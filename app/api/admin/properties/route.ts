import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

const patchSchema = z.object({
  id: z.string().min(1),
  status: z
    .enum(["available", "rented", "coming_soon", "pending", "archived"])
    .optional(),
  approvedAt: z.string().optional().nullable(),
  verifiedAt: z.string().optional().nullable(),
});

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { properties } });
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const status = searchParams.get("status") ?? null;

    const db = getDb();

    // Build base query
    const base = db.select().from(properties);
    const countBase = db
      .select({ count: sql<number>`count(*)` })
      .from(properties);

    const [rows, totals] = await Promise.all([
      (status
        ? base.where(
            eq(
              properties.status,
              status as
                | "available"
                | "rented"
                | "coming_soon"
                | "pending"
                | "archived"
            )
          )
        : base
      )
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      (status
        ? countBase.where(
            eq(
              properties.status,
              status as
                | "available"
                | "rented"
                | "coming_soon"
                | "pending"
                | "archived"
            )
          )
        : countBase
      ).get(),
    ]);

    const total = Number(totals?.count ?? 0);

    return NextResponse.json({
      data: rows,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (err) {
    console.error("GET /api/admin/properties error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const db = getDb();

    const updateValues: Partial<typeof properties.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };
    if (data.status !== undefined) updateValues.status = data.status;
    if (data.approvedAt !== undefined) updateValues.approvedAt = data.approvedAt;
    if (data.verifiedAt !== undefined) updateValues.verifiedAt = data.verifiedAt;

    const updated = await db
      .update(properties)
      .set(updateValues)
      .where(eq(properties.id, data.id))
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
    console.error("PATCH /api/admin/properties error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
