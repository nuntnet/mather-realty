import type { BlogPost } from "@/lib/notion-types";
import { canonicalUrl, SITE_URL, SITE_NAME } from "@/lib/site";

const LOGO_URL = `${SITE_URL}/logo.png`;

const CATEGORY_LABELS: Record<string, string> = {
  "rental-guide": "Rental Guide",
  neighborhood: "Neighborhood",
  "legal-visa": "Legal & Visa",
  lifestyle: "Lifestyle",
  "cost-of-living": "Cost of Living",
};

/**
 * Schema.org Article JSON-LD for DoubleN Realty blog posts.
 * BlogPost titles/excerpts are multi-locale maps; pass the desired locale.
 */
export function generateArticleJsonLd(post: BlogPost, locale = "en") {
  const path = `/blog/${post.slug}`;
  const title = post.title[locale] ?? post.title["en"] ?? "";
  const excerpt = post.excerpt[locale] ?? post.excerpt["en"] ?? "";
  const section = CATEGORY_LABELS[post.category] ?? post.category;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    ...(excerpt ? { description: excerpt } : {}),
    ...(post.coverImage ? { image: post.coverImage } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.publishedAt ?? undefined,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    url: canonicalUrl(path),
    inLanguage: locale,
    articleSection: section,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".prose"],
    },
    ...(post.tags?.length > 0 ? { keywords: post.tags.join(", ") } : {}),
  };
}
