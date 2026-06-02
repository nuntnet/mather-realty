# BRIEF.md — DoubleN Realty Platform

แพลตฟอร์มประกาศเช่าบ้านสำหรับชาวต่างชาติในประเทศไทย  
CMS + Search + Rental Management + Multi-language SEO

---

## Vision

แพลตฟอร์มกลางที่เชื่อมเจ้าของบ้านในไทยกับผู้เช่าชาวต่างชาติทั่วโลก  
เน้น discovery ผ่าน search engine หลายภาษา + UX ที่ทำให้ผู้เช่าตัดสินใจได้เร็ว  
**CTA หลัก:** "สนใจ → นัดดูบ้าน" — ไม่มี payment online ในระยะแรก

---

## Feature Scope (Full)

### 1. Property Listings (CMS)
- แต่ละ listing: ชื่อ, คำอธิบาย (multi-lang), ที่อยู่, ราคา/เดือน, ขนาด, จำนวนห้อง
- Photo gallery (Cloudinary) — รูปหลัก 1 ใบ + gallery สูงสุด 20 ใบ/หลัง
- Virtual tour: รองรับ Matterport embed หรือ YouTube 360° link
- Tags/Amenities: Pool, Parking, WiFi, EV Charger, เฟอร์นิเจอร์, สัตว์เลี้ยง ฯลฯ
- Status: **Available / Rented / Coming Soon**
- วันว่าง: `available_from` + blocked ranges จาก rental periods
- **Verified badge** — listing ที่ admin ตรวจสอบแล้ว
- **Listing score** — คะแนนความสมบูรณ์ (รูปครบ, คำอธิบายครบ, แปล 15 ภาษาแล้ว)

### 2. Search System
ระบบ search เป็น core ของ platform — ต้องเร็ว, ฉลาด, รองรับหลายภาษา

**Search Bar (Homepage + Browse page)**
- Full-text search ข้ามทุกภาษา — พิมพ์ "เชียงใหม่", "Chiang Mai", "清迈" ได้เหมือนกัน
- Autocomplete suggestions: ชื่อเมือง, ย่าน, ประเภทบ้าน
- Search-as-you-type (debounce 300ms)

**Filters**
- เมือง / ย่าน / รัศมีจากจุด (km)
- ราคา (range slider — THB/เดือน)
- ห้องนอน, ห้องน้ำ
- ขนาด (ตร.ม.)
- Amenities (checkboxes)
- Available now toggle (แสดงเฉพาะว่างวันนี้)
- Available from date (ว่างก่อนวันที่กำหนด)

**Sort Options**
- ราคา (ต่ำ→สูง, สูง→ต่ำ)
- ใหม่ล่าสุด
- ใกล้ที่สุด (ต้องการ geolocation หรือ map center)
- Verified first

**View Modes**
- Grid view (default) — listing cards
- Map view — pins บน Google Maps + popup card
- List view — compact rows สำหรับ compare

**Search Analytics (Turso)**
- บันทึก queries ที่ไม่มีผลลัพธ์ → ใช้วิเคราะห์ demand และเติม inventory

**Tech: Algolia**
- Index: properties (EN + TH + multi-lang fields)
- `algoliasearch` client-side + `InstantSearch.js` components
- Sync Notion → Algolia ผ่าน webhook เมื่อ approve/update listing
- Fallback: Turso full-text search (SQLite FTS5) ถ้า Algolia budget ไม่พอ

### 3. Map & Location
- **Listing page**: Google Maps embed พร้อม pin, street view, directions link
- **Browse page**: toggle map mode — pins ทุก listing, click → popup card + "ดูรายละเอียด"
- **Nearby Locations panel** บน listing page:
  - Airport, BTS/MRT/รถไฟ, Mall, Hospital, School, Beach, Convenience store, Restaurant
  - ดึงจาก Google Places API (radius search จาก lat/lng ของ listing)
  - แสดงเป็น distance (km) + ชื่อสถานที่
- **"Find near me"** — ใช้ browser geolocation → sort listings ตาม distance

### 4. Availability & Rental Calendar
- Calendar widget บน listing page — วันว่าง/ไม่ว่างแสดงชัดเจน
- เจ้าของบ้านบันทึก rental periods (from–to + ชื่อผู้เช่า optional)
- Status คำนวณ auto จาก rental periods
- แสดง "ว่างถัดไป: dd/mm/yyyy" บน listing card
- **Availability embed widget** — เจ้าของบ้านนำ `<iframe>` ไปฝังในเว็บหรือ Facebook ได้

