/**
 * Replace mock Notion car catalog with Thailand-market models (official press images).
 *
 * Run: bun run scripts/seed-real-cars.ts
 * Dry run (no Notion writes): bun run scripts/seed-real-cars.ts --dry-run
 *
 * Requires .env.local: NOTION_* , CLOUDINARY_* (recommended for image upload)
 */

import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import {
  archiveCar,
  createCar,
  getAllCarsAdmin,
} from "../lib/notion";
import type { CarInput } from "../lib/notion-types";

config({ path: ".env.local" });

const dryRun = process.argv.includes("--dry-run");

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function cloudinaryReady(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function imageFetchHeaders(url: string): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "ch-erawan/1.0 (dealer site image sync)",
  };
  if (url.includes("changan.co.th")) {
    headers.Referer = "https://www.changan.co.th/";
  }
  return headers;
}

async function uploadOfficialImage(
  url: string | null,
  publicId: string
): Promise<string | null> {
  if (!url) return null;
  if (!cloudinaryReady()) {
    console.warn(`  ⚠ Cloudinary not configured — keeping source URL for ${publicId}`);
    return url;
  }
  try {
    const res = await fetch(url, {
      headers: imageFetchHeaders(url),
    });
    if (!res.ok) {
      console.warn(`  ⚠ Fetch failed for ${publicId}: HTTP ${res.status}`);
      return url;
    }
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    const dataUri = `data:${contentType};base64,${buf.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "ch-erawan/cars",
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠ Upload failed for ${publicId}: ${msg.slice(0, 120)}`);
    return url;
  }
}

/** Official Thailand-market catalog — imageSource is for the deliverable report only. */
const REAL_CARS: Array<
  CarInput & {
    imageSource: string;
    cloudinaryId: string;
    sourceImageUrl: string | null;
    gallerySourceUrls?: string[];
  }
