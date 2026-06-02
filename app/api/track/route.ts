import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { propertyViews, analyticsEvents } from "@/lib/db/schema";

const schema = z.object({
  event: z.string().min(1).max(100),
  propertyId: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  countryCode: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
});

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { propertyViews, analyticsEvents } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const db = getDb();
    const now = new Date().toISOString();

    if (data.event === "property_view") {
      await db.insert(propertyViews).values({
        propertyId: data.propertyId ?? null,
        locale: data.locale ?? null,
        countryCode: data.countryCode ?? null,
        referrer: data.referrer ?? null,
        createdAt: now,
      });
    } else {
      await db.insert(analyticsEvents).values({
        event: data.event,
        path: data.referrer ?? null,
        meta: data.propertyId ? JSON.stringify({ propertyId: data.propertyId }) : null,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/track error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
