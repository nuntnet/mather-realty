/**
 * test/unit/notion-types.test.ts
 *
 * Tests for notion.ts helper functions:
 *   - getMultiLang: locale lookup with en fallback
 *   - buildMultiLangRecord: via the exported getMultiLang across all locales
 *   - calculateListingScore: indirectly via mapProperty (through getProperties mock)
 *
 * The Notion SDK and notion-to-md are fully mocked so no network calls are made.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoist mocks before any imports ───────────────────────────────────────────

const { notionMock } = vi.hoisted(() => ({
  notionMock: {
    databases: { query: vi.fn() },
    pages: { create: vi.fn(), update: vi.fn(), retrieve: vi.fn() },
    blocks: {
      children: { append: vi.fn(), list: vi.fn() },
      delete: vi.fn(),
    },
  },
}));

vi.mock("@notionhq/client", () => ({
  Client: vi.fn(function () {
    return notionMock;
  }),
}));

vi.mock("notion-to-md", () => ({
  NotionToMarkdown: vi.fn(function () {
    return {
      pageToMarkdown: vi.fn(async () => []),
      toMarkdownString: vi.fn(() => ({ parent: "" })),
    };
  }),
}));

// ── Import after mocks ────────────────────────────────────────────────────────

import {
  getMultiLang,
  notionRichTextToString,
  getProperties,
} from "@/lib/notion";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function richText(text: string) {
  return text
    ? [{ plain_text: text, type: "text", text: { content: text } }]
    : [];
}

function makeFakePage(properties: Record<string, unknown>, id = "p-1") {
  return {
    id,
    object: "page",
    created_time: "2025-01-10T00:00:00.000Z",
    last_edited_time: "2025-01-10T00:00:00.000Z",
    cover: null,
    properties,
  } as any;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe("notionRichTextToString", () => {
  it("returns empty string for null/undefined", () => {
    expect(notionRichTextToString(null)).toBe("");
    expect(notionRichTextToString(undefined)).toBe("");
  });

  it("returns empty string for empty array", () => {
    expect(notionRichTextToString([])).toBe("");
  });

  it("concatenates plain_text from multiple segments", () => {
    const items = [
      { plain_text: "Hello", type: "text", text: { content: "Hello" } },
      { plain_text: " World", type: "text", text: { content: " World" } },
    ] as any;
    expect(notionRichTextToString(items)).toBe("Hello World");
  });
});

describe("getMultiLang — locale lookup and fallback", () => {
  it("returns the exact locale value when present", () => {
    const page = makeFakePage({
      title_en: { type: "rich_text", rich_text: richText("English title") },
      title_th: { type: "rich_text", rich_text: richText("Thai title") },
    });
    expect(getMultiLang(page, "title", "th")).toBe("Thai title");
  });

  it("falls back to en when requested locale is missing", () => {
    const page = makeFakePage({
      title_en: { type: "rich_text", rich_text: richText("English fallback") },
    });
    expect(getMultiLang(page, "title", "ja")).toBe("English fallback");
  });

  it("returns empty string when neither locale nor en exist", () => {
    const page = makeFakePage({});
    expect(getMultiLang(page, "title", "ko")).toBe("");
  });

  it("reads title-type properties (not just rich_text)", () => {
    const page = makeFakePage({
      title_en: { type: "title", title: richText("Title field") },
    });
    expect(getMultiLang(page, "title", "en")).toBe("Title field");
  });

  it("prefers exact locale over en even when both present", () => {
    const page = makeFakePage({
      title_en: { type: "rich_text", rich_text: richText("English") },
      title_de: { type: "rich_text", rich_text: richText("Deutsch") },
    });
    expect(getMultiLang(page, "title", "de")).toBe("Deutsch");
  });

  it("returns empty string when locale field exists but has empty rich_text (no fallback)", () => {
    const page = makeFakePage({
      title_en: { type: "rich_text", rich_text: richText("Fallback EN") },
      title_fr: { type: "rich_text", rich_text: [] },
    });
    // fr key exists (returns ""), so getMultiLang returns "" — it does NOT fall back to en
    // because the locale branch already fired (it just produced an empty string)
    expect(getMultiLang(page, "title", "fr")).toBe("");
  });
});

describe("getProperties — error handling and empty result", () => {
  it("returns [] when Notion throws", async () => {
    notionMock.databases.query.mockRejectedValue(new Error("Notion API error"));
    const result = await getProperties();
    expect(result).toEqual([]);
  });

  it("returns [] when query returns no results", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
    });
    const result = await getProperties();
    expect(result).toEqual([]);
  });

  it("maps pages to Property objects", async () => {
    const page = makeFakePage({
      slug: { type: "rich_text", rich_text: richText("beachfront-villa") },
      title_en: { type: "rich_text", rich_text: richText("Beachfront Villa") },
      description_en: { type: "rich_text", rich_text: richText("Beautiful villa") },
      address: { type: "rich_text", rich_text: richText("123 Beach Rd") },
      city: { type: "rich_text", rich_text: richText("Phuket") },
      district: { type: "rich_text", rich_text: richText("Patong") },
      lat: { type: "number", number: 7.9 },
      lng: { type: "number", number: 98.3 },
      price_thb: { type: "number", number: 50000 },
      bedrooms: { type: "number", number: 2 },
      bathrooms: { type: "number", number: 2 },
      size_sqm: { type: "number", number: 120 },
      amenities: { type: "multi_select", multi_select: [{ name: "Pool" }] },
      status: { type: "select", select: { name: "available" } },
      available_from: { type: "date", date: { start: "2025-06-01" } },
      tags: { type: "multi_select", multi_select: [{ name: "featured" }] },
    });

    notionMock.databases.query.mockResolvedValue({
      results: [page],
      has_more: false,
      next_cursor: null,
    });

    const result = await getProperties();
    expect(result).toHaveLength(1);
    expect(result[0]!.slug).toBe("beachfront-villa");
    expect(result[0]!.city).toBe("Phuket");
    expect(result[0]!.priceTHB).toBe(50000);
    expect(result[0]!.title["en"]).toBe("Beachfront Villa");
    expect(result[0]!.amenities).toContain("Pool");
    expect(result[0]!.tags).toContain("featured");
  });
});

describe("calculateListingScore — via mapProperty", () => {
  it("gives a low score for a completely empty property page", async () => {
    const page = makeFakePage({});
    notionMock.databases.query.mockResolvedValue({
      results: [page],
      has_more: false,
      next_cursor: null,
    });
    const [prop] = await getProperties();
    // Only the virtual-tour check passes (has_virtual_tour=false → true) = 1/18 → score 6
    expect(prop!.listingScore).toBe(6);
  });

  it("gives higher score for a more complete property", async () => {
    const fullPage = makeFakePage({
      slug: { type: "rich_text", rich_text: richText("villa-phuket") },
      title_en: { type: "rich_text", rich_text: richText("Villa Phuket") },
      description_en: { type: "rich_text", rich_text: richText("Great villa") },
      address: { type: "rich_text", rich_text: richText("1 Beach Rd") },
      city: { type: "rich_text", rich_text: richText("Phuket") },
      district: { type: "rich_text", rich_text: richText("Patong") },
      lat: { type: "number", number: 7.9 },
      lng: { type: "number", number: 98.3 },
      price_thb: { type: "number", number: 45000 },
      bedrooms: { type: "number", number: 3 },
      bathrooms: { type: "number", number: 2 },
      size_sqm: { type: "number", number: 200 },
      amenities: { type: "multi_select", multi_select: [{ name: "Pool" }] },
      tags: { type: "multi_select", multi_select: [{ name: "featured" }] },
      available_from: { type: "date", date: { start: "2025-07-01" } },
    });

    const emptyPage = makeFakePage({}, "p-empty");

    notionMock.databases.query
      .mockResolvedValueOnce({
        results: [fullPage],
        has_more: false,
        next_cursor: null,
      })
      .mockResolvedValueOnce({
        results: [emptyPage],
        has_more: false,
        next_cursor: null,
      });

    const [full] = await getProperties();
    const [empty] = await getProperties();

    expect(full!.listingScore).toBeGreaterThan(empty!.listingScore);
    expect(full!.listingScore).toBeGreaterThan(50);
  });

  it("scores 100 for a fully populated property", async () => {
    const page = makeFakePage({
      slug: { type: "rich_text", rich_text: richText("full-villa") },
      title_en: { type: "rich_text", rich_text: richText("Full Villa") },
      description_en: { type: "rich_text", rich_text: richText("Full description") },
      address: { type: "rich_text", rich_text: richText("1 Main St") },
      city: { type: "rich_text", rich_text: richText("Bangkok") },
      district: { type: "rich_text", rich_text: richText("Sukhumvit") },
      lat: { type: "number", number: 13.7 },
      lng: { type: "number", number: 100.5 },
      price_thb: { type: "number", number: 80000 },
      bedrooms: { type: "number", number: 2 },
      bathrooms: { type: "number", number: 2 },
      size_sqm: { type: "number", number: 100 },
      amenities: { type: "multi_select", multi_select: [{ name: "Pool" }, { name: "WiFi" }] },
      tags: { type: "multi_select", multi_select: [{ name: "featured" }] },
      available_from: { type: "date", date: { start: "2025-08-01" } },
      has_virtual_tour: { type: "checkbox", checkbox: false },
      gallery: {
        type: "files",
        files: [{ type: "external", external: { url: "https://cdn/img.jpg" } }],
      },
    });

    // Inject a cover
    page.cover = { type: "external", external: { url: "https://cdn/cover.jpg" } };

    notionMock.databases.query.mockResolvedValue({
      results: [page],
      has_more: false,
      next_cursor: null,
    });

    const [prop] = await getProperties();
    expect(prop!.listingScore).toBe(100);
  });
});
