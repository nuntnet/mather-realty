import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { inquiries } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { inquiries } });
}

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = parseInt(searchParams.get("limit") ?? String(PAGE_SIZE), 10);
    const offset = (page - 1) * limit;

    const base = db.select().from(inquiries);
    const filtered = status && status !== "all"
      ? base.where(eq(inquiries.status, status as "new" | "contacted" | "booked" | "declined"))
      : base;

    const rows = await filtered.orderBy(desc(inquiries.id)).limit(limit).offset(offset);

    const countBase = db.select({ count: sql<number>`count(*)` }).from(inquiries);
    const total = await (status && status !== "all"
      ? countBase.where(eq(inquiries.status, status as "new" | "contacted" | "booked" | "declined"))
      : countBase
    ).get();

    return NextResponse.json({
      items: rows,   // page reads data?.items
      data: rows,    // backward compat
      total: Number(total?.count ?? 0),
      page,
      pageSize: limit,
    });
  } catch (err) {
    console.error("GET /api/admin/inquiries error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
