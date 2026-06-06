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

type NearbyPlace = {
  name: string;
  category: string;
  distanceKm: number;
  lat: number;
  lng: number;
  placeId: string;
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
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;

  // DB is optional — all DB operations are best-effort so a missing table or
  // unavailable Turso never causes a 500.
  let db: ReturnType<typeof getDb> | null = null;
  try { db = getDb(); } catch { /* no DB available */ }

  // 1. Check cache
  if (db) {
    try {
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
    } catch {
      // Cache table may not exist yet — proceed to live fetch
    }
  }

  // 2. Resolve coordinates: Turso first, then query params
  let coordLat: number | null = null;
  let coordLng: number | null = null;

  if (db) {
    try {
      const dbProperty = await db
        .select({ lat: properties.lat, lng: properties.lng })
        .from(properties)
        .where(eq(properties.id, propertyId))
        .get();
      coordLat = dbProperty?.lat ?? null;
      coordLng = dbProperty?.lng ?? null;
    } catch { /* properties table unavailable */ }
  }

  if (coordLat == null || coordLng == null) {
    const qLat = parseFloat(req.nextUrl.searchParams.get("lat") ?? "");
    const qLng = parseFloat(req.nextUrl.searchParams.get("lng") ?? "");
    if (!isNaN(qLat) && !isNaN(qLng)) {
      coordLat = qLat;
      coordLng = qLng;
    }
  }

  if (coordLat == null || coordLng == null) {
    return NextResponse.json(
      { error: "Property not found or missing coordinates" },
      { status: 404 }
    );
  }

  // 3. Google Places API key required
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json([], { status: 200 });
  }

  // 4. Fetch each place type
  const allPlaces: NearbyPlace[] = [];

  for (const type of PLACE_TYPES) {
    try {
      const url = new URL(PLACES_API);
      url.searchParams.set("location", `${coordLat},${coordLng}`);
      url.searchParams.set("radius", String(RADIUS_METERS));
      url.searchParams.set("type", type);
      url.searchParams.set("key", apiKey);

      const res = await fetch(url.toString());
      if (!res.ok) continue;

      const json = (await res.json()) as { results: PlaceResult[]; status: string };
      if (json.status !== "OK" && json.status !== "ZERO_RESULTS") continue;

      for (const place of (json.results ?? []).slice(0, 3)) {
        const distanceKm = haversineKm(
          coordLat,
          coordLng,
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
    } catch { /* skip this place type on network error */ }
  }

  // 5. Deduplicate
  const seen = new Set<string>();
  const unique = allPlaces.filter((p) => {
    if (seen.has(p.placeId)) return false;
    seen.add(p.placeId);
    return true;
  });

  // 6. Persist cache (best-effort — ignore FK violations or missing tables)
  if (db && unique.length > 0) {
    try {
      const existing = await db
        .select({ id: nearbyPlaces.id })
        .from(nearbyPlaces)
        .where(eq(nearbyPlaces.propertyId, propertyId));

      for (const old of existing) {
        await db.delete(nearbyPlaces).where(eq(nearbyPlaces.id, old.id));
      }

      await db.insert(nearbyPlaces).values(
        unique.map((p) => ({
          propertyId,
          placeId: p.placeId,
          name: p.name,
          category: p.category,
          distanceKm: p.distanceKm,
          lat: p.lat,
          lng: p.lng,
          cachedAt: new Date().toISOString(),
        }))
      );
    } catch { /* cache write failed — not critical */ }
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
}
