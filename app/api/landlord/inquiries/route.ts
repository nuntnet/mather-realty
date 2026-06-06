import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq, inArray, desc } from "drizzle-orm";
import { properties, inquiries } from "@/lib/db/schema";
import { requireLandlord } from "@/lib/admin-auth";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { properties, inquiries } });
}

/**
 * GET /api/landlord/inquiries
 * Returns inquiries for properties owned by the current landlord.
 * Admins see all inquiries.
 */
export async function GET(_req: NextRequest) {
  const result = await requireLandlord();
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const userId = session.user.id;
  const role = (session.user as { role?: string }).role;

  try {
    const db = getDb();

    let rows: typeof inquiries.$inferSelect[];

    if (role === "admin") {
      rows = await db
        .select()
        .from(inquiries)
        .orderBy(desc(inquiries.createdAt))
        .limit(100);
    } else {
      // First get the landlord's property IDs
      const ownedProps = await db
        .select({ id: properties.id })
        .from(properties)
        .where(eq(properties.ownerId, userId));

      if (ownedProps.length === 0) {
        return NextResponse.json({ inquiries: [] });
      }

      const propIds = ownedProps.map((p) => p.id);

      rows = await db
        .select()
        .from(inquiries)
        .where(inArray(inquiries.propertyId, propIds))
        .orderBy(desc(inquiries.createdAt))
        .limit(100);
    }

    return NextResponse.json({ inquiries: rows });
  } catch (err) {
    console.error("[landlord/inquiries] GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 },
    );
  }
}
