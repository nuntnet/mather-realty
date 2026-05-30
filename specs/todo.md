# TODO List

อัปเดตล่าสุด: 2026-05-30 (branch `cursor/admin-cms-crud-notion-hardening`)

---

## P0 — แก้ก่อน merge / deploy prod

- [ ] **Fix `revalidatePath` หน้ารถใช้ slug ไม่ใช่ Notion id**  
  `app/api/admin/cars/route.ts` → `revalidateCars(id)` เรียก `/cars/${id}` แต่ route จริงคือ `/cars/[slug]` — หลังแก้รถ หน้า detail อาจไม่ refresh ทันที

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

- [ ] **Vehicle/Product JSON-LD** บนหน้ารถ `/cars/[slug]`
- [ ] **Canonical URLs** ทุกหน้าหลัก
- [ ] **Default OG image** เมื่อไม่มีรูปจาก Notion
- [ ] **Sitemap `lastModified`** จาก Notion dates
- [ ] **BreadcrumbList** JSON-LD

### Features / Ops

- [ ] **File upload — damage photos (body_paint booking)**  
  UI มี file input แต่ backend ยังไม่รับไฟล์ → Cloudinary + Notion

- [ ] **File upload — insurance documents (body_paint booking)**  
  เหมือนกัน

- [ ] **Email notifications สำหรับนัดหมายใหม่**  
  Resend หรือ Nodemailer + Gmail SMTP

- [ ] **ตรวจสอบ Notion API reachable จาก Vercel sin1**  
  latency และ rate limits

- [ ] **Configure ESLint** — `eslint` + `eslint-config-next` มีใน devDeps แต่ยังไม่มี config ใช้งาน (`bun lint` อาจ fail)

- [ ] **อัปเดตหรือ archive `docs/IMPLEMENTATION_PLAN.md`** — แผน Phase 2 เก่า (pre-Admin CMS) ไม่สะท้อน codebase ปัจจุบัน

---

## P2 — Nice to have

- [ ] **Health check `/api/health`** — Turso + Notion ping
- [ ] **Error tracking (Sentry)**
- [ ] **Analytics** — Vercel Analytics หรือ GA4
- [ ] **Turso backup schedule**
- [ ] **Notion webhook → auto revalidate**
- [ ] **AI Chat Widget** — port จาก ch-erawanwebsite
- [ ] **Car comparison tool**
- [ ] **Awards page brand filter**

---

## ✅ Done (shipped บน branch นี้)

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
