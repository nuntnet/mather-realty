import type { Property, BlogPost } from "@/lib/notion-types";

export function isWithinLastDays(isoDate: string | null | undefined, days: number): boolean {
  if (!isoDate) return false;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return date >= cutoff;
}

export function countByKey<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

// ── Property Stats ─────────────────────────────────────
export interface PropertyDashboardStats {
  total: number;
  available: number;
  rented: number;
  pending: number;
  archived: number;
  coming_soon: number;
  verified: number;
  last7Days: number;
  byCity: Record<string, number>;
}

export function computePropertyStats(properties: Property[]): PropertyDashboardStats {
  const byStatus = countByKey(properties, (p) => p.status);
  return {
    total: properties.length,
    available: byStatus.available ?? 0,
    rented: byStatus.rented ?? 0,
    pending: byStatus.pending ?? 0,
    archived: byStatus.archived ?? 0,
    coming_soon: byStatus.coming_soon ?? 0,
    verified: properties.filter((p) => !!p.verifiedAt).length,
    last7Days: properties.filter((p) => isWithinLastDays(p.createdAt, 7)).length,
    byCity: countByKey(properties, (p) => p.city || "Unknown"),
  };
}

// ── Blog Stats ─────────────────────────────────────────
export interface BlogDashboardStats {
  total: number;
  published: number;
  draft: number;
  last7Days: number;
  byCategory: Record<string, number>;
}

export function computeBlogStats(posts: BlogPost[]): BlogDashboardStats {
  const published = posts.filter((p) => p.published);
  return {
    total: posts.length,
    published: published.length,
    draft: posts.length - published.length,
    last7Days: published.filter((p) => isWithinLastDays(p.publishedAt, 7)).length,
    byCategory: countByKey(posts, (p) => p.category || "uncategorized"),
  };
}

// ── Inquiry Stats ──────────────────────────────────────
export interface InquiryRecord {
  id: number;
  propertyId: string;
  name: string;
  contactType: string;
  status: string;
  createdAt: string | null;
}

export interface InquiryDashboardStats {
  total: number;
  new: number;
  contacted: number;
  booked: number;
  declined: number;
  last7Days: number;
}

export function computeInquiryStats(inquiries: InquiryRecord[]): InquiryDashboardStats {
  const byStatus = countByKey(inquiries, (i) => i.status);
  return {
    total: inquiries.length,
    new: byStatus.new ?? 0,
    contacted: byStatus.contacted ?? 0,
    booked: byStatus.booked ?? 0,
    declined: byStatus.declined ?? 0,
    last7Days: inquiries.filter((i) => isWithinLastDays(i.createdAt, 7)).length,
  };
}

// ── Submission Stats ───────────────────────────────────
export interface SubmissionRecord {
  id: number;
  status: string;
  submittedAt: string | null;
}

export interface SubmissionDashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  last7Days: number;
}

export function computeSubmissionStats(submissions: SubmissionRecord[]): SubmissionDashboardStats {
  const byStatus = countByKey(submissions, (s) => s.status);
  return {
    total: submissions.length,
    pending: byStatus.pending ?? 0,
    approved: byStatus.approved ?? 0,
    rejected: byStatus.rejected ?? 0,
    last7Days: submissions.filter((s) => isWithinLastDays(s.submittedAt, 7)).length,
  };
}

// ── Activity Summary ───────────────────────────────────
export interface ActivitySummary {
  inquiries: number;
  submissions: number;
  views: number;
  total: number;
}

export function computeActivitySummary(
  inquiries: InquiryRecord[],
  submissions: SubmissionRecord[],
): ActivitySummary {
  const inquiries7 = inquiries.filter((i) => isWithinLastDays(i.createdAt, 7)).length;
  const submissions7 = submissions.filter((s) => isWithinLastDays(s.submittedAt, 7)).length;
  return {
    inquiries: inquiries7,
    submissions: submissions7,
    views: 0,
    total: inquiries7 + submissions7,
  };
}
