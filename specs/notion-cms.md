# Notion CMS

Notion ทำหน้าที่เป็น CMS หลักของโปรเจ็ค — content ทั้งหมด (รถ, บล็อก, testimonials, นัดหมาย, ติดต่อ) เก็บใน Notion databases และดึงผ่าน Notion API

## 5 Databases

### 1. Cars DB (`NOTION_CARS_DB_ID`)

| Property | Type | คำอธิบาย |
|----------|------|----------|
| Name | Title | ชื่อรถ เช่น "Mazda CX-5 2024" |
| Brand | Select | Mazda / Ford / Mitsubishi / GWM / Deepal / Kia |
| Model | Text | รุ่น เช่น "CX-5" |
| Year | Number | ปี เช่น 2024 |
| Type | Select | sedan / suv / pickup / hatchback / mpv / ev / other |
| Condition | Select | new / used |
| Price Min | Number | ราคาต่ำสุด (บาท) |
| Price Max | Number | ราคาสูงสุด (บาท) |
| Engine Size | Text | เช่น "2.0L" |
| Transmission | Select | automatic / manual / cvt |
| Fuel Type | Select | petrol / diesel / electric / hybrid |
| Description | Text | คำอธิบายรถ |
| Specs | Text | JSON string เช่น `{"กำลัง": "165 แรงม้า"}` |
| Image URLs | Text | Cloudinary URLs คั่นด้วย newline |
| Video URL | URL | YouTube หรือ Cloudinary video |
| Is Active | Checkbox | แสดงบนเว็บหรือไม่ |
| Is Featured | Checkbox | แสดงใน featured section บน Home |
| Slug | Text | URL slug (ถ้ามี) |

**Queries ที่ใช้:**
- `getActiveCars(filters?)` — ดึงรถที่ `Is Active = true`, filter ได้ด้วย brand/condition/type
- `getFeaturedCars()` — ดึงรถ featured สูงสุด 6 คัน
- `getCarById(id)` — ดึงรถตาม Notion page ID
- `getAllCarIds()` — ดึง ID ทั้งหมดสำหรับ static generation

### 2. Blog DB (`NOTION_BLOG_DB_ID`)

| Property | Type | คำอธิบาย |
|----------|------|----------|
| Title | Title | หัวข้อบทความ |
| Slug | Text | URL path เช่น "review-mazda-cx5-2024" |
| Excerpt | Text | สรุปย่อ |
| Cover Image URL | Text | Cloudinary URL รูปหน้าปก |
| Category | Select | review / tips / news / promotion / csr |
| Tags | Multi-select | แท็กหลายอัน |
| SEO Title | Text | title สำหรับ meta tag |
| SEO Description | Text | description สำหรับ meta tag |
| Is Published | Checkbox | เผยแพร่หรือยัง |
| Published At | Date | วันที่เผยแพร่ |
| Author Name | Text | ชื่อผู้เขียน |

**Content:** เขียนใน Notion page body (Notion blocks) → แปลงเป็น Markdown ด้วย `notion-to-md`

**Queries:**
- `getPublishedBlogPosts(limit?)` — ดึงบทความที่ published เรียงตาม date
- `getBlogPostBySlug(slug)` — ดึงตาม slug
- `getBlogPostWithContent(slug)` — ดึง + แปลง content เป็น Markdown
- `getAllBlogSlugs()` — ดึง slugs ทั้งหมดสำหรับ static generation

### 3. Stories DB (`NOTION_STORIES_DB_ID`)

| Property | Type | คำอธิบาย |
|----------|------|----------|
| Name | Title | (auto-generated จาก Customer Name) |
| Customer Name | Text | ชื่อลูกค้า |
| Email | Email | อีเมล |
| Phone | Phone | เบอร์โทร |
| Story | Text | เนื้อหา testimonial |
| Rating | Number | 1–5 ดาว |
| Car Model | Text | รุ่นรถที่ซื้อ |
| Image URL | URL | รูปลูกค้า (optional) |
| Status | Select | pending / approved / rejected |
| Is Public | Checkbox | แสดงบนเว็บหรือไม่ |

**Flow:**
1. ลูกค้า submit form → `POST /api/submit/story` → สร้าง page ใน Notion (status: pending)
2. Admin เข้า `/admin/stories` → approve + toggle Is Public
3. `getPublicStories()` ดึงเฉพาะ status=approved AND Is Public=true

### 4. Appointments DB (`NOTION_APPOINTMENTS_DB_ID`)

| Property | Type | คำอธิบาย |
|----------|------|----------|
| Name | Title | Auto: "{Type} - {Customer Name}" |
| Customer Name | Text | ชื่อลูกค้า |
| Type | Select | test_drive / service / body_paint / insurance_quote |
| Status | Select | pending / confirmed / completed / cancelled |
| Phone | Phone | เบอร์โทร |
| Email | Email | อีเมล (optional) |
| Car Model | Text | รุ่นรถที่สนใจ |
| Branch | Text | สาขาที่เลือก |
| Preferred Date | Date | วันที่ต้องการ |
| Preferred Time | Text | เวลา เช่น "10:00" |
| Notes | Text | หมายเหตุเพิ่มเติม |
| Damage Description | Text | (body_paint) คำอธิบายความเสียหาย |
| Insurance Company | Text | (body_paint) บริษัทประกัน |
| Vehicle Registration | Text | (insurance_quote) เลขทะเบียน |
| Coverage Type | Text | (insurance_quote) ประเภทความคุ้มครอง |
| Submitted At | Date | วันเวลาที่ส่งฟอร์ม |

**Admin actions:**
- `updateAppointmentStatus(id, status)` — เปลี่ยน status ใน Notion

### 5. Contacts DB (`NOTION_CONTACTS_DB_ID`)

ข้อมูลจากฟอร์มติดต่อ — name, email, phone, message, branch

## การ Setup Notion

1. ไปที่ https://www.notion.so/my-integrations → สร้าง Integration ใหม่
2. Copy `Internal Integration Secret` → `NOTION_API_KEY`
3. เปิด Database แต่ละอัน → คลิก "..." → Connections → เพิ่ม Integration ที่สร้าง
4. Copy Database ID จาก URL: `notion.so/[workspace]/`**`{DATABASE_ID}`**`?v=...`
5. ใส่ทั้ง 5 IDs ใน `.env.local`

## การแก้ไข Content

- **เพิ่มรถใหม่**: เปิด Cars DB ใน Notion → New page → กรอก properties → ✅ Is Active
- **เขียนบล็อก**: เปิด Blog DB → New page → กรอก Title/Slug/Category → เขียนใน body → ✅ Is Published
- **Approve testimonial**: เปิด Stories DB → เปลี่ยน Status เป็น "approved" → ✅ Is Public
- **จัดการนัดหมาย**: เปิด Appointments DB หรือผ่าน `/admin/appointments`

## ISR Revalidation

เมื่อแก้ไข content ใน Notion สามารถ trigger revalidation ได้ทันที:

```bash
curl -X POST https://ch-erawan.com/api/revalidate?secret=YOUR_REVALIDATE_SECRET
```

หน้าที่ revalidate: cars, blog, stories, home
