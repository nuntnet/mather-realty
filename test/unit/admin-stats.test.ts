/**
 * test/unit/admin-stats.test.ts
 *
 * Tests for lib/admin-dashboard-stats.ts (realty platform edition):
 *   - isWithinLastDays
 *   - computePropertyStats
 *   - computeInquiryStats
 *   - computeBlogStats (bonus)
 *   - computeActivitySummary (bonus)
 */

import { describe, it, expect } from "vitest";
import type { Property, BlogPost } from "@/lib/notion-types";
import {
  isWithinLastDays,
  computePropertyStats,
  computeInquiryStats,
  computeBlogStats,
  computeActivitySummary,
  type InquiryRecord,
  type SubmissionRecord,
} from "@/lib/admin-dashboard-stats";

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: "prop-1",
    slug: "test-property",
    title: { en: "Test Property" },
    description: { en: "Description" },
    address: "123 Main St",
    city: "Bangkok",
    district: "Sukhumvit",
    lat: 13.7,
    lng: 100.5,
    priceTHB: 30000,
    bedrooms: 2,
    bathrooms: 1,
    sizeSqm: 80,
    amenities: [],
    status: "available",
    availableFrom: null,
    coverImage: "",
    gallery: [],
    hasVirtualTour: false,
    virtualTourUrl: null,
    verifiedAt: null,
    approvedAt: null,
    listingScore: 50,
    ownerId: null,
    tags: [],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    ...overrides,
  };
}

function makeInquiry(overrides: Partial<InquiryRecord> = {}): InquiryRecord {
  return {
    id: 1,
    propertyId: "prop-1",
    name: "John Doe",
    contactType: "email",
    status: "new",
    createdAt: daysAgo(1),
    ...overrides,
  };
}

// ── isWithinLastDays ──────────────────────────────────────────────────────────

describe("isWithinLastDays", () => {
  it("returns true for a date within the window", () => {
    expect(isWithinLastDays(daysAgo(3), 7)).toBe(true);
  });

  it("returns false for a date outside the window", () => {
    expect(isWithinLastDays(daysAgo(10), 7)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isWithinLastDays(null, 7)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isWithinLastDays(undefined, 7)).toBe(false);
  });

  it("returns false for an invalid date string", () => {
    expect(isWithinLastDays("not-a-date", 7)).toBe(false);
  });

  it("returns true for today", () => {
    expect(isWithinLastDays(new Date().toISOString(), 1)).toBe(true);
  });

  it("respects the exact day boundary", () => {
    // 7 days ago — should be included in a 7-day window
    expect(isWithinLastDays(daysAgo(7), 7)).toBe(true);
    // 8 days ago — should be outside
    expect(isWithinLastDays(daysAgo(8), 7)).toBe(false);
  });
});

// ── computePropertyStats ──────────────────────────────────────────────────────

describe("computePropertyStats", () => {
  it("returns all-zero stats for an empty array", () => {
    const stats = computePropertyStats([]);
    expect(stats.total).toBe(0);
    expect(stats.available).toBe(0);
    expect(stats.rented).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.archived).toBe(0);
    expect(stats.coming_soon).toBe(0);
    expect(stats.verified).toBe(0);
    expect(stats.last7Days).toBe(0);
    expect(stats.byCity).toEqual({});
  });

  it("counts total correctly", () => {
    const props = [makeProperty(), makeProperty({ id: "p2" }), makeProperty({ id: "p3" })];
    expect(computePropertyStats(props).total).toBe(3);
  });

  it("counts available, rented, pending, archived, coming_soon by status", () => {
    const props = [
      makeProperty({ status: "available" }),
      makeProperty({ id: "p2", status: "available" }),
      makeProperty({ id: "p3", status: "rented" }),
      makeProperty({ id: "p4", status: "pending" }),
      makeProperty({ id: "p5", status: "archived" }),
      makeProperty({ id: "p6", status: "coming_soon" }),
    ];
    const stats = computePropertyStats(props);
    expect(stats.available).toBe(2);
    expect(stats.rented).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.archived).toBe(1);
    expect(stats.coming_soon).toBe(1);
  });

  it("counts verified properties (have verifiedAt)", () => {
    const props = [
      makeProperty({ verifiedAt: "2025-01-01" }),
      makeProperty({ id: "p2", verifiedAt: null }),
      makeProperty({ id: "p3", verifiedAt: "2025-03-15" }),
    ];
    expect(computePropertyStats(props).verified).toBe(2);
  });

  it("counts last7Days properties correctly", () => {
    const props = [
      makeProperty({ createdAt: daysAgo(2) }),
      makeProperty({ id: "p2", createdAt: daysAgo(5) }),
      makeProperty({ id: "p3", createdAt: daysAgo(10) }),
    ];
    expect(computePropertyStats(props).last7Days).toBe(2);
  });

  it("groups byCity correctly", () => {
    const props = [
      makeProperty({ city: "Bangkok" }),
      makeProperty({ id: "p2", city: "Bangkok" }),
      makeProperty({ id: "p3", city: "Phuket" }),
    ];
    const { byCity } = computePropertyStats(props);
    expect(byCity["Bangkok"]).toBe(2);
    expect(byCity["Phuket"]).toBe(1);
  });

  it("uses 'Unknown' for properties with missing city", () => {
    const props = [makeProperty({ city: "" }), makeProperty({ id: "p2", city: "" })];
    const { byCity } = computePropertyStats(props);
    expect(byCity["Unknown"]).toBe(2);
  });

  it("handles mixed verified and unverified, recent and old", () => {
    const props = [
      makeProperty({ verifiedAt: "2024-06-01", createdAt: daysAgo(1) }),
      makeProperty({ id: "p2", verifiedAt: null, createdAt: daysAgo(20) }),
    ];
    const stats = computePropertyStats(props);
    expect(stats.verified).toBe(1);
    expect(stats.last7Days).toBe(1);
  });
});

