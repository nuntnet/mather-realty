# AEO / GEO — Answer Engine & Generative Engine Optimization

Phase 1 foundation for **ช.เอราวัณ ออโต้ กรุ๊ป** (ch-erawan-next). Goal: make the site legible to search engines, answer engines (Google AI Overviews, Bing Copilot), and LLM crawlers.

## Concepts

| Term | Meaning |
|------|---------|
| **AEO** | Optimize content and structure so AI/search can extract direct answers (FAQ, speakable, clear entity names). |
| **GEO** | Optimize for generative engines citing your site (`llms.txt`, consistent facts, structured data). |
| **JSON-LD** | Machine-readable facts in `<script type="application/ld+json">` — preferred by Google for rich results. |

**Canonical entity name (schema):** `ช.เอราวัณ ออโต้ กรุ๊ป`  
**Legal company:** `บริษัท ช.เอราวัณ ออโตเซลล์ จำกัด`  
**Display site name (`lib/site.ts`):** `ช.เอราวัณ กรุ๊ป`

## Module layout (`lib/seo/`)

| File | Role |
|------|------|
| `constants.ts` | Entity names, brands, logo URL, `sameAs` from env |
| `json-ld.tsx` | `<JsonLd data={...} />` component |
| `organization.ts` | Organization + AutoDealer `@graph` |
| `local-business.ts` | 7 branches → LocalBusiness / AutoDealer nodes |
| `website.ts` | WebSite + SearchAction → `/cars` |
| `product-vehicle.ts` | Car detail Product/Car + Offer + breadcrumbs |
| `article.ts` | Blog Article + speakable + articleSection |
| `faq.ts` | FAQPage helper (Phase 2 wiring) |
| `item-list.ts` | ItemList for listings / homepage featured cars |
| `index.ts` | Re-exports |

Shared URL helpers remain in `lib/site.ts` (`SITE_URL`, `canonicalUrl`, `pageMetadata`, `breadcrumbJsonLd`).

## Schema by page type

| Page | JSON-LD types | Source |
|------|---------------|--------|
| Root layout | Organization, AutoDealer, WebSite | `organizationGraph()`, `websiteJsonLd()` |
| `/` homepage | ItemList (featured cars, if any) | Notion featured cars |
| `/cars/[slug]` | Product, Car, Offer, BreadcrumbList | Notion car + `lib/seo/product-vehicle` |
| `/blog/[slug]` | Article, BreadcrumbList | Notion blog + `lib/seo/article` |
| `/branches` | (Phase 2) LocalBusiness graph on page | `lib/branchData.ts` |
| `/insurance` | (Phase 2) FAQPage | Static FAQ content |

## Canonical data sources

| Data | Source of truth |
|------|-----------------|
| Branches (7) | `lib/branchData.ts` |
| Cars | Notion `NOTION_CARS_DB_ID` |
| Blog | Notion `NOTION_BLOG_DB_ID` |
| Site URL | `NEXT_PUBLIC_SITE_URL` → `lib/site.ts` |
| Social `sameAs` | `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_LINE_OA_URL` (optional) |

**Branch drift fix (Phase 1):** `app/branches/page.tsx` and `app/contact/page.tsx` import from `lib/branchData.ts`. Removed phantom "Ford นครปฐม" from contact (not in canonical 7 branches).

## Semantic HTML checklist (ongoing)

- [x] `<html lang="th">` on root layout
- [x] One `<h1>` per page (existing pages)
- [x] Blog posts use `<article>` + `.prose` (speakable target)
- [ ] Visible breadcrumb nav with `<nav aria-label="Breadcrumb">` (Phase 2)
- [ ] FAQ sections with `<details>` / heading hierarchy on insurance (Phase 2)

## GEO: `public/llms.txt`

Plain-text site summary for AI crawlers (key URLs, brands, branch phones, content policy). Served at `/llms.txt`.

## Roadmap

### Phase 2

- FAQPage on `/insurance` and other high-intent static pages
- LocalBusiness JSON-LD on `/branches` page render
- Visible semantic breadcrumbs (UI + BreadcrumbList alignment)
- `robots.txt` hints for AI bots (if policy allows)
- Wire `organizationSameAs()` when social URLs are confirmed

### Phase 3

- Speakable tuning per page type; Thai TTS-friendly excerpts
- Entity graph linking (branch ↔ brand ↔ offers)
- Monitoring: Search Console rich results, citation tracking
- Admin-triggered schema refresh after Notion publish

## Verification

```bash
bun run test
bun run build
```

Validate JSON-LD with [Google Rich Results Test](https://search.google.com/test/rich-results) on production URLs after deploy.
