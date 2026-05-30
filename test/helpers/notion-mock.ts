import { vi } from "vitest";

/**
 * Build a fresh mock of the `@notionhq/client` `Client` instance surface used
 * by `lib/notion.ts`. Returned object's methods are vi.fn() spies you can
 * program per-test with `.mockResolvedValue(...)`.
 *
 * Usage (inside a test file, hoisted so vi.mock can reference it):
 *
 *   const { notionMock } = vi.hoisted(() => {
 *     const { createNotionMock } = require("../helpers/notion-mock");
 *     return { notionMock: createNotionMock() };
 *   });
 *   vi.mock("@notionhq/client", () => ({ Client: vi.fn(() => notionMock) }));
 */
export function createNotionMock() {
  return {
    databases: {
      query: vi.fn(async () => ({ results: [] })),
    },
    pages: {
      create: vi.fn(async () => ({ id: "new-page", properties: {} })),
      update: vi.fn(async () => ({ id: "updated-page", properties: {} })),
      retrieve: vi.fn(async () => ({ id: "retrieved-page", properties: {} })),
    },
    blocks: {
      children: {
        append: vi.fn(async () => ({})),
        list: vi.fn(async () => ({ results: [] })),
      },
      delete: vi.fn(async () => ({})),
    },
  };
}
