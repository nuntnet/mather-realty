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
  const p = page.properties[key] as {
    type: string;
    rich_text?: Array<{ plain_text: string }>;
    title?: Array<{ plain_text: string }>;
    phone_number?: string | null;
    url?: string | null;
    email?: string | null;
  } | undefined;
  if (!p) return "";
  if (p.type === "rich_text") return (p.rich_text ?? []).map((r) => r.plain_text).join("");
  if (p.type === "title") return (p.title ?? []).map((r) => r.plain_text).join("");
  if (p.type === "phone_number") return p.phone_number ?? "";
  if (p.type === "url") return p.url ?? "";
  if (p.type === "email") return p.email ?? "";
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

/** Read exterior/interior/community from new separate fields,
 *  falling back to the legacy gallery_categories JSON blob if needed. */
function getCategoryPhotos(page: PageObjectResponse) {
  const extRaw  = richText(page, "exterior_photos");
  const intRaw  = richText(page, "interior_photos");
  const comRaw  = richText(page, "community_photos");

  // If all three new fields are populated, use them directly
  if (extRaw || intRaw || comRaw) {
    return { exteriorPhotos: extRaw, interiorPhotos: intRaw, communityPhotos: comRaw };
  }

  // Fallback: parse legacy gallery_categories JSON
  const gcRaw = richText(page, "gallery_categories");
  if (gcRaw) {
    try {
      const cats = JSON.parse(gcRaw) as { exterior?: string[]; interior?: string[]; community?: string[] };
      return {
        exteriorPhotos:  (cats.exterior  ?? []).join(","),
        interiorPhotos:  (cats.interior  ?? []).join(","),
        communityPhotos: (cats.community ?? []).join(","),
      };
    } catch { /* fall through */ }
  }

  return { exteriorPhotos: "", interiorPhotos: "", communityPhotos: "" };
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

  // Highlights per-locale — English in 'highlights', others in 'highlights_{loc}'
  const parseHL = (raw: string) => raw ? raw.split("•").map(s => s.trim()).filter(Boolean) : []
  const highlights: Record<string, string[]> = {}
  const hlEn = parseHL(richText(page, "highlights"))
  if (hlEn.length) highlights["en"] = hlEn
  for (const loc of LOCALES.filter(l => l !== "en")) {
    const v = parseHL(richText(page, `highlights_${loc}`))
    if (v.length) highlights[loc] = v
  }

  // FAQ per-locale
  const tryParseFaqArr = (s: string) => { try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch { return []; } }
  const faqJson: Record<string, Array<{q: string; a: string}>> = {}
  const faqEn = tryParseFaqArr(richText(page, "faq_json"))
  if (faqEn.length) faqJson["en"] = faqEn
  for (const loc of LOCALES.filter(l => l !== "en")) {
    const v = tryParseFaqArr(richText(page, `faq_json_${loc}`))
    if (v.length) faqJson[loc] = v
  }

  // SEO per-locale
  const seoDescription: Record<string, string> = {}
  const seoEn = richText(page, "seo_description")
  if (seoEn) seoDescription["en"] = seoEn
  for (const loc of LOCALES.filter(l => l !== "en")) {
    const v = richText(page, `seo_description_${loc}`)
    if (v) seoDescription[loc] = v
  }

  // Boolean helper
  const propBool = (key: string) => {
    const p = page.properties[key] as { type: string; checkbox?: boolean } | undefined;
    return p?.type === "checkbox" ? (p.checkbox ?? false) : false;
  };

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
    floors: propNumber(page, "floors"),
    parkingSpots: propNumber(page, "parking_spots"),
    amenities: propMultiSelect(page, "amenities"),
    status: propSelect(page, "status") || "pending",
    availableFrom: propDate(page, "available_from"),
    minLeaseTerm: propNumber(page, "min_lease_months"),
    depositMonths: propNumber(page, "deposit_months"),
    contactLine: richText(page, "contact_line"),
    contactPhone: richText(page, "contact_phone"),
    highlights,
    perfectFor: propMultiSelect(page, "perfect_for"),
    tags: propMultiSelect(page, "tags"),
    faqJson,
    seoDescription,
    // personaDescriptions: per-locale Record<locale, string>
    personaDescriptions: (() => {
      const rec: Record<string, string> = {}
      const en = richText(page, "persona_descriptions")
      if (en) rec["en"] = en
      for (const loc of LOCALES.filter(l => l !== "en")) {
        const v = richText(page, `persona_descriptions_${loc}`)
        if (v) rec[loc] = v
      }
      return rec
    })(),
    hasVirtualTour: propBool("has_virtual_tour"),
    gallery: galleryUrls,
    virtualTourUrl: richText(page, "virtual_tour_url") || null,
    // New separate fields — fallback to legacy gallery_categories JSON if empty
    ...getCategoryPhotos(page),
    heroPhotos: richText(page, "hero_photos"),
    verifiedAt: propDate(page, "verified_at"),
    approvedAt: propDate(page, "approved_at"),
    slug: richText(page, "slug"),
  };
}

