/**
 * migrate-static-images.ts
 *
 * Downloads & uploads all hardcoded external images (hero, brands, awards,
 * team, branch maps, page backgrounds) to Cloudinary.
 * Outputs a JSON mapping: old URL → new optimized Cloudinary URL.
 *
 * Run:
 *   bun scripts/migrate-static-images.ts
 *
 * Then apply mapping to codebase:
 *   bun scripts/apply-static-migration.ts
 */

import { writeFileSync, readFileSync } from "fs";
import path from "path";
import crypto from "crypto";

// ── Env ───────────────────────────────────────────────────────────────────────
function loadEnv() {
  const content = readFileSync(path.join(process.cwd(), ".env.local"), "utf-8");
  return Object.fromEntries(
    content.split("\n")
      .filter(l => l.includes("=") && !l.startsWith("#") && l.trim() !== "")
      .map(l => {
        const idx = l.indexOf("=");
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
      })
  );
}

// ── Cloudinary upload via REST (no SDK needed in script) ───────────────────────
function sign(params: Record<string, string | number>, secret: string) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  return crypto.createHash("sha256").update(str + secret).digest("hex");
}

async function uploadUrl(
  sourceUrl: string,
  folder: string,
  publicId: string,
  cloud: string,
  apiKey: string,
  apiSecret: string,
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder, public_id: publicId, timestamp, overwrite: "false" };
  const signature = sign(params as Record<string, string | number>, apiSecret);

  const form = new FormData();
  form.append("file", sourceUrl);
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("api_key", apiKey);
  form.append("signature", signature);
  form.append("overwrite", "false");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST", body: form,
  });

  const data = await res.json() as { secure_url?: string; error?: { message?: string } };

  if (data.error) {
    // Already exists → reconstruct URL
    if (data.error.message?.includes("already exists")) {
      return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto:best/${folder}/${publicId}`;
    }
    throw new Error(data.error.message ?? "Upload failed");
  }

  // Insert optimization transforms
  return data.secure_url!.replace("/upload/", "/upload/f_auto,q_auto:best/");
}

// ── Image manifest ─────────────────────────────────────────────────────────────
const IMAGES: Array<{ url: string; folder: string; publicId: string }> = [
  // ── Hero banners ──────────────────────────────────────────────────────────
  {
    url: "https://mazda-media-s3.s3.ap-southeast-1.amazonaws.com/s3fs-public/2026-02/MAZDA-CX-5_GWS_Homepage-Banner_Desktop_1920x1000px.jpg",
    folder: "ch-erawan/hero", publicId: "mazda-cx5-hero-2026",
  },
  {
    url: "https://www.gwm.co.th/content/dam/gwm/pages/th/en/model/haval-h6-hev/h6-kv-pc-1-2.jpg",
    folder: "ch-erawan/hero", publicId: "gwm-haval-h6-hero",
  },
  {
    url: "https://www.kia.com/content/dam/kwcms/gt/en/images/showroom/EV5-ovc-25my/Gallery/ext/ev5-25my-wide-exterior-01.jpg",
    folder: "ch-erawan/hero", publicId: "kia-ev5-hero",
  },

  // ── Brand images (lib/brandImages.ts) ─────────────────────────────────────
  {
    url: "https://www.gwm.co.th/content/dam/gwm/pages/th/en/model/tank-300-hev/tank-300-kv-pc.webp",
    folder: "ch-erawan/brands", publicId: "gwm-tank-300-hev",
  },
  {
    url: "https://www.kia.com/content/dam/kwcms/th/th/images/util/promotion/2026/MAR2026/EV9/R1_MAR_Home_EV9-1920x1080.jpg",
    folder: "ch-erawan/brands", publicId: "kia-ev9-promo-2026",
  },
  {
    url: "https://www.mitsubishi-motors.co.th/content/dam/mitsubishi-motors-th/images/site-images/news-activity/jun-2025/01%20Mitsubishi%20Triton%20Athlete%204WD.jpg",
    folder: "ch-erawan/brands", publicId: "mitsubishi-triton-athlete",
  },
  {
    url: "https://www.changan.co.th/cache/images/t9l43xIO9pZswrsAqWOcOsP9VyPJBCBz3v0KyCfDhFI/rs:fit:3840/q:75/max_bytes:120000/bG9jYWw6Ly8vV2ViX1MwN18xNng5X25ld19hODBmMTZjODNkLmpwZw.webp",
    folder: "ch-erawan/brands", publicId: "deepal-s07-hero",
  },
  {
    url: "https://imgcdn.zigwheels.co.th/large/gallery/exterior/8/3176/ford-ranger-raptor-front-angle-low-view-922927.jpg",
    folder: "ch-erawan/brands", publicId: "ford-ranger-raptor",
  },

  // ── Page backgrounds (CSS backgroundImage) ────────────────────────────────
  {
    url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80&auto=format&fit=crop",
    folder: "ch-erawan/pages", publicId: "career-hero-bg",
  },

  // ── Branch map graphics (lib/branchData.ts) ───────────────────────────────
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663161651958/aQKoZFokvv2LAz3MGmmmgh/Artboard1_f7cc056f.png",
    folder: "ch-erawan/branch-maps", publicId: "branch-map-mazda-nakhon-pathom",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663161651958/aQKoZFokvv2LAz3MGmmmgh/Artboard2_e250130b.png",
    folder: "ch-erawan/branch-maps", publicId: "branch-map-mazda-salaya",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663161651958/aQKoZFokvv2LAz3MGmmmgh/Artboard3_30c3b66c.png",
    folder: "ch-erawan/branch-maps", publicId: "branch-map-deepal-salaya",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663161651958/aQKoZFokvv2LAz3MGmmmgh/Artboard4_442d1cb0.png",
    folder: "ch-erawan/branch-maps", publicId: "branch-map-ford-omnoi",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663161651958/aQKoZFokvv2LAz3MGmmmgh/Artboard5_c71ad0c9.png",
    folder: "ch-erawan/branch-maps", publicId: "branch-map-mitsubishi-nakhon-pathom",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663161651958/aQKoZFokvv2LAz3MGmmmgh/Artboard6_1d7745a4.png",
    folder: "ch-erawan/branch-maps", publicId: "branch-map-gwm-nakhon-pathom",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663161651958/aQKoZFokvv2LAz3MGmmmgh/Artboard7_a4076a98.png",
    folder: "ch-erawan/branch-maps", publicId: "branch-map-kia-samphran",
  },

  // ── Awards — manuscdn.com (app/awards/page.tsx) ───────────────────────────
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/yPDnwmkqVzEYuBeq.jpg", folder: "ch-erawan/awards", publicId: "gwm-leader-challenge-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/GTacKSauFgltSeRI.jpg", folder: "ch-erawan/awards", publicId: "gwm-iam-challenge-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/BoCNTJfKmHrEPIyt.jpg", folder: "ch-erawan/awards", publicId: "gwm-top-sales-2024-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/MnJsvRYaujTcuyig.jpg", folder: "ch-erawan/awards", publicId: "gwm-top-sales-2024" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/kKxgyxBgggTrJhzs.jpg", folder: "ch-erawan/awards", publicId: "gwm-outstanding-consultant-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/OyZffVCShqdNisKJ.jpg", folder: "ch-erawan/awards", publicId: "mitsu-body-paint-2024" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/PdtUSCETrwTkxeLr.jpg", folder: "ch-erawan/awards", publicId: "mitsu-skills-contest-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/djXUdpCMqVoqbEaA.jpg", folder: "ch-erawan/awards", publicId: "mitsu-top-performance-2024" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/bUIIcgMpTBAipGwl.jpg", folder: "ch-erawan/awards", publicId: "mitsu-advisor-award" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/lbePXKAYbQECEsMR.jpg", folder: "ch-erawan/awards", publicId: "mitsu-top-spare-part" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/vQFMStXvuBEcIwci.jpg", folder: "ch-erawan/awards", publicId: "mitsu-president-award" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/ZqrsNmxhILGrBeNN.jpg", folder: "ch-erawan/awards", publicId: "mitsu-gold-standard" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/iakdlQuIPkFAwkka.jpg", folder: "ch-erawan/awards", publicId: "mitsu-spare-kpi" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/FMFwaHwmBldmirfR.jpg", folder: "ch-erawan/awards", publicId: "mazda-dealer-excellence-2024b" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/opBqTicKNyEEvmHH.jpg", folder: "ch-erawan/awards", publicId: "mazda-sales-consultant-2024" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/NwFoOVeeOADJPgFL.jpg", folder: "ch-erawan/awards", publicId: "mazda-service-manager" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/QltSFDxDyTVQLYih.jpg", folder: "ch-erawan/awards", publicId: "mazda-service-advisor" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/DhoqsukcNhPaLpkZ.jpg", folder: "ch-erawan/awards", publicId: "mazda-guild-2024b" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/bEjMviEqjnbflCzi.jpg", folder: "ch-erawan/awards", publicId: "deepal-top-advisor-2025b" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/TouZjLPQPSxSaBkD.jpg", folder: "ch-erawan/awards", publicId: "deepal-top-sales-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/SuvMqxwWFiNuDACG.jpg", folder: "ch-erawan/awards", publicId: "deepal-top-spare-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/pAUYcoyZYLAgyJvC.jpg", folder: "ch-erawan/awards", publicId: "kia-top-sales-2024" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/kMVkoqeDMyrIwLTX.jpg", folder: "ch-erawan/awards", publicId: "kia-top-sales-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/SWBPNRyPSBmZMPJa.jpg", folder: "ch-erawan/awards", publicId: "kia-outstanding-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/NqDJwPmcpsRqWsjq.jpg", folder: "ch-erawan/awards", publicId: "kia-master-sales-2025" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/TKVKCpZlkgijzVaS.jpg", folder: "ch-erawan/awards", publicId: "ford-top-sales-2024" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/FrhlZrMKOddKSAIU.jpg", folder: "ch-erawan/awards", publicId: "ford-top-service-2024" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/YGdTgqCrWnMlNebF.jpg", folder: "ch-erawan/awards", publicId: "ford-advisor-award" },

  // ── Team / About — manuscdn.com (app/about/page.tsx) ────────────────────────
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/AsagDcMfAaGOwiHj.jpg", folder: "ch-erawan/team", publicId: "team-photo-1" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/BrXLfFaBkBOpwsss.jpg", folder: "ch-erawan/team", publicId: "team-photo-2" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/JcyyrwibzmCGKYKQ.jpg", folder: "ch-erawan/team", publicId: "team-photo-3" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/OBcnpheiaKQaViiD.jpg", folder: "ch-erawan/team", publicId: "team-photo-4" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/PclAqKgvEkjKHphx.jpg", folder: "ch-erawan/team", publicId: "team-photo-5" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/TsCmIkumrflAejvu.jpg", folder: "ch-erawan/team", publicId: "team-photo-6" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/VUhMqynfsPDXVqNM.jpg", folder: "ch-erawan/team", publicId: "team-photo-7" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/VdFAslUBgaiCGyqJ.jpg", folder: "ch-erawan/team", publicId: "team-photo-8" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/YKzZnzpJmupSvawJ.jpg", folder: "ch-erawan/team", publicId: "team-photo-9" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/qKnIMMNVBJWKaLHM.jpg", folder: "ch-erawan/team", publicId: "team-photo-10" },
  { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663161651958/xBSTeTJImAehDzoh.jpg", folder: "ch-erawan/team", publicId: "team-photo-11" },
];

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const env = loadEnv();
  const cloud = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloud || !apiKey || !apiSecret) {
    console.error("❌ Missing Cloudinary env vars in .env.local");
    process.exit(1);
  }

  console.log(`\n🚀 Migrating ${IMAGES.length} static images to Cloudinary...\n`);

  const mapping: Record<string, string> = {};
  let ok = 0, fail = 0;

  for (const item of IMAGES) {
    process.stdout.write(`  [${ok + fail + 1}/${IMAGES.length}] ${item.publicId} ... `);
    try {
      const newUrl = await uploadUrl(item.url, item.folder, item.publicId, cloud, apiKey, apiSecret);
      mapping[item.url] = newUrl;
      console.log(`✓`);
      ok++;
      await new Promise(r => setTimeout(r, 200)); // rate limit
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗ ${msg}`);
      mapping[item.url] = item.url; // keep original on failure
      fail++;
    }
  }

  const mapPath = path.join(process.cwd(), "scripts/static-image-map.json");
  writeFileSync(mapPath, JSON.stringify(mapping, null, 2));

  console.log(`\n✅ ${ok} uploaded, ❌ ${fail} failed`);
  console.log(`📄 Mapping saved → scripts/static-image-map.json`);
  console.log(`\nNext: bun scripts/apply-static-migration.ts\n`);
}

main().catch(console.error);
