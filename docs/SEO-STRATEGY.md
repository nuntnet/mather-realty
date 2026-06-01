# SEO Strategy — ช.เอราวัณ ออโต้ กรุป

> เป้าหมาย: ติดหน้าแรก Google สำหรับ local car dealer searches จ.นครปฐม และแบรนด์รถยนต์ที่จำหน่าย

---

## สถานะปัจจุบัน (ทำแล้ว ✅)

- ✅ Schema: Organization, AutoDealer, LocalBusiness (7 สาขา), FAQ, HowTo, VideoObject, BreadcrumbList, CollectionPage
- ✅ sitemap.xml + robots.txt
- ✅ URL structure clean: `/cars/[slug]`, `/[brand]/service`, `/[brand]/promotions`
- ✅ Open Graph + Twitter Card ทุกหน้า
- ✅ Canonical URL ทุกหน้า
- ✅ Car detail: title, description จาก Notion
- ✅ เว็บเร็ว: Next.js SSG + Cloudinary CDN + ISR

---

## Phase 1 — Local SEO & Technical (เดือนที่ 1) 🔴 ด่วน

### 1.1 Google Business Profile (ทำเองนอก codebase)
- [ ] อัปเดต profile ทั้ง 7 สาขาให้ครบ: รูป, เวลา, หมวด "Car Dealer"
- [ ] เพิ่ม products/services ในแต่ละ profile
- [ ] ตอบ review ทุกรีวิวภายใน 24 ชม.
- [ ] โพสต์ข่าว/โปรโมชั่นทุกสัปดาห์

### 1.2 Title Tags & Meta Description Optimization
ปัจจุบันใช้ pattern: `[Brand] [Model] [Year] | ช.เอราวัณ`

ควรเปลี่ยนเป็น: `[Model] ราคา [Price] บาท | [Brand] นครปฐม — ช.เอราวัณ`

**Pages ที่ต้อง update:**
- [ ] หน้าแรก: `ดีลเลอร์รถยนต์นครปฐม — Mazda Ford Mitsubishi GWM Deepal Kia | ช.เอราวัณ`
- [ ] `/cars`: `รถยนต์ใหม่ทุกแบรนด์ นครปฐม ราคาดีที่สุด | ช.เอราวัณ`
- [ ] `/[brand]`: `[แบรนด์] นครปฐม ราคาและโปรโมชั่น 2568 | ช.เอราวัณ`
- [ ] `/branches`: `โชว์รูมและศูนย์บริการรถยนต์ 7 สาขา นครปฐม | ช.เอราวัณ`

### 1.3 H1 Tags Optimization
- [ ] ทุกหน้าต้องมี H1 เดียวที่มี keyword หลัก
- [ ] Brand hub pages: H1 = `[แบรนด์] นครปฐม — ตัวแทนจำหน่ายอย่างเป็นทางการ`
- [ ] Car detail: H1 = `[ชื่อรถ] ราคาเริ่มต้น ฿[price]`

### 1.4 Core Web Vitals
- [ ] รัน Lighthouse บน production URL
- [ ] เป้าหมาย: LCP < 2.5s, CLS < 0.1, FID < 100ms
- [ ] ตรวจ image lazy loading ทุกหน้า

---

## Phase 2 — Content Strategy (เดือนที่ 1-3) 🟡

### 2.1 Blog Categories & URL Structure

เปลี่ยนชื่อ section จาก "บทความ" → **"คู่มือรถยนต์"**

| Category | URL | เป้าหมาย keyword |
|----------|-----|-----------------|
| รีวิวรถ | `/blog?category=review` | `รีวิว [รุ่น] [ปี]` |
| เปรียบเทียบรถ | `/blog?category=compare` | `เปรียบเทียบ [A] กับ [B]` |
| คู่มือซื้อรถ | `/blog?category=tips` | `วิธีซื้อรถ`, `สินเชื่อรถ` |
| ข่าวสาร | `/blog?category=news` | brand + news keywords |
| โปรโมชั่น | `/blog?category=promotion` | `โปรโมชั่น [แบรนด์] [เดือน]` |

### 2.2 Content Calendar (บทความที่ควรเขียน)

**สูงสุด (High priority) — ค้นหาเยอะ:**
1. `รีวิว Mazda CX-5 2025 ราคาและสเปคครบ` → target 2,000+ คำ
2. `เปรียบเทียบ Ford Ranger กับ Mitsubishi Triton 2025`
3. `รีวิว Deepal S07 รถไฟฟ้า ดีไหม ควรซื้อ`
4. `ราคา GWM HAVAL H6 HEV 2025 ทุกรุ่นย่อย`
5. `Kia EV5 Air vs EV9 ต่างกันอย่างไร`

**Local SEO (Medium priority) — ติดเร็ว:**
6. `โชว์รูมรถยนต์ นครปฐม ที่ไหนดี 2025`
7. `ศูนย์บริการมาสด้า นครปฐม-ปทุมธานี`
8. `ทดสอบขับรถ GWM ใกล้กรุงเทพ ที่ไหน`
9. `ซื้อรถไฟฟ้าในนครปฐม คู่มือฉบับสมบูรณ์`

