import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { inquiries, properties } from "@/lib/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";
import { Client as NotionClient } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { inquiries, properties } });
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

    // Enrich with property names — Turso first, then Notion for any missing
    const uniquePropertyIds = [...new Set(rows.map(r => r.propertyId).filter(Boolean))] as string[];
    const propertyMap: Record<string, string> = {};

    if (uniquePropertyIds.length > 0) {
      // 1. Try Turso hot-cache (fast)
      try {
        const propRows = await db
          .select({ id: properties.id, slug: properties.slug, address: properties.address, city: properties.city })
          .from(properties)
          .where(inArray(properties.id, uniquePropertyIds));

        for (const p of propRows) {
          const label = p.slug
            ? p.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            : [p.address, p.city].filter(Boolean).join(', ') || p.id;
          propertyMap[p.id] = label;
        }
      } catch { /* Turso may be empty */ }

      // 2. Notion fallback for any IDs not found in Turso
      const unmapped = uniquePropertyIds.filter(id => !propertyMap[id]);
      if (unmapped.length > 0 && process.env.NOTION_API_KEY) {
        const notion = new NotionClient({ auth: process.env.NOTION_API_KEY });
        await Promise.allSettled(unmapped.map(async (id) => {
          try {
            const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse;
            // Try to get title_en rich_text property
            const titleProp = page.properties["title_en"] as { type: string; rich_text?: Array<{ plain_text: string }> } | undefined;
            const title = titleProp?.rich_text?.map(r => r.plain_text).join("") ?? "";
            // Fallback: try main Name/title property
            const nameProp = page.properties["Name"] as { type: string; title?: Array<{ plain_text: string }> } | undefined;
            const name = nameProp?.title?.map(r => r.plain_text).join("") ?? "";
            propertyMap[id] = title || name || `Property ${id.slice(0, 8)}…`;
          } catch { propertyMap[id] = `Property ${id.slice(0, 8)}…`; }
        }));
      }
    }

    const enriched = rows.map(r => ({
      ...r,
      propertyTitle: r.propertyId ? (propertyMap[r.propertyId] ?? `Property ${r.propertyId.slice(0, 8)}…`) : null,
    }));

    const countBase = db.select({ count: sql<number>`count(*)` }).from(inquiries);
    const total = await (status && status !== "all"
      ? countBase.where(eq(inquiries.status, status as "new" | "contacted" | "booked" | "declined"))
      : countBase
    ).get();

    return NextResponse.json({
      items: enriched,
      data: enriched,
      total: Number(total?.count ?? 0),
      page,
      pageSize: limit,
    });
  } catch (err) {
    console.error("GET /api/admin/inquiries error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
