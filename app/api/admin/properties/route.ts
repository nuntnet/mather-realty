import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getProperties } from "@/lib/notion";
import { requireAdmin } from "@/lib/admin-auth";

const PROPERTIES_DB_ID = process.env.NOTION_PROPERTIES_DB_ID ?? "";

function getNotionClient() {
  return new Client({ auth: process.env.NOTION_API_KEY });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z
    .enum(["available", "rented", "coming_soon", "pending", "archived"])
    .optional(),
  approvedAt: z.string().optional().nullable(),
  verifiedAt: z.string().optional().nullable(),
  syncAlgolia: z.boolean().optional(),
});

// ── GET — list all properties straight from Notion ────────────────────────────
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const props = await getProperties(undefined, "en");

    const items = props.map((p) => ({
      id: p.id,
      slug: p.slug ?? null,
      titleEn: p.title.en ?? null,
      city: p.city ?? null,
      district: p.district ?? null,
      priceTHB: p.priceTHB ?? null,
      bedrooms: p.bedrooms ?? null,
      status: p.status ?? null,
      verifiedAt: p.verifiedAt ?? null,
      approvedAt: p.approvedAt ?? null,
      createdAt: p.createdAt ?? null,
    }));

    return NextResponse.json({ items, total: items.length });
  } catch (err) {
    console.error("GET /api/admin/properties error:", err);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

// ── PATCH — update a property directly in Notion ──────────────────────────────
export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const notion = getNotionClient();

    // Retrieve current page to detect property types (select vs status)
    const page = await notion.pages.retrieve({ page_id: data.id }) as PageObjectResponse;
    const props = page.properties as Record<string, { type: string }>;

    const updateProperties: Record<string, unknown> = {};

    // Status — Notion can be either a "select" or "status" type property
    if (data.status) {
      const statusProp = props["status"];
      if (statusProp?.type === "select") {
        updateProperties["status"] = { select: { name: data.status } };
      } else if (statusProp?.type === "status") {
        updateProperties["status"] = { status: { name: data.status } };
      }
    }

    // verified_at date
    if (data.verifiedAt !== undefined) {
      updateProperties["verified_at"] = data.verifiedAt
        ? { date: { start: data.verifiedAt } }
        : { date: null };
    }

    // approved_at date
    if (data.approvedAt !== undefined) {
      updateProperties["approved_at"] = data.approvedAt
        ? { date: { start: data.approvedAt } }
        : { date: null };
    }

    if (Object.keys(updateProperties).length > 0) {
      await notion.pages.update({
        page_id: data.id,
        properties: updateProperties as Parameters<typeof notion.pages.update>[0]["properties"],
      });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error("PATCH /api/admin/properties error:", err);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
