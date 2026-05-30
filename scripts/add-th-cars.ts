/**
 * Add Thailand-market car models to Notion without deactivating existing rows.
 *
 * Run: bun run scripts/add-th-cars.ts
 * Dry run: bun run scripts/add-th-cars.ts --dry-run
 *
 * Requires .env.local: NOTION_*, CLOUDINARY_* (recommended)
 */

import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { createCar, getAllCarsAdmin } from "../lib/notion";
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
    const res = await fetch(url, {
      headers: { "User-Agent": "ch-erawan/1.0 (dealer site image sync)" },
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

/** Additional TH-market models — gallery URLs live in sync-car-galleries.ts */
const TH_ADDITIONAL_CARS: Array<
  CarInput & {
    cloudinaryId: string;
    sourceImageUrl: string | null;
    imageSource: string;
  }
> = [
  {
    name: "Mazda CX-3",
    brand: "Mazda",
    model: "CX-3 Essential 2.0",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 699000,
    priceMax: 899000,
    engineSize: "2.0L",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "ครอสโอเวอร์ขนาดกะทัดรัด ขับคล่องตัวในเมือง ราคาเริ่มต้นจาก mazda.co.th",
    specs: { seats: "5", drive: "FWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mazda-cx-3-essential-2025",
    cloudinaryId: "mazda-cx-3-essential",
    sourceImageUrl:
      "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-3_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
    imageSource: "mazda.co.th (mazda-media-s3 CDN)",
  },
  {
    name: "Mazda3",
    brand: "Mazda",
    model: "Mazda3 2.0",
    year: 2025,
    type: "sedan",
    condition: "new",
    priceMin: 979000,
    priceMax: 1198000,
    engineSize: "2.0L",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "ซедาน/แฮทช์แบ็กสปอร์ต ดีไซน์ Kodo สมรรถนะสมดุล จากมาสด้าประเทศไทย",
    specs: { seats: "5", body: "Sedan / Hatchback" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mazda-mazda3-2025",
    cloudinaryId: "mazda-mazda3",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mazda3_SKYACTIV-G.jpg",
    imageSource: "Wikimedia Commons (Mazda3 BP, CC BY-SA)",
  },
  {
    name: "Mazda BT-50",
    brand: "Mazda",
    model: "BT-50 Hi-Racer",
    year: 2025,
    type: "pickup",
    condition: "new",
    priceMin: 762000,
    priceMax: 1352000,
    engineSize: "1.9L / 2.2L / 3.0L Diesel",
    transmission: "auto",
    fuelType: "diesel",
    description:
      "กระบะไฮไลท์ Hi-Racer จากมาสด้า ประหยัดน้ำมัน ขับสบาย ราคาเริ่มต้นจาก mazda.co.th",
    specs: { cab: "Double Cab / Freestyle", drive: "4x2 / 4x4" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mazda-bt-50-2025",
    cloudinaryId: "mazda-bt-50",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/2024_Mazda_BT-50_Hi-Racer_Double-Cab_2.2_XT.jpg",
    imageSource: "Wikimedia Commons (BT-50 Thailand Motor Expo 2024, CC BY-SA)",
  },
  {
    name: "Mazda2 Essential",
    brand: "Mazda",
    model: "Mazda2 Essential 1.3",
    year: 2025,
    type: "hatchback",
    condition: "new",
    priceMin: 529000,
    priceMax: 749000,
    engineSize: "1.3L",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "รถขนาดเล็ก Essential ดีไซน์สปอร์ต ราคาเข้าถึงง่าย มีทั้ง Sedan และแฮทช์แบ็ก จาก mazda.co.th",
    specs: { seats: "5", body: "Sedan / Hatchback" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mazda-mazda2-essential-2025",
    cloudinaryId: "mazda-mazda2-essential",
    sourceImageUrl:
      "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-04/MAZDA-2-Essential_Home-Banner-%28Desktop%29_3840x1700px.jpg",
    imageSource: "mazda.co.th (mazda-media-s3 CDN)",
  },
  {
    name: "Mazda6",
    brand: "Mazda",
    model: "Mazda6 20th Anniversary",
    year: 2025,
    type: "sedan",
    condition: "new",
    priceMin: 2499000,
    priceMax: 2499000,
    engineSize: "2.5L",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "Sedan พรีเมียม Mazda6 รุ่นฉลองครบรอบ 20 ปี ดีไซน์ Kodo สมรรถนะสมดุล จาก mazda.co.th",
    specs: { seats: "5", drive: "FWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mazda-mazda6-2025",
    cloudinaryId: "mazda-mazda6",
    sourceImageUrl:
      "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2024-11/90_1400x700_Mazda6.webp",
    imageSource: "mazda.co.th (mazda-media-s3 CDN)",
  },
  {
    name: "Mazda6e",
    brand: "Mazda",
    model: "Mazda6e BEV",
    year: 2026,
    type: "ev",
    condition: "new",
    priceMin: 1169000,
    priceMax: 1199000,
    engineSize: "Electric 77.9 kWh",
    transmission: "auto",
    fuelType: "electric",
    description:
      "รถไฟฟ้า 100% Mazda6e ระยะทาง NEDC 654 กม. ดีไซน์ NeoFastback จาก mazda.co.th",
    specs: { seats: "5", drive: "RWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: true,
    slug: "mazda-mazda6e-2026",
    cloudinaryId: "mazda-mazda6e",
    sourceImageUrl:
      "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/45_1400x700_Mazda6e_Black_46V_0.webp",
    imageSource: "mazda.co.th (mazda-media-s3 CDN)",
  },
  {
    name: "Mazda CX-8",
    brand: "Mazda",
    model: "CX-8 2.5 / XDL",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 1549000,
    priceMax: 2199000,
    engineSize: "2.5L / 2.2L Diesel",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "SUV 7 ที่นั่ง CX-8 หรูหรา ขับเคลื่อน 4WD ในรุ่นท็อป จาก mazda.co.th",
    specs: { seats: "6–7", drive: "FWD / AWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mazda-cx-8-2025",
    cloudinaryId: "mazda-cx-8",
    sourceImageUrl:
      "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2024-11/90_1400x700_CX-8.webp",
    imageSource: "mazda.co.th (mazda-media-s3 CDN)",
  },
  {
    name: "Mazda MX-5",
    brand: "Mazda",
    model: "MX-5 RF 2.0",
    year: 2025,
    type: "other",
    condition: "new",
    priceMin: 3029000,
    priceMax: 3069000,
    engineSize: "2.0L",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "Roadster สองที่นั่ง MX-5 RF ดีไซน์ Classic ขับสนุก รุ่น 35th Anniversary จาก mazda.co.th",
    specs: { seats: "2", body: "Convertible RF" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mazda-mx-5-2025",
    cloudinaryId: "mazda-mx-5",
    sourceImageUrl:
      "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2025-03/IMG_Homepage%20Model%20BG-Desktop_NEW%20MAZDA%20MX-5_35th%20Anniversary.webp",
    imageSource: "mazda.co.th (mazda-media-s3 CDN)",
  },
  {
    name: "Ford Ranger Raptor",
    brand: "Ford",
    model: "Ranger Raptor 3.0 V6",
    year: 2026,
    type: "pickup",
    condition: "new",
    priceMin: 1804000,
    priceMax: 1984000,
    engineSize: "3.0L V6 Twin-Turbo",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "กระบะสมรรถนะสูง Ranger Raptor ขับเคลื่อน 4x4 ระบบ FOX Shocks — ราคาจาก ford.co.th",
    specs: { cab: "Double Cab", drive: "4x4" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    slug: "ford-ranger-raptor-2026",
    cloudinaryId: "ford-ranger-raptor",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e9/Ford_Ranger_Raptor_2023.jpg",
    imageSource: "Wikimedia Commons (Ford Ranger Raptor, CC BY-SA)",
  },
  {
    name: "Ford Everest Sport",
    brand: "Ford",
    model: "Everest Sport 2.0 Bi-Turbo",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 1585000,
    priceMax: 1669000,
    engineSize: "2.0L Bi-Turbo Diesel",
    transmission: "auto",
    fuelType: "diesel",
    description:
      "SUV 7 ที่นั่ง Everest Sport ดีไซน์สปอร์ต ขับเคลื่อน 4x4 สำหรับครอบครัว",
    specs: { seats: "7", drive: "4WD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "ford-everest-sport-2025",
    cloudinaryId: "ford-everest-sport",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c6/Ford_Everest_III_01_--_Bangkok_Motor_Show_--_2022-03-23.jpg",
    imageSource: "Wikimedia Commons (Everest III Bangkok Motor Show, CC BY-SA)",
  },
  {
    name: "Mitsubishi Pajero Sport",
    brand: "Mitsubishi",
    model: "Pajero Sport Elite Edition",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 1389000,
    priceMax: 1689000,
    engineSize: "2.4L MIVEC Diesel",
    transmission: "auto",
    fuelType: "diesel",
    description:
      "SUV 7 ที่นั่ง Pajero Sport แข็งแกร่ง ขับเคลื่อน 4x4 จาก Mitsubishi ประเทศไทย",
    specs: { seats: "7", drive: "4WD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mitsubishi-pajero-sport-2025",
    cloudinaryId: "mitsubishi-pajero-sport",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c6/Mitsubishi_Montero_Sport_4x2_GLS_2023_%283%29.jpg",
    imageSource: "Wikimedia Commons (Montero Sport 2023, CC BY-SA)",
  },
  {
    name: "Mitsubishi Xpander",
    brand: "Mitsubishi",
    model: "Xpander HEV",
    year: 2026,
    type: "mpv",
    condition: "new",
    priceMin: 789000,
    priceMax: 919000,
    engineSize: "1.6L Hybrid",
    transmission: "auto",
    fuelType: "hybrid",
    description:
      "MPV 7 ที่นั่ง Xpander HEV ประหยัดน้ำมัน กว้างขวาง เหมาะกับครอบครัวไทย",
    specs: { seats: "7", drive: "FWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mitsubishi-xpander-hev-2026",
    cloudinaryId: "mitsubishi-xpander-hev",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/2024_Mitsubishi_Xpander_HEV.jpg",
    imageSource: "Wikimedia Commons (Xpander HEV Thailand, CC BY-SA)",
  },
  {
    name: "Mitsubishi Attrage",
    brand: "Mitsubishi",
    model: "Attrage 1.2",
    year: 2025,
    type: "sedan",
    condition: "new",
    priceMin: 529000,
    priceMax: 584000,
    engineSize: "1.2L",
    transmission: "auto",
    fuelType: "petrol",
    description:
      "ซедานขนาดเล็กประหยัดน้ำมัน ราคาเข้าถึงง่าย จาก Mitsubishi ประเทศไทย",
    specs: { seats: "5", drive: "FWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "mitsubishi-attrage-2025",
    cloudinaryId: "mitsubishi-attrage",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d0/Mitsubishi_Mirage_G4_1.2_GLS_2023.jpg",
    imageSource: "Wikimedia Commons (Mirage G4 / Attrage, CC BY-SA)",
  },
  {
    name: "GWM Tank 300",
    brand: "GWM",
    model: "Tank 300 HEV Ultra",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 1049000,
    priceMax: 1799000,
    engineSize: "2.0L Hybrid",
    transmission: "auto",
    fuelType: "hybrid",
    description:
      "SUV ออฟโรด Tank 300 จาก GWM ประเทศไทย ดีไซน์แข็งแกร่ง ขับเคลื่อน 4x4",
    specs: { seats: "5", drive: "4WD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    slug: "gwm-tank-300-2025",
    cloudinaryId: "gwm-tank-300",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/98/2023_TANK_300_HEV_Ultra.jpg",
    imageSource: "Wikimedia Commons (Tank 300 HEV Thailand dealer, CC BY-SA)",
  },
  {
    name: "GWM HAVAL Jolion HEV",
    brand: "GWM",
    model: "HAVAL Jolion HEV",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 799000,
    priceMax: 999000,
    engineSize: "1.5L Hybrid",
    transmission: "auto",
    fuelType: "hybrid",
    description:
      "SUV ไฮบริดขนาดกะทัดรัด Jolion จาก GWM ประหยัดน้ำมัน ราคาเริ่มต้น gwm.co.th",
    specs: { seats: "5", drive: "FWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "gwm-haval-jolion-hev-2025",
    cloudinaryId: "gwm-haval-jolion-hev",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5d/2021_Haval_Jolion_HEV_Ultra.jpg",
    imageSource: "Wikimedia Commons (Jolion HEV Thailand, CC BY-SA)",
  },
  {
    name: "GWM Poer Sahar",
    brand: "GWM",
    model: "Poer Sahar PHEV",
    year: 2025,
    type: "pickup",
    condition: "new",
    priceMin: 799000,
    priceMax: 999000,
    engineSize: "2.0L PHEV",
    transmission: "auto",
    fuelType: "hybrid",
    description:
      "กระบะปลั๊กอินไฮบริด Poer Sahar จาก GWM ประเทศไทย สมรรถนะและประหยัด",
    specs: { cab: "Double Cab", drive: "4x4" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "gwm-poer-sahar-2025",
    cloudinaryId: "gwm-poer-sahar",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cd/2024_GWM_Poer_Sahar_PHEV_front_view.png",
    imageSource: "Wikimedia Commons (Poer Sahar PHEV, CC BY-SA)",
  },
  {
    name: "Kia EV9 GT-Line",
    brand: "Kia",
    model: "EV9 GT-Line AWD",
    year: 2025,
    type: "ev",
    condition: "new",
    priceMin: 3899000,
    priceMax: 3899000,
    engineSize: "Electric",
    transmission: "auto",
    fuelType: "electric",
    description:
      "SUV ไฟฟ้า 3 แถว EV9 GT-Line ระดับพรีเมียม จาก Kia ประเทศไทย",
    specs: { seats: "6–7", drive: "AWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    slug: "kia-ev9-gt-line-2025",
    cloudinaryId: "kia-ev9-gt-line",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b7/2024_Kia_EV9_1.jpg",
    imageSource: "Wikimedia Commons (Kia EV9 Bangkok Motor Show, CC BY-SA)",
  },
  {
    name: "Kia Sorento PHEV",
    brand: "Kia",
    model: "Sorento PHEV",
    year: 2025,
    type: "suv",
    condition: "new",
    priceMin: 1499000,
    priceMax: 2199000,
    engineSize: "1.6L Turbo PHEV",
    transmission: "auto",
    fuelType: "hybrid",
    description:
      "SUV ปลั๊กอินไฮบริด 7 ที่นั่ง Sorento จาก Kia ประเทศไทย ขับสบาย ประหยัด",
    specs: { seats: "7", drive: "AWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: false,
    navFeatured: false,
    navNew: false,
    slug: "kia-sorento-phev-2025",
    cloudinaryId: "kia-sorento-phev",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/58/2025_Kia_Sorento_PHEV_SX_in_Mineral_Blue%2C_front_right%2C_2024-09-29.jpg",
    imageSource: "Wikimedia Commons (Sorento PHEV, CC BY-SA)",
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
      "Changan Lumin รถไฟฟ้าเมืองขนาดเล็ก จาก CHANGAN ประเทศไทย รุ่น L 479,000 บาท และ L DC 499,000 บาท",
    specs: { seats: "4", range: "301 km (NEDC, L DC)" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: true,
    slug: "deepal-lumin-2026",
    cloudinaryId: "deepal-lumin",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cc/2024_Changan_Lumin_L_DC.jpg",
    imageSource: "Wikimedia Commons (Changan Lumin, CC BY-SA)",
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
      "Deepal S07 L เอสยูวีไฟฟ้า ฐานล้อ 2,900 mm แบต 79 kWh ราคา 1,499,000 บาท",
    specs: { seats: "5", drive: "RWD", wheelbase: "2,900 mm" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: true,
    slug: "deepal-s07-l-bev-2026",
    cloudinaryId: "deepal-s07-l-bev",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/31/Deepal_S07_IAA_2025_DSC_1897.jpg",
    imageSource: "Wikimedia Commons (Deepal S07 L, CC BY-SA)",
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
      "Deepal E07 ครอสโอเวอร์ไฟฟ้า Plus 1,649,000 บาท และ Performance AWD 1,999,000 บาท",
    specs: { seats: "5", drive: "RWD / AWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: true,
    navNew: true,
    slug: "deepal-e07-bev-2026",
    cloudinaryId: "deepal-e07-bev",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d0/Nevo_E07_001.jpg",
    imageSource: "Wikimedia Commons (Deepal E07, CC BY-SA)",
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
      "Deepal Hunter K50 กระบะ REEV Plus AWD 1,099,000 บาท และ Max AWD 1,249,000 บาท",
    specs: { seats: "5", drive: "AWD" },
    imageUrls: [],
    videoUrl: null,
    isActive: true,
    isFeatured: true,
    navFeatured: false,
    navNew: true,
    slug: "deepal-hunter-k50-reev-2026",
    cloudinaryId: "deepal-hunter-k50-reev",
    sourceImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f1/2025_Deepal_Hunter_K50_REEV_Plus_AWD.jpg",
    imageSource: "Wikimedia Commons (Deepal Hunter K50, CC BY-SA)",
  },
];

async function main() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_CARS_DB_ID) {
    console.error("Missing NOTION_API_KEY or NOTION_CARS_DB_ID in .env.local");
    process.exit(1);
  }

  console.log(dryRun ? "=== DRY RUN (add TH cars) ===" : "=== Adding TH-market cars ===");

  const existing = await getAllCarsAdmin();
  const existingSlugs = new Set(existing.map((c) => c.slug));

  let added = 0;
  let skipped = 0;

  for (const entry of TH_ADDITIONAL_CARS) {
    if (existingSlugs.has(entry.slug)) {
      console.log(`\n⏭ Skip ${entry.slug} (already in Notion)`);
      skipped++;
      continue;
    }

    const { cloudinaryId, sourceImageUrl, imageSource, navFeatured, navNew, ...carData } = entry;
    console.log(`\n🚗 ${carData.brand} ${carData.model}`);

    const hero = dryRun
      ? `[dry-run] ${sourceImageUrl}`
      : await uploadOfficialImage(sourceImageUrl, cloudinaryId);

    const payload: CarInput = {
      ...carData,
      imageUrls: hero && !hero.startsWith("[dry-run]") ? [hero] : [],
    };

    if (dryRun) {
      console.log(`  [dry-run] would create slug=${payload.slug}`);
      added++;
      continue;
    }

    const car = await createCar(payload);
    console.log(`  ✓ created ${car.slug} → ${car.id} (${imageSource})`);
    added++;
  }

  console.log(`\n--- Done: ${added} added, ${skipped} skipped ---`);
  if (added > 0 && !dryRun) {
    console.log("Run `bun run sync:galleries` to upload multi-image galleries.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
