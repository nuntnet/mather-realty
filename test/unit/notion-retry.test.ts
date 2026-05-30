import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";

/**
 * Exercises the module-private `notionFetchWithRetry` wrapper in lib/notion.ts
 * by driving the REAL @notionhq/client with a stubbed global `fetch`.
 *
 * - 429 (rate limit) is retried regardless of HTTP method.
 * - Transient 5xx is retried only for idempotent GETs (e.g. pages.retrieve),
 *   NOT for writes/POSTs (databases.query is a POST) to avoid duplicate work.
 *
 * Real timers are used; the wrapper's first backoff is ~500-750ms, so each
 * single-retry scenario adds well under 1s.
 */

// Make React `cache()` a pass-through so getCarById isn't memoized across tests.
vi.mock("react", async (orig) => {
  const actual = await orig<typeof import("react")>();
  return { ...actual, cache: <T>(fn: T) => fn };
});

interface FakeInit {
  method?: string;
}

function fakeResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (k: string) => headers[k.toLowerCase()] ?? null,
    },
    text: async () => JSON.stringify(body),
    json: async () => body,
  };
}

const carPageBody = {
  id: "car-1",
  created_time: "2024-01-01T00:00:00.000Z",
  properties: {
    Name: { title: [{ plain_text: "Mazda CX-5" }] },
    Brand: { select: { name: "Mazda" } },
    Slug: { rich_text: [{ plain_text: "mazda-cx-5" }] },
  },
};

let notion: typeof import("@/lib/notion");

beforeAll(async () => {
  process.env.NOTION_API_KEY = "secret_test_key";
  process.env.NOTION_CARS_DB_ID = "cars-db";
  process.env.NOTION_BLOG_DB_ID = "blog-db";
  notion = await import("@/lib/notion");
});

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("notionFetchWithRetry — 429 rate limit", () => {
  it("retries a 429 (on a POST query) then succeeds on the next attempt", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse(429, { message: "rate limited" }, { "retry-after": "0" }))
      .mockResolvedValueOnce(fakeResponse(200, { results: [carPageBody] }));
    vi.stubGlobal("fetch", fetchMock);

    const cars = await notion.getActiveCars();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cars).toHaveLength(1);
    expect(cars[0].brand).toBe("Mazda");
  });
});

describe("notionFetchWithRetry — 5xx", () => {
  it("does NOT retry a 5xx on a non-GET (databases.query is a POST)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(fakeResponse(500, { message: "boom" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(notion.getActiveCars()).rejects.toBeDefined();
    // No retry for POST 5xx → exactly one fetch.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("DOES retry a 5xx on an idempotent GET (pages.retrieve via getCarById)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse(503, { message: "unavailable" }))
      .mockResolvedValueOnce(fakeResponse(200, carPageBody));
    vi.stubGlobal("fetch", fetchMock);

    const car = await notion.getCarById("car-1");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(car?.id).toBe("car-1");
  });
});

void (null as unknown as FakeInit);
