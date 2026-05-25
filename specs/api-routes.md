# API Routes

ทุก API routes อยู่ใน `app/api/`

## Public Routes

### `POST /api/submit/booking`

จองนัดหมาย — สร้าง page ใน Notion Appointments DB

**Body (Zod schema):**
```typescript
{
  customerName: string          // required
  customerPhone: string         // required
  customerEmail?: string        // optional, must be valid email
  type: "test_drive" | "service" | "body_paint" | "insurance_quote"  // required
  carModel?: string
  branch?: string
  preferredDate?: string        // ISO date string
  preferredTime?: string        // "HH:MM"
  notes?: string

  // body_paint only
  damageDescription?: string
  insuranceCompany?: string

  // insurance_quote only
  vehicleRegistration?: string
  coverageType?: string
}
```

**Response:**
- `200` `{ success: true }`
- `400` `{ error: "Invalid data", issues: [...] }` — Zod validation failed
- `500` `{ error: "Internal server error" }`

---

### `POST /api/submit/story`

Submit customer testimonial → Notion Stories DB (status: pending)

**Body:**
```typescript
{
  customerName: string
  story: string
  rating: number  // 1-5
  carModel?: string
  customerEmail?: string
  customerPhone?: string
}
```

---

### `POST /api/submit/contact`

ฟอร์มติดต่อ → Notion Contacts DB

**Body:**
```typescript
{
  name: string
  phone: string
  email?: string
  message: string
  branch?: string
}
```

---

### `GET|POST /api/auth/[...all]`

Better Auth catch-all handler — จัดการ auth routes ทั้งหมด:

| Path | Method | คำอธิบาย |
|------|--------|----------|
| `/api/auth/sign-in/email` | POST | Login |
| `/api/auth/sign-up/email` | POST | Register |
| `/api/auth/sign-out` | POST | Logout |
| `/api/auth/get-session` | GET | Get current session |

ถ้า `TURSO_DATABASE_URL` ไม่ถูกตั้ง → ส่งกลับ 503

---

## Admin Routes (ต้อง admin session)

Middleware ป้องกัน `/admin/*` pages แต่ API routes ตรวจสอบ auth เองใน handler

### `GET /api/admin/appointments`

ดึงนัดหมายทั้งหมดจาก Notion

**Response:** `{ appointments: Appointment[] }`

---

### `PATCH /api/admin/appointments`

อัปเดต status นัดหมาย

**Body:**
```typescript
{
  id: string  // Notion page ID
  status: "pending" | "confirmed" | "completed" | "cancelled"
}
```

**Response:** `{ success: true }`

---

### `GET /api/admin/stories`

ดึง stories ทั้งหมด (รวม pending/rejected)

**Response:** `{ stories: CustomerStory[] }`

---

### `PATCH /api/admin/stories`

Approve/reject story และ toggle public

**Body:**
```typescript
{
  id: string  // Notion page ID
  status: "approved" | "rejected" | "pending"
  isPublic?: boolean
}
```

**Response:** `{ success: true }`

---

## Utility Routes

### `POST /api/revalidate?secret=SECRET`

Trigger on-demand ISR revalidation — ใช้หลังแก้ content ใน Notion

**Query param:** `secret` ต้องตรงกับ `REVALIDATE_SECRET`

**Response:**
- `200` `{ revalidated: true }`
- `401` `{ error: "Invalid secret" }`

**ใช้งาน:**
```bash
curl -X POST "https://ch-erawan.com/api/revalidate?secret=YOUR_SECRET"
```

---

## TypeScript Types

Types ทั้งหมดอยู่ใน `lib/notion-types.ts`:

```typescript
type Car { id, name, brand, model, year, type, condition, priceMin, priceMax, ... }
type BlogPost { id, title, slug, excerpt, category, isPublished, publishedAt, ... }
type BlogPostWithContent extends BlogPost { contentMarkdown: string }
type CustomerStory { id, customerName, story, rating, status, isPublic, ... }
type Appointment { id, customerName, type, status, phone, branch, ... }
```
