import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { properties, inquiries, submissions, propertyViews } from "@/lib/db/schema";
import { eq, sql, gte, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, {
    schema: { properties, inquiries, submissions, propertyViews },
  });
}

export async function GET(_req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const db = getDb();

    // Start of today (UTC)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayStr = todayStart.toISOString();

    // Start of this month (UTC)
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthStr = monthStart.toISOString();

    const [
      statusCounts,
      newInquiriesToday,
      pendingSubmissions,
      viewsThisMonth,
    ] = await Promise.all([
      // Properties grouped by status
      db
        .select({
          status: properties.status,
          count: sql<number>`count(*)`,
        })
        .from(properties)
        .groupBy(properties.status),

      // New inquiries today (status = 'new', createdAt >= today)
      db
        .select({ count: sql<number>`count(*)` })
        .from(inquiries)
        .where(
          and(
            eq(inquiries.status, "new"),
            gte(inquiries.createdAt, todayStr)
          )
        )
        .get(),

      // Pending submissions
      db
        .select({ count: sql<number>`count(*)` })
        .from(submissions)
        .where(eq(submissions.status, "pending"))
        .get(),

      // Property views this month
      db
        .select({ count: sql<number>`count(*)` })
        .from(propertyViews)
        .where(gte(propertyViews.createdAt, monthStr))
        .get(),
    ]);

    const propertyCount = Object.fromEntries(
      statusCounts.map((r) => [r.status ?? "unknown", Number(r.count)])
    );

    return NextResponse.json({
      propertyCount,
      newInquiriesToday: Number(newInquiriesToday?.count ?? 0),
      pendingSubmissions: Number(pendingSubmissions?.count ?? 0),
      viewsThisMonth: Number(viewsThisMonth?.count ?? 0),
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
