# Environment Variables — DoubleN Realty

Copy `.env.local.example` → `.env.local` and fill in real values.

## Notion CMS

| Variable | Required | Description |
|----------|----------|-------------|
| `NOTION_API_KEY` | yes | Internal Integration Secret from notion.so/my-integrations |
| `NOTION_PROPERTIES_DB_ID` | yes | Properties database ID |
| `NOTION_BLOG_DB_ID` | yes | Blog posts database ID |
| `NOTION_PAGES_DB_ID` | yes | Static pages database ID (FAQ, how-it-works, about) |

**Finding a Database ID:** Open database in Notion → Copy link → extract the 32-char hex from the URL.

## Better Auth + Turso

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | yes | Random secret for signing sessions (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | yes (prod) | Site URL, e.g. `https://doublen-realty.com` (dev: `http://localhost:3002`) |
| `TURSO_DATABASE_URL` | yes | `libsql://[db-name].aws-[region].turso.io` |
| `TURSO_AUTH_TOKEN` | yes | Auth token from Turso dashboard |

**Create Turso DB:**
```bash
brew install tursodatabase/tap/turso
turso auth login
turso db create doublen-realty
turso db show doublen-realty   # get URL
turso db tokens create doublen-realty
```

## Cloudinary

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | yes | Cloud name (public — exposed to browser) |
| `CLOUDINARY_API_KEY` | yes | API Key (server-side only) |
| `CLOUDINARY_API_SECRET` | yes | API Secret (server-side only) |

Cloud name for this project: `dsteex5wz`

## Google Maps

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | yes | Maps JavaScript API key (public — exposed to browser) |

## Algolia

| Variable | Required | Description |
|----------|----------|-------------|
| `ALGOLIA_APP_ID` | yes | Algolia Application ID (server-side) |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | yes | Same App ID (exposed to browser for InstantSearch) |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | yes | Search-only API key (safe to expose to browser) |
| `ALGOLIA_ADMIN_KEY` | yes | Admin API key (server-side only — never expose to browser) |

**Setup Algolia index:**
```bash
bun run algolia:index   # bulk-index all approved properties
```

## AI (property descriptions, personas, FAQ)

`callAI()` selects a provider in order: Hermes → **Gemini** → Anthropic → OpenAI.
Google Gemini is the primary provider (via its OpenAI-compatible endpoint
`generativelanguage.googleapis.com/v1beta/openai/`).

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_AI_API_KEY` | **recommended** | Google Gemini key (primary AI provider). Get at https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | optional | Pin one model; else falls back `gemini-2.5-flash-lite → 2.5-flash → 2.0-flash-lite → 2.0-flash` on quota errors |
| `OPENAI_API_KEY` | optional | Last-resort fallback only — not needed when `GOOGLE_AI_API_KEY` is set |
| `ANTHROPIC_API_KEY` | optional | Fallback provider |
| `HERMES_URL` / `HERMES_MODEL` | optional | Local dev proxy only — do NOT set in production (localhost unreachable from Vercel) |

## Email (Resend)

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | recommended prod | Resend API key for email notifications |
| `ADMIN_EMAIL` | recommended prod | Admin inbox for new inquiry/submission notifications |

## Revalidation

| Variable | Required | Description |
|----------|----------|-------------|
| `REVALIDATE_SECRET` | yes | Secret token for triggering ISR revalidation |

```bash
curl -X POST "https://doublen-realty.com/api/revalidate?secret=YOUR_SECRET"
```

## Site URL

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | recommended prod | Canonical/OG base URL |

## Summary Table

| Variable | dev | staging | prod |
|----------|-----|---------|------|
| `NOTION_API_KEY` | req | req | req |
| `NOTION_PROPERTIES_DB_ID` | req | req | req |
| `NOTION_BLOG_DB_ID` | req | req | req |
| `NOTION_PAGES_DB_ID` | req | req | req |
| `BETTER_AUTH_SECRET` | req | req | req |
| `BETTER_AUTH_URL` | req | req | req |
| `TURSO_DATABASE_URL` | req | req | req |
| `TURSO_AUTH_TOKEN` | req | req | req |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | req | req | req |
| `CLOUDINARY_API_KEY` | req | req | req |
| `CLOUDINARY_API_SECRET` | req | req | req |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | req | req | req |
| `ALGOLIA_APP_ID` | req | req | req |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | req | req | req |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | req | req | req |
| `ALGOLIA_ADMIN_KEY` | req | req | req |
| `OPENAI_API_KEY` | opt | opt | opt |
| `RESEND_API_KEY` | opt | opt | req |
| `ADMIN_EMAIL` | opt | opt | req |
| `REVALIDATE_SECRET` | req | req | req |
| `NEXT_PUBLIC_SITE_URL` | opt | req | req |

## Vercel Environment Variables

In Vercel dashboard → Project → Settings → Environment Variables:
- Set all variables above per environment (Development/Preview/Production)
- `BETTER_AUTH_URL` must be the production URL in prod
- `NEXT_PUBLIC_*` variables are exposed to the browser — never put secrets in them
- `ALGOLIA_ADMIN_KEY` and `CLOUDINARY_API_SECRET` are server-side only — do not prefix with `NEXT_PUBLIC_`
