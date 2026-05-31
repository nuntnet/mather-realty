import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  makeCarPage,
  number,
  checkbox,
} from "../helpers/notion-fixtures";

// Mock the Notion SDK so no real network/auth happens.
const { notionMock } = vi.hoisted(() => {
  return {
    notionMock: {
      databases: { query: vi.fn() },
      pages: { create: vi.fn(), update: vi.fn(), retrieve: vi.fn() },
      blocks: {
        children: { append: vi.fn(), list: vi.fn() },
        delete: vi.fn(),
      },
    },
  };
});

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

import * as notion from "@/lib/notion";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getActiveCars — sort order", () => {
  it("applies [Sort Order ASC, Year DESC] sorts on every call", async () => {
    notionMock.databases.query.mockResolvedValue({ results: [] });
    await notion.getActiveCars();

    const query = notionMock.databases.query.mock.calls[0][0];
    expect(query.sorts).toEqual([
      { property: "Sort Order", direction: "ascending" },
      { property: "Year", direction: "descending" },
    ]);
  });

  it("applies the same dual sort when optional filters are provided", async () => {
    notionMock.databases.query.mockResolvedValue({ results: [makeCarPage()] });
    await notion.getActiveCars({ brand: "Ford", condition: "new", type: "pickup" });

    const query = notionMock.databases.query.mock.calls[0][0];
    expect(query.sorts).toEqual([
      { property: "Sort Order", direction: "ascending" },
      { property: "Year", direction: "descending" },
    ]);
  });
});

describe("getActiveCars — filter.and construction", () => {
  it("contains only Is Active when called with no filters", async () => {
    notionMock.databases.query.mockResolvedValue({ results: [] });
    await notion.getActiveCars();

    const { filter } = notionMock.databases.query.mock.calls[0][0];
    expect(filter.and).toEqual([
      { property: "Is Active", checkbox: { equals: true } },
    ]);
  });

  it("appends brand filter when brand is provided", async () => {
    notionMock.databases.query.mockResolvedValue({ results: [] });
    await notion.getActiveCars({ brand: "Mazda" });

    const { filter } = notionMock.databases.query.mock.calls[0][0];
    expect(filter.and).toEqual([
      { property: "Is Active", checkbox: { equals: true } },
      { property: "Brand", select: { equals: "Mazda" } },
    ]);
  });

  it("appends condition filter when condition is provided", async () => {
    notionMock.databases.query.mockResolvedValue({ results: [] });
    await notion.getActiveCars({ condition: "used" });

    const { filter } = notionMock.databases.query.mock.calls[0][0];
    expect(filter.and).toEqual([
      { property: "Is Active", checkbox: { equals: true } },
      { property: "Condition", select: { equals: "used" } },
    ]);
  });

  it("appends type filter when type is provided", async () => {
    notionMock.databases.query.mockResolvedValue({ results: [] });
    await notion.getActiveCars({ type: "ev" });

    const { filter } = notionMock.databases.query.mock.calls[0][0];
    expect(filter.and).toEqual([
      { property: "Is Active", checkbox: { equals: true } },
      { property: "Type", select: { equals: "ev" } },
    ]);
  });

  it("appends brand + condition + type in that order when all three provided", async () => {
    notionMock.databases.query.mockResolvedValue({ results: [makeCarPage()] });
    await notion.getActiveCars({ brand: "GWM", condition: "new", type: "suv" });

    const { filter } = notionMock.databases.query.mock.calls[0][0];
    expect(filter.and).toEqual([
      { property: "Is Active", checkbox: { equals: true } },
      { property: "Brand", select: { equals: "GWM" } },
      { property: "Condition", select: { equals: "new" } },
      { property: "Type", select: { equals: "suv" } },
    ]);
  });
});

describe("getFeaturedCars — Is Best Seller filter", () => {
  it("filters by Is Active AND Is Best Seller", async () => {
    notionMock.databases.query.mockResolvedValue({ results: [] });
    await notion.getFeaturedCars();

    const { filter } = notionMock.databases.query.mock.calls[0][0];
    expect(filter.and).toEqual([
      { property: "Is Active", checkbox: { equals: true } },
      { property: "Is Best Seller", checkbox: { equals: true } },
    ]);
  });

  it("fetches up to 60 best-seller pages for cross-brand filtering", async () => {
    notionMock.databases.query.mockResolvedValue({ results: [] });
    await notion.getFeaturedCars();

    const query = notionMock.databases.query.mock.calls[0][0];
    expect(query.page_size).toBe(60);
  });

  it("returns Car objects mapped from result pages", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [
        makeCarPage({ "Is Best Seller": checkbox(true) }),
        makeCarPage({ "Is Best Seller": checkbox(true) }),
      ],
    });
    const cars = await notion.getFeaturedCars();
    expect(cars).toHaveLength(2);
    expect(cars[0].isBestSeller).toBe(true);
  });
});

describe("pageToCar — sortOrder field mapping", () => {
  it("reads Sort Order number property into car.sortOrder", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [makeCarPage({ "Sort Order": number(3) })],
    });
    const cars = await notion.getActiveCars();
    expect(cars[0].sortOrder).toBe(3);
  });

  it("defaults sortOrder to 0 when Sort Order property is absent", async () => {
    // makeCarPage does not include Sort Order, so propNumber falls back to 0
    notionMock.databases.query.mockResolvedValue({
      results: [makeCarPage()],
    });
    const cars = await notion.getActiveCars();
    expect(cars[0].sortOrder).toBe(0);
  });

  it("maps Sort Order 1 and Sort Order 99 correctly for two cars", async () => {
    notionMock.databases.query.mockResolvedValue({
      results: [
        makeCarPage({ "Sort Order": number(1) }),
        makeCarPage({ "Sort Order": number(99) }),
      ],
    });
    const cars = await notion.getActiveCars();
    expect(cars[0].sortOrder).toBe(1);
    expect(cars[1].sortOrder).toBe(99);
  });
});
