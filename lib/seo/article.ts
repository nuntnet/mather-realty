import type { BlogPostWithContent } from "@/lib/notion-types";
import { canonicalUrl, SITE_URL } from "@/lib/site";
import { LOGO_URL, ORGANIZATION_NAME } from "./constants";

const CATEGORY_LABELS: Record<string, string> = {
  review: "รีวิวรถยนต์",
  tips: "เคล็ดลับ",
  news: "ข่าวสาร",
  promotion: "โปรโมชั่น",
  csr: "CSR",
};

export function articleJsonLd(post: BlogPostWithContent, slug: string) {
  const path = `/blog/${post.slug || slug}`;
  const headline = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const section = CATEGORY_LABELS[post.category] ?? post.category;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    ...(description && { description }),
    ...(post.coverImageUrl && { image: post.coverImageUrl }),
    ...(post.publishedAt && { datePublished: post.publishedAt }),
    dateModified: post.publishedAt ?? undefined,
    author: {
      "@type": "Organization",
      name: ORGANIZATION_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: ORGANIZATION_NAME,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    url: canonicalUrl(path),
    inLanguage: "th-TH",
    articleSection: section,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".prose"],
    },
    ...(post.tags.length > 0 ? { keywords: post.tags.join(", ") } : {}),
  };
}
