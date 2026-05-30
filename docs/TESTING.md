# Testing Guide — ch-erawan-next

This project uses a three-layer test stack: **Vitest unit/component tests**, **Vitest integration tests** (route handlers + middleware), and **Playwright e2e** specs.

## Stack

| Layer | Runner | Environment | Location |
|-------|--------|-------------|----------|
| Unit (lib, mappers, retry, ratelimit, admin-auth) | Vitest | `node` | `test/unit/*.test.ts` |
| Component (forms, uploaders, editor) | Vitest | `jsdom` (`// @vitest-environment jsdom`) | `test/unit/*.test.tsx` |
| Integration (API routes, middleware) | Vitest | `node` | `test/integration/*.test.ts` |
| E2E (public + auth redirect flows) | Playwright | Chromium | `e2e/*.spec.ts` |

Config files:

- `vitest.config.ts` — Vitest + `@/` path alias
- `test/setup.ts` — RTL cleanup, jsdom stubs (matchMedia, ResizeObserver, Radix pointer capture)
- `playwright.config.ts` — base URL, optional `webServer` for local runs

## Commands

```bash
# All Vitest tests (unit + integration + component)
bun run test

# Watch mode
bun run test:watch

# Playwright — list specs (no server required)
bunx playwright test --list

# Playwright — full run (needs server + env; see below)
bun run test:e2e

# Production build sanity check
bun run build
```

Install Playwright browser once:

```bash
bunx playwright install chromium
```

## Mocking strategy

### Integration tests (`test/integration/`)

Route handlers are imported directly and exercised with `NextRequest` objects built via `test/helpers/integration-utils.ts`.

| Dependency | Mock approach |
|------------|---------------|
| `@/lib/admin-auth` → `requireAdmin` | Return `null` (allow) or a `NextResponse` (401/403/503) |
| `@/lib/notion` | `vi.mock` with per-route function spies |
| `next/cache` → `revalidatePath` | `vi.fn()` — assert paths after mutations |
| `@notionhq/client` (submit routes) | Mock `Client` constructor → `{ pages: { create } }` |
| `cloudinary` (upload route) | Mock `v2.uploader.upload` |
| `@/lib/ratelimit` (middleware) | Mock `checkAuthRateLimit` |
| Global `fetch` (middleware session check) | Stub to return admin/non-admin session JSON |

Fixtures for valid request bodies live in `test/helpers/api-fixtures.ts`. Notion page shapes for mapper unit tests are in `test/helpers/notion-fixtures.ts`.

### Component tests

- **ImageUploader / CarForm / BlogForm** — mock `fetch`, `sonner` toast
- **BlogForm** — mock `RichTextEditor` as a textarea (TipTap/ProseMirror is unreliable in jsdom)
- **RichTextEditor** — mock `@tiptap/react` `useEditor` with a minimal editor stub; assert toolbar buttons and `onChange` markdown contract

### E2E

No mocks. Tests use resilient selectors (`getByRole`, `getByText`) and tolerate empty Notion CMS data (e.g. zero car cards). **Do not** run real admin login or Notion writes in e2e.

## Environment prerequisites

### Vitest (unit + integration)

No real external services required. Integration tests mock Notion, Cloudinary, auth, and cache.

Optional: set dummy env vars in CI for modules that read `process.env` at import time (submit routes stub `NOTION_*_DB_ID` per test).

### Playwright e2e

To **run** (not just `--list`) against a live server:

| Variable | Purpose |
|----------|---------|
| `NOTION_API_KEY` | CMS reads for `/cars`, `/blog`, home |
| `NOTION_CARS_DB_ID`, etc. | Database IDs (see `specs/env-vars.md`) |
| `E2E_BASE_URL` | Optional — test deployed preview instead of local |
| `PW_NO_SERVER=1` | Skip Playwright `webServer` when using `E2E_BASE_URL` |
| `E2E_USE_DEV=1` | Use `bun dev` instead of build+start in webServer |

Default Playwright config targets **`http://localhost:3002`** (same as `bun dev` / `bun start`) so e2e does not collide with other apps on port 3000. It runs `bun run build && bun run start` unless a server is already up on 3002 (`reuseExistingServer` locally).

Turso/Better Auth/Cloudinary are **not** required for public e2e specs. Admin e2e only checks redirect-to-login (no credential login).

## Known limitations

1. **TipTap / ProseMirror** — full rich-text editing is not tested in jsdom; RichTextEditor tests use a stubbed editor.
2. **Middleware session validation** — integration tests stub `fetch` to `/api/auth/get-session`; not a full Better Auth integration test.
3. **Rate limiting** — middleware 429 branch is tested with mocked `checkAuthRateLimit`; real Upstash is not hit in tests.
4. **E2E with empty Notion** — car card link test skips navigation when no cars are returned.
5. **Upload e2e** — not covered in Playwright (requires admin session + Cloudinary); covered in integration tests instead.
6. **Auth API rate limit in production** — requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; disabled in dev without Upstash.

## Adding tests

1. Read the route/component source first.
2. Reuse `test/helpers/integration-utils.ts` and `api-fixtures.ts`.
3. For new admin routes: mock `requireAdmin` + `@/lib/notion` functions.
4. For new public forms: integration test zod + Notion create; optional e2e for visible validation only.
5. Component tests that use Radix/shadcn: keep the jsdom docblock and existing setup stubs.
