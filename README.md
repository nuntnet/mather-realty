# ช.เอราวัณ ออโต้ กรุ๊ป — เว็บไซต์หลัก

เว็บไซต์ดีลเลอร์รถยนต์ครบวงจรของ **ช.เอราวัณ ออโตเซลส์** จ.นครปฐม ก่อตั้งปี 2510 รองรับ 6 แบรนด์: Mazda, Ford, Mitsubishi, GWM, Deepal, Kia — 7 สาขา

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router + Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 + Radix UI + shadcn/ui |
| Animations | Framer Motion |
| CMS | Notion API (cars, blog, stories, appointments, contacts) |
| Auth | Better Auth 1.5 + Turso (SQLite) |
| Images | Cloudinary |
| Maps | Google Maps JS API |
| Deploy | Vercel (Singapore region) |
| Package Manager | Bun |

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Copy env file and fill in values
cp .env.local.example .env.local
# → แก้ไข .env.local ตาม specs/env-vars.md

# 3. Start dev server
bun dev
```

เปิด [http://localhost:3000](http://localhost:3000)

> ⚠️ ถ้า `TURSO_DATABASE_URL` ไม่ถูกตั้ง — auth จะถูก disable (warning ใน console)  
> ⚠️ ถ้า `NOTION_API_KEY` ไม่ถูกตั้ง — หน้าที่ดึงข้อมูล Notion จะ error

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, brand cards, car search, services, testimonials, blog, map |
| `/cars` | รายการรถทั้งหมด (filter brand/condition/type) |
| `/cars/[id]` | รายละเอียดรถแต่ละคัน |
| `/booking` | จองนัดหมาย 4 ประเภท |
| `/stories` | Customer testimonials |
| `/blog` | บทความและข่าวสาร |
| `/blog/[slug]` | บทความเดี่ยว (Notion content → Markdown) |
| `/branches` | 7 สาขาพร้อมแผนที่และข้อมูลติดต่อ |
| `/contact` | ฟอร์มติดต่อ |
| `/about` | ประวัติบริษัท |
| `/awards` | รางวัลและความสำเร็จ |
| `/insurance` | ข้อมูลประกันภัย |
| `/secondhand` | รถมือสอง |
| `/career` | สมัครงาน |
| `/admin/*` | Admin dashboard (ต้อง login เป็น admin) |

## Documentation

| ไฟล์ | เนื้อหา |
|------|---------|
| [specs/architecture.md](specs/architecture.md) | System overview และ data flow |
| [specs/notion-cms.md](specs/notion-cms.md) | วิธีใช้ Notion เป็น CMS |
| [specs/auth.md](specs/auth.md) | Authentication และ admin access |
| [specs/api-routes.md](specs/api-routes.md) | API endpoints ทั้งหมด |
| [specs/env-vars.md](specs/env-vars.md) | Environment variables ครบทุกตัว |
| [specs/deployment.md](specs/deployment.md) | Deploy บน Vercel step-by-step |
| [specs/todo.md](specs/todo.md) | TODO list และ known issues |

## Scripts

```bash
bun dev        # dev server
bun build      # production build
bun start      # start production server
bun lint       # ESLint
```

## ติดต่อ / สาขา

ดูข้อมูลสาขาทั้ง 7 แห่งได้ที่ [`lib/branchData.ts`](lib/branchData.ts)
