/**
 * migrate-images-to-cloudinary.ts
 *
 * Uploads all external car images to Cloudinary and updates Notion with new URLs.
 * Run: bun run scripts/migrate-images-to-cloudinary.ts
 *
 * Safe to re-run — skips images already on Cloudinary.
 * Progress saved per car; interrupt and resume anytime.
 */

import "dotenv/config";

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "n5llrdnq";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const CARS_DB_ID = process.env.NOTION_CARS_DB_ID!;

if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !NOTION_API_KEY || !CARS_DB_ID) {
  console.error("Missing env vars. Ensure .env.local is loaded.");
  process.exit(1);
}

// ── Cloudinary ────────────────────────────────────────────────────────────────

function cloudinarySign(params: Record<string, string | number>) {
  const crypto = require("crypto");
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto
    .createHash("sha256")
    .update(sorted + CLOUDINARY_API_SECRET)
    .digest("hex");
}

async function uploadToCloudinary(
  imageUrl: string,
  publicId: string
): Promise<string | null> {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "ch-erawan/cars";
  const params: Record<string, string | number> = {
    folder,
    public_id: publicId,
    timestamp,
    overwrite: "false",
  };
  const signature = cloudinarySign(params);

  const form = new FormData();
  form.append("file", imageUrl);
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("api_key", CLOUDINARY_API_KEY);
  form.append("signature", signature);
  form.append("overwrite", "false");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // Already exists (already uploaded)
    if ((err as { error?: { message?: string } }).error?.message?.includes("already exists")) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/ch-erawan/cars/${publicId}`;
    }
    console.warn(`  ⚠ Cloudinary upload failed: ${JSON.stringify(err)}`);
    return null;
  }
  const data = await res.json() as { secure_url: string };
  return data.secure_url;
}

// ── Notion helpers ────────────────────────────────────────────────────────────

async function notionQuery(dbId: string): Promise<any[]> {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: 100,
      filter: { property: "Is Active", checkbox: { equals: true } },
    }),
  });
  const data = await res.json() as { results: any[] };
  return data.results;
}

async function notionPatch(pageId: string, imageUrls: string[]) {
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        "Image URLs": {
          rich_text: [{ text: { content: imageUrls.join("\n").slice(0, 2000) } }],
        },
      },
    }),
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

function isCloudinary(url: string): boolean {
  return url.includes("res.cloudinary.com") || url.includes("cloudinary.com");
}

function makePublicId(carName: string, index: number): string {
  const slug = carName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${slug}-${index + 1}`;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("🚀 Cloudinary migration starting...\n");

  const cars = await notionQuery(CARS_DB_ID);
  console.log(`Found ${cars.length} active cars\n`);

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const car of cars) {
    const nameRt = car.properties?.Name?.title ?? [];
    const name: string = nameRt[0]?.plain_text ?? "unknown";

    const imgRt = car.properties?.["Image URLs"]?.rich_text ?? [];
    const imgText: string = imgRt[0]?.plain_text ?? "";
    const urls = imgText.split("\n").map((u: string) => u.trim()).filter(Boolean);

    const externalUrls = urls.filter((u: string) => !isCloudinary(u));
    if (externalUrls.length === 0) {
      console.log(`  ✅ ${name} — all ${urls.length} images already on Cloudinary`);
      totalSkipped += urls.length;
      continue;
    }

    console.log(`\n📷 ${name} — ${externalUrls.length} external images to migrate`);

    const newUrls: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      if (isCloudinary(url)) {
        newUrls.push(url);
        totalSkipped++;
        continue;
      }

      const publicId = makePublicId(name, i);
      process.stdout.write(`    [${i + 1}/${urls.length}] Uploading... `);

      try {
        const cloudUrl = await uploadToCloudinary(url, publicId);
        if (cloudUrl) {
          newUrls.push(cloudUrl);
          totalMigrated++;
          console.log(`✅ ${publicId}`);
        } else {
          // Keep original if upload fails (better than losing the image)
          newUrls.push(url);
          totalFailed++;
          console.log(`❌ kept original`);
        }
      } catch (err) {
        newUrls.push(url);
        totalFailed++;
        console.log(`❌ error: ${err}`);
      }

      // Rate limit: Cloudinary free = 500 uploads/hour
      await sleep(300);
    }

    // Only patch if something changed
    if (newUrls.join("\n") !== urls.join("\n")) {
      await notionPatch(car.id, newUrls);
      console.log(`  💾 Notion updated for ${name}`);
    }

    await sleep(150); // Notion rate limit
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Migrated:  ${totalMigrated}
⏭  Skipped:   ${totalSkipped}  (already on Cloudinary)
❌ Failed:    ${totalFailed}   (original URL kept)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch(console.error);
