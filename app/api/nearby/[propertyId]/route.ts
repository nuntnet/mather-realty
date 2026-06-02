import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { nearbyPlaces, properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const PLACE_TYPES = [
  "airport",
  "hospital",
  "shopping_mall",
  "school",
  "subway_station",
  "restaurant",
  "convenience_store",
];

const CACHE_DAYS = 30;
const RADIUS_METERS = 5000;
const PLACES_API = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

type PlaceResult = {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  types: string[];
};

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { nearbyPlaces, properties } });
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function primaryType(types: string[]): string {
  for (const t of PLACE_TYPES) {
    if (types.includes(t)) return t;
  }
  return types[0] ?? "other";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;

  try {
    const db = getDb();

    // Check cache (within 30 days)
    const cached = await db
      .select()
      .from(nearbyPlaces)
      .where(eq(nearbyPlaces.propertyId, propertyId));

    if (cached.length > 0) {
      const cachedAt = cached[0]?.cachedAt;
      if (cachedAt) {
        const age = Date.now() - new Date(cachedAt).getTime();
        const maxAge = CACHE_DAYS * 24 * 60 * 60 * 1000;
        if (age < maxAge) {
          return NextResponse.json(
            cached.map((p) => ({
              name: p.name,
              category: p.category,
              distanceKm: p.distanceKm,
              lat: p.lat,
              lng: p.lng,
            }))
          );
        }
      }
    }

    // Get property coordinates
    const property = await db
      .select({ lat: properties.lat, lng: properties.lng })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .get();

    if (!property || property.lat == null || property.lng == null) {
      return NextResponse.json(
        { error: "Property not found or missing coordinates" },
        { status: 404 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 503 });
    }

    const allPlaces: {
      name: string;
      category: string;
      distanceKm: number;
      lat: number;
      lng: number;
      placeId: string;
    }[] = [];

    // Fetch each type separately for better coverage
    for (const type of PLACE_TYPES) {
      const url = new URL(PLACES_API);
      url.searchParams.set("location", `${property.lat},${property.lng}`);
      url.searchParams.set("radius", String(RADIUS_METERS));
      url.searchParams.set("type", type);
      url.searchParams.set("key", apiKey);

      const res = await fetch(url.toString());
      if (!res.ok) continue;

      const json = (await res.json()) as { results: PlaceResult[]; status: string };
      if (json.status !== "OK" && json.status !== "ZERO_RESULTS") continue;

      for (const place of (json.results ?? []).slice(0, 3)) {
        const distanceKm = haversineKm(
          property.lat,
          property.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        allPlaces.push({
          placeId: place.place_id,
          name: place.name,
          category: primaryType(place.types),
          distanceKm: Math.round(distanceKm * 100) / 100,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        });
      }
    }

    // Deduplicate by placeId
    const seen = new Set<string>();
    const unique = allPlaces.filter((p) => {
      if (seen.has(p.placeId)) return false;
      seen.add(p.placeId);
      return true;
    });

    // Clear old cache entries
    if (cached.length > 0) {
      // Delete old entries and re-insert fresh ones
      // Use raw delete since drizzle sqlite doesn't have a simple deleteAll by column without eq
      for (const old of cached) {
        await db.delete(nearbyPlaces).where(eq(nearbyPlaces.id, old.id));
      }
    }

    const now = new Date().toISOString();

    if (unique.length > 0) {
      await db.insert(nearbyPlaces).values(
        unique.map((p) => ({
          propertyId,
          placeId: p.placeId,
          name: p.name,
          category: p.category,
          distanceKm: p.distanceKm,
          lat: p.lat,
          lng: p.lng,
          cachedAt: now,
        }))
      );
    }

    return NextResponse.json(
      unique.map((p) => ({
        name: p.name,
        category: p.category,
        distanceKm: p.distanceKm,
        lat: p.lat,
        lng: p.lng,
      }))
    );
  } catch (err) {
    console.error(`GET /api/nearby/${propertyId} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
