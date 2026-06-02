import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq, desc } from "drizzle-orm";
import { properties, inquiries } from "@/lib/db/schema";
import { requireLandlord } from "@/lib/admin-auth";
function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { properties, inquiries } });
}

// ── GET /api/landlord/properties ──────────────────────────────────────────────
// Returns all properties owned by the current landlord (or all for admin).

export async function GET(req: NextRequest) {
  const result = await requireLandlord();
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const userId = session.user.id;
  const role = (session.user as { role?: string }).role;

  try {
    const db = getDb();

    const rows =
      role === "admin"
        ? await db
            .select()
            .from(properties)
            .orderBy(desc(properties.createdAt))
        : await db
            .select()
            .from(properties)
            .where(eq(properties.ownerId, userId))
            .orderBy(desc(properties.createdAt));

    // Shape response as ListingSummary objects expected by the dashboard
    const mapped = rows.map((p) => ({
      id: p.id,
      slug: p.slug ?? "",
      titleEn: p.address ?? p.city ?? p.id,
      city: p.city ?? "",
      priceTHB: p.priceTHB ?? 0,
      status: p.status ?? "pending",
      bedrooms: p.bedrooms ?? 0,
      coverImage: "",
    }));

    return NextResponse.json({ properties: mapped });
  } catch (err) {
    console.error("[landlord/properties] GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 },
    );
  }
}

// ── POST /api/landlord/properties ─────────────────────────────────────────────
// Create a new property listing with status "pending" (awaiting admin approval).

const createPropertySchema = z.object({
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  priceTHB: z.number().int().positive("Price must be positive"),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  sizeSqm: z.number().positive().optional(),
  availableFrom: z.string().optional(),
  hasVirtualTour: z.boolean().optional(),
  virtualTourUrl: z.string().url().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const result = await requireLandlord();
  if (result instanceof NextResponse) return result;
  const { session } = result;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  // Generate a URL-safe slug from city + id suffix
  const slugBase = data.city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const slug = `${slugBase}-${id.slice(0, 8)}`;

  try {
    const db = getDb();

    await db.insert(properties).values({
      id,
      slug,
      ownerId: session.user.id,
      status: "pending",
      address: data.address,
      city: data.city,
      district: data.district ?? null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      priceTHB: data.priceTHB,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      sizeSqm: data.sizeSqm ?? null,
      availableFrom: data.availableFrom ?? null,
      hasVirtualTour: data.hasVirtualTour ?? false,
      virtualTourUrl: data.virtualTourUrl ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        property: { id, slug, status: "pending" },
        message:
          "Listing submitted for review. It will appear on the site once approved.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[landlord/properties] POST error:", err);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 },
    );
  }
}
