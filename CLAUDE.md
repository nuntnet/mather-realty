# CLAUDE.md — ch-erawan-next

เว็บไซต์ดีลเลอร์รถยนต์ **ช.เอราวัณ ออโต้ กรุ๊ป** จ.นครปฐม  
6 แบรนด์: Mazda, Ford, Mitsubishi, GWM, Deepal, Kia — 7 สาขา

## Stack

- **Next.js 15** App Router + React 19 + TypeScript
- **Tailwind CSS 3** + Radix UI + shadcn/ui + Framer Motion
- **Notion API** — CMS หลัก (cars, blog, stories, appointments, contacts)
- **Better Auth 1.5** + **Turso** (SQLite) — authentication + sessions
- **Cloudinary** — image hosting + admin upload
- **Upstash Redis** — rate limit `/api/auth/*` (optional in dev)
- **Google Maps JS API** — branch map
- **Vercel** (sin1) — deployment
- **Bun** — package manager

## Commands

```bash
bun dev          # dev server :3002 (avoids conflict with other apps on :3000)
bun build        # production build
bun start        # start prod server
bun lint         # ESLint (config TBD)
bun run test     # Vitest (unit + integration + component)
bun run test:watch
bun run test:e2e # Playwright e2e
```

## Key Files

| File | Role |
|------|------|
| `lib/notion.ts` | Notion queries ทั้งหมด (read + write, retry/backoff) |
| `lib/admin-auth.ts` | `requireAdmin()` สำหรับ `/api/admin/*` |
| `lib/auth.ts` | Better Auth instance (Turso) |
| `lib/auth-client.ts` | Client-side auth hooks |
| `lib/ratelimit.ts` | Upstash rate limit auth endpoints |
| `lib/branchData.ts` | Hardcoded branch data (7 สาขา) |
| `lib/notion-types.ts` | TypeScript interfaces สำหรับ Notion data |
| `middleware.ts` | Guard `/admin/*`, `/api/admin/*`, rate limit `/api/auth/*` |
| `drizzle.config.ts` | Drizzle config สำหรับ Turso (inspect/migrate) |
| `docs/ADMIN.md` | คู่มือ operator — login, env, แต่ละหน้า admin |
| `docs/TESTING.md` | Test stack, mocks, e2e prerequisites |
| `docs/ADMIN_CMS_PLAN.md` | แผน eng Admin CMS (Phase 0–5 — shipped) |
| `specs/env-vars.md` | Template env vars |

## Routes

**Public:** `/` `/cars` `/cars/[slug]` `/booking` `/stories` `/blog` `/blog/[slug]` `/branches` `/contact` `/about` `/awards` `/insurance` `/secondhand` `/career`

**Admin (require role=admin):** `/admin` `/admin/cars` `/admin/blog` `/admin/contacts` `/admin/appointments` `/admin/stories`

**Auth:** `/login`

**API:** `POST /api/submit/booking|contact|story` · `GET|PATCH /api/admin/appointments|stories` · `GET|POST|PATCH|DELETE /api/admin/cars|blog` · `GET /api/admin/contacts` · `POST /api/admin/revalidate` · `POST /api/upload` · `POST /api/revalidate`

## Notion Databases (5)

`NOTION_CARS_DB_ID` · `NOTION_BLOG_DB_ID` · `NOTION_STORIES_DB_ID` · `NOTION_APPOINTMENTS_DB_ID` · `NOTION_CONTACTS_DB_ID`

Content แก้ที่ Notion หรือผ่าน Admin Panel — หลังแก้ trigger revalidation:
```bash
# จาก dashboard admin (session) หรือ
curl -X POST "http://localhost:3002/api/revalidate?secret=YOUR_SECRET"
```

## Auth

- Email/password only (minPasswordLength: 8)
- Admin role เก็บใน `user.role` ใน Turso
- ถ้า `TURSO_DATABASE_URL` ไม่ถูกตั้ง — auth disabled (warning ใน console)
- สร้าง admin: sign-up แล้ว `UPDATE user SET role='admin'` — ดู `docs/ADMIN.md` (อย่า rely `seed-admin.ts` ใน prod)

## Environment Variables

ดู `specs/env-vars.md` — Notion (6) · Better Auth (2) · Turso (2) · Cloudinary (3) · Google Maps (1) · Revalidate (1) · Upstash (2, prod แนะนำ)

## Conventions

- Server Components by default — ใช้ `"use client"` เฉพาะที่จำเป็น
- Notion data ดึงใน Server Components เท่านั้น (ไม่ expose API key ไป client)
- Form submissions → `fetch("/api/submit/...")` จาก client
- Admin data fetching → `fetch("/api/admin/...")` จาก client ใน admin pages
- Images: admin upload ผ่าน `/api/upload` → Cloudinary URL → เก็บใน Notion

## Known Gaps (TODO)

- `revalidatePath` หลังแก้รถใช้ Notion id แทน slug (หน้า detail อาจ stale)
- SEO: JSON-LD, canonical, sitemap lastModified
- File upload (damage photos, insurance docs) ใน booking ยังไม่ implement
- ไม่มี email notifications สำหรับนัดหมายใหม่
- Upstash env ต้องตั้งใน prod สำหรับ rate limit
- ESLint config ยังไม่ครบ

ดู `specs/todo.md` สำหรับรายการครบ (P0/P1/P2)
