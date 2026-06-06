/**
 * test/unit/lib-utils.test.ts
 *
 * Tests for lib/utils.ts:
 *   - cn() — Tailwind className merger (clsx + tailwind-merge)
 *
 * The file only exports `cn`. Price / date formatting helpers live in
 * application components and pages; where such helpers exist as pure functions
 * they are also tested here as inline implementations to document the expected
 * behaviour.
 */

import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

// ── cn() ──────────────────────────────────────────────────────────────────────

describe("cn()", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple classes into a single string", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("deduplicates conflicting Tailwind utilities (tailwind-merge)", () => {
    // tailwind-merge should keep only the last conflicting utility
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("filters out falsy values (clsx behavior)", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("handles conditional object syntax", () => {
    expect(cn({ "font-bold": true, "italic": false })).toBe("font-bold");
  });

  it("handles array syntax", () => {
    expect(cn(["px-2", "py-1"])).toBe("px-2 py-1");
  });

  it("returns empty string when all inputs are falsy", () => {
    expect(cn(undefined, false, null)).toBe("");
  });

  it("handles a mix of strings, objects, and arrays", () => {
    const result = cn("base", ["extra"], { "active": true, "disabled": false });
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).toContain("active");
    expect(result).not.toContain("disabled");
  });

  it("merges Tailwind background-color conflicts correctly", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("preserves non-conflicting utilities when merging", () => {
    const result = cn("flex", "items-center", "justify-between");
    expect(result).toBe("flex items-center justify-between");
  });
});

// ── THB price formatting helpers (inline spec) ────────────────────────────────
//
// The application formats Thai Baht prices in several places. These tests
// document the canonical format used across the codebase so that if a shared
// helper is added later it can be validated against these expectations.

describe("THB price formatting (Intl.NumberFormat spec)", () => {
  function formatThb(amount: number): string {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  it("formats zero correctly", () => {
    const result = formatThb(0);
    expect(result).toMatch(/0/);
  });

  it("formats whole THB amounts without decimals", () => {
    const result = formatThb(50000);
    // Should contain 50,000 or 50.000 depending on locale
    expect(result).toMatch(/50[,.]?000/);
  });

  it("formats large amounts with thousand separators", () => {
    const result = formatThb(1500000);
    expect(result).toMatch(/1[,.]?500[,.]?000/);
  });

  it("includes a THB currency symbol or code", () => {
    const result = formatThb(30000);
    // Thai locale uses ฿ symbol or THB
    expect(result).toMatch(/฿|THB/);
  });
});

// ── Date formatting helpers (inline spec) ─────────────────────────────────────

describe("date formatting (Intl.DateTimeFormat spec)", () => {
  function formatDate(isoDate: string, locale = "en"): string {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(isoDate));
  }

  it("formats a valid ISO date string", () => {
    const result = formatDate("2025-06-15");
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/June|Jun/i);
  });

  it("formats with Thai locale", () => {
    const result = formatDate("2025-06-15", "th-TH");
    expect(result).toMatch(/2025|2568/); // Buddhist calendar may show 2568
  });

  it("handles January correctly", () => {
    const result = formatDate("2025-01-01");
    expect(result).toMatch(/January|Jan/i);
    expect(result).toMatch(/2025/);
  });
});
