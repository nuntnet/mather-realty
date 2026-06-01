import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { analyticsEvents } from "@/lib/db/schema";
import { desc, eq, gte, sql, and } from "drizzle-orm";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { analyticsEvents } });
}

export type AnalyticsEventType = "car_view" | "booking" | "contact" | "search";

export async function trackEvent(
  event: AnalyticsEventType,
  data: { path?: string; brand?: string; model?: string; meta?: Record<string, string> }
) {
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(analyticsEvents).values({
      event,
      path: data.path ?? null,
      brand: data.brand ?? null,
      model: data.model ?? null,
      meta: data.meta ? JSON.stringify(data.meta) : null,
      createdAt: new Date(),
    });
  } catch {
    // non-critical, never throw
  }
}

// ── Admin queries ─────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function getEventCounts(days = 30) {
  const db = getDb();
  if (!db) return { car_view: 0, booking: 0, contact: 0, search: 0 };
  const since = daysAgo(days);
  const rows = await db
    .select({ event: analyticsEvents.event, count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, since))
    .groupBy(analyticsEvents.event);
  return Object.fromEntries(rows.map((r) => [r.event, Number(r.count)])) as Record<string, number>;
}

export async function getTopCars(days = 30, limit = 10) {
  const db = getDb();
  if (!db) return [];
  const since = daysAgo(days);
  return db
    .select({
      brand: analyticsEvents.brand,
      model: analyticsEvents.model,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.event, "car_view"), gte(analyticsEvents.createdAt, since)))
    .groupBy(analyticsEvents.brand, analyticsEvents.model)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

export async function getTopBrands(days = 30) {
  const db = getDb();
  if (!db) return [];
  const since = daysAgo(days);
  return db
    .select({
      brand: analyticsEvents.brand,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.event, "car_view"), gte(analyticsEvents.createdAt, since)))
    .groupBy(analyticsEvents.brand)
    .orderBy(desc(sql`count(*)`));
}

export async function getDailyEvents(days = 14) {
  const db = getDb();
  if (!db) return [];
  const since = daysAgo(days);
  return db
    .select({
      date: sql<string>`date(datetime(${analyticsEvents.createdAt}, 'unixepoch'))`,
      event: analyticsEvents.event,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, since))
    .groupBy(sql`date(datetime(${analyticsEvents.createdAt}, 'unixepoch'))`, analyticsEvents.event)
    .orderBy(sql`date(datetime(${analyticsEvents.createdAt}, 'unixepoch'))`);
}

export async function getRecentEvents(limit = 20) {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(analyticsEvents)
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(limit);
}
