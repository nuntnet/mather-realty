import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { requireAdmin } from "@/lib/admin-auth";

const LOCALES = ["en","th","zh-CN","zh-TW","ja","ko","ru","de","fr","es","it","nl","sv","ar","hi"] as const;

function notion() {
  return new Client({ auth: process.env.NOTION_API_KEY });
}

// ── helpers ────────────────────────────────────────────────────────────────────

function richText(page: PageObjectResponse, key: string): string {
  const p = page.properties[key] as { type: string; rich_text?: Array<{ plain_text: string }>; title?: Array<{ plain_text: string }> } | undefined;
  if (!p) return "";
  if (p.type === "rich_text") return (p.rich_text ?? []).map((r) => r.plain_text).join("");
  if (p.type === "title") return (p.title ?? []).map((r) => r.plain_text).join("");
  return "";
}

function propNumber(page: PageObjectResponse, key: string): number | null {
  const p = page.properties[key] as { type: string; number?: number | null } | undefined;
  if (!p || p.type !== "number") return null;
  return p.number ?? null;
}

function propSelect(page: PageObjectResponse, key: string): string {
  const p = page.properties[key] as { type: string; select?: { name: string } | null; status?: { name: string } | null } | undefined;
  if (!p) return "";
  if (p.type === "select") return p.select?.name ?? "";
  if (p.type === "status") return p.status?.name ?? "";
  return "";
}

function propMultiSelect(page: PageObjectResponse, key: string): string[] {
  const p = page.properties[key] as { type: string; multi_select?: Array<{ name: string }> } | undefined;
  if (!p || p.type !== "multi_select") return [];
  return (p.multi_select ?? []).map((o) => o.name);
}

function propDate(page: PageObjectResponse, key: string): string | null {
  const p = page.properties[key] as { type: string; date?: { start: string } | null } | undefined;
  if (!p || p.type !== "date") return null;
  return p.date?.start ?? null;
}

function propFiles(page: PageObjectResponse, key: string): string[] {
  const p = page.properties[key] as { type: string; files?: Array<{ type: string; file?: { url: string }; external?: { url: string }; name?: string }> } | undefined;
  if (!p || p.type !== "files") return [];
  return (p.files ?? []).map((f) => f.file?.url ?? f.external?.url ?? "").filter(Boolean);
}

/** Map a raw Notion page to the admin edit form shape */
function mapToForm(page: PageObjectResponse) {
  // Multilingual titles & descriptions
  const titles: Record<string, string> = {};
  const descriptions: Record<string, string> = {};
  for (const loc of LOCALES) {
    const t = richText(page, `title_${loc}`);
    if (t) titles[loc] = t;
    const d = richText(page, `description_${loc}`);
    if (d) descriptions[loc] = d;
  }

  // Cover image from the Notion page cover (not a database property)
  let coverImage = "";
  const cover = (page as PageObjectResponse & {
    cover?: { type: string; external?: { url: string }; file?: { url: string } } | null
  }).cover;
  if (cover?.type === "external") coverImage = cover.external?.url ?? "";
  else if (cover?.type === "file") coverImage = cover.file?.url ?? "";

  // Gallery: try files property first, fall back to comma-separated URL text
  const galleryFiles = propFiles(page, "gallery");
  const galleryUrls = galleryFiles.length
    ? galleryFiles
    : richText(page, "gallery_urls").split(",").map((u) => u.trim()).filter(Boolean);

  return {
    coverImage,
    titles,
    descriptions,
    address: richText(page, "address"),
    city: richText(page, "city"),
    district: richText(page, "district"),
    lat: propNumber(page, "lat"),
    lng: propNumber(page, "lng"),
    priceTHB: propNumber(page, "price_thb"),
    bedrooms: propNumber(page, "bedrooms"),
    bathrooms: propNumber(page, "bathrooms"),
    sizeSqm: propNumber(page, "size_sqm"),
    amenities: propMultiSelect(page, "amenities"),
    status: propSelect(page, "status") || "pending",
    gallery: galleryUrls,
    virtualTourUrl: richText(page, "virtual_tour_url") || null,
    verifiedAt: propDate(page, "verified_at"),
    approvedAt: propDate(page, "approved_at"),
    slug: richText(page, "slug"),
  };
}

// ── PATCH schema ───────────────────────────────────────────────────────────────

