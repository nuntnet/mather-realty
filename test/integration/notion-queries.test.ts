/**
 * test/integration/notion-queries.test.ts
 *
 * Integration-sketch tests for lib/notion.ts property queries.
 * The Notion client is mocked at module level — no real network calls.
 *
 * Covers:
 *   - getProperties returns [] on Notion error
 *   - getProperty returns null on not-found (empty results)
 *   - getProperty returns null when Notion throws
 *   - getFeaturedProperties limits results correctly
 *   - getFeaturedProperties returns [] on error
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoist mocks ───────────────────────────────────────────────────────────────

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

// ── Import under test ─────────────────────────────────────────────────────────

import {
  getProperties,
  getProperty,
  getFeaturedProperties,
} from "@/lib/notion";

// ── Page fixture builder ──────────────────────────────────────────────────────

function richText(text: string) {
  return text
    ? [{ plain_text: text, type: "text", text: { content: text } }]
    : [];
}

function makePropertyPage(
  slug: string,
  opts: { id?: string; status?: string; tags?: string[] } = {},
) {
  return {
    id: opts.id ?? `page-${slug}`,
    object: "page",
    created_time: "2025-03-01T00:00:00.000Z",
    last_edited_time: "2025-03-01T00:00:00.000Z",
    cover: null,
    properties: {
      slug: { type: "rich_text", rich_text: richText(slug) },
      title_en: { type: "rich_text", rich_text: richText(`Property ${slug}`) },
      description_en: { type: "rich_text", rich_text: richText("A nice place") },
      address: { type: "rich_text", rich_text: richText("1 Beach Rd") },
      city: { type: "rich_text", rich_text: richText("Phuket") },
      district: { type: "rich_text", rich_text: richText("Patong") },
      lat: { type: "number", number: 7.9 },
      lng: { type: "number", number: 98.3 },
      price_thb: { type: "number", number: 40000 },
      bedrooms: { type: "number", number: 2 },
      bathrooms: { type: "number", number: 1 },
      size_sqm: { type: "number", number: 80 },
      amenities: { type: "multi_select", multi_select: [{ name: "WiFi" }] },
      status: { type: "select", select: { name: opts.status ?? "available" } },
      tags: {
        type: "multi_select",
        multi_select: (opts.tags ?? []).map((t) => ({ name: t })),
      },
      available_from: { type: "date", date: null },
    },
  } as any;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── getProperties ─────────────────────────────────────────────────────────────

describe("getProperties", () => {
  it("returns [] when Notion throws an error", async () => {
    notionMock.databases.query.mockRejectedValue(new Error("503 Service Unavailable"));
    const result = await getProperties();
    expect(result).toEqual([]);
  });

  it("returns [] when there are no matching pages", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
    });
    const result = await getProperties();
    expect(result).toEqual([]);
  });

  it("returns mapped Property objects for each page result", async () => {
    const pages = [
      makePropertyPage("villa-a", { id: "id-a" }),
      makePropertyPage("villa-b", { id: "id-b" }),
    ];
    notionMock.databases.query.mockResolvedValue({
      results: pages,
      has_more: false,
      next_cursor: null,
    });

    const result = await getProperties();
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.slug)).toEqual(["villa-a", "villa-b"]);
  });

  it("filters out non-page objects returned by Notion", async () => {
    const pages = [
      makePropertyPage("villa-a"),
      { id: "db-1", object: "database" }, // should be ignored
    ];
    notionMock.databases.query.mockResolvedValue({
      results: pages,
      has_more: false,
      next_cursor: null,
    });

    const result = await getProperties();
    expect(result).toHaveLength(1);
    expect(result[0]!.slug).toBe("villa-a");
  });

  it("follows pagination (has_more) to fetch all pages", async () => {
    // First page returns has_more: true with a cursor
    notionMock.databases.query
      .mockResolvedValueOnce({
        results: [makePropertyPage("villa-a")],
        has_more: true,
        next_cursor: "cursor-abc",
      })
      .mockResolvedValueOnce({
        results: [makePropertyPage("villa-b")],
        has_more: false,
        next_cursor: null,
      });

    const result = await getProperties();
    expect(result).toHaveLength(2);
    expect(notionMock.databases.query).toHaveBeenCalledTimes(2);
    const secondCall = notionMock.databases.query.mock.calls[1][0];
    expect(secondCall.start_cursor).toBe("cursor-abc");
  });
});

// ── getProperty ───────────────────────────────────────────────────────────────

describe("getProperty", () => {
  it("returns null when Notion returns no results (not-found)", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
    });
    const result = await getProperty("non-existent-slug");
    expect(result).toBeNull();
  });

  it("returns null when Notion throws an error", async () => {
    notionMock.databases.query.mockRejectedValue(new Error("Notion API error"));
    const result = await getProperty("villa-a");
    expect(result).toBeNull();
  });

  it("returns the Property when a matching page is found", async () => {
    const page = makePropertyPage("ocean-view-condo");
    notionMock.databases.query.mockResolvedValue({
      results: [page],
      has_more: false,
      next_cursor: null,
    });

    const result = await getProperty("ocean-view-condo");
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("ocean-view-condo");
    expect(result!.city).toBe("Phuket");
  });

  it("returns null when the result is not a page object", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [{ id: "db-1", object: "database" }],
      has_more: false,
      next_cursor: null,
    });
    const result = await getProperty("some-slug");
    expect(result).toBeNull();
  });

  it("passes the slug in the query filter", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
    });

    await getProperty("my-special-slug");

    const callArgs = notionMock.databases.query.mock.calls[0][0];
    expect(JSON.stringify(callArgs.filter)).toContain("my-special-slug");
  });
});

// ── getFeaturedProperties ─────────────────────────────────────────────────────

describe("getFeaturedProperties", () => {
  it("returns [] when Notion throws an error", async () => {
    notionMock.databases.query.mockRejectedValue(new Error("Rate limited"));
    const result = await getFeaturedProperties();
    expect(result).toEqual([]);
  });

  it("returns [] when there are no featured properties", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
    });
    const result = await getFeaturedProperties();
    expect(result).toEqual([]);
  });

  it("returns mapped Property objects for featured pages", async () => {
    const pages = [
      makePropertyPage("featured-villa-1", { tags: ["featured"] }),
      makePropertyPage("featured-villa-2", { tags: ["featured", "new"] }),
    ];
    notionMock.databases.query.mockResolvedValue({
      results: pages,
      has_more: false,
      next_cursor: null,
    });

    const result = await getFeaturedProperties();
    expect(result).toHaveLength(2);
    expect(result[0]!.slug).toBe("featured-villa-1");
    expect(result[1]!.tags).toContain("featured");
  });

  it("passes the limit as page_size to Notion query", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
    });

    await getFeaturedProperties("en", 3);

    const callArgs = notionMock.databases.query.mock.calls[0][0];
    expect(callArgs.page_size).toBe(3);
  });

  it("uses default limit of 6 when no limit provided", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
    });

    await getFeaturedProperties();

    const callArgs = notionMock.databases.query.mock.calls[0][0];
    expect(callArgs.page_size).toBe(6);
  });

  it("filters out non-page objects from the response", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [
        makePropertyPage("featured-ok"),
        { id: "x", object: "block" },
      ],
      has_more: false,
      next_cursor: null,
    });

    const result = await getFeaturedProperties();
    expect(result).toHaveLength(1);
  });

  it("includes the featured tag filter in the query", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
    });

    await getFeaturedProperties();

    const callArgs = notionMock.databases.query.mock.calls[0][0];
    expect(JSON.stringify(callArgs.filter)).toContain("featured");
  });
});