// ── computeInquiryStats ───────────────────────────────────────────────────────

describe("computeInquiryStats", () => {
  it("returns all-zero stats for an empty array", () => {
    const stats = computeInquiryStats([]);
    expect(stats.total).toBe(0);
    expect(stats.new).toBe(0);
    expect(stats.contacted).toBe(0);
    expect(stats.booked).toBe(0);
    expect(stats.declined).toBe(0);
    expect(stats.last7Days).toBe(0);
  });

  it("counts total correctly", () => {
    const inquiries = [makeInquiry(), makeInquiry({ id: 2 }), makeInquiry({ id: 3 })];
    expect(computeInquiryStats(inquiries).total).toBe(3);
  });

  it("counts by status: new, contacted, booked, declined", () => {
    const inquiries = [
      makeInquiry({ status: "new" }),
      makeInquiry({ id: 2, status: "new" }),
      makeInquiry({ id: 3, status: "contacted" }),
      makeInquiry({ id: 4, status: "booked" }),
      makeInquiry({ id: 5, status: "declined" }),
    ];
    const stats = computeInquiryStats(inquiries);
    expect(stats.new).toBe(2);
    expect(stats.contacted).toBe(1);
    expect(stats.booked).toBe(1);
    expect(stats.declined).toBe(1);
  });

  it("counts last7Days based on createdAt", () => {
    const inquiries = [
      makeInquiry({ createdAt: daysAgo(1) }),
      makeInquiry({ id: 2, createdAt: daysAgo(3) }),
      makeInquiry({ id: 3, createdAt: daysAgo(14) }),
    ];
    expect(computeInquiryStats(inquiries).last7Days).toBe(2);
  });

  it("handles null createdAt gracefully", () => {
    const inquiries = [makeInquiry({ createdAt: null })];
    const stats = computeInquiryStats(inquiries);
    expect(stats.total).toBe(1);
    expect(stats.last7Days).toBe(0);
  });

  it("counts unknown statuses as 0 for named fields", () => {
    const inquiries = [makeInquiry({ status: "unknown_status" })];
    const stats = computeInquiryStats(inquiries);
    expect(stats.new).toBe(0);
    expect(stats.contacted).toBe(0);
    expect(stats.total).toBe(1);
  });
});

// ── computeBlogStats ──────────────────────────────────────────────────────────

describe("computeBlogStats", () => {
  function makeBlogPost(overrides: Partial<BlogPost> = {}): BlogPost {
    return {
      id: "blog-1",
      slug: "test-post",
      title: { en: "Test Post" },
      excerpt: { en: "Excerpt" },
      content: "",
      category: "lifestyle",
      coverImage: "",
      published: true,
      publishedAt: daysAgo(1),
      tags: [],
      locale: "en",
      ...overrides,
    };
  }

  it("counts published vs draft", () => {
    const posts = [
      makeBlogPost({ published: true }),
      makeBlogPost({ id: "b2", published: false }),
      makeBlogPost({ id: "b3", published: true }),
    ];
    const stats = computeBlogStats(posts);
    expect(stats.total).toBe(3);
    expect(stats.published).toBe(2);
    expect(stats.draft).toBe(1);
  });

  it("counts last7Days only for published posts", () => {
    const posts = [
      makeBlogPost({ published: true, publishedAt: daysAgo(2) }),
      makeBlogPost({ id: "b2", published: true, publishedAt: daysAgo(10) }),
      makeBlogPost({ id: "b3", published: false, publishedAt: daysAgo(1) }),
    ];
    expect(computeBlogStats(posts).last7Days).toBe(1);
  });

  it("groups byCategory", () => {
    const posts = [
      makeBlogPost({ category: "news" }),
      makeBlogPost({ id: "b2", category: "tips" }),
      makeBlogPost({ id: "b3", category: "news" }),
    ];
    const { byCategory } = computeBlogStats(posts);
    expect(byCategory["news"]).toBe(2);
    expect(byCategory["tips"]).toBe(1);
  });
});

// ── computeActivitySummary ────────────────────────────────────────────────────

describe("computeActivitySummary", () => {
  function makeSubmission(overrides: Partial<SubmissionRecord> = {}): SubmissionRecord {
    return {
      id: 1,
      status: "pending",
      submittedAt: daysAgo(1),
      ...overrides,
    };
  }

  it("sums inquiries and submissions within last 7 days", () => {
    const inquiries = [makeInquiry(), makeInquiry({ id: 2, createdAt: daysAgo(20) })];
    const submissions = [makeSubmission(), makeSubmission({ id: 2 })];
    const summary = computeActivitySummary(inquiries, submissions);
    expect(summary.inquiries).toBe(1);
    expect(summary.submissions).toBe(2);
    expect(summary.total).toBe(3);
  });

  it("returns zeros for empty arrays", () => {
    const summary = computeActivitySummary([], []);
    expect(summary.inquiries).toBe(0);
    expect(summary.submissions).toBe(0);
    expect(summary.total).toBe(0);
    expect(summary.views).toBe(0);
  });
});
