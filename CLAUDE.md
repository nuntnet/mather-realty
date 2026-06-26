# CLAUDE.md — Mather

**Mather** — rental property platform for foreigners in Thailand.
Multilingual (15 locales), Notion-backed CMS, Algolia search, Turso SQLite, Better Auth.

## Design System

Always read `DESIGN.md` before making any visual or UI decision. Font choices, colors,
spacing, icons, motion, and aesthetic direction are defined there. Key rules:
- Display headings use **Lora** (`font-serif`); body/UI use **Plus Jakarta Sans** (`font-sans`).
- Palette: teal `#1E6B69` (brand), amber `#C9935A` (accent), cream `#F7F4EF` (background), ink `#1A2624` (text).
- Icons: **Lucide at stroke-width 1.5**. Never use emoji as functional icons.
- Motion: calm ease-out, tokens in `globals.css`; honor `prefers-reduced-motion`.
Do not deviate without explicit user approval.

## Workflow Rules

- **Do NOT** git add/commit/push/deploy after every change. Batch changes together.
- Only commit when the user **explicitly asks** to commit, push, or deploy.
- Focus on making code changes quickly without stopping for git operations.

## Git Flow

```
feature/* ──→ staging ──→ master (production)
                ↓              ↓
         staging.vercel.app   mather.to
         Staging Notion DBs   Production Notion DBs
         Staging Turso DB     Production Turso DB
```

| Branch | Role | Vercel Project | Auto-deploy |
|---|---|---|---|
| `master` | **Production** | `doublen-realty` | yes |
| `staging` | **Staging** — test before prod | `doublen-realty-staging` | yes |
| `feature/*` | New features | — | — |

**Flow:**
1. Create feature branch from `staging`
2. Code + commit
3. Merge to `staging` → auto-deploy → test
4. Pass → merge `staging` into `master` → auto-deploy production

Do NOT push directly to `master` without going through staging.

## Stack

- **Next.js 15** App Router + React 19 + TypeScript
- **Tailwind CSS 3** + Radix UI + shadcn/ui + Framer Motion
- **Notion API** — CMS (properties, blog posts, static pages)
- **Better Auth 1.5** + **Turso** (SQLite via Drizzle ORM) — auth + sessions + hot cache
- **Cloudinary** (`dsteex5wz`) — image hosting + admin upload
- **Algolia** — property search (react-instantsearch)
- **Google Maps JS API** — property map + nearby places
- **Resend** — email notifications (inquiries, submissions)
- **OpenAI** — AI-generated multilingual property descriptions
- **Vercel** — deployment
- **Bun** — package manager

## Commands

```bash
bun dev               # dev server :3002
bun build             # production build
bun start             # start prod server
bun lint              # ESLint
bun run test          # Vitest (unit + integration + component)
bun run test:watch
bun run test:e2e      # Playwright e2e

# DB
bun run db:push       # push schema changes to Turso (no migration file)
bun run db:migrate    # run drizzle migrations
bun run db:studio     # Drizzle Studio (local DB viewer)

# Algolia
bun run algolia:index # bulk-index all approved properties to Algolia

# Infrastructure
bun run infra:setup -- --env staging     # provision new environment
```

## Key Files

| File | Role |
|------|------|
| `lib/notion.ts` | Notion queries — properties, blog, pages |
| `lib/algolia.ts` | Algolia client + sync helpers (syncPropertyToAlgolia, bulkSyncPropertiesToAlgolia) |
| `lib/algolia-browser.ts` | Client-side Algolia search client |
| `lib/admin-auth.ts` | `requireAdmin()` for `/api/admin/*` |
| `lib/auth.ts` | Better Auth instance (Turso) |
| `lib/auth-client.ts` | Client-side auth hooks |
| `lib/notion-types.ts` | TypeScript interfaces (Property, BlogPost, StaticPage, PropertyFilters) |
| `lib/email.ts` | Resend email helpers |
| `lib/db/schema.ts` | Drizzle schema (user, session, properties, inquiries, submissions, searchLogs, etc.) |
| `middleware.ts` | Guard `/admin/*`, locale routing (15 locales) |
| `drizzle.config.ts` | Drizzle config for Turso |
| `scripts/algolia-index.ts` | Bulk-index Notion properties to Algolia |
| `specs/env-vars.md` | All environment variables documented |
| `docs/ADMIN.md` | Admin panel user guide |

## Routes

