import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { submissions } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { submissions } });
}

const PAGE_SIZE = 20;
const patchSchema = z.object({
  id: z.number().int(),
  status: z.enum(["pending", "approved", "rejected"]),
});

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

    const base = db.select().from(submissions);
    const filtered = status && status !== "all"
      ? base.where(eq(submissions.status, status as "pending" | "approved" | "rejected"))
      : base;

    const rows = await filtered.orderBy(desc(submissions.id)).limit(limit).offset(offset);

    const countBase = db.select({ count: sql<number>`count(*)` }).from(submissions);
    const total = await (status && status !== "all"
      ? countBase.where(eq(submissions.status, status as "pending" | "approved" | "rejected"))
      : countBase
    ).get();

    return NextResponse.json({
      items: rows,
      data: rows,
      total: Number(total?.count ?? 0),
      page,
      pageSize: limit,
    });
  } catch (err) {
    console.error("GET /api/admin/submissions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const { id, status } = patchSchema.parse(body);
    const db = getDb();

    const updated = await db
      .update(submissions)
      .set({ status, reviewedAt: new Date().toISOString() })
      .where(eq(submissions.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, submission: updated[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    console.error("PATCH /api/admin/submissions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
