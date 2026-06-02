import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { rentalPeriods, properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { rentalPeriods, properties } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = getDb();

    const [periods, property] = await Promise.all([
      db
        .select({ startDate: rentalPeriods.startDate, endDate: rentalPeriods.endDate })
        .from(rentalPeriods)
        .where(eq(rentalPeriods.propertyId, id)),
      db
        .select({ availableFrom: properties.availableFrom })
        .from(properties)
        .where(eq(properties.id, id))
        .get(),
    ]);

    return NextResponse.json({
      blockedRanges: periods.map((p) => ({ start: p.startDate, end: p.endDate })),
      availableFrom: property?.availableFrom ?? null,
    });
  } catch (err) {
    console.error(`GET /api/properties/${id}/calendar error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