### 5. Inquiry / CTA
- ปุ่มหลัก: **"สนใจ / Interested — นัดดูบ้าน"**
- Form: ชื่อ, contact (LINE / WeChat / WhatsApp / Email / Phone), วันที่สะดวก, ข้อความ (optional)
- **Direct chat links**: LINE, WeChat, WhatsApp — กดแล้วเปิด app ทันที (conversion สูงกว่า form)
- ส่ง → บันทึกลง Turso + notify เจ้าของบ้าน (Email / LINE OA)
- **Saved listings**: bookmark ได้โดยไม่ต้อง login (localStorage → sync เมื่อ login)
- **Compare**: เลือก 2–3 หลัง → เปรียบเทียบ side-by-side (ราคา, specs, amenities)

### 6. Property Submission (User-generated)
- เจ้าของบ้านทั่วไป submit listing ใหม่ผ่าน form
- ข้อมูลบ้าน + upload รูป (Cloudinary) + ข้อมูลติดต่อ
- **AI description generator**: กรอกข้อมูลพื้นฐาน → AI เขียน description ให้อัตโนมัติ 15 ภาษา
- Status: **Pending Review** → Admin อนุมัติก่อน publish
- เจ้าของบ้านที่ verified มี Landlord Dashboard (CRUD + calendar + inquiries + analytics)

### 7. Landlord Dashboard
- My listings overview + listing score per property
- จัดการ rental calendar (add/edit/delete periods)
- ดู inquiries ที่เข้ามา + mark status (contacted / booked / declined)
- **Inquiry analytics**: view count, ประเทศที่มาของ traffic, keyword ที่ใช้ค้นหา
- **Landlord profile**: รูป, ภาษาที่คุยได้, response time — แสดงบน listing
- Upload/sort รูปภาพ (drag-and-drop, reorder)

### 8. Admin Dashboard
- จัดการ listings ทั้งหมด (approve/reject/edit/unpublish/verify)
- จัดการ inquiries + submissions
- SEO fields per listing: meta title, description, canonical URL
- จัดการ blog/content
- Search analytics: failed queries, top keywords, traffic by country

### 9. Content Hub (SEO Blog)
- บทความ Expat Guide: "How to rent a house in Thailand", "Best neighborhoods for digital nomads in Chiang Mai"
- **Cost of living calculator**: กรอก budget + lifestyle → แนะนำย่านและ price range — shareable, SEO-friendly
- บทความแปล 15 ภาษา (AI-assisted)
- Categories: Rental Guide, Neighborhood Review, Legal/Visa, Lifestyle, Cost of Living

---

## SEO Architecture

### Target Search Engines
| Engine | Market | Priority |
|--------|--------|---------|
| Google | Worldwide expat | ⭐⭐⭐⭐⭐ |
| Baidu | จีน | ⭐⭐⭐⭐⭐ |
| Naver | เกาหลี | ⭐⭐⭐⭐ |
| Yahoo Japan | ญี่ปุ่น | ⭐⭐⭐⭐ |
| Yandex | รัสเซีย | ⭐⭐⭐ |
| Bing / DuckDuckGo | ตะวันตก | ⭐⭐⭐ |

### Language Detection
- **Auto-detect จาก browser** — อ่าน `Accept-Language` header ใน Next.js middleware
- Priority: cookie `NEXT_LOCALE` → `Accept-Language` → fallback `en`
- User เปลี่ยนภาษาผ่าน language selector → เก็บใน cookie ไว้ override ครั้งต่อไป

### 15 Languages
| Code | Language | Target Market |
|------|----------|---------------|
| `th` | ไทย | คนไทย/เจ้าของบ้าน |
| `en` | English | Expat, ตะวันตก |
| `zh-CN` | 简体中文 | จีนแผ่นดินใหญ่ |
| `zh-TW` | 繁體中文 | ไต้หวัน, ฮ่องกง |
| `ja` | 日本語 | ญี่ปุ่น |
| `ko` | 한국어 | เกาหลี |
| `ru` | Русский | รัสเซีย |
| `de` | Deutsch | เยอรมนี |
| `fr` | Français | ฝรั่งเศส |
| `es` | Español | สเปน, ลาตินอเมริกา |
| `it` | Italiano | อิตาลี |
| `nl` | Nederlands | เนเธอร์แลนด์ |
| `sv` | Svenska | สแกนดิเนเวีย |
| `ar` | العربية | ตะวันออกกลาง |
| `hi` | हिन्दी | อินเดีย |

