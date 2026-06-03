import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

const patchSchema = z.object({
  status: z
    .enum(["available", "rented", "coming_soon", "pending", "archived"])
    .optional(),
  approvedAt: z.string().optional().nullable(),
  verifiedAt: z.string().optional().nullable(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  priceTHB: z.number().int().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  sizeSqm: z.number().optional(),
  availableFrom: z.string().optional().nullable(),
  // Photo management
  cover_image: z.string().url().optional(),
  gallery_urls: z.string().optional(),
});

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { properties } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const db = getDb();
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .get();

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ property });
  } catch (err) {
    console.error(`GET /api/admin/properties/${id} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const db = getDb();

    const updateValues: Partial<typeof properties.$inferInsert> = {
      updatedAt: new Date().toISOString(),
      ...data,
    };

    const updated = await db
      .update(properties)
      .set(updateValues)
      .where(eq(properties.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, property: updated[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error(`PATCH /api/admin/properties/${id} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const db = getDb();
    const deleted = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning({ id: properties.id });

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error(`DELETE /api/admin/properties/${id} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
