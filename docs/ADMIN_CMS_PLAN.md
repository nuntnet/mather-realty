# Admin CMS — Implementation Plan

**เป้าหมาย:** ทำให้ `/admin/*` เป็น CMS เต็มรูปแบบ จัดการ Cars / Blog / Stories / Appointments / Contacts ได้ในเว็บ โดย **Notion เป็น source of truth** (เขียนกลับ Notion โดยตรง)

**Data strategy:** ทุก write operation ยิงเข้า Notion API ผ่าน `lib/notion.ts` แล้ว revalidate หน้า public ที่เกี่ยวข้อง

---

## Phase 0 — Security Foundation (ทำก่อนเป็นอันดับแรก) 🔴

ปัจจุบัน `/api/admin/*` **ไม่ถูก protect** (middleware matcher = `/admin/:path*` เท่านั้น) และ handler ไม่เช็ค session เอง

### 0.1 สร้าง helper `requireAdmin()` — `lib/admin-auth.ts` (ใหม่)
- ใช้ `auth.api.getSession({ headers })` ฝั่ง server เช็ค `session.user.role === "admin"`
- คืน `null` ถ้าผ่าน, หรือ `NextResponse` 401/403 ถ้าไม่ผ่าน
- ใส่ไว้ต้นทุก handler ใน `/api/admin/*` (รวมที่จะสร้างใหม่)

### 0.2 ขยาย middleware matcher
- เพิ่ม `"/api/admin/:path*"` เข้า matcher (ป้องกันชั้นนอก) — แต่ยังคง `requireAdmin()` ในตัว handler เป็น defense-in-depth

### 0.3 Rate limiting บน `/api/auth/*`
- ใช้ `@upstash/ratelimit` + `@upstash/redis` (ติดตั้งแล้ว)
- สร้าง `lib/ratelimit.ts` → จำกัด sign-in/sign-up เช่น 10 req/นาที/IP
- เพิ่ม env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (graceful skip ถ้าไม่มี)

---

## Phase 1 — Cars CRUD (full)

### 1.1 ขยาย `lib/notion.ts`
เพิ่มฟังก์ชัน:
- `getAllCarsAdmin()` — ดึงรถทุกคันรวม inactive (admin เห็นหมด)
- `createCar(data)` — `notion.pages.create` map field → Notion properties
- `updateCar(id, data)` — `notion.pages.update`
- `archiveCar(id)` / `setCarFlags(id, {isActive, isFeatured})` — soft-delete = set `Is Active=false`; toggle featured
- helper `carToProperties(data)` แปลง type → Notion property payload (title/select/number/checkbox/rich_text/url + JSON specs + newline image URLs)

### 1.2 API — `app/api/admin/cars/route.ts` (ใหม่)
- `GET` list (admin) · `POST` create · `PATCH` update/flags · `DELETE` archive
- Zod schema validate ทุก field · `requireAdmin()` ทุก method
- หลัง write → `revalidatePath("/cars")`, `revalidatePath("/")`, `revalidatePath("/cars/[id]")`

### 1.3 UI — `app/admin/cars/`
- `page.tsx` → เปลี่ยนเป็น client component: ตาราง + ปุ่ม "เพิ่มรถ", inline toggle featured/active, ปุ่มแก้ไข/ลบ
- `CarForm.tsx` (ใหม่) → ฟอร์ม shadcn (Dialog หรือ route `/admin/cars/new` + `/admin/cars/[id]/edit`)
  - field ครบตาม `Car` interface, image upload (Phase 3), specs เป็น key-value editor
- ใช้ `sonner` toast + optimistic update

---

## Phase 2 — Blog CRUD + Rich Text Editor (WYSIWYG)

> **สถาปัตยกรรมเนื้อหา:** Notion เก็บเนื้อหาเป็น **blocks** (ไม่ใช่ text ก้อนเดียว) Notion API รับเฉพาะ blocks
> ใช้ **markdown เป็นตัวกลาง** เบื้องหลัง WYSIWYG:
> - แก้บทความ: `Notion blocks → (notion-to-md) markdown → TipTap`
> - บันทึก: `TipTap → markdown → (martian) Notion blocks → Notion API`
> ผู้ใช้เห็นเป็น WYSIWYG จริง แต่ reuse `notion-to-md` ที่มีอยู่ + converter พร้อมใช้

### 2.1 ขยาย `lib/notion.ts`
- `getAllBlogPostsAdmin()` — รวม draft
- `getBlogPostForEdit(id)` — คืน meta + contentMarkdown (สำหรับโหลดเข้า editor)
- `createBlogPost(meta, markdown)` — create page + แปลง markdown → blocks เขียน body
- `updateBlogPost(id, meta, markdown?)` — update properties; ถ้าแก้ content → ลบ blocks เดิมทั้งหมด + เขียน blocks ใหม่
- `setBlogPublished(id, bool)` — toggle publish + set Published At
- `archiveBlogPost(id)` — soft delete
- helper `markdownToBlocks()` ใช้ `@tryfabric/martian` **[เพิ่ม dependency]**

