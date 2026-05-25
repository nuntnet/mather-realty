# TODO List

## 🔴 Critical — Security / Infra

- [ ] **Rate limiting บน `/api/auth/*`** — ป้องกัน brute force attack  
  ใช้ `@upstash/ratelimit` + Vercel Edge Middleware หรือ `next-rate-limit`

- [ ] **ตั้ง `BETTER_AUTH_URL` ใน Vercel** ให้เป็น production domain  
  ถ้าไม่ตั้ง session cookies จะ scope ผิด domain

- [ ] **สร้าง admin account แรกใน Turso** หลัง deploy  
  ดูวิธีที่ [deployment.md](deployment.md#step-5-สร้าง-admin-account)

- [ ] **ตรวจสอบ Notion API reachable จาก Vercel sin1**  
  Notion ไม่ได้ block Vercel แต่ควรเช็ค latency และ rate limits

---

## 🟡 Important — Features

- [ ] **File upload — damage photos (body_paint booking)**  
  UI แสดง file input อยู่แล้วแต่ backend ไม่ได้รับไฟล์จริง  
  ต้องเพิ่ม: upload ไป Cloudinary → เก็บ URL ใน Notion

- [ ] **File upload — insurance documents (body_paint booking)**  
  เหมือนกัน — upload ไม่ได้ implement จริง

- [ ] **Cloudinary upload wired up**  
  `CLOUDINARY_API_KEY` และ `CLOUDINARY_API_SECRET` อยู่ใน env แต่ยังไม่มี upload endpoint  
  สร้าง `POST /api/upload` สำหรับ presigned upload หรือ server-side upload

- [ ] **Email notifications สำหรับนัดหมายใหม่**  
  ปัจจุบัน admin ต้องเข้าไปดูใน Notion เอง  
  แนะนำ: Resend หรือ Nodemailer + Gmail SMTP

- [ ] **AI Chat Widget**  
  มีอยู่ใน ch-erawanwebsite (worktree) แต่ยังไม่ได้ port มา  
  detect intent → route ไป LINE OA ของแต่ละแบรนด์

- [ ] **Car comparison tool**  
  เปรียบเทียบรถ 2-3 คันแบบ side-by-side

- [ ] **Awards page brand filter**  
  หน้า `/awards` มีรูป 32 รางวัล แต่ยังไม่มี filter ตาม brand

---

## 🟢 Nice to Have — Ops / DX

- [ ] **Health check endpoint `/api/health`**  
  เช็ค connectivity: Turso ping + Notion API ping  
  ใช้สำหรับ monitoring และ uptime check

- [ ] **Error tracking (Sentry)**  
  ```bash
  bun add @sentry/nextjs
  ```
  ตั้ง `SENTRY_DSN` ใน Vercel env

- [ ] **Analytics**  
  Vercel Analytics (ฟรีใน hobby plan) หรือ GA4  
  เพิ่มแค่ `<Analytics />` component จาก `@vercel/analytics`

- [ ] **Turso backup schedule**  
  ตั้งใน Turso dashboard → Backups → Enable automatic backups

- [ ] **`drizzle.config.ts` สำหรับ manual migrations**  
  ปัจจุบัน better-auth จัดการ schema เอง แต่ถ้าต้อง migrate หรือ inspect DB จะทำยาก

- [ ] **E2E tests (Playwright)**  
  critical paths: booking form, blog browsing, admin login + approve story

- [ ] **`CLAUDE.md`** สำหรับ AI agent context  
  ช่วยให้ Claude เข้าใจ project เร็วขึ้นเมื่อเปิด session ใหม่

- [ ] **Notion webhook → auto revalidate**  
  เมื่อแก้ Notion → trigger `/api/revalidate` อัตโนมัติ  
  ดู Notion Automations หรือใช้ Zapier/Make

---

## ✅ Done

- [x] Next.js 15 App Router setup
- [x] Tailwind CSS + Radix UI + shadcn/ui
- [x] Notion API integration (Cars, Blog, Stories, Appointments, Contacts)
- [x] Better Auth + Turso (email/password + admin role)
- [x] Admin dashboard (appointments, stories)
- [x] Booking form (4 types: test drive, service, body paint, insurance)
- [x] Blog with Notion-to-Markdown rendering
- [x] Customer stories submission + admin approval flow
- [x] Google Maps integration (7 branches)
- [x] Vercel deployment config (Singapore region)
- [x] ISR revalidation endpoint
- [x] SEO metadata (sitemap, robots, OG tags)
- [x] Mobile responsive design
- [x] Thai language UI
- [x] Brand logos (base64 embedded)
