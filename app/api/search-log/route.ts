import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { searchLogs } from "@/lib/db/schema";

const schema = z.object({
  query: z.string().min(1).max(500),
  locale: z.string().min(2).max(10),
  resultCount: z.number().int().min(0),
  filtersJson: z.string().optional().nullable(),
});

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { searchLogs } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const db = getDb();

    await db.insert(searchLogs).values({
      query: data.query,
      locale: data.locale,
      resultCount: data.resultCount,
      filtersJson: data.filtersJson ?? null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/search-log error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