### 2.2 API — `app/api/admin/blog/route.ts` (ใหม่)
- `GET/POST/PATCH/DELETE` + `requireAdmin()` + Zod
- revalidate `/blog`, `/blog/[slug]`, `/`

### 2.3 UI — `app/admin/blog/`
- ตาราง + create/edit/publish toggle/delete
- `BlogForm.tsx`: meta fields (title, slug auto, excerpt, category, tags, SEO, cover image upload, author)
- `RichTextEditor.tsx` (ใหม่) — **TipTap WYSIWYG** **[เพิ่ม dependency: `@tiptap/react`, `@tiptap/starter-kit`, `tiptap-markdown`]**
  - toolbar: bold/italic/heading/list/link/image (รูปจาก Cloudinary upload)
  - import markdown ตอนโหลด, export markdown ตอน save

---

## Phase 3 — Cloudinary Image Upload

### 3.1 `app/api/upload/route.ts` (ใหม่)
- `POST` รับ multipart/form-data → upload ไป Cloudinary (server-side, signed) → คืน `{ url }`
- ใช้ env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `requireAdmin()` + จำกัดขนาด/ชนิดไฟล์ (jpg/png/webp, ≤5MB)
- **[ต้องเพิ่ม dependency]** `cloudinary` SDK

### 3.2 `components/admin/ImageUploader.tsx` (ใหม่)
- drag-drop / เลือกไฟล์ → แสดง preview → คืน URL ให้ฟอร์ม
- ใช้ใน CarForm (multi-image) และ BlogForm (cover image)

---

## Phase 4 — Contacts (read-only)

### 4.1 ขยาย `lib/notion.ts`
- `getAllContacts()` → map `ContactSubmission` (Name, Email, Phone, Message, Branch, created_time)

### 4.2 API — `app/api/admin/contacts/route.ts` (ใหม่)
- `GET` + `requireAdmin()`

### 4.3 UI — `app/admin/contacts/page.tsx` (ใหม่)
- ตาราง list ข้อความติดต่อ + filter สาขา + search
- เพิ่มเมนู "ข้อความติดต่อ" ใน `app/admin/layout.tsx`

---

## Phase 5 — Dashboard polish (เก็บตก)
- เพิ่ม stat card: รถยนต์ทั้งหมด, บทความเผยแพร่, ข้อความติดต่อใหม่ (ดึงจาก count จริง)
- เปลี่ยน Notion-managed cards ให้ลิงก์ไปหน้า admin จริงแทน `href="#"`

---

## สรุป Dependencies ที่ต้องเพิ่ม
| Package | ใช้ทำ | Phase |
|---------|-------|-------|
| `cloudinary` | server-side image upload (env vars พร้อมแล้ว) | 3 |
| `@tryfabric/martian` | markdown → Notion blocks | 2 |
| `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `tiptap-markdown` | WYSIWYG editor + markdown interchange | 2 |

## สรุปไฟล์ที่จะสร้าง/แก้
**สร้างใหม่:** `lib/admin-auth.ts`, `lib/ratelimit.ts`, `app/api/admin/cars/route.ts`, `app/api/admin/blog/route.ts`, `app/api/admin/contacts/route.ts`, `app/api/upload/route.ts`, `app/admin/contacts/page.tsx`, `components/admin/CarForm.tsx`, `components/admin/BlogForm.tsx`, `components/admin/RichTextEditor.tsx`, `components/admin/ImageUploader.tsx`
**แก้ไข:** `lib/notion.ts` (เพิ่ม write functions), `middleware.ts` (matcher + rate limit), `app/admin/cars/page.tsx`, `app/admin/blog/page.tsx`, `app/admin/page.tsx`, `app/admin/layout.tsx`, `app/api/admin/appointments/route.ts` + `stories/route.ts` (เพิ่ม requireAdmin), `package.json`

## ลำดับการทำที่แนะนำ
**Phase 0 (security) → 1 (cars) → 3 (upload) → 2 (blog) → 4 (contacts) → 5 (dashboard)**
เหตุผล: security ต้องมาก่อน, upload ทำก่อน blog เพราะ blog ต้องใช้ cover image

## ความเสี่ยง / จุดต้องตัดสินใจ
1. **Notion property names** — โค้ดอ่านใช้ชื่อ property ภาษาอังกฤษ (เช่น "Price Min", "Is Featured") เวลาเขียนต้องตรงเป๊ะ ไม่งั้น Notion error → ควรทดสอบกับ DB จริง 1 ครั้งก่อน
2. **TipTap ↔ markdown ↔ Notion blocks** — แปลงไม่ครบ 100% (table, embed ซับซ้อน) ระยะแรกรองรับ paragraph/heading/list/bold/italic/link/image ก่อน
3. **Rate limit** ต้องมี Upstash Redis instance (ฟรี tier ได้)
