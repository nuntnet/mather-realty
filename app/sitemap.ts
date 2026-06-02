import type { MetadataRoute } from "next";
import { getProperties, getBlogPosts } from "@/lib/notion";
import { SITE_URL } from "@/lib/site";

const LOCALES = [
  "en", "th", "zh-CN", "zh-TW", "ja", "ko", "ru", "de", "fr", "es", "it", "nl", "sv", "ar", "hi",
] as const;

const STATIC_PATHS = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/properties", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/how-it-works", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/submit", priority: 0.7, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, blogPosts] = await Promise.all([
    getProperties({ status: "available" }).catch(() => []),
    getBlogPosts("en", 1000).catch(() => []),
  ]);

  const now = new Date();

  // Static pages × all locales
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap(
    ({ path, priority, changeFrequency }) =>
      LOCALES.map((locale) => ({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
      })),
  );

  // Properties × all locales
  const propertyEntries: MetadataRoute.Sitemap = properties.flatMap((property) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/properties/${property.slug}`,
      lastModified: property.updatedAt ? new Date(property.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  // Blog posts × all locales
  const blogEntries: MetadataRoute.Sitemap = blogPosts.flatMap((post) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  return [...staticEntries, ...propertyEntries, ...blogEntries];
}
