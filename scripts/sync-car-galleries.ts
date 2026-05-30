/**
 * Audit + sync car image galleries to Cloudinary and Notion.
 *
 * Run: bun run scripts/sync-car-galleries.ts
 * Audit only: bun run scripts/sync-car-galleries.ts --audit
 *
 * Requires .env.local: NOTION_*, CLOUDINARY_*
 */

import { config } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { getAllCarsAdmin, updateCar } from "../lib/notion";

config({ path: ".env.local" });

const auditOnly = process.argv.includes("--audit");

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Official / Commons press images per slug (multiple = gallery) */
const GALLERY_SOURCES: Record<string, string[]> = {
  "ford-ranger-wildtrak-2026": [
    "https://upload.wikimedia.org/wikipedia/commons/c/cd/Ford_Ranger_4x2_Wildtrak_2024.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/f0/Ford_Ranger_4x2_Wildtrak_2024_%281%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/0c/Ford_Ranger_4x2_Wildtrak_2024_%282%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a2/PIMS_2024_-_Ford_Ranger_2.0_Turbo_Wildtrak_4x2.jpg",
  ],
  "ford-everest-platinum-2025": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c6/Ford_Everest_III_01_--_Bangkok_Motor_Show_--_2022-03-23.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/00/Ford_Everest_III_02_--_Bangkok_Motor_Show_--_2022-03-23.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b1/Ford_Everest_Titanium_29082022.jpg",
  ],
  "mazda-cx-5-2025": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-5_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
  ],
  "mazda-cx-30-2025": [
    "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-30_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
  ],
  "mitsubishi-triton-2024": [
    "https://www.mitsubishi-motors.co.th/content/dam/mitsubishi-motors-th/images/cars/l200/2024/primary/hero/all-new-triton-2024-edit-jun.png",
  ],
  "mitsubishi-xpander-cross-hev-2026": [
    "https://www.mitsubishi-motors.co.th/content/dam/mitsubishi-motors-th/images/cars/xpander-cross-hev/2026/primary/hero/xpander-cross-hev-hero.png",
  ],
  "gwm-haval-h6-hev-2025": [
    "https://www.gwm.co.th/content/dam/gwm/pages/th/en/model/haval-h6-hev/h6-kv-pc-1-2.jpg",
  ],
  "gwm-ora-05-bev-2025": [
    "https://www.gwm.co.th/content/dam/gwm/pages/th/en/model/ora-07/ora-07-kv-pc.jpg",
  ],
  "deepal-s07-bev-2025": [
    "https://www.changan.co.th/cache/images/i3XxHnTOvv9KlTxKx3m9cEzWFJM21SPYOL0L2Yu3aVA/rs:fit:640/q:75/max_bytes:120000/bG9jYWw6Ly8vbmV3X3MwNV85ZjI3ZGYxNmFiLnBuZw.webp",
  ],
  "deepal-l07-bev-2025": [
    "https://api.www.changan.co.th/uploads/og_image_c60505aa9e.jpg",
  ],
  "kia-ev5-air-2025": [
    "https://www.kia.com/content/dam/kwcms/th/th/images/showroom/ev5/0-Banner/kia-ev5-banner-pc.jpg",
  ],
  "kia-carnival-hev-2025": [
    "https://www.kia.com/content/dam/kwcms/th/th/images/showroom/carnival-pe/0-Banner/Rev.2_The-new-Kia-Carnival32_1920x1080.jpg",
  ],
};

function cloudinaryReady(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadImage(url: string, publicId: string): Promise<string | null> {
  if (!cloudinaryReady()) {
    console.warn("  ⚠ Cloudinary not configured — using source URL");
    return url;
  }
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ch-erawan/1.0 (dealer site image sync)" },
    });
    if (!res.ok) {
      console.warn(`  ⚠ Fetch failed ${publicId}: HTTP ${res.status}`);
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
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.warn(`  ⚠ Upload failed ${publicId}: ${msg.slice(0, 120)}`);
    return url;
  }
}

async function syncGallery(slug: string, sources: string[]): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < sources.length; i++) {
    const id = `${slug.replace(/[^a-z0-9-]/gi, "-")}-${i + 1}`;
    const url = await uploadImage(sources[i]!, id);
    if (url) urls.push(url);
    if (i < sources.length - 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
  return urls;
}

async function main() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_CARS_DB_ID) {
    console.error("Missing NOTION_* in .env.local");
    process.exit(1);
  }

  const cars = await getAllCarsAdmin();
  const active = cars.filter((c) => c.isActive);

  console.log(`\n=== Car gallery audit (${active.length} active) ===\n`);
  console.log("| Slug | Brand | Images | Cloudinary | Status |");
  console.log("|------|-------|--------|------------|--------|");

  let needsSync = 0;

  for (const car of active) {
    const count = car.imageUrls.filter(Boolean).length;
    const onCloudinary = car.imageUrls.some((u) => u.includes("cloudinary.com"));
    const sources = GALLERY_SOURCES[car.slug];
    const missing = count === 0;
    const status = missing ? "❌ no images" : count === 1 ? "⚠ single" : "✓ gallery";

    if (missing || (sources && count < sources.length)) needsSync++;

    console.log(
      `| ${car.slug} | ${car.brand} | ${count} | ${onCloudinary ? "yes" : "no"} | ${status} |`
    );

    if (auditOnly || !sources) continue;
    if (!missing && count >= sources.length) continue;

    console.log(`\n→ Syncing ${car.slug} (${sources.length} source images)...`);
    const urls = await syncGallery(car.slug, sources);
    if (urls.length === 0) {
      console.warn(`  ⚠ No URLs uploaded for ${car.slug}`);
      continue;
    }
    await updateCar(car.id, { imageUrls: urls });
    console.log(`  ✓ Updated Notion with ${urls.length} image(s)`);
  }

  console.log(`\n--- ${needsSync} car(s) need gallery attention ---`);
  if (auditOnly) console.log("Run without --audit to upload missing galleries.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