> = [
  {
    name: "Mazda CX-5",
    brand: "Mazda",
    model: "CX-5 2.5 Turbo",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 1199000,
    priceMax: 1599000,
    engineSize: "2.5L Turbo",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "SUV ขับสนุก ดีไซน์ Kodo สมรรถนะสมดุล พร้อม i-Activsense และสี Snowflake White Pearl เป็นตัวเลือกยอดนิยม",
    specs: { seats: "5", drive: "FWD / AWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: false,
    slug: "mazda-cx-5-2025",
    cloudinaryId: "mazda-cx-5",
    sourceImageUrl:
      "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-5_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
    imageSource: "mazda.co.th (mazda-media-s3 CDN)",
  },
  {
    name: "Mazda CX-30",
    brand: "Mazda",
    model: "CX-30 2.0",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 999000,
    priceMax: 1299000,
    engineSize: "2.0L",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "ครอสโอเวอร์ ขนาดกะทัดรัด ดีไซน์สปอร์ต ขับคล่องตัวในเมือง เหมาะสำหรับครอบครัวยุคใหม่",
    specs: { seats: "5", drive: "FWD / AWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    slug: "mazda-cx-30-2025",
    cloudinaryId: "mazda-cx-30",
    sourceImageUrl:
      "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-30_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
    imageSource: "mazda.co.th (mazda-media-s3 CDN)",
  },
  {
    name: "Ford Ranger Wildtrak",
    brand: "Ford",
    model: "Ranger Wildtrak 2.0 Turbo",
    year: 2026,
    type: "pickup",
    condition: "new",
    priceMin: 1159000,
    priceMax: 1469000,
    engineSize: "2.0L Turbo Diesel",
    transmission: "auto",
    fuelType: "diesel",
    description:
      "กระบะไฮแรง ดีไซน์ Wildtrak เฉพาะตัว 4x4 พร้อมเทคโนโลยีช่วยขับขี่และกระบะท้าย Easy Lift — ราคาเริ่มต้นจาก ford.co.th",
    specs: { cab: "Double Cab", drive: "4x4 / 4x2" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: false,
    slug: "ford-ranger-wildtrak-2026",
    cloudinaryId: "ford-ranger-wildtrak",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cd/Ford_Ranger_4x2_Wildtrak_2024.jpg",
    gallerySourceUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/f/f0/Ford_Ranger_4x2_Wildtrak_2024_%281%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/0/0c/Ford_Ranger_4x2_Wildtrak_2024_%282%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/PIMS_2024_-_Ford_Ranger_2.0_Turbo_Wildtrak_4x2.jpg",
    ],
    imageSource: "Wikimedia Commons (Ford Ranger Wildtrak 2024, CC BY-SA)",
  },
  {
    name: "Ford Everest Platinum",
    brand: "Ford",
    model: "Everest Platinum 2.0 Turbo",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 1699000,
    priceMax: 1899000,
    engineSize: "2.0L Bi-Turbo Diesel",
    transmission: "auto",
    fuelType: "diesel",
    description:
      "SUV 7 ที่นั่งระดับพรีเมียม ห้องโดยสารกว้างขวาง ระบบขับเคลื่อน 4x4 สำหรับครอบครัวและการเดินทางไกล",
    specs: { seats: "7", drive: "4WD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: true,
    slug: "ford-everest-platinum-2025",
    cloudinaryId: "ford-everest-platinum",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c6/Ford_Everest_III_01_--_Bangkok_Motor_Show_--_2022-03-23.jpg",
    gallerySourceUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/0/00/Ford_Everest_III_02_--_Bangkok_Motor_Show_--_2022-03-23.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/b/b1/Ford_Everest_Titanium_29082022.jpg",
    ],
    imageSource: "Wikimedia Commons (Bangkok Motor Show 2022, CC BY-SA)",
  },
  {
    name: "Mitsubishi Triton",
    brand: "Mitsubishi",
    model: "Triton Double Cab",
    year: 2024,
    type: "pickup",
    condition: "new",
    priceMin: 729000,
    priceMax: 1099000,
    engineSize: "2.4L MIVEC Diesel",
    transmission: "auto",
    fuelType: "diesel",
    description:
      "All-New Triton กระบะยอดนิยม ดีไซน์ Dynamic Shield แข็งแกร่ง ประหยัดน้ำมัน พร้อมอุปกรณ์ความปลอดภัยครบ",
    specs: { cab: "Double Cab", drive: "4x2 / 4x4" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: false,
    slug: "mitsubishi-triton-2024",
    cloudinaryId: "mitsubishi-triton",
    sourceImageUrl:
      "https://www.mitsubishi-motors.co.th/content/dam/mitsubishi-motors-th/images/cars/l200/2024/primary/hero/all-new-triton-2024-edit-jun.png",
    imageSource: "mitsubishi-motors.co.th",
  },
  {
    name: "Mitsubishi Xpander Cross HEV",
    brand: "Mitsubishi",
    model: "Xpander Cross HEV",
    year: 2026,
    type: "mpv",
    condition: "new",
    priceMin: 999000,
    priceMax: 1099000,
    engineSize: "1.6L Hybrid",
    transmission: "auto",
    fuelType: "hybrid",
    description:
      "MPV ไฮบริด 7 ที่นั่ง กว้างขวาง ประหยัดน้ำมัน เหมาะกับครอบครัวไทย ดีไซน์ Dynamic Shield",
    specs: { seats: "7", drive: "FWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: true,
    slug: "mitsubishi-xpander-cross-hev-2026",
    cloudinaryId: "mitsubishi-xpander-cross-hev",
    sourceImageUrl:
      "https://www.mitsubishi-motors.co.th/content/dam/mitsubishi-motors-th/images/cars/xpander-cross-hev/2026/primary/U28_0_26Xpander-Cross-01_Side_recrop.png",
    imageSource: "mitsubishi-motors.co.th",
  },
  {
    name: "GWM HAVAL H6 HEV",
    brand: "GWM",
    model: "HAVAL H6 HEV",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 969000,
    priceMax: 1199000,
    engineSize: "1.5L Turbo Hybrid",
    transmission: "auto",
    fuelType: "hybrid",
    description:
      "SUV ไฮบริดยอดนิยมจาก GWM ประหยัดน้ำมัน ออพชั่นครบ ราคาเริ่มต้น 969,000 บาท (gwm.co.th)",
    specs: { seats: "5", drive: "FWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: false,
    slug: "gwm-haval-h6-hev-2025",
    cloudinaryId: "gwm-haval-h6-hev",
    sourceImageUrl:
      "https://www.gwm.co.th/content/dam/gwm/pages/th/en/model/haval-h6-hev/h6-kv-pc-1-2.jpg",
    imageSource: "gwm.co.th",
  },
  {
    name: "GWM ORA 05 BEV",
    brand: "GWM",
    model: "ORA 05 BEV",
    year: 2025,
    type: "ev",
    condition: "new",
    priceMin: 799000,
    priceMax: 999000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "รถยนต์ไฟฟ้า ORA 05 ดีไซน์ทันสมัย สมรรถนะเงียบ ประหยัดค่าใช้จ่าย จาก GWM ประเทศไทย",
    specs: { range: "400+ km (WLTP est.)", seats: "5" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: true,
    slug: "gwm-ora-05-bev-2025",
    cloudinaryId: "gwm-ora-05-bev",
    sourceImageUrl:
      "https://www.gwm.co.th/content/dam/gwm/pages/th/en/homepage/kv/ora5-ev-1.jpg",
    imageSource: "gwm.co.th",
  },
  {
    name: "Deepal Lumin",
    brand: "Deepal",
    model: "Lumin L / L DC",
    year: 2026,
    type: "hatchback",
    condition: "new",
    priceMin: 479000,
    priceMax: 499000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "Changan Lumin รถไฟฟ้าเมืองขนาดเล็ก จาก CHANGAN ประเทศไทย รุ่น L 479,000 บาท และ L DC 499,000 บาท (โปรโมชันพิเศษ L DC 409,000 บาท ตามช่วงเวลา) มอเตอร์ 30 kW แบต LFP ระยะทาง NEDC 301 กม.",
    specs: {
      seats: "4",
      range: "301 km (NEDC, L DC)",
      power: "41 PS",
    },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: true,
    slug: "deepal-lumin-2026",
    cloudinaryId: "deepal-lumin",
    sourceImageUrl:
      "https://api.www.changan.co.th/uploads/lumin_LDC_e87edb1721.jpg",
    gallerySourceUrls: [
      "https://www.changan.co.th/cache/images/dPIhSPZDV_S3svLLYfujiKsi8NWbJ6kTC2l7w567tqE/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vSW50ZXJpb3JfQ29sb3JfTHVtaW5fMDJfODgyNzc4ZGM4Ni5qcGc.webp",
      "https://www.changan.co.th/cache/images/nd6-epgFlBcdux7bF4tY0MhhD-pW2eHCFCmb7fd94EE/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vSW50ZXJpb3JfQ29sb3JfTHVtaW5fMDFfYzBjZGRjZjNiZS5qcGc.webp",
      "https://www.changan.co.th/cache/images/mR1FP_Q_34OSNdadJXTyV0uCIRRku6vMGj-8ERuxrnU/rs:fit:640/q:75/max_bytes:120000/bG9jYWw6Ly8vRmVhdHVyZXNfTHVtaW5fMDNfMjY5MjRlNWE1MS5qcGc.webp",
      "https://www.changan.co.th/cache/images/7Su8-d_YjgFi1ODS5K0s9XcFxWy6CtebygTdr77bMvA/rs:fit:640/q:75/max_bytes:120000/bG9jYWw6Ly8vTHVtaW5fQ29ybl8wM184ZmFiNTU1MGE2LnBuZw.webp",
    ],
    imageSource: "changan.co.th/en/lumin/luminl-dc-en/ (official)",
  },
  {
    name: "Deepal Nevo Q05",
    brand: "Deepal",
    model: "Nevo Q05 BEV",
    year: 2026,
    type: "ev",
    condition: "new",
    priceMin: 599900,
    priceMax: 709900,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "CHANGAN NEVO Q05 เอสยูวีไฟฟ้าอัจฉริยะ เปิดตัวในไทย พ.ค. 2569 มอเตอร์ 163 แรงม้า ระยะทาง NEDC 462 กม. ชาร์จ DC 30–80% 15 นาที ราคาโปรโมชัน 599,900–679,900 บาท (ถึง 30 มิ.ย. 2569)",
    specs: {
      seats: "5",
      range: "462 km (NEDC)",
      wheelbase: "2,735 mm",
      dcCharge: "162 kW",
    },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: true,
    slug: "deepal-nevo-q05-2026",
    cloudinaryId: "deepal-nevo-q05",
    sourceImageUrl:
      "https://www.changan.co.th/images/nevo/q05/kv/kv-q05-pc.jpg?v2",
    gallerySourceUrls: [
      "https://www.changan.co.th/images/nevo/q05/car/Q05-white.png",
      "https://www.changan.co.th/images/nevo/q05/car/Q05-black.png",
      "https://www.changan.co.th/images/nevo/q05/car/Q05-gray.png",
      "https://www.changan.co.th/images/nevo/q05/car/Q05-pink.png",
    ],
    imageSource: "changan.co.th/en/nevo-q05/ (official)",
  },
  {
    name: "Deepal S07 BEV",
    brand: "Deepal",
    model: "S07 BEV",
    year: 2026,
    type: "ev",
    condition: "new",
    priceMin: 1099000,
    priceMax: 1099000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "Deepal New S07 รุ่นปรับโฉม 2569 แบต LFP 68.8 kWh ชาร์จ DC สูงสุด 163 kW มอเตอร์ 258 แรงม้า ขับเคลื่อนล้อหลัง ระยะทาง NEDC 485 กม. รับประกันแบต 8 ปี/160,000 กม.",
    specs: {
      seats: "5",
      drive: "RWD",
      range: "485 km (NEDC)",
      power: "258 PS",
    },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: true,
    slug: "deepal-s07-bev-2026",
    cloudinaryId: "deepal-s07-bev",
    sourceImageUrl:
      "https://www.changan.co.th/cache/images/AljG4xVwhLAOAcrZPSadP7bV9kVVdgvO9Jo2VT5lReI/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vZGVlcGFsX1MwN19pbl9vcmFuZ2VfZmU4MzhjODkyMi5qcGc.webp",
    gallerySourceUrls: [
      "https://www.changan.co.th/cache/images/rOLWJuRUqhtrIX42X3w_KTrirVkjo_FJJvGs6TfoEcU/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vZGVlcGFsX1MwN19pbl9ibGFja19iNDU0MGVjZWVlLmpwZw.webp",
      "https://www.changan.co.th/cache/images/o1rpnJzgayPn2r459DSdk-34ZbSvX28N1VlBJ4lPsGg/rs:fit:1200/q:75/max_bytes:120000/bG9jYWw6Ly8vUzA3X05lYnVsYV9HcmVlbl9MZWZ0X0RhcmtfTWlycm9yX25ld18xMjgweDYwMF83YjUxYzhmZTQ2LnBuZw.webp",
      "https://www.changan.co.th/cache/images/uJQ0uqj8LJ3BHnczzZ50rdc0HlonYMfHP_qbsfzbHrY/rs:fit:1200/q:75/max_bytes:120000/bG9jYWw6Ly8vUzA3X1N1bnNldF9PcmFuZ2VfRGFya19NaXJyb3JfbmV3XzEyODB4NjAwXzZhYTJkMmVmOGUucG5n.webp",
      "https://www.changan.co.th/cache/images/jVbefvwv9rzLZUZ-TMpJn_nfrPJ4b45Gse4LgtVIT3o/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vV2ViX1MwN18xNng5X25ld19hODBmMTZjODNkLmpwZw.webp",
    ],
    imageSource: "changan.co.th/en/deepal/s07-en/ (official)",
  },
  {
    name: "Deepal S07 L BEV",
    brand: "Deepal",
    model: "S07 L BEV",
    year: 2026,
    type: "suv",
    condition: "new",
    priceMin: 1499000,
    priceMax: 1499000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "Deepal S07 L เอสยูวีไฟฟ้า ฐานล้อ 2,900 mm แบต 79 kWh มอเตอร์ 258 แรงม้า ขับเคลื่อนล้อหลัง ราคา 1,499,000 บาท เน้นห้องโดยสารกว้างและระยะทางไกลกว่า S07 มาตรฐาน",
    specs: {
      seats: "5",
      drive: "RWD",
      wheelbase: "2,900 mm",
      battery: "79 kWh",
    },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: true,
    slug: "deepal-s07-l-bev-2026",
    cloudinaryId: "deepal-s07-l-bev",
    sourceImageUrl:
      "https://api.www.changan.co.th/uploads/AW_After_MTX_16_9_S07_L_de875b1386.jpg",
    gallerySourceUrls: [
      "https://www.changan.co.th/cache/images/SAFfL7Q7PIymkbR-5KjpEvZ2iimXwqPMiUvmPJ5b3wc/rs:fit:1200/q:75/max_bytes:120000/bG9jYWw6Ly8vUzA3X0x1bmFyX0dyZXlfRGFya19NaXJyb3JfbmV3XzEyODB4NjAwX2U1NjBlZTBlNjUucG5n.webp",
      "https://api.www.changan.co.th/uploads/AW_Feb_Sale_Promotion_16x9_L07_and_S07_c4723d3363.jpg",
    ],
    imageSource: "changan.co.th (official Deepal S07 L press)",
  },
  {
    name: "Deepal S05 BEV",
    brand: "Deepal",
    model: "S05 BEV",
    year: 2026,
    type: "ev",
    condition: "new",
    priceMin: 799000,
    priceMax: 999000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "Deepal S05 ครอสโอเวอร์ไฟฟ้า ประกอบในไทย (Rayong) รุ่น BEV Lite/Plus/Max และ Max Long Range 799,000–999,000 บาท มี REEV Plus/Max 949,000–999,000 บาท พร้อม Lifetime Warranty แบต (ตามเงื่อนไขโปรโมชัน)",
    specs: {
      seats: "5",
      drive: "FWD / AWD",
      dimensions: "4,620 × 1,900 × 1,600 mm",
    },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: true,
    slug: "deepal-s05-bev-2026",
    cloudinaryId: "deepal-s05-bev",
    sourceImageUrl:
      "https://www.changan.co.th/cache/images/0-ksH_Dj6eNsIRfJIhCQ-0-hX3wUJZv50Ed614YsM6k/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vUzA1X3dlYl8xOTIweDEwODBfMV9kNGQxOGJkZDZiLmpwZw.webp",
    gallerySourceUrls: [
      "https://www.changan.co.th/cache/images/VSxT1iFyWkXq61OwBMY5V00c4TRXe5aEnz3X2dSyb7Q/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vU2lkZV9EZWVwYWxfQWRqdXN0X0JsYWNrXzRjZTc0YTg5NWUucG5n.webp",
      "https://www.changan.co.th/cache/images/G7lzzRvFAIbK7KIa9-EtbYm8OxM5WuFwoTLTQ6ycef0/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vU2lkZV9EZWVwYWxfQWRqdXN0X0dyYXlfZDdmZjY1NjhiNi5wbmc.webp",
      "https://www.changan.co.th/cache/images/VP2_nktEZGy8qx0viieR8PNK25clhlh4kaj49OL7ir4/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vU2lkZV9EZWVwYWxfQWRqdXN0X1NpbHZlcl9iYmU1YmNmM2VhLnBuZw.webp",
      "https://www.changan.co.th/cache/images/48A7QFp6kIUtXTVbqp-oDYypVMzCV1VCmwxHWJ4vpqA/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vTW9kZWxfY2FyX1MwNV9lMDYzYjgzZDQ4LmpwZw.webp",
    ],
    imageSource: "changan.co.th/en/deepal/s05-en/ (official)",
  },
  {
    name: "Deepal L07 BEV",
    brand: "Deepal",
    model: "L07 / L07 S BEV",
    year: 2026,
    type: "sedan",
    condition: "new",
    priceMin: 1239000,
    priceMax: 1329000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "Deepal L07 ฟาสต์แบ็กไฟฟ้า (SL03) ดีไซน์ Red Dot Award มี L07 S 1,239,000 บาท และ L07 1,329,000 บาท มอเตอร์ล้อหลัง 258 แรงม้า แบต 66.8 kWh ระยะทาง NEDC 540 กม. รับประกันตัวรถและแบต 8 ปี",
    specs: {
      seats: "5",
      body: "Fastback",
      range: "540 km (NEDC)",
      power: "258 PS",
    },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: false,
    slug: "deepal-l07-bev-2026",
    cloudinaryId: "deepal-l07-bev",
    sourceImageUrl:
      "https://api.www.changan.co.th/uploads/AW_After_MTX_16_9_L07_f127631fc6.jpg",
    gallerySourceUrls: [
      "https://api.www.changan.co.th/uploads/AW_Feb_Sale_Promotion_16x9_L07_and_S07_c4723d3363.jpg",
      "https://www.changan.co.th/cache/images/rcj3gytBBSAipEr2Kb9KXhxa1nvtY_EEbVn6jROFTnc/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vZGVlcGFsX0wwN190ZWNoNV9hMDQ5ODFlYTdkLmpwZw.webp",
    ],
    imageSource: "changan.co.th (official Deepal L07 press)",
  },
  {
    name: "Deepal E07 BEV",
    brand: "Deepal",
    model: "E07 Plus / Performance AWD",
    year: 2026,
    type: "suv",
    condition: "new",
    priceMin: 1649000,
    priceMax: 1999000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "Deepal E07 ครอสโอเวอร์ไฟฟ้า 4 ประตูเปิดได้ (Transformable SUV) รุ่น Plus 1,649,000 บาท (ราคาปกติ 1,699,000) และ Performance AWD 1,999,000 บาท (ราคาปกติ 2,099,000) มอเตอร์คู่ AWD สูงสุด 435 แรงม้า แบต 89.98 kWh",
    specs: {
      seats: "5",
      drive: "RWD / AWD",
      power: "435 PS (Performance AWD)",
      battery: "89.98 kWh",
    },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: true,
    slug: "deepal-e07-bev-2026",
    cloudinaryId: "deepal-e07-bev",
    sourceImageUrl:
      "https://www.changan.co.th/cache/images/2STT2NoaOIICKLoeMSHx9en3nkO--pXDpM-FKOqiLaA/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vQVdfV2ViX0JOXzE5MjB4MTA4MF8zMV84NDhiZGVjMDA3LmpwZw.webp",
    gallerySourceUrls: [
      "https://www.changan.co.th/cache/images/V-XLkyMyV1Be8TKbR_M20iMuK2sgTZZWWDbxepxO8Ew/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vQVVUT19QQVJLSU5HX0FTU0lTVF9BUEFfNmM5MWUyYjI2YS5qcGc.webp",
      "https://www.changan.co.th/cache/images/FsrziNTX6uAVd9J5f62LMsWX5267LfXsdHw02xfLtrU/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vQVdfV2ViX0JOXzE5MjB4MTA4MF8wMV9FMDdfMWI2MmI1NmY5Yi5qcGc.webp",
      "https://www.changan.co.th/cache/images/832AEAQsAqHprGmNdZhGIFTBQ_3ouuXRfxDwDZLujJI/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vQVdfV2ViX0JOXzE5MjB4MTA4MF8zNV9mMDQyNWE5MmJkLmpwZw.webp",
    ],
    imageSource: "changan.co.th/en/deepal/e07-plus-en/ (official)",
  },
  {
    name: "Deepal Hunter K50 REEV",
    brand: "Deepal",
    model: "Hunter K50 REEV",
    year: 2026,
    type: "pickup",
    condition: "new",
    priceMin: 1099000,
    priceMax: 1249000,
    engineSize: "1.5L REEV",
    transmission: "auto",
    fuelType: "hybrid",
    description:
      "Deepal Hunter K50 กระบะปลั๊กอินไฮบริด (REEV) ขับเคลื่อน 4 ล้อ รุ่น Plus AWD 1,099,000 บาท และ Max AWD 1,249,000 บาท มอเตอร์ไฟฟ้าคู่ ระบบ Range Extender 1.5L เหมาะงานหนักและใช้งาน off-road",
    specs: {
      seats: "5",
      drive: "AWD",
      body: "Double Cab Pickup",
    },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: true,
    slug: "deepal-hunter-k50-reev-2026",
    cloudinaryId: "deepal-hunter-k50-reev",
    sourceImageUrl:
      "https://www.changan.co.th/cache/images/XdnU-BiMy3195cv3aAMysjzneKOlhhKbjaGmeHBeCys/rs:fit:2048/q:75/max_bytes:120000/bG9jYWw6Ly8vazUwX2JsYWNrX3NpZGVfMGNmYzZjMWZiMS5wbmc.webp",
    gallerySourceUrls: [
      "https://www.changan.co.th/cache/images/Qka_ZZ6OaHzRj6c9KgPlcv0v2BuRQJ44dMe36eAzb_s/rs:fit:2048/q:75/max_bytes:120000/bG9jYWw6Ly8vSzUwX2dyZXlfc2lkZV8wZDU0MTkxNGQxLnBuZw.webp",
      "https://www.changan.co.th/cache/images/OqR5vJgdiSwdIwVaXcG75o0FOJgjb0CogP_tgRnwgKc/rs:fit:2048/q:75/max_bytes:120000/bG9jYWw6Ly8vSzUwX3doaXRlX3NpZGVfNTZmYzQ5NzRmZC5wbmc.webp",
      "https://www.changan.co.th/cache/images/-oLnGsUryoaUPyYEkVk6PzW9dvpyzkSq2OYVEcSrd7g/rs:fit:1920/q:75/max_bytes:120000/bG9jYWw6Ly8vSFVOVEVSX0s1MF9SRUVWX01BWF9BV0RfSW50ZXJpb3JfZjYyNmRmZWJmYV9iOTc1ZGZiZTdmLmpwZw.webp",
    ],
    imageSource: "changan.co.th/en/deepal/hunter-k50-en/ (official)",
  },
  {
    name: "Kia EV5 Air",
    brand: "Kia",
    model: "EV5 Air",
    year: 2025,
    type: "ev",
    condition: "new",
    priceMin: 1399000,
    priceMax: 1599000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "SUV ไฟฟ้า Kia EV5 ดีไซน์ Opposites United ห้องโดยสารกว้าง ราคาเริ่มต้น 1,399,000 บาท (kia.com/th)",
    specs: { seats: "5", drive: "FWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: true,
    slug: "kia-ev5-air-2025",
    cloudinaryId: "kia-ev5-air",
    sourceImageUrl:
      "https://www.kia.com/content/dam/kwcms/gt/en/images/showroom/EV5-ovc-25my/Gallery/ext/ev5-25my-wide-exterior-01.jpg",
    imageSource: "kia.com/th",
  },
  {
    name: "Kia Carnival HEV",
    brand: "Kia",
    model: "Carnival HEV",
    year: 2025,
    type: "mpv",
    condition: "new",
    priceMin: 1899000,
    priceMax: 2199000,
    engineSize: "1.6L Turbo Hybrid",
    transmission: "auto",
    fuelType: "hybrid",
    description:
      "MPV ไฮบริด Premium 11 ที่นั่ง สบายระดับ First Class จาก Kia ประเทศไทย",
    specs: { seats: "7–11", drive: "FWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: false,
    slug: "kia-carnival-hev-2025",
    cloudinaryId: "kia-carnival-hev",
    sourceImageUrl:
      "https://www.kia.com/content/dam/kwcms/th/th/images/showroom/carnival-pe/0-Banner/Rev.2_The-new-Kia-Carnival32_1920x1080.jpg",
    imageSource: "kia.com/th",
  },
];

async function deactivateExistingCars(existing: Awaited<ReturnType<typeof getAllCarsAdmin>>) {
  const active = existing.filter((c) => c.isActive);
  console.log(`\n📦 Deactivating ${active.length} existing active car(s)...`);
  for (const car of active) {
    if (dryRun) {
      console.log(`  [dry-run] archive ${car.slug || car.name} (${car.id})`);
      continue;
    }
    await archiveCar(car.id);
    console.log(`  ✓ archived ${car.slug || car.name}`);
  }
}

async function seedRealCars() {
  const created: Array<{ id: string; slug: string; imageUrl: string | null; imageSource: string }> =
    [];

  for (const entry of REAL_CARS) {
    const { imageSource, cloudinaryId, sourceImageUrl, gallerySourceUrls, navFeatured, navNew, ...carData } = entry;
    console.log(`\n🚗 ${carData.brand} ${carData.model}`);

    const uploadedUrls: string[] = [];
    if (sourceImageUrl) {
      const hero = dryRun
        ? `[dry-run] ${sourceImageUrl}`
        : await uploadOfficialImage(sourceImageUrl, cloudinaryId);
      if (hero) uploadedUrls.push(hero);
    } else {
      console.warn("  ⚠ No automated image source — upload via Admin panel");
    }

    if (gallerySourceUrls?.length) {
      for (let i = 0; i < gallerySourceUrls.length; i++) {
        const url = gallerySourceUrls[i]!;
        const id = `${cloudinaryId}-${i + 2}`;
        const uploaded = dryRun ? `[dry-run] ${url}` : await uploadOfficialImage(url, id);
        if (uploaded) uploadedUrls.push(uploaded);
      }
    }

    const payload: CarInput = {
      ...carData,
      imageUrls: uploadedUrls.filter((u) => !u.startsWith("[dry-run]")),
    };

    if (dryRun) {
      console.log(
        `  [dry-run] would create slug=${payload.slug} images=${uploadedUrls.length}`
      );
      created.push({
        id: "dry-run",
        slug: payload.slug,
        imageUrl: uploadedUrls[0] ?? null,
        imageSource,
      });
      continue;
    }

    const car = await createCar(payload);
    console.log(`  ✓ created ${car.slug} → ${car.id}`);
    created.push({
      id: car.id,
      slug: car.slug,
      imageUrl: car.imageUrls[0] ?? null,
      imageSource,
    });
  }

  return created;
}

async function seedDeepalOnly(existingSlugs: Set<string>) {
  const deepalEntries = REAL_CARS.filter((c) => c.brand === "Deepal");
  const created: Awaited<ReturnType<typeof seedRealCars>> = [];
  for (const entry of deepalEntries) {
    if (existingSlugs.has(entry.slug)) {
      console.log(`\n⏭ Skip ${entry.slug} (already in Notion)`);
      continue;
    }
    const { imageSource, cloudinaryId, sourceImageUrl, gallerySourceUrls, navFeatured, navNew, ...carData } = entry;
    console.log(`\n🚗 ${carData.brand} ${carData.model}`);
    const uploadedUrls: string[] = [];
    if (sourceImageUrl) {
      const hero = dryRun
        ? `[dry-run] ${sourceImageUrl}`
        : await uploadOfficialImage(sourceImageUrl, cloudinaryId);
      if (hero) uploadedUrls.push(hero);
    }
    if (gallerySourceUrls?.length) {
      for (let i = 0; i < gallerySourceUrls.length; i++) {
        const url = gallerySourceUrls[i]!;
        const id = `${cloudinaryId}-${i + 2}`;
        const uploaded = dryRun ? `[dry-run] ${url}` : await uploadOfficialImage(url, id);
        if (uploaded) uploadedUrls.push(uploaded);
      }
    }
    const payload: CarInput = {
      ...carData,
      imageUrls: uploadedUrls.filter((u) => !u.startsWith("[dry-run]")),
    };
    if (dryRun) {
      console.log(`  [dry-run] would create slug=${payload.slug}`);
      created.push({ id: "dry-run", slug: payload.slug, imageUrl: uploadedUrls[0] ?? null, imageSource });
      continue;
    }
    const car = await createCar(payload);
    console.log(`  ✓ created ${car.slug} → ${car.id}`);
    created.push({ id: car.id, slug: car.slug, imageUrl: car.imageUrls[0] ?? null, imageSource });
  }
  return created;
}

async function main() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_CARS_DB_ID) {
    console.error("Missing NOTION_API_KEY or NOTION_CARS_DB_ID in .env.local");
    process.exit(1);
  }

  const deepalOnly = process.argv.includes("--deepal-only");

  console.log(
    dryRun
      ? "=== DRY RUN ==="
      : deepalOnly
        ? "=== Adding Deepal cars only (no archive) ==="
        : "=== Seeding real Thailand-market cars ==="
  );

  const existing = await getAllCarsAdmin();
  console.log(`Found ${existing.length} car row(s) in Notion`);

  const existingSlugs = new Set(existing.map((c) => c.slug));
  let created: Awaited<ReturnType<typeof seedRealCars>>;
  if (deepalOnly) {
    created = await seedDeepalOnly(existingSlugs);
  } else {
    await deactivateExistingCars(existing);
    created = await seedRealCars();
  }

  console.log("\n--- Summary ---");
  console.log("| Brand | Model | Slug | Notion ID | Image |");
  console.log("|-------|-------|------|-----------|-------|");
  for (const row of created) {
    const def = REAL_CARS.find((c) => c.slug === row.slug);
    console.log(
      `| ${def?.brand ?? ""} | ${def?.model ?? ""} | ${row.slug} | ${row.id} | ${row.imageUrl ? "✓" : "—"} |`
    );
  }

  console.log("\n--- Pricing & image sources (official) ---");
  for (const c of REAL_CARS) {
    console.log(
      `${c.brand}\t${c.model}\t${c.priceMin.toLocaleString()} THB\t${c.imageSource}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