### SEO Implementation
- URL: `/{lang}/properties/{slug}` — e.g. `/zh-CN/properties/3-bed-villa-chiang-mai`
- `hreflang` tags ครบทุก language variant ทุกหน้า
- `next-intl` i18n routing
- **JSON-LD (Schema.org)**:
  - `Accommodation` per listing
  - `RentAction` + `PriceSpecification`
  - `LodgingBusiness` platform-level
  - `BreadcrumbList`, `FAQPage` (How it works)
  - `Place` + `GeoCoordinates` per listing
- Open Graph + Twitter Card ต่อ listing (og:locale per lang, Cloudinary OG image)
- Sitemap XML แยกภาษา → ส่ง Google Search Console + Baidu Webmaster
- Robots.txt อนุญาต Baiduspider, Yandex, Googlebot, Naverbot
- Core Web Vitals: Cloudinary auto-format (WebP/AVIF), ISR/SSG, edge caching

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 15** App Router + React 19 + TypeScript |
| Styling | **Tailwind CSS 3** + shadcn/ui + Framer Motion |
| i18n | **next-intl** (15 locales, middleware routing) |
| CMS DB | **Notion API** — listings content, blog, static pages |
| Auth + Sessions | **Better Auth 1.5** + **Turso** (SQLite) |
| Transactional DB | **Turso** — users, inquiries, rental periods, submissions, analytics |
| Image Storage | **Cloudinary** — gallery, thumbnail auto-crop, OG image |
| Search | **Algolia** (InstantSearch) — full-text, multi-lang, filters |
| Maps | **Google Maps JS API + Places API** — pins, map browse, nearby POIs |
| AI (description) | **OpenAI API** (GPT-4o) — auto-generate listing descriptions 15 ภาษา |
| Email Notify | **Resend** |
| Deploy | **Vercel** (sin1 region) + CDN edge caching |
| Package manager | **Bun** |

---

## Database Schema (Turso)

```sql
-- ผู้ใช้งาน
users (
  id, name, email, role,           -- role: admin | landlord
  line_id, wechat_id, whatsapp,
  languages_spoken,                -- JSON array ["en","th","zh-CN"]
  response_time_hours,
  verified_at, created_at
)

-- บ้านเช่า (hot data — synced from Notion)
properties (
  id, notion_page_id, slug, owner_id,
  status,                          -- available | rented | coming_soon | pending | archived
  available_from,
  address, city, district, lat, lng,
  price_thb, bedrooms, bathrooms, size_sqm,
  cloudinary_folder,
  has_virtual_tour, virtual_tour_url,
  algolia_object_id,
  verified_at, approved_at, created_at
)

-- ช่วงการเช่า
rental_periods (
  id, property_id,
  tenant_name, start_date, end_date,
  note, created_at
)

-- Nearby POIs cache (ดึงจาก Google Places → cache ไว้ไม่ต้องเรียกซ้ำ)
nearby_places (
  id, property_id, place_id,
  name, category, distance_km,
  lat, lng, cached_at
)

-- คำถาม/นัดดูบ้าน
inquiries (
  id, property_id, name,
  contact, contact_type,           -- line | wechat | whatsapp | email | phone
  preferred_date, message,
  status,                          -- new | contacted | booked | declined
  created_at
)

-- User submissions (รอ approve)
submissions (
  id, owner_email, owner_phone,
  data_json, images_json,
  status,                          -- pending | approved | rejected
  submitted_at, reviewed_at
)

-- Search analytics
search_logs (
  id, query, locale, result_count,
  filters_json, created_at
)

-- Listing views (analytics)
property_views (
  id, property_id, locale,
  country_code, referrer, created_at
)
```

---

## Notion Databases (CMS Content)

| Env Var | หน้าที่ |
|---------|--------|
| `NOTION_PROPERTIES_DB_ID` | Listing content (title/desc per lang, amenities, tags, images) |
| `NOTION_BLOG_DB_ID` | บทความ Expat Guide + Neighborhood Reviews |
| `NOTION_PAGES_DB_ID` | Static pages (About, FAQ, How it works — per lang) |