**Locale pattern:** `/{locale}/...` for all public/landlord routes.
**Locales (15):** `en` (default), `th`, `zh-CN`, `zh-TW`, `ja`, `ko`, `ru`, `de`, `fr`, `es`, `it`, `nl`, `sv`, `ar`, `hi`

**Public:**
- `/{locale}/` — homepage
- `/{locale}/properties` — property listing with Algolia filters
- `/{locale}/properties/[slug]` — property detail + Google Maps + inquiry form
- `/{locale}/blog` — blog listing
- `/{locale}/blog/[slug]` — blog post

**Admin (role=admin, no locale prefix):**
- `/admin` — dashboard
- `/admin/properties` — manage properties (approve, update status)
- `/admin/blog` — manage blog posts
- `/admin/inquiries` — view/manage inquiries
- `/admin/submissions` — review landlord submissions

**Auth:** `/login`

**API:**
- `POST /api/inquiries` — submit property inquiry (→ email notification)
- `POST /api/submit/property` — landlord property submission
- `GET|PATCH /api/admin/properties`
- `GET|PATCH /api/admin/inquiries`
- `GET|PATCH /api/admin/submissions`
- `POST /api/upload` — Cloudinary upload
- `POST /api/revalidate` — ISR revalidation trigger

## Notion Databases (3)

| Env Var | Purpose |
|---------|---------|
| `NOTION_PROPERTIES_DB_ID` | Properties (multilingual title/description, status, approval) |
| `NOTION_BLOG_DB_ID` | Blog posts (multilingual, category, tags) |
| `NOTION_PAGES_DB_ID` | Static pages (FAQ, how-it-works, about — multilingual content) |

Trigger revalidation after Notion edits:
```bash
curl -X POST "https://mather.to/api/revalidate?secret=YOUR_SECRET"
```

## DB Schema (Turso / Drizzle)

| Table | Purpose |
|-------|---------|
| `user` | Auth users (role: admin \| landlord) |
| `session` | Better Auth sessions |
| `account` | OAuth accounts |
| `verification` | Email verification tokens |
| `properties` | Hot cache of Notion properties (slug, price, geo, status) |
| `rental_periods` | Rental start/end dates per property |
| `nearby_places` | Google Places cache per property |
| `inquiries` | Viewing/rental inquiries (name, contact, preferredDate) |
| `submissions` | Landlord listing submissions (pending review) |
| `search_logs` | Search query logs (query, locale, resultCount) |
| `property_views` | Property page view events |
| `analytics_events` | General analytics events |
| `audit_log` | Admin action audit trail |

## Algolia Index

Index name: `properties`

Each record is a flat `AlgoliaPropertyRecord` with:
- Filterable: `city`, `district`, `priceTHB`, `bedrooms`, `bathrooms`, `sizeSqm`, `status`, `amenities`, `tags`
- Geo: `_geoloc { lat, lng }`
- Multilingual: `title_en`, `title_th`, `title_zh_CN`, ... (15 locales)
- Same for `description_*`

Sync flow: Notion → `lib/algolia.ts:syncPropertyToAlgolia()` → Algolia  
Full re-index: `bun run algolia:index`

## Auth

- Email/password only (minPasswordLength: 8)
- Roles: `admin` | `landlord` stored in `user.role` in Turso
- Create admin: sign up → `UPDATE user SET role='admin' WHERE email='...'`
- If `TURSO_DATABASE_URL` is unset — auth is disabled (warning in console)

## i18n

- `next-intl` with 15 locales
- Message files in `messages/[locale].json`
- Default locale: `en` (no prefix in URL via middleware)
- All public pages use `/{locale}/` prefix; admin routes have no locale prefix

## Environment Variables

See `specs/env-vars.md` — full documentation of all vars.
Template: `.env.local.example`

## Conventions

- Server Components by default — use `"use client"` only when necessary
- Notion data fetched in Server Components only (API key never exposed to client)
- Algolia search uses client-side react-instantsearch with search-only key
- Form submissions: `fetch("/api/...")` from client components
- Admin data: `fetch("/api/admin/...")` from client, guarded by Better Auth session
- Images: admin uploads via `/api/upload` → Cloudinary URL → stored in Notion
- `scripts/` excluded from tsconfig (build utilities only)

## Known Gaps (TODO)

- Landlord portal (property submission form, dashboard)
- AI description generation endpoint using OpenAI
- Virtual tour integration (Matterport or iframe)
- Email templates for inquiry confirmations
- Upstash Redis rate limiting on auth endpoints (optional in dev)
- SEO: LocalBusiness JSON-LD, breadcrumbs
- Property comparison feature
