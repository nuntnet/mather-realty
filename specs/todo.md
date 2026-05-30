# TODO List

อัปเดตล่าสุด: 2026-05-30 (branch `cursor/aeo-geo-phase1`)

---

## P0 — แก้ก่อน merge / deploy prod

- [x] **Fix `revalidatePath` หน้ารถใช้ slug ไม่ใช่ Notion id** — `revalidateCars(slug)` + lookup slug เมื่อ toggle flags/archive

- [ ] **ตั้ง Upstash env บน Vercel** — `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`  
  Rate limit `/api/auth/*` implement แล้ว แต่ปิดถ้าไม่มี env (prod เสี่ยง brute force)

- [ ] **ตั้ง `BETTER_AUTH_URL` ใน Vercel** เป็น production domain  
  ถ้าไม่ตั้ง session cookies จะ scope ผิด domain

- [ ] **สร้าง admin account แรกใน Turso** หลัง deploy  
  ใช้ sign-up API + `UPDATE role` — ดู [`docs/ADMIN.md`](../docs/ADMIN.md) และ [`deployment.md`](deployment.md#step-5-สร้าง-admin-account)  
  ⚠️ `scripts/seed-admin.ts` อาจ hash ไม่ตรง Better Auth — อย่า rely ใน prod จนกว่าจะแก้สคริปต์

- [ ] **Split PR เป็น 5 PRs ตามที่วางแผน** (ยังไม่ทำ) — security/CMS, slug+tests, SEO, ops, docs

---

## P1 — สำคัญถัดไป

### SEO

- [x] **Vehicle/Product JSON-LD** บนหน้ารถ `/cars/[slug]` — Product + Offer (THB)
- [x] **Canonical URLs** ทุกหน้าหลัก — car/blog detail, list pages, static layouts
- [x] **Default OG image** — `app/opengraph-image.tsx` + layout fallback
- [x] **Sitemap `lastModified`** จาก Notion `last_edited_time` / `publishedAt`
- [x] **BreadcrumbList** JSON-LD — car detail + blog post

### Features / Ops

- [x] **File upload — damage photos (body_paint booking)** — `/api/upload/booking` → Cloudinary → Notion `Damage Photo URLs`
- [x] **File upload — insurance documents (body_paint booking)** — Notion `Insurance Doc URLs`
- [x] **Email notifications สำหรับนัดหมายใหม่** — Resend → SMTP fallback → log-only (`lib/email.ts`)
- [x] **ตรวจสอบ Notion API reachable จาก Vercel sin1** — docs ใน `specs/deployment.md` + `GET /api/health`
- [x] **Configure ESLint** — `eslint.config.mjs` (Next 15 flat config)
- [x] **Archive `docs/IMPLEMENTATION_PLAN.md`** → `docs/archive/IMPLEMENTATION_PLAN.md` + SUPERSEDED banner

---

### AEO / GEO Phase 1 (2026-05-30, branch `cursor/aeo-geo-phase1`)

- [x] **`lib/seo/` module** — Organization, AutoDealer, WebSite, Product/Car, Article, FAQ helper, ItemList, JsonLd component
- [x] **Root layout JSON-LD** — `organizationGraph()` + `websiteJsonLd()` via `<JsonLd />`
- [x] **Homepage** — AEO metadata + ItemList for featured cars
- [x] **`public/llms.txt`** — GEO crawler summary (brands, URLs, branches)
- [x] **`docs/AEO-GEO.md`** — schema map, data sources, Phase 2–3 roadmap
- [x] **Branch data unification** — `branches` + `contact` import `lib/branchData.ts`; removed phantom Ford นครปฐม

---

## P2 — Nice to have

- [x] **Health check `/api/health`** — Turso + Notion ping (shipped ใน P1 batch)
- [ ] **Error tracking (Sentry)**
- [ ] **Analytics** — Vercel Analytics หรือ GA4
- [ ] **Turso backup schedule**
- [ ] **Notion webhook → auto revalidate**
- [ ] **AI Chat Widget** — port จาก ch-erawanwebsite
- [ ] **Car comparison tool**
- [ ] **Awards page brand filter**

---

## ✅ Done (shipped บน branch นี้)

### P1 SEO + Ops (2026-05-30)

- [x] Product JSON-LD, BreadcrumbList, canonical URLs, default OG, sitemap dates
- [x] Booking file upload (damage + insurance docs)
- [x] Appointment email notifications (Resend/SMTP/log-only)
- [x] `/api/health`, ESLint config, archived IMPLEMENTATION_PLAN
- [x] `revalidatePath` ใช้ car slug

### Admin CMS + Security

- [x] `requireAdmin()` บนทุก `/api/admin/*` + middleware `/api/admin/:path*`
- [x] Rate limiting `/api/auth/*` (`@upstash/ratelimit` — graceful skip ถ้าไม่มี env)
- [x] Cars CRUD (`/admin/cars`, `/api/admin/cars`)
- [x] Blog CRUD + TipTap WYSIWYG (`/admin/blog`, `/api/admin/blog`)
- [x] Contacts admin read-only (`/admin/contacts`)
- [x] Cloudinary upload (`POST /api/upload`, `ImageUploader`)
- [x] Admin dashboard stats + ปุ่ม revalidate (`POST /api/admin/revalidate`)
- [x] Notion write helpers + retry/backoff 429/5xx ใน `lib/notion.ts`

### URLs + Performance

- [x] Car detail URLs: `/cars/[slug]` (แทน `[id]`)
- [x] `React cache()` dedupe Notion reads
- [x] Bounded prerender 40 slugs (`generateStaticParams`)

### Testing + Docs

- [x] Vitest unit/integration/component (~123 tests)
- [x] Playwright e2e (9 specs)
- [x] `docs/TESTING.md`
- [x] `docs/ADMIN.md` (operator how-to)

### ที่มีอยู่ก่อนหน้า (baseline)

- [x] Next.js 15 App Router + React 19 + TypeScript
- [x] Tailwind CSS + Radix UI + shadcn/ui
- [x] Notion API (Cars, Blog, Stories, Appointments, Contacts)
- [x] Better Auth + Turso (email/password + admin role)
- [x] Admin: appointments, stories approval
- [x] Booking form (4 types), blog, stories submission
- [x] Google Maps (7 branches), Vercel sin1
- [x] ISR `/api/revalidate`, SEO metadata (sitemap, robots, OG)
- [x] Mobile responsive, Thai UI
