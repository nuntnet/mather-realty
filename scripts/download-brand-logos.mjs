/**
 * Download official brand logos into public/brands/.
 *
 * Sources (dealer/trademark use):
 * - Wikimedia Commons: Mazda, Ford, Mitsubishi, Kia, ORA (Ora_logo.svg)
 * - GWM Global (gwm-global.com): GWM wordmark PNG, HAVAL/OR A/TANK SVGs
 * - Deepal (staticre.deepal.com.cn): brand share_logo PNG
 *
 * Run: bun run scripts/download-brand-logos.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(import.meta.dirname, "../public/brands");

const ASSETS = [
  {
    name: "mazda.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Mazda_logo.svg",
  },
  {
    name: "ford.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Ford_Motor_Company_Logo.svg",
  },
  {
    name: "mitsubishi.svg",
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Mitsubishi_motors_new_logo.svg",
  },
  {
    name: "kia.svg",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/KIA_logo.svg",
  },
  {
    name: "gwm.png",
    url: "https://www.gwm-global.com/dist/images/home-page/cc_logo-20250120.png",
  },
  {
    name: "haval.svg",
    url: "https://www.gwm-global.com/dist/images/home-page/hfhf.svg",
  },
  {
    name: "ora.svg",
    url: "https://www.gwm-global.com/dist/images/home-page/pkpk.svg",
  },
  {
    name: "tank.svg",
    url: "https://www.gwm-global.com/dist/images/home-page/tanktank.svg",
  },
  {
    name: "deepal.png",
    url: "https://staticre.deepal.com.cn/20231107-office/office/public/share_logo.png",
  },
];

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ch-erawan-next/1.0)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`✓ ${path.basename(dest)} (${buf.length} bytes)`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const { name, url } of ASSETS) {
    await download(url, path.join(OUT, name));
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log("\nPost-process: normalize GWM SVG fills to currentColor in public/brands/*.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