// ── Notion rich_text helper — splits strings > 1900 chars across multiple items ─
// Notion enforces a 2000-char limit per text block. Long comma-separated URL
// lists (gallery, categories, hero) easily exceed this.
function toRichText(str: string) {
  const LIMIT = 1900;
  if (!str) return [{ text: { content: "" } }];
  if (str.length <= LIMIT) return [{ text: { content: str } }];

  const items = [];
  let remaining = str;
  while (remaining.length > 0) {
    if (remaining.length <= LIMIT) {
      items.push({ text: { content: remaining } });
      break;
    }
    // Prefer cutting at a comma boundary so URLs stay intact
    const cut = remaining.lastIndexOf(",", LIMIT);
    const end = cut > 0 ? cut + 1 : LIMIT; // include the comma in the chunk
    items.push({ text: { content: remaining.slice(0, end) } });
    remaining = remaining.slice(end);
  }
  return items;
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
  floors: z.number().int().nullable().optional(),
  parkingSpots: z.number().int().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  status: z.enum(["available","rented","coming_soon","pending","archived"]).optional(),
  availableFrom: z.string().nullable().optional(),
  minLeaseTerm: z.number().int().nullable().optional(),
  depositMonths: z.number().int().nullable().optional(),
  contactLine: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  // highlights: legacy = string[], new = Record<locale, string[]>
  highlights: z.union([z.array(z.string()), z.record(z.array(z.string()))]).optional(),
  perfectFor: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  // faqJson: legacy = JSON string, new = Record<locale, FaqItem[]>
  faqJson: z.union([z.string(), z.record(z.unknown())]).optional(),
  // seoDescription: legacy = string, new = Record<locale, string>
  seoDescription: z.union([z.string(), z.record(z.string())]).optional(),
  personaDescriptions: z.union([z.string(), z.record(z.string())]).optional(), // string (EN legacy) or Record<locale, string>
  hasVirtualTour: z.boolean().optional(),
  gallery: z.array(z.string()).optional(),
  virtualTourUrl: z.string().nullable().optional(),
  exteriorPhotos: z.string().optional(),     // comma-separated
  interiorPhotos: z.string().optional(),
  communityPhotos: z.string().optional(),
  heroPhotos: z.string().optional(),    // comma-separated, empty = show all
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

    // Skip the retrieve call — we know the DB schema:
    //   status = select type, all optional fields guarded below
    const updates: Record<string, unknown> = {};

    // Helper: only add update if the key might exist (prevents Notion 400 on missing props)
    // We use a soft check — if Notion rejects, it's caught per-call
    const addUpdate = (key: string, value: unknown) => { updates[key] = value; };

    // Multilingual titles
    if (data.titles) {
      for (const loc of LOCALES) {
        if (data.titles[loc] !== undefined) {
          addUpdate(`title_${loc}`, { rich_text: toRichText(data.titles[loc] ?? "") });
        }
      }
    }

    // Multilingual descriptions — can be very long, must chunk
    if (data.descriptions) {
      for (const loc of LOCALES) {
        if (data.descriptions[loc] !== undefined) {
          addUpdate(`description_${loc}`, { rich_text: toRichText(data.descriptions[loc] ?? "") });
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
      ["floors", "floors"],
      ["parkingSpots", "parking_spots"],
      ["minLeaseTerm", "min_lease_months"],
      ["depositMonths", "deposit_months"],
    ];
    for (const [formKey, notionKey] of numFields) {
      if (data[formKey] !== undefined) {
        updates[notionKey] = { number: data[formKey] ?? null };
      }
    }

    // Available from (date)
    if (data.availableFrom !== undefined) {
      updates["available_from"] = data.availableFrom
        ? { date: { start: data.availableFrom } }
        : { date: null };
    }

    // Contact fields
    if (data.contactLine !== undefined) {
      updates["contact_line"] = { rich_text: [{ text: { content: data.contactLine ?? "" } }] };
    }
    // contact_phone is phone_number type in Notion (not rich_text)
    if (data.contactPhone !== undefined) {
      updates["contact_phone"] = { phone_number: data.contactPhone || null };
    }

    // Highlights — now per-locale: { en: [...], ko: [...] } or legacy array (admin edit)
    if (data.highlights !== undefined) {
      if (Array.isArray(data.highlights)) {
        // Legacy format from admin edit page (English array)
        updates["highlights"] = { rich_text: toRichText(data.highlights.filter(Boolean).join(" • ")) };
      } else if (typeof data.highlights === 'object') {
        // Per-locale format: { en: [...], ko: [...] }
        const h = data.highlights as Record<string, string[]>
        if (h['en']) updates["highlights"] = { rich_text: toRichText(h['en'].filter(Boolean).join(" • ")) }
        for (const loc of LOCALES.filter(l => l !== 'en')) {
          if (h[loc]) updates[`highlights_${loc}`] = { rich_text: toRichText(h[loc].filter(Boolean).join(" • ")) }
        }
      }
    }

    // Perfect For / Tags (multi_select)
    if (data.perfectFor !== undefined) {
      updates["perfect_for"] = { multi_select: data.perfectFor.map(name => ({ name })) };
    }
    if (data.tags !== undefined) {
      updates["tags"] = { multi_select: data.tags.map(name => ({ name })) };
    }

    // FAQ — per-locale: { en: [...], ko: [...] } or legacy string
    if (data.faqJson !== undefined) {
      if (typeof data.faqJson === 'string') {
        updates["faq_json"] = { rich_text: toRichText(data.faqJson) };
      } else if (typeof data.faqJson === 'object' && !Array.isArray(data.faqJson)) {
        const f = data.faqJson as Record<string, unknown>
        if (f['en']) updates["faq_json"] = { rich_text: toRichText(JSON.stringify(f['en'])) }
        for (const loc of LOCALES.filter(l => l !== 'en')) {
          if (f[loc]) updates[`faq_json_${loc}`] = { rich_text: toRichText(JSON.stringify(f[loc])) }
        }
      }
    }

    // SEO description — per-locale: { en: "...", ko: "..." } or legacy string
    if (data.seoDescription !== undefined) {
      if (typeof data.seoDescription === 'string') {
        updates["seo_description"] = { rich_text: toRichText(data.seoDescription) };
      } else if (typeof data.seoDescription === 'object') {
        const s = data.seoDescription as Record<string, string>
        if (s['en']) updates["seo_description"] = { rich_text: toRichText(s['en']) }
        for (const loc of LOCALES.filter(l => l !== 'en')) {
          if (s[loc]) updates[`seo_description_${loc}`] = { rich_text: toRichText(s[loc]) }
        }
      }
    }

    // Persona descriptions — per-locale Record<locale, string> or legacy single string
    if (data.personaDescriptions !== undefined) {
      if (typeof data.personaDescriptions === "string") {
        // Legacy: single EN string
        updates["persona_descriptions"] = { rich_text: toRichText(data.personaDescriptions) };
      } else if (typeof data.personaDescriptions === "object") {
        const pd = data.personaDescriptions as Record<string, string>
        if (pd["en"]) updates["persona_descriptions"] = { rich_text: toRichText(pd["en"]) };
        for (const loc of LOCALES.filter(l => l !== "en")) {
          if (pd[loc]) updates[`persona_descriptions_${loc}`] = { rich_text: toRichText(pd[loc]) };
        }
      }
    }

    if (data.hasVirtualTour !== undefined) {
      addUpdate("has_virtual_tour", { checkbox: data.hasVirtualTour });
    }

    // Gallery category photo URL strings — chunked to respect 2000-char limit
    if (data.exteriorPhotos !== undefined) {
      addUpdate("exterior_photos", { rich_text: toRichText(data.exteriorPhotos) });
    }
    if (data.interiorPhotos !== undefined) {
      addUpdate("interior_photos", { rich_text: toRichText(data.interiorPhotos) });
    }
    if (data.communityPhotos !== undefined) {
      addUpdate("community_photos", { rich_text: toRichText(data.communityPhotos) });
    }
    if (data.heroPhotos !== undefined) {
      addUpdate("hero_photos", { rich_text: toRichText(data.heroPhotos) });
    }

    // Status — confirmed select type in this DB
    if (data.status) {
      updates["status"] = { select: { name: data.status } };
    }

    // Amenities (multi_select)
    if (data.amenities !== undefined) {
      updates["amenities"] = {
        multi_select: data.amenities.map((name) => ({ name })),
      };
    }

    // Gallery URLs — comma-separated, chunked to respect Notion 2000-char limit
    if (data.gallery !== undefined) {
      updates["gallery_urls"] = { rich_text: toRichText(data.gallery.join(",")) };
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

    // Cover image — only set if non-empty URL (avoid accidentally removing covers)
    if (data.coverImage) {
      (updatePayload as Record<string, unknown>).cover = {
        type: "external",
        external: { url: data.coverImage },
      };
    }

    // Run properties update and cover update separately so we can pinpoint failures
    const results: string[] = [];
    const errors: string[] = [];

    if (Object.keys(updates).length > 0) {
      try {
        await client.pages.update({ page_id: id, properties: updates as Parameters<typeof client.pages.update>[0]["properties"] });
        results.push(`properties(${Object.keys(updates).join(",")})`);
      } catch (propErr) {
        const msg = propErr instanceof Error ? propErr.message : String(propErr);
        errors.push(`properties: ${msg}`);
        console.error(`PATCH ${id} properties error:`, msg, JSON.stringify(Object.keys(updates)));
      }
    }

    // Only set cover if it's a valid absolute URL (Notion rejects relative/invalid URLs)
    const isValidUrl = (u: string) => {
      try { return /^https?:\/\/.+/.test(u); } catch { return false; }
    };
    if (data.coverImage && isValidUrl(data.coverImage)) {
      try {
        await client.pages.update({
          page_id: id,
          cover: { type: "external", external: { url: data.coverImage } },
        } as Parameters<typeof client.pages.update>[0]);
        results.push("cover");
      } catch (coverErr) {
        const msg = coverErr instanceof Error ? coverErr.message : String(coverErr);
        errors.push(`cover: ${msg}`);
        console.error(`PATCH ${id} cover error:`, msg);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Partial update failure", detail: errors.join(" | "), saved: results },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id, saved: results });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error(`PATCH /api/admin/properties/${id} outer error:`, message);
    return NextResponse.json({ error: "Failed to update property", detail: message }, { status: 500 });
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