---

## Routes

**Public:**
```
/                              → redirect ตาม Accept-Language
/[locale]                      → Homepage: featured listings, search, hero
/[locale]/properties           → Browse: search + filters + map/grid/list view
/[locale]/properties/[slug]    → Listing detail: gallery, map, calendar, nearby, CTA
/[locale]/properties/compare   → Compare 2–3 listings side-by-side
/[locale]/blog                 → Content hub: Expat Guide
/[locale]/blog/[slug]          → บทความ
/[locale]/tools/cost-of-living → Cost of living calculator
/[locale]/how-it-works         → สำหรับผู้เช่าและเจ้าของบ้าน
/[locale]/submit               → Submit listing ใหม่ (with AI description)
```

**Auth:**
```
/login   /register   /forgot-password
```

**Landlord Portal:**
```
/dashboard                          → Overview + stats
/dashboard/properties               → My listings + listing scores
/dashboard/properties/new           → สร้าง listing + AI description
/dashboard/properties/[id]          → Edit + calendar + inquiries + analytics
/dashboard/profile                  → Profile (ภาษา, response time, chat links)
```

**Admin:**
```
/admin                              → Dashboard overview
/admin/properties                   → Approve/reject/verify/edit
/admin/inquiries                    → All inquiries
/admin/submissions                  → Pending submissions
/admin/blog                         → Blog CRUD
/admin/analytics                    → Search logs, views by country, top listings
```

**API:**
```
POST   /api/inquiries
POST   /api/submissions
POST   /api/upload
POST   /api/search-log
GET    /api/nearby/[propertyId]     → Google Places (cache-first)
GET    /api/properties/[id]/embed   → Availability embed widget (iframe)
GET|POST|PATCH|DELETE /api/admin/properties
PATCH  /api/admin/inquiries/[id]
POST   /api/admin/revalidate
POST   /api/webhooks/algolia-sync   → Sync Notion → Algolia เมื่อ approve
POST   /api/ai/description          → Generate listing description (OpenAI)
```

---

## UI Components (Key)

**Listing Card**
```
┌─────────────────────────────────┐
│  [รูปหลัก]          ✅ Verified │
│  🟢 ว่าง | ว่างถัดไป 1 ส.ค.    │
├─────────────────────────────────┤
│  Modern Villa — เชียงใหม่       │
│  ฿25,000 / เดือน                │
│  🛏 3  🚿 2  📐 180 ตร.ม.       │
│  Pool · WiFi · Pet-friendly     │
│  [🔖 บันทึก]  [นัดดูบ้าน →]    │
└─────────────────────────────────┘
```

**Nearby Panel (Listing Page)**
```
📍 Nearby Locations
──────────────────────────────────
✈️  Chiang Mai Airport      8.2 km
🏥  Bangkok Hospital        1.4 km
🛒  Central Festival        2.1 km
🏫  CMIS School             3.0 km
🏖️  Nimmanhaemin            0.8 km
```

---

## Git Flow

```
feature/* ──→ staging ──→ main (production)
                ↓              ↓
         staging.vercel   doublen-realty.com
```

---

## Phase Development Plan

### Phase 1 — Core MVP (4–6 สัปดาห์)
**เป้าหมาย:** platform มีชีวิต — ดู listing ได้ + ติดต่อได้

- [ ] Project setup: Next.js 15 + Tailwind + shadcn/ui + Bun
- [ ] Notion DB setup (Properties, Blog, Pages)
- [ ] Turso schema: users, properties, rental_periods, inquiries
- [ ] Better Auth (email/password — landlord + admin roles)
- [ ] Property listing pages (EN + TH only)
- [ ] Photo gallery (Cloudinary upload + display)
- [ ] Availability calendar widget
- [ ] Inquiry form + LINE/WhatsApp direct links
- [ ] Turso: บันทึก inquiry + email notify (Resend)
- [ ] Admin dashboard: approve/reject listings, view inquiries
- [ ] Basic filters: เมือง, ราคา, ห้องนอน, available now
- [ ] Deploy: Vercel (staging + production branches)

---

### Phase 2 — Search & Map (3–4 สัปดาห์)
**เป้าหมาย:** ค้นหาได้ฉลาด + เห็น map

