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
    const result = await cloudinary.uploader.upload(url, {
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
  CarInput & { imageSource: string; cloudinaryId: string; sourceImageUrl: string | null }
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
    slug: "ford-ranger-wildtrak-2026",
    cloudinaryId: "ford-ranger-wildtrak",
    sourceImageUrl: null,
    imageSource:
      "ford.co.th (Akamai blocks hotlink — upload hero via Admin → /api/upload)",
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
    slug: "ford-everest-platinum-2025",
    cloudinaryId: "ford-everest-platinum",
    sourceImageUrl: null,
    imageSource:
      "ford.co.th (Akamai blocks hotlink — upload hero via Admin → /api/upload)",
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
    slug: "gwm-ora-05-bev-2025",
    cloudinaryId: "gwm-ora-05-bev",
    sourceImageUrl:
      "https://www.gwm.co.th/content/dam/gwm/pages/th/en/homepage/kv/ora5-ev-1.jpg",
    imageSource: "gwm.co.th",
  },
  {
    name: "Deepal S07 BEV",
    brand: "Deepal",
    model: "S07 BEV",
    year: 2025,
    type: "ev",
    condition: "new",
    priceMin: 1099000,
    priceMax: 1299000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "SUV ไฟฟ้า Deepal S07 จาก Changan ประเทศไทย ห้องโดยสาร Premium ระบบ ADAS ครบ",
    specs: { seats: "5", drive: "RWD / AWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    slug: "deepal-s07-bev-2025",
    cloudinaryId: "deepal-s07-bev",
    sourceImageUrl:
      "https://www.changan.co.th/cache/images/i3XxHnTOvv9KlTxKx3m9cEzWFJM21SPYOL0L2Yu3aVA/rs:fit:640/q:75/max_bytes:120000/bG9jYWw6Ly8vbmV3X3MwNV85ZjI3ZGYxNmFiLnBuZw.webp",
    imageSource: "changan.co.th (Deepal S07)",
  },
  {
    name: "Deepal L07 BEV",
    brand: "Deepal",
    model: "L07 BEV",
    year: 2025,
    type: "sedan",
    condition: "new",
    priceMin: 899000,
    priceMax: 1099000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "ซедานไฟฟ้า Deepal L07 ดีไซน์ล้ำสมัย สมรรถนะเร้าใจ จากเครือ Changan ประเทศไทย",
    specs: { seats: "5", body: "Sedan" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    slug: "deepal-l07-bev-2025",
    cloudinaryId: "deepal-l07-bev",
    sourceImageUrl: "https://api.www.changan.co.th/uploads/og_image_c60505aa9e.jpg",
    imageSource: "changan.co.th (Deepal brand OG — replace with model KV when available)",
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
    const { imageSource, cloudinaryId, sourceImageUrl, ...carData } = entry;
    console.log(`\n🚗 ${carData.brand} ${carData.model}`);

    let imageUrl: string | null = null;
    if (sourceImageUrl) {
      imageUrl = dryRun
        ? `[dry-run] ${sourceImageUrl}`
        : await uploadOfficialImage(sourceImageUrl, cloudinaryId);
    } else {
      console.warn("  ⚠ No automated image source — upload via Admin panel");
    }

    const payload: CarInput = {
      ...carData,
      imageUrls: imageUrl && !imageUrl.startsWith("[dry-run]") ? [imageUrl] : [],
    };

    if (dryRun) {
      console.log(`  [dry-run] would create slug=${payload.slug} image=${imageUrl ?? "none"}`);
      created.push({ id: "dry-run", slug: payload.slug, imageUrl, imageSource });
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

async function main() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_CARS_DB_ID) {
    console.error("Missing NOTION_API_KEY or NOTION_CARS_DB_ID in .env.local");
    process.exit(1);
  }

  console.log(dryRun ? "=== DRY RUN ===" : "=== Seeding real Thailand-market cars ===");

  const existing = await getAllCarsAdmin();
  console.log(`Found ${existing.length} car row(s) in Notion`);

  await deactivateExistingCars(existing);
  const created = await seedRealCars();

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