const patchSchema = z.object({
  titles: z.record(z.string()).optional(),
  descriptions: z.record(z.string()).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  priceTHB: z.number().int().nullable().optional(),
  bedrooms: z.number().int().nullable().optional(),
  bathrooms: z.number().int().nullable().optional(),
  sizeSqm: z.number().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  status: z.enum(["available","rented","coming_soon","pending","archived"]).optional(),
  gallery: z.array(z.string()).optional(),
  virtualTourUrl: z.string().nullable().optional(),
  verified: z.boolean().optional(),
  approvedAt: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
});

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const client = notion();
    const page = await client.pages.retrieve({ page_id: id }) as PageObjectResponse;
    return NextResponse.json(mapToForm(page));
  } catch (err) {
    const msg = String(err);
    if (msg.includes("not_found") || msg.includes("404")) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    console.error(`GET /api/admin/properties/${id} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PATCH ──────────────────────────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const client = notion();

    // First retrieve the page to determine property types (select vs status)
    const existing = await client.pages.retrieve({ page_id: id }) as PageObjectResponse;
    const existingProps = existing.properties as Record<string, { type: string }>;

    const updates: Record<string, unknown> = {};

    // Multilingual titles
    if (data.titles) {
      for (const loc of LOCALES) {
        if (data.titles[loc] !== undefined) {
          updates[`title_${loc}`] = {
            rich_text: [{ text: { content: data.titles[loc] ?? "" } }],
          };
        }
      }
    }

    // Multilingual descriptions
    if (data.descriptions) {
      for (const loc of LOCALES) {
        if (data.descriptions[loc] !== undefined) {
          updates[`description_${loc}`] = {
            rich_text: [{ text: { content: data.descriptions[loc] ?? "" } }],
          };
        }
      }
    }

    // Text fields
    const textFields: Array<[keyof typeof data, string]> = [
      ["address", "address"],
      ["city", "city"],
      ["district", "district"],
    ];
    for (const [formKey, notionKey] of textFields) {
      if (data[formKey] !== undefined) {
        updates[notionKey] = {
          rich_text: [{ text: { content: String(data[formKey] ?? "") } }],
        };
      }
    }

    // Number fields
    const numFields: Array<[keyof typeof data, string]> = [
      ["lat", "lat"],
      ["lng", "lng"],
      ["priceTHB", "price_thb"],
      ["bedrooms", "bedrooms"],
      ["bathrooms", "bathrooms"],
      ["sizeSqm", "size_sqm"],
    ];
    for (const [formKey, notionKey] of numFields) {
      if (data[formKey] !== undefined) {
        updates[notionKey] = { number: data[formKey] ?? null };
      }
    }

    // Status (select or status type)
    if (data.status) {
      const statusProp = existingProps["status"];
      if (statusProp?.type === "select") {
        updates["status"] = { select: { name: data.status } };
      } else if (statusProp?.type === "status") {
        updates["status"] = { status: { name: data.status } };
      }
    }

    // Amenities (multi_select)
    if (data.amenities !== undefined) {
      updates["amenities"] = {
        multi_select: data.amenities.map((name) => ({ name })),
      };
    }

    // Gallery URLs — store as comma-separated text
    if (data.gallery !== undefined) {
      updates["gallery_urls"] = {
        rich_text: [{ text: { content: data.gallery.join(",") } }],
      };
    }

    // Virtual tour URL
    if (data.virtualTourUrl !== undefined) {
      updates["virtual_tour_url"] = data.virtualTourUrl
        ? { rich_text: [{ text: { content: data.virtualTourUrl } }] }
        : { rich_text: [] };
    }

    // Verified / approved dates
    if (data.verified !== undefined) {
      updates["verified_at"] = data.verified
        ? { date: { start: new Date().toISOString().split("T")[0] } }
        : { date: null };
    }
    if (data.approvedAt !== undefined) {
      updates["approved_at"] = data.approvedAt
        ? { date: { start: data.approvedAt } }
        : { date: null };
    }

    // Build the full pages.update call — combine properties + optional cover
    const updatePayload: Parameters<typeof client.pages.update>[0] = {
      page_id: id,
    };

    if (Object.keys(updates).length > 0) {
      updatePayload.properties = updates as Parameters<typeof client.pages.update>[0]["properties"];
    }

    // Cover image lives on the Notion page itself, not a property field
    if (data.coverImage !== undefined) {
      (updatePayload as Record<string, unknown>).cover = data.coverImage
        ? { type: "external", external: { url: data.coverImage } }
        : null;
    }

    if (Object.keys(updatePayload).length > 1) {
      await client.pages.update(updatePayload);
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    console.error(`PATCH /api/admin/properties/${id} error:`, err);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

// ── DELETE — archive the page in Notion ───────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const client = notion();
    // Notion doesn't truly delete pages via API — archive instead
    await client.pages.update({ page_id: id, archived: true });
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error(`DELETE /api/admin/properties/${id} error:`, err);
    return NextResponse.json({ error: "Failed to archive property" }, { status: 500 });
  }
}
