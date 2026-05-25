# CLAUDE.md — ch-erawan-next

เว็บไซต์ดีลเลอร์รถยนต์ **ช.เอราวัณ ออโต้ กรุ๊ป** จ.นครปฐม  
6 แบรนด์: Mazda, Ford, Mitsubishi, GWM, Deepal, Kia — 7 สาขา

## Stack

- **Next.js 15** App Router + React 19 + TypeScript
- **Tailwind CSS 3** + Radix UI + shadcn/ui + Framer Motion
- **Notion API** — CMS หลัก (cars, blog, stories, appointments, contacts)
- **Better Auth 1.5** + **Turso** (SQLite) — authentication + sessions
- **Cloudinary** — image hosting
- **Google Maps JS API** — branch map
- **Vercel** (sin1) — deployment
- **Bun** — package manager

## Commands

```bash
bun dev        # dev server :3000
bun build      # production build
bun start      # start prod server
bun lint       # ESLint
```

## Key Files

| File | Role |
|------|------|
| `lib/notion.ts` | Notion queries ทั้งหมด (read + write) |
| `lib/auth.ts` | Better Auth instance (Turso) |
| `lib/auth-client.ts` | Client-side auth hooks |
| `lib/branchData.ts` | Hardcoded branch data (7 สาขา) |
| `lib/notion-types.ts` | TypeScript interfaces สำหรับ Notion data |
| `middleware.ts` | Guard `/admin/*` routes |
| `drizzle.config.ts` | Drizzle config สำหรับ Turso (inspect/migrate) |
| `.env.local.example` | Template env vars |

## Routes

**Public:** `/` `/cars` `/cars/[id]` `/booking` `/stories` `/blog` `/blog/[slug]` `/branches` `/contact` `/about` `/awards` `/insurance` `/secondhand` `/career`

**Admin (require role=admin):** `/admin` `/admin/appointments` `/admin/stories` `/admin/blog` `/admin/cars`

**API:** `POST /api/submit/booking|contact|story` — `GET|PATCH /api/admin/appointments|stories` — `POST /api/revalidate`

## Notion Databases (5)

`NOTION_CARS_DB_ID` · `NOTION_BLOG_DB_ID` · `NOTION_STORIES_DB_ID` · `NOTION_APPOINTMENTS_DB_ID` · `NOTION_CONTACTS_DB_ID`

Content แก้ที่ Notion โดยตรง หลังแก้ trigger revalidation:
```bash
curl -X POST "http://localhost:3000/api/revalidate?secret=YOUR_SECRET"
```

## Auth

- Email/password only (minPasswordLength: 8)
- Admin role เก็บใน `user.role` ใน Turso
- ถ้า `TURSO_DATABASE_URL` ไม่ถูกตั้ง — auth disabled (warning ใน console)
- สร้าง admin: register แล้ว `UPDATE user SET role='admin' WHERE email='...'` ใน Turso

## Environment Variables

ดูรายละเอียดที่ `specs/env-vars.md` — ต้องการ 13 ตัว:  
Notion (6) · Better Auth (2) · Turso (2) · Cloudinary (3) · Google Maps (1) · Revalidate (1)

## Conventions

- Server Components by default — ใช้ `"use client"` เฉพาะที่จำเป็น
- Notion data ดึงใน Server Components เท่านั้น (ไม่ expose API key ไป client)
- Form submissions → `fetch("/api/submit/...")` จาก client
- Admin data fetching → `fetch("/api/admin/...")` จาก client ใน admin pages
- Images: รูปรถ upload ขึ้น Cloudinary → paste URL ลงใน Notion text property (newline-separated)

## Known Gaps (TODO)

- ไม่มี rate limiting บน `/api/auth/*`
- File upload (damage photos, insurance docs) ยังไม่ implement จริง
- ไม่มี email notifications สำหรับนัดหมายใหม่
- ไม่มี AI Chat Widget

ดู `specs/todo.md` สำหรับรายการครบ
