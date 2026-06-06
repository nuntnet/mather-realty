import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { inquiries, submissions, propertyViews } from "@/lib/db/schema";
import { eq, sql, gte, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { getProperties } from "@/lib/notion";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { inquiries, submissions, propertyViews } });
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const quick = req.nextUrl.searchParams.get("quick") === "1";

  try {
    const db = getDb();

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayStr = todayStart.toISOString();

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const monthStr = monthStart.toISOString();

    // Fast Turso counts
    const [newInquiriesToday, pendingSubmissions, viewsThisMonth] = db
      ? await Promise.all([
          db.select({ count: sql<number>`count(*)` })
            .from(inquiries)
            .where(and(eq(inquiries.status, "new"), gte(inquiries.createdAt, todayStr)))
            .get(),
          db.select({ count: sql<number>`count(*)` })
            .from(submissions)
            .where(eq(submissions.status, "pending"))
            .get(),
          db.select({ count: sql<number>`count(*)` })
            .from(propertyViews)
            .where(gte(propertyViews.createdAt, monthStr))
            .get(),
        ])
      : [null, null, null];

    const pendingSubCount = Number(pendingSubmissions?.count ?? 0);

    // quick=1 used by sidebar badge — only needs a fast number
    if (quick) {
      return NextResponse.json({ pendingProperties: pendingSubCount });
    }

    // Property counts from Notion (source of truth — Turso hot-cache is not reliable)
    const props = await getProperties(undefined, "en").catch(() => []);
    const propertyCount = props.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      propertyCount,
      totalProperties: props.length,
      availableProperties: propertyCount["available"] ?? 0,
      rentedProperties: propertyCount["rented"] ?? 0,
      pendingProperties: propertyCount["pending"] ?? 0,
      newInquiriesToday: Number(newInquiriesToday?.count ?? 0),
      pendingSubmissions: pendingSubCount,
      totalViewsThisMonth: Number(viewsThisMonth?.count ?? 0),
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