**Informational (Top of funnel):**
10. `รถไฟฟ้า VS ไฮบริด ต่างกันอย่างไร เลือกแบบไหนดี`
11. `ค่าใช้จ่ายเป็นเจ้าของ EV ต่อปีจริงๆ เท่าไหร่`
12. `วิธีขอสินเชื่อรถยนต์ 2025 ผ่านง่าย อนุมัติเร็ว`
13. `5 เหตุผลที่ควรซื้อรถ Deepal แทน BYD`

### 2.3 Blog Post Template (ทุกบทความควรมี)
```
- H1: keyword หลัก (ยาว + ปี)
- Meta description: 150-160 chars, มี keyword + CTA
- Featured image: alt text มี keyword
- H2/H3: ตอบ sub-questions
- FAQ section (5-8 Q&A) → FAQ Schema
- CTA: "ดูราคาและโปรโมชั่น" → link ไปหน้ารถ
- Internal links: 3-5 links ไปหน้าอื่น
- ความยาว: 1,500-3,000 คำ
```

---

## Phase 3 — Backlinks & Authority (เดือนที่ 2-3) 🟢

### 3.1 Easy Wins (ฟรี ทำได้เลย)
- [ ] ลงทะเบียนใน `one2car.com` dealer profile
- [ ] ลงทะเบียนใน `thaicar.com`
- [ ] ขอลิงก์จาก Mazda Thailand / Ford Thailand dealer page
- [ ] ส่ง press release รางวัล GWM/Mazda ให้ automotive media
- [ ] ลง pantip.com กระทู้รีวิวรถพร้อม source ไปยังบทความ

### 3.2 PR & Media
- [ ] ติดต่อ headlightmag.com, autodeft.com ให้ feature ดีลเลอร์
- [ ] ส่งรูปโชว์รูมใหม่ให้ GWM/Deepal Thailand ลง social official

---

## Phase 4 — Advanced SEO (เดือนที่ 3+) 🔵

### 4.1 FAQ ทุกหน้ารถ
เพิ่ม FAQ section ใน car detail page พร้อม FAQ Schema:
```
Q: ราคา [รุ่น] 2025 เท่าไหร่?
Q: [รุ่น] มีรุ่นย่อยอะไรบ้าง?
Q: ศูนย์บริการ [แบรนด์] นครปฐม อยู่ที่ไหน?
Q: [รุ่น] ผ่อนเดือนละเท่าไหร่?
```

### 4.2 Rich Snippets ที่ยังขาด
- [ ] `Product` schema + `offers` สำหรับแต่ละรถ (price range)
- [ ] `Review` + `AggregateRating` จาก customer stories
- [ ] `Event` schema เมื่อมีงาน test drive / motor expo

### 4.3 Internal Linking Strategy
- Car detail → Brand hub → Service page → Booking
- Blog posts → Car detail pages (exact match anchor text)
- Homepage → top 3 cars per brand

---

## KPIs & Tracking

| Metric | เครื่องมือ | เป้าหมาย 6 เดือน |
|--------|-----------|-----------------|
| Organic sessions | Google Analytics | +200% |
| Keyword rankings | Google Search Console | 20 keywords top 10 |
| Local pack appearances | GBP Insights | top 3 ใน 5 สาขา |
| Blog traffic | GA4 | 500 sessions/เดือน |
| Conversion (contact/booking) | GA4 goals | 3% conversion rate |

---

## Keywords Priority List

### Tier 1 — ซื้อทันที (High intent)
```
ราคา mazda cx-5 นครปฐม
ซื้อรถ ford ranger นครปฐม
deepal s07 ราคา 2025
gwm haval h6 hev โปรโมชั่น
kia ev5 นครปฐม
mitsubishi triton นครปฐม
```

### Tier 2 — กำลังเลือก (Medium intent)
```
รีวิว mazda cx-5 2025
ford ranger raptor vs triton
deepal vs byd ซื้อรุ่นไหนดี
gwm tank 300 ดีไหม
kia ev9 ราคา ไทย
```

### Tier 3 — ให้ความรู้ (Awareness)
```
รถไฟฟ้าราคาถูก 2025
รถ suv ประหยัดน้ำมัน
วิธีเลือกรถยนต์ครอบครัว
ซื้อรถ ev ดีไหม ปี 2025
```

---

## Progress Tracking

### Phase 1 Status
- [x] Schema markup ครบ
- [ ] Title tags optimization
- [ ] H1 optimization
- [ ] Core Web Vitals check
- [ ] GBP อัปเดต

### Phase 2 Status
- [x] เขียนบทความ Tier 1 (5/5) — Mazda CX-5, Ford Ranger, Mitsubishi Triton, HAVAL H6 HEV, Kia Carnival
- [x] เขียนบทความ Local SEO (3/4) — Deepal S07 review, EV Guide นครปฐม, Tank vs Everest
- [x] เขียนบทความ 50 ชิ้น ครอบคลุมทุกแผนก (แผนกขาย/บริการ/ซ่อมสี/ประกัน/เปรียบเทียบ/EV)
- [ ] FAQ schema บนหน้ารถแต่ละรุ่น (Phase 4)

### Phase 3 Status
- [ ] one2car.com registration
- [ ] Press release รางวัล

---

*Last updated: June 2026 | Owner: ช.เอราวัณ ออโต้ กรุป*