- [ ] Algolia setup: index properties, sync จาก Notion webhook
- [ ] Search bar + autocomplete (ชื่อเมือง, ย่าน, ประเภท)
- [ ] Advanced filters (range slider, amenities checkboxes, available date)
- [ ] Sort options (ราคา, ใหม่, verified first)
- [ ] Grid / List / **Map view** toggle
- [ ] Google Maps: pins + popup card บน browse page
- [ ] Google Maps embed บน listing page (street view, directions)
- [ ] Google Places API: Nearby Locations panel + cache ลง Turso
- [ ] "Find near me" geolocation
- [ ] Compare listings (side-by-side, สูงสุด 3 หลัง)
- [ ] Saved listings (localStorage → sync เมื่อ login)
- [ ] Search analytics log (failed queries → Turso)

---

### Phase 3 — i18n & SEO (3–4 สัปดาห์)
**เป้าหมาย:** rank ใน Google/Baidu/Naver — ดึง traffic ต่างชาติ

- [ ] next-intl setup (15 locales, middleware routing)
- [ ] Browser language auto-detect (Accept-Language → cookie NEXT_LOCALE)
- [ ] Language selector UI
- [ ] แปล UI strings ครบ 15 ภาษา (translation files)
- [ ] Listing descriptions แปล 15 ภาษา (Notion multi-lang fields)
- [ ] JSON-LD structured data: Accommodation, RentAction, BreadcrumbList, Place
- [ ] hreflang tags ทุกหน้า
- [ ] Dynamic OG images per listing + locale (Cloudinary)
- [ ] Sitemap XML แยกภาษา
- [ ] Robots.txt (Baiduspider, Naverbot, Yandexbot)
- [ ] Google Search Console + Baidu Webmaster Tools setup
- [ ] Core Web Vitals audit + optimize

---

### Phase 4 — Landlord Portal & Submissions (3–4 สัปดาห์)
**เป้าหมาย:** เจ้าของบ้านจัดการ listing ได้เอง

- [ ] Landlord registration + profile (ภาษา, response time, chat links)
- [ ] Landlord dashboard: my listings, listing score, calendar
- [ ] Submit listing form + Cloudinary upload
- [ ] **AI description generator** (OpenAI GPT-4o → 15 ภาษา)
- [ ] Admin submission review flow (approve/reject + feedback)
- [ ] Inquiry analytics per listing (views, country breakdown)
- [ ] Verified badge system
- [ ] Availability embed widget (`/api/properties/[id]/embed`)
- [ ] Listing score UI (completeness indicator)

---

### Phase 5 — Content & Growth (2–3 สัปดาห์)
**เป้าหมาย:** SEO content ดึง organic traffic ระยะยาว

- [ ] Blog CMS (Notion → Next.js) + admin blog editor
- [ ] Expat Guide articles (EN + top 5 ภาษาก่อน)
- [ ] **Cost of living calculator** (interactive tool, shareable link)
- [ ] Landlord profile public page
- [ ] Property views analytics (country, referrer → Turso)
- [ ] Admin analytics dashboard (top listings, traffic by country, search keywords)
- [ ] Virtual tour embed (Matterport / YouTube 360°)
- [ ] Baidu/Naver-specific optimizations (meta tags, crawl config)

---

### Phase 6 — Monetization & Scale (Future / TBD)
**เป้าหมาย:** สร้าง revenue model

- [ ] Featured listing (paid boost — pin ไว้ด้านบน)
- [ ] Subscription plan สำหรับ landlords (จำนวน listing, analytics tier)
- [ ] Online deposit escrow (StripeThailand / Omise)
- [ ] Tenant verification (passport scan, reference check)
- [ ] Multi-currency pricing display (THB / USD / CNY / EUR / JPY)
- [ ] Mobile app (React Native หรือ PWA)

---

## Known Constraints

- ไม่มี payment online จนถึง Phase 6
- Baidu ต้องการ ICP license ถ้าต้องการ rank ใน China — พิจารณา Cloudflare mirror
- Notion rate limit 3 req/s — ISR cache + Turso hot-data layer
- Google Places API มี cost per request — cache ผลใน `nearby_places` table
- Algolia free tier จำกัด 10,000 records — monitor และ upgrade เมื่อจำเป็น
- รูปภาพทุกใบต้องผ่าน admin review ก่อน publish (ป้องกัน inappropriate content)
