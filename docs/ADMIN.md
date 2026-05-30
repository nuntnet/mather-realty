# คู่มือ Admin — ch-erawan-next

คู่มือสำหรับทีมงานที่ใช้ **Admin Panel** จัดการเนื้อหาเว็บ ช.เอราวัณ ออโต้ กรุ๊ป

**หลักการ:** Notion เป็น **source of truth** — การแก้ผ่าน Admin จะเขียนกลับ Notion โดยตรง หน้าเว็บสาธารณะจะอัปเดตหลัง ISR revalidate

แผนการพัฒนาทางเทคนิค (Phase 0–5) ดูที่ [`docs/ADMIN_CMS_PLAN.md`](ADMIN_CMS_PLAN.md)

---

## เข้าสู่ระบบ

| รายการ | ค่า |
|--------|-----|
| URL เข้าสู่ระบบ | `/login` |
| หลัง login สำเร็จ | redirect ไป `/admin` (หรือ `callbackUrl` ถ้ามี) |
| สิทธิ์ที่ต้องมี | `user.role = 'admin'` ใน Turso |

หน้า `/admin/*` และ API `/api/admin/*` ถูก protect โดย middleware + `requireAdmin()` ในแต่ละ handler

---

## สร้าง Admin คนแรก

### วิธีที่แนะนำ (sign-up + ตั้ง role)

1. ตั้ง env ให้ครบ (Turso + Better Auth) แล้ว start server
2. สมัครผู้ใช้ผ่าน API หรือหน้า login (ถ้ามี sign-up เปิดอยู่):

```bash
curl -X POST http://localhost:3002/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ch-erawan.com","password":"StrongPassword123","name":"Admin"}'
```

3. ตั้ง role เป็น admin ใน Turso:

```bash
turso db shell ch-erawan \
  "UPDATE user SET role = 'admin' WHERE email = 'admin@ch-erawan.com';"
```

Better Auth จะ hash รหัสผ่านให้ถูกต้องอัตโนมัติเมื่อ sign-up ผ่าน API

### วิธี `scripts/seed-admin.ts` (มีข้อจำกัด)

```bash
bunx tsx scripts/seed-admin.ts
```

สคริปต์นี้ insert ผู้ใช้ลง Turso โดยตรง และ hash รหัสผ่านด้วย **Bun.password / bcrypt** — อาจ**ไม่ตรง**กับอัลกอริทึมที่ Better Auth 1.5 ใช้จริง (scrypt) ทำให้ login ไม่ได้

**แนะนำ:** ใช้ sign-up API + `UPDATE role` แทน หรือแก้สคริปต์ให้เรียก Better Auth sign-up แทนการ insert เอง

รายละเอียด deploy ครบ: [`specs/deployment.md`](../specs/deployment.md#step-5-สร้าง-admin-account)

---

## Environment Variables (Admin / Auth)

| Variable | จำเป็น | ใช้ทำอะไร |
|----------|--------|-----------|
| `TURSO_DATABASE_URL` | ✅ | SQLite บน Turso — sessions + users |
| `TURSO_AUTH_TOKEN` | ✅ | Token เชื่อม Turso |
| `BETTER_AUTH_SECRET` | ✅ | Sign session cookies |
| `BETTER_AUTH_URL` | ✅ prod | Base URL (`http://localhost:3002` dev, `https://ch-erawan.com` prod) |
| `NOTION_API_KEY` + DB IDs | ✅ | อ่าน/เขียน CMS |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ upload | Cloud name |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | ✅ upload | Server-side upload |
| `REVALIDATE_SECRET` | optional | Revalidate ผ่าน curl/webhook (ไม่ใช้ใน Admin dashboard) |
| `UPSTASH_REDIS_REST_URL` | prod แนะนำ | Rate limit `/api/auth/*` |
| `UPSTASH_REDIS_REST_TOKEN` | prod แนะนำ | คู่กับ Upstash URL |

ถ้าไม่มี Turso → auth ปิด (503 บน admin API)  
ถ้าไม่มี Upstash → rate limit auth **ปิด** (dev OK, prod ควรตั้ง)

รายการ env ครบ: [`specs/env-vars.md`](../specs/env-vars.md)

---

## หน้า Admin แต่ละส่วน

| เส้นทาง | หน้าที่ |
|---------|---------|
| `/admin` | ภาพรวม — stat cards, นัดหมาย/รีวิวล่าสุด, ปุ่ม **รีเฟรชเว็บไซต์** |
| `/admin/cars` | CRUD รถ — เพิ่ม/แก้/ลบ (archive), toggle active/featured, อัปโหลดรูป |
| `/admin/blog` | CRUD บทความ — WYSIWYG (TipTap), publish/draft, slug, SEO fields |
| `/admin/contacts` | อ่านข้อความจากฟอร์มติดต่อ (read-only) |
| `/admin/appointments` | ดู/อัปเดตสถานะนัดหมาย |
| `/admin/stories` | อนุมัติ/ปฏิเสธรีวิวลูกค้า |

เมนู sidebar อยู่ใน `app/admin/layout.tsx`

---

## อัปโหลดรูป (Cloudinary)

1. ในฟอร์มรถหรือบทความ ใช้ **ImageUploader** — drag-drop หรือเลือกไฟล์
2. Client ส่ง `POST /api/upload` (multipart, field `file`) — ต้อง login admin
3. Server อัปโหลดไป Cloudinary แล้วคืน `{ url }`
4. URL ถูกเก็บใน Notion (รูปรถ: newline-separated ใน property; บทความ: cover URL)

**ข้อจำกัด:** JPG / PNG / WEBP, สูงสุด 5MB ต่อไฟล์

---

## รีเฟรชเว็บไซต์ (Revalidate)

หลังแก้เนื้อหาใน Admin หน้าสาธารณะอาจยัง cache อยู่ชั่วคราว

- **จาก Dashboard:** ปุ่ม «รีเฟรชเว็บไซต์» → `POST /api/admin/revalidate` body `{ "type": "all" }` (ใช้ session admin ไม่ต้อง secret)
- **จาก CLI/webhook:** `POST /api/revalidate?secret=REVALIDATE_SECRET` — ดู [`specs/deployment.md`](../specs/deployment.md)

Admin CRUD บาง route จะ revalidate อัตโนมัติหลัง save (cars/blog)

---

## Notion ยังเป็น source of truth

- แก้ใน Admin = แก้ Notion database โดยตรง
- แก้ใน Notion UI โดยตรงก็ได้ — ต้อง trigger revalidate เองถ้าหน้าเว็บไม่อัปเดต
- Property names ใน Notion ต้องตรงกับที่ `lib/notion.ts` map (เช่น "Price Min", "Is Featured")

---

## การทดสอบ

ดู [`docs/TESTING.md`](TESTING.md) — unit/integration/e2e ครอบ admin routes, upload, middleware

```bash
bun run test        # Vitest ทั้งหมด
bun run test:e2e    # Playwright (ต้องมี server + Notion env)
```
