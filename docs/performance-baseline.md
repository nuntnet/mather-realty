# Performance Baseline — ch-erawanwebsite.vercel.app

**วันที่วัด:** 2026-05-31  
**URL:** https://ch-erawanwebsite.vercel.app/  
**Tool:** Lighthouse 13.3.0 (Mobile Simulated Throttling)

---

## Lighthouse Scores

| Category | Score |
|----------|-------|
| 🟡 Performance | **71 / 100** |
| 🟠 Accessibility | **83 / 100** |
| 🟢 Best Practices | **92 / 100** |
| 🟢 SEO | **100 / 100** |

## Core Web Vitals

| Metric | ค่า | เกณฑ์ดี | สถานะ |
|--------|-----|---------|-------|
| FCP (First Contentful Paint) | 1.7s | < 1.8s | 🟢 |
| LCP (Largest Contentful Paint) | **5.1s** | < 2.5s | 🔴 |
| TBT (Total Blocking Time) | 200ms | < 200ms | 🟡 |
| CLS (Cumulative Layout Shift) | 0 | < 0.1 | 🟢 |
| Speed Index | 7.0s | < 3.4s | 🔴 |
| TTI (Time to Interactive) | 9.6s | < 5.2s | 🔴 |
| TTFB (Server Response) | 40ms | < 600ms | 🟢 |

## Network

| ข้อมูล | ค่า |
|--------|-----|
| HTML uncompressed | 283 KB |
| HTML brotli compressed | 37 KB |
| Total network payload | **5,671 KB** |
| RSC payload | 95 KB |

---

## Root Causes (จากการวิเคราะห์)

### 1. Award Images ไม่ optimize (ผล LCP หนักที่สุด)

Cloudinary URLs ไม่มี transform params — โหลดรูปขนาดเต็มทุกรูปพร้อมกัน:

| ไฟล์ | ขนาด |
|------|------|
| mitsu-body-paint-2024.jpg | 757 KB |
| gwm-top-sale-2024.jpg | 744 KB |
| deepal-top-advisor-2025.jpg | 688 KB |
| mazda-dealer-excellence-2024.jpg | 611 KB |
| deepal-top-sale-spare-part.jpg | 572 KB |
| mazda-dealer-excellence-2022.jpg | 390 KB |
| gwm-top-sale-2025.jpg | 353 KB |
| mazda-guild-sale-2024.jpg | 177 KB |
| mitsu-president-award-2018.jpg | 111 KB |

**รวม ~4.4 MB** สำหรับรูปที่แสดงทีละรูป

### 2. Google Maps โหลดบน Homepage ทุกครั้ง

| Resource | ขนาด |
|----------|------|
| Google Maps API script | 339 KB |
| Unused Maps JS | 178 KB wasted |

Maps component ไม่มี dynamic import — โหลดทันทีแม้ user ยังไม่เห็น map section

### 3. Unused JavaScript — 225 KB savings

ส่วนใหญ่มาจาก Google Maps API ที่โหลดแล้วไม่ได้ใช้ทั้งหมด

### 4. Accessibility Issues (score 83)

- Buttons ไม่มี accessible name
- Links ไม่มี discernible name  
- Color contrast ratio ไม่ผ่าน
- Touch targets เล็กเกินไป

---

## Action Plan

| # | Fix | Impact ต่อ LCP | Effort |
|---|-----|---------------|--------|
| 1 | เพิ่ม Cloudinary transform params ให้ award images (`f_auto,q_auto,w_1200`) | ~2–3s | ต่ำ |
| 2 | Dynamic import Google Maps (lazy load เมื่อ scroll ถึง) | ~0.5s | ต่ำ |
| 3 | Lazy load award slideshow (แสดงรูปแรก priority, ที่เหลือ lazy) | ~0.5s | ต่ำ |
| 4 | แก้ accessibility (button labels, contrast) | — | กลาง |
| 5 | Dynamic import Carousel + heavy components | bundle size | กลาง |
| 6 | เพิ่ม `revalidate` ใน marketing pages | TTFB ช่วง cold | ต่ำ |

**เป้าหมายหลัง optimize:** Performance > 85, LCP < 2.5s
