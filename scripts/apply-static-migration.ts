/**
 * apply-static-migration.ts
 *
 * Reads scripts/static-image-map.json and replaces all old external URLs
 * with new Cloudinary URLs across the codebase.
 *
 * Run AFTER migrate-static-images.ts:
 *   bun scripts/apply-static-migration.ts
 */

import { readFileSync, writeFileSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const MAP_PATH = path.join(ROOT, "scripts/static-image-map.json");

// Files to patch
const TARGET_FILES = [
  "app/HomeClient.tsx",
  "app/(brands)/[brand]/promotions/page.tsx",
  "app/(brands)/gwm/promotions/page.tsx",
  "app/about/page.tsx",
  "app/awards/page.tsx",
  "app/career/page.tsx",
  "app/insurance/page.tsx",
  "app/secondhand/page.tsx",
  "lib/brandImages.ts",
  "lib/branchData.ts",
].map(f => path.join(ROOT, f));

function main() {
  // Load mapping
  let mapping: Record<string, string>;
  try {
    mapping = JSON.parse(readFileSync(MAP_PATH, "utf-8"));
  } catch {
    console.error(`❌ Cannot read ${MAP_PATH}\nRun migrate-static-images.ts first.`);
    process.exit(1);
  }

  // Filter to only successful uploads (new URL differs from old)
  const pairs = Object.entries(mapping).filter(([old, next]) => old !== next);
  console.log(`\n📋 ${pairs.length} URLs to replace across codebase\n`);

  let totalFiles = 0;
  let totalReplacements = 0;

  for (const filePath of TARGET_FILES) {
    let content: string;
    try {
      content = readFileSync(filePath, "utf-8");
    } catch {
      continue; // file doesn't exist, skip
    }

    let changed = false;
    let fileReplacements = 0;

    for (const [oldUrl, newUrl] of pairs) {
      if (content.includes(oldUrl)) {
        content = content.split(oldUrl).join(newUrl);
        fileReplacements++;
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(filePath, content, "utf-8");
      const rel = path.relative(ROOT, filePath);
      console.log(`  ✓ ${rel} — ${fileReplacements} replacement(s)`);
      totalFiles++;
      totalReplacements += fileReplacements;
    }
  }

  console.log(`\n✅ Done: ${totalReplacements} URLs replaced in ${totalFiles} files`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review changes with: git diff`);
  console.log(`  2. Run: bun run build  (verify no TypeScript errors)`);
  console.log(`  3. Update next.config.ts — remove external domains no longer needed\n`);
}

main();
