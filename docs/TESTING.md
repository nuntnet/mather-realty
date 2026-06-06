# Testing Guide

## Test stack
- **Unit/Integration:** Vitest (`bun run test`)
- **E2E:** Playwright (`bun run test:e2e`)

## Running tests
```bash
bun run test          # unit + integration
bun run test:watch    # watch mode
bun run test:e2e      # Playwright e2e (needs running dev server)
```

## P0 — Must add before production
1. Inquiry form — POST /api/inquiries happy + validation errors
2. Property submission — POST /api/submissions with all fields
3. Admin PATCH property — per-locale highlights/FAQ/SEO saves correctly
4. Locale switching — /en/ → /ko/ preserves slug

## P1 — Next sprint
5. AI generate-content — mock Gemini, verify Notion auto-save
6. Admin approval — PATCH submissions approve → status change
7. Search — Algolia filters return correct results
8. Auth guards — /api/admin returns 401 unauthenticated

## Mocking strategy
```typescript
vi.mock('@notionhq/client', () => ({
  Client: vi.fn(() => ({
    pages: { retrieve: vi.fn(), update: vi.fn() },
    databases: { query: vi.fn() },
  })),
}))
```
