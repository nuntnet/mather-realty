# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│   React 19 (Client Components + Framer Motion)             │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                  Vercel Edge (sin1)                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │             Next.js 15 App Router                   │   │
│   │                                                     │   │
│   │  Server Components ──► Notion API  (CMS data)       │   │
│   │  Server Actions    ──► Notion API  (form submit)    │   │
│   │  Middleware        ──► Better Auth (admin guard)    │   │
│   │  API Routes        ──► Notion API / Better Auth     │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │               │               │
         ▼               ▼               ▼
   ┌──────────┐   ┌──────────────┐  ┌───────────────┐
   │  Notion  │   │    Turso     │  │  Cloudinary   │
   │   (CMS)  │   │  (SQLite DB) │  │   (Images)    │
   │  5 DBs   │   │  Auth tables │  │  Car photos   │
   └──────────┘   └──────────────┘  └───────────────┘
         │
         ▼
   ┌──────────────────┐
   │   Google Maps    │
   │  (branch map)    │
   └──────────────────┘
```

## Data Sources

| Data | Source | เขียน/แก้ไขที่ไหน |
|------|--------|-----------------|
| รายการรถ | Notion Cars DB | Notion workspace |
| บล็อก | Notion Blog DB | Notion workspace |
| Testimonials | Notion Stories DB | Form → Notion, admin approve |
| นัดหมาย | Notion Appointments DB | Form → Notion, admin update status |
| ติดต่อ | Notion Contacts DB | Form → Notion |
| User sessions | Turso (SQLite) | better-auth จัดการอัตโนมัติ |
| ข้อมูลสาขา | `lib/branchData.ts` (hardcoded) | แก้ใน code |
| รูปภาพรถ | Cloudinary | upload แล้วใส่ URL ใน Notion |

## Rendering Strategy

| Page | Strategy | เหตุผล |
|------|----------|--------|
| `/` Home | SSR + ISR | ดึงข้อมูล Notion แบบ fresh, revalidate ได้ |
| `/cars` | SSR | filter จาก query params |
| `/cars/[id]` | SSG + ISR | static ต่อ ID, revalidate เมื่ออัปเดต Notion |
| `/blog/[slug]` | SSG + ISR | static ต่อ slug |
| `/admin/*` | CSR (protected) | ข้อมูล realtime, ต้อง auth |
| Static pages | SSG | about, awards, career ไม่เปลี่ยนบ่อย |

## Request Flow — Form Submission (Booking)

```
User fills form
      │
      ▼
POST /api/submit/booking
      │
      ├── Zod validation
      │
      ├── notion.pages.create() → Appointments DB
      │
      └── return { success: true }
            │
            ▼
      Admin sees in /admin/appointments
            │
            ▼
      PATCH /api/admin/appointments → updateAppointmentStatus()
```

## Request Flow — Admin Protected Pages

```
Browser navigates to /admin/*
      │
      ▼
middleware.ts intercepts
      │
      ├── ไม่มี session cookie → redirect /login?callbackUrl=...
      │
      ├── GET /api/auth/get-session (validate token)
      │
      ├── user.role !== "admin" → redirect /login?error=unauthorized
      │
      └── NextResponse.next() → render admin page
```

## Key Directories

```
app/
  (public)/          # Public marketing pages
  admin/             # Protected admin dashboard
  api/               # API routes
    auth/[...all]/   # Better Auth catch-all
    submit/          # Form submissions → Notion
    admin/           # Admin CRUD → Notion
    revalidate/      # On-demand ISR
components/          # React components (Navbar, Footer, Map, etc.)
lib/
  notion.ts          # All Notion queries (read + write)
  auth.ts            # Better Auth instance
  auth-client.ts     # Client-side auth hooks
  branchData.ts      # Hardcoded branch info (7 branches)
  brandLogos.ts      # Brand logos (base64)
  brandImages.ts     # Cloudinary image URLs
  notion-types.ts    # TypeScript interfaces for Notion data
```
