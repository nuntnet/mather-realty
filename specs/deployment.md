# Deployment Guide (Vercel)

## Prerequisites

ก่อน deploy ต้องมี accounts ต่อไปนี้พร้อม:
- [ ] Vercel account (เชื่อมกับ GitHub)
- [ ] Notion workspace + Integration
- [ ] Turso account + database
- [ ] Cloudinary account
- [ ] Google Cloud Console project (Maps API enabled)

---

## Step 1: สร้าง Secrets

```bash
# BETTER_AUTH_SECRET
openssl rand -base64 32

# REVALIDATE_SECRET
openssl rand -base64 32
```

---

## Step 2: Setup Turso

```bash
# Install CLI
brew install tursodatabase/tap/turso

# Login
turso auth login

# Create database
turso db create ch-erawan

# Get URL (copy TURSO_DATABASE_URL)
turso db show ch-erawan

# Create auth token (copy TURSO_AUTH_TOKEN)
turso db tokens create ch-erawan
```

Better Auth จะสร้าง tables อัตโนมัติเมื่อ server start ครั้งแรก

---

## Step 3: Setup Notion

1. ไปที่ https://www.notion.so/my-integrations
2. สร้าง Integration ใหม่ → ตั้งชื่อ "ch-erawan-website"
3. Copy **Internal Integration Secret** → `NOTION_API_KEY`
4. เปิดแต่ละ database ใน Notion workspace:
   - Cars, Blog, Stories, Appointments, Contacts
   - คลิก "..." บนมุมขวาบน → Connections → เพิ่ม integration
5. Copy Database IDs จาก URL ของแต่ละ database

---

## Step 4: Deploy บน Vercel

```bash
# Option A: ผ่าน Vercel CLI
npm i -g vercel
vercel --prod

# Option B: ผ่าน GitHub (แนะนำ)
# 1. Push code ขึ้น GitHub
# 2. ไป https://vercel.com/new → Import Git Repository
# 3. เลือก repo ch-erawan-next
# 4. Framework: Next.js (auto-detected)
# 5. ตั้งค่า Environment Variables (ดูด้านล่าง)
# 6. Deploy
```

**Environment Variables ใน Vercel:**

| Variable | Value |
|----------|-------|
| `NOTION_API_KEY` | secret_xxx... |
| `NOTION_CARS_DB_ID` | 32-char ID |
| `NOTION_BLOG_DB_ID` | 32-char ID |
| `NOTION_STORIES_DB_ID` | 32-char ID |
| `NOTION_APPOINTMENTS_DB_ID` | 32-char ID |
| `NOTION_CONTACTS_DB_ID` | 32-char ID |
| `BETTER_AUTH_SECRET` | random secret |
| `BETTER_AUTH_URL` | `https://ch-erawan.com` |
| `TURSO_DATABASE_URL` | libsql://... |
| `TURSO_AUTH_TOKEN` | token |
| `REVALIDATE_SECRET` | random secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | cloud name |
| `CLOUDINARY_API_KEY` | api key |
| `CLOUDINARY_API_SECRET` | api secret |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | AIzaSy... |

---

## Step 5: สร้าง Admin Account

หลัง deploy ครั้งแรก สร้าง admin user:

```bash
# 1. Register ผ่าน /login หรือ API
curl -X POST https://ch-erawan.com/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ch-erawan.com","password":"StrongPassword123","name":"Admin"}'

# 2. Set role เป็น admin ผ่าน Turso CLI
turso db shell ch-erawan \
  "UPDATE user SET role = 'admin' WHERE email = 'admin@ch-erawan.com';"
```

---

## Step 6: Post-Deploy Checks

```bash
BASE_URL="https://ch-erawan.com"

# ✅ Health: หน้าแรกโหลดได้
curl -I $BASE_URL

# ✅ Auth: get-session ตอบ (ไม่ crash)
curl $BASE_URL/api/auth/get-session

# ✅ Admin protection: redirect ไป /login
curl -I $BASE_URL/admin

# ✅ Revalidation ทำงาน
curl -X POST "$BASE_URL/api/revalidate?secret=YOUR_REVALIDATE_SECRET"

# ✅ Notion: form submission ทำงาน (เช็คใน Notion ว่ามี page ใหม่)
curl -X POST $BASE_URL/api/submit/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"0812345678","message":"test"}'
```

---

## Custom Domain

1. ไป Vercel → Project → Settings → Domains
2. เพิ่ม `ch-erawan.com` และ `www.ch-erawan.com`
3. อัปเดต DNS ตาม Vercel instructions
4. อัปเดต `BETTER_AUTH_URL=https://ch-erawan.com` ใน Vercel env vars
5. Redeploy

---

## vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "regions": ["sin1"]
}
```

Deploy ไปที่ Singapore (sin1) — ใกล้ user ในไทย latency ต่ำ

---

## Continuous Deployment

เมื่อ push ไป `main` branch → Vercel auto-deploy  
เมื่อเปิด PR → Vercel สร้าง Preview URL อัตโนมัติ

---

## Content Updates (ไม่ต้อง redeploy)

หลัง deploy แล้ว เมื่อแก้ content ใน Notion:

```bash
# Trigger revalidation เพื่ออัปเดตหน้าเว็บ
curl -X POST "https://ch-erawan.com/api/revalidate?secret=YOUR_REVALIDATE_SECRET"
```

หรือตั้ง Notion Automation ให้เรียก webhook นี้อัตโนมัติเมื่อ page ถูกแก้ไข
