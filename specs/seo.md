# SEO / AEO / GEO Reference

## JSON-LD Schemas in use

| Schema | Page | File |
|--------|------|------|
| `Accommodation` | Property detail | `app/[locale]/properties/[slug]/page.tsx` |
| `FAQPage` | Property detail (when FAQ exists) | same |
| `BreadcrumbList` | Property detail | same |
| `Organization` | (TODO: add to root layout) | `app/layout.tsx` |
| `LocalBusiness` | (TODO: add to homepage) | `app/[locale]/page.tsx` |

## Metadata per page type

### Property detail
- `title`: `{property_title} | Mather`
- `description`: locale SEO description → locale description → EN fallback
- `openGraph`: title, description, image (cover), url
- `twitter`: `summary_large_image`, title, description, image
- `alternates.languages`: all 15 locales (hreflang)
- `canonical`: current locale URL

### Properties listing
- `title`: `Properties in {City} | Mather` (when city filter active)
- `description`: generated with count

### Homepage
- `title`: `Mather | Find Your Perfect Home in Thailand`
- `description`: brand tagline

## sitemap.xml

Generated at `/sitemap.xml` — includes:
- All property slugs × 15 locales
- Static pages (homepage, blog, how-it-works, about, contact)
- Blog posts

Run `bun run algolia:index` to ensure all properties are indexed.

## AEO (AI Engine Optimization)

AI assistants (ChatGPT, Perplexity, Claude) crawl structured data and factual content.

Best practices applied:
- FAQPage JSON-LD on property pages → direct Q&A extraction
- Accommodation JSON-LD with price, location, geo coordinates
- Clear, factual property descriptions (no marketing fluff without facts)
- Structured highlights as bullet points
- `lang` attribute on `<main>` for correct language detection

## GEO (Generative Engine Optimization)

For location-based searches ("rental property Bangkok expat"):
- City + district in every property title and description
- "expat" keyword in persona descriptions and highlights
- Thai school names in property descriptions (near Concordian, NIST, etc.)
- Price in THB prominently in metadata
- "foreigner" / "expat" in blog post titles and content

## Robots.txt

`/robots.txt` — allows all crawlers, points to sitemap.

## Core Web Vitals targets

- LCP: hero image has `priority` prop → preloaded
- CLS: images have explicit dimensions or `fill` with sized containers
- FID/INP: no blocking scripts; Google Maps deferred with `lazyOnload`
