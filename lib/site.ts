import type { Metadata } from "next";

export const site = {
  name: 'DoubleN Realty',
  tagline: 'Find Your Home in Thailand',
  description: 'Premium rental properties in Thailand for expats and foreigners',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://doublen-realty.com',
  email: 'janjiranui@gmail.com',
  social: {
    facebook: '',
    instagram: '',
    line: '',
  },
}

export const SITE_URL = site.url;
export const SITE_NAME = site.name;

/** Build absolute canonical URL for a site path (no query string). */
export function canonicalUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

/** Shared metadata fields for static/list pages. */
export function pageMetadata({
  title,
  description,
  path,
  openGraphImage,
}: {
  title: string;
  description: string;
  path: string;
  openGraphImage?: string | null;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(path) },
    openGraph: {
      title,
      description,
      url: canonicalUrl(path),
      ...(openGraphImage ? { images: [openGraphImage] } : {}),
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** Schema.org BreadcrumbList for JSON-LD. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}
