import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { propertyViews, analyticsEvents, searchLogs } from "@/lib/db/schema";
import { sql, gte, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { propertyViews, analyticsEvents, searchLogs } });
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get("days") ?? 30)));
  const since = daysAgo(days);

  const db = getDb();
  if (!db) {
    return NextResponse.json({
      counts: {}, topProperties: [], topCities: [],
      daily: [], recent: [], topSearches: [],
    });
  }

  try {
    const [topProperties, eventCounts, daily, recent, topSearches] = await Promise.all([
      // Top viewed properties
      db.select({
          propertyId: propertyViews.propertyId,
          count: sql<number>`count(*)`,
        })
        .from(propertyViews)
        .where(gte(propertyViews.createdAt, since))
        .groupBy(propertyViews.propertyId)
        .orderBy(desc(sql`count(*)`))
        .limit(10),

      // Event counts by type (createdAt is a timestamp integer → pass Date)
      db.select({
          event: analyticsEvents.event,
          count: sql<number>`count(*)`,
        })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.createdAt, new Date(since)))
        .groupBy(analyticsEvents.event),

      // Daily property views (createdAt is text → string comparison OK)
      db.select({
          date: sql<string>`date(${propertyViews.createdAt})`,
          count: sql<number>`count(*)`,
        })
        .from(propertyViews)
        .where(gte(propertyViews.createdAt, daysAgo(Math.min(days, 14))))
        .groupBy(sql`date(${propertyViews.createdAt})`)
        .orderBy(sql`date(${propertyViews.createdAt})`),

      // Recent analytics events
      db.select()
        .from(analyticsEvents)
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(20),

      // Top search queries
      db.select({
          query: searchLogs.query,
          count: sql<number>`count(*)`,
        })
        .from(searchLogs)
        .where(gte(searchLogs.createdAt, since))
        .groupBy(searchLogs.query)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
    ]);

    const counts = Object.fromEntries(
      eventCounts.map((r) => [r.event, Number(r.count)])
    );

    return NextResponse.json({
      counts,
      topProperties: topProperties.map((r) => ({
        propertyId: r.propertyId,
        title: r.propertyId, // enriched on frontend if needed
        count: Number(r.count),
      })),
      topCities: [],
      daily: daily.map((r) => ({
        date: r.date,
        event: "property_view",
        count: Number(r.count),
      })),
      recent: recent.map((r) => ({
        id: r.id,
        event: r.event,
        path: r.path,
        createdAt: typeof r.createdAt === 'object' ? r.createdAt?.toISOString() : r.createdAt,
      })),
      topSearches: topSearches.map((r) => ({
        query: r.query,
        count: Number(r.count),
      })),
    });
  } catch (err) {
    console.error("GET /api/admin/analytics error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
