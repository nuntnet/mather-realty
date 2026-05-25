/**
 * One-time migration script: MySQL → Notion
 *
 * Usage:
 *   1. Copy .env.local.example → .env.local and fill in all values
 *   2. bun run scripts/migrate-to-notion.ts
 *
 * What it migrates:
 *   - Blog posts (MySQL) → Notion Blog DB
 *   - Cars         (MySQL) → Notion Cars DB
 *   - Stories      (MySQL) → Notion Stories DB
 *
 * Appointments and contacts are write-only (forms), no legacy data to migrate.
 */

import { Client } from "@notionhq/client";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const notion = new Client({ auth: process.env.NOTION_API_KEY! });

async function getMySQL() {
  return mysql.createConnection(process.env.DATABASE_URL!);
}

// ── Blog Posts ────────────────────────────────────────────────────────────────

async function migrateBlogPosts(db: mysql.Connection) {
  console.log("\n📝 Migrating blog posts...");

  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM blog_posts ORDER BY created_at ASC"
  );

  console.log(`  Found ${rows.length} posts`);

  for (const row of rows) {
    try {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_BLOG_DB_ID! },
        properties: {
          Title: { title: [{ text: { content: row.title ?? "" } }] },
          Slug: { rich_text: [{ text: { content: row.slug ?? "" } }] },
          Excerpt: { rich_text: [{ text: { content: row.excerpt ?? "" } }] },
          "Cover Image URL": { rich_text: [{ text: { content: row.cover_image_url ?? "" } }] },
          Category: { select: { name: row.category ?? "news" } },
          "Is Published": { checkbox: Boolean(row.is_published) },
          "Published At": row.published_at ? { date: { start: new Date(row.published_at).toISOString() } } : { date: null },
          "Author Name": { rich_text: [{ text: { content: row.author_name ?? "ช.เอราวัณ กรุ๊ป" } }] },
        },
        // Content goes in page body — append as a paragraph block
        children: row.content ? [
          {
            object: "block" as const,
            type: "paragraph" as const,
            paragraph: {
              rich_text: [{ text: { content: String(row.content).slice(0, 2000) } }],
            },
          },
        ] : [],
      });
      process.stdout.write(".");
    } catch (e) {
      console.error(`\n  ✗ Failed to migrate post: ${row.title}`, e);
    }
  }
  console.log("\n  ✓ Done");
}

// ── Cars ──────────────────────────────────────────────────────────────────────

async function migrateCars(db: mysql.Connection) {
  console.log("\n🚗 Migrating cars...");

  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM cars ORDER BY created_at ASC"
  );

  console.log(`  Found ${rows.length} cars`);

  for (const row of rows) {
    try {
      // image_urls stored as JSON array in MySQL → convert to newline-separated Cloudinary URLs
      let imageUrlsText = "";
      try {
        const urls = JSON.parse(row.image_urls ?? "[]");
        imageUrlsText = Array.isArray(urls) ? urls.join("\n") : "";
      } catch {
        imageUrlsText = row.image_urls ?? "";
      }

      await notion.pages.create({
        parent: { database_id: process.env.NOTION_CARS_DB_ID! },
        properties: {
          Name: { title: [{ text: { content: `${row.brand ?? ""} ${row.model ?? ""}`.trim() } }] },
          Brand: { select: { name: row.brand ?? "Mazda" } },
          Model: { rich_text: [{ text: { content: row.model ?? "" } }] },
          Year: { number: Number(row.year) || 2024 },
          Type: { select: { name: row.type ?? "other" } },
          Condition: { select: { name: row.condition ?? "new" } },
          "Price Min": { number: Number(row.price_min) || 0 },
          "Price Max": { number: Number(row.price_max) || 0 },
          "Engine Size": { rich_text: [{ text: { content: row.engine_size ?? "" } }] },
          Transmission: { select: { name: row.transmission ?? "auto" } },
          "Fuel Type": { select: { name: row.fuel_type ?? "petrol" } },
          Description: { rich_text: [{ text: { content: (row.description ?? "").slice(0, 2000) } }] },
          "Image URLs": { rich_text: [{ text: { content: imageUrlsText.slice(0, 2000) } }] },
          "Is Active": { checkbox: Boolean(row.is_active ?? true) },
          "Is Featured": { checkbox: Boolean(row.is_featured) },
          Slug: { rich_text: [{ text: { content: row.slug ?? "" } }] },
        },
      });
      process.stdout.write(".");
    } catch (e) {
      console.error(`\n  ✗ Failed to migrate car: ${row.brand} ${row.model}`, e);
    }
  }
  console.log("\n  ✓ Done");
}

// ── Stories ───────────────────────────────────────────────────────────────────

async function migrateStories(db: mysql.Connection) {
  console.log("\n💬 Migrating customer stories...");

  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM customer_stories ORDER BY created_at ASC"
  );

  console.log(`  Found ${rows.length} stories`);

  for (const row of rows) {
    try {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_STORIES_DB_ID! },
        properties: {
          Name: { title: [{ text: { content: row.customer_name ?? "" } }] },
          "Customer Name": { rich_text: [{ text: { content: row.customer_name ?? "" } }] },
          Story: { rich_text: [{ text: { content: (row.story ?? "").slice(0, 2000) } }] },
          Rating: { number: Number(row.rating) || 5 },
          "Car Model": { rich_text: [{ text: { content: row.car_model ?? "" } }] },
          ...(row.customer_email ? { Email: { email: row.customer_email } } : {}),
          ...(row.customer_phone ? { Phone: { phone_number: row.customer_phone } } : {}),
          Status: { select: { name: row.status ?? "pending" } },
          "Is Public": { checkbox: Boolean(row.is_public) },
        },
      });
      process.stdout.write(".");
    } catch (e) {
      console.error(`\n  ✗ Failed to migrate story: ${row.customer_name}`, e);
    }
  }
  console.log("\n  ✓ Done");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting MySQL → Notion migration");
  console.log("=====================================");

  // Validate env vars
  const required = [
    "NOTION_API_KEY",
    "NOTION_BLOG_DB_ID",
    "NOTION_CARS_DB_ID",
    "NOTION_STORIES_DB_ID",
    "DATABASE_URL",
  ];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "));
    process.exit(1);
  }

  const db = await getMySQL();
  console.log("✓ Connected to MySQL");

  try {
    await migrateBlogPosts(db);
    await migrateCars(db);
    await migrateStories(db);

    console.log("\n=====================================");
    console.log("✅ Migration complete!");
    console.log("   Review data in Notion databases.");
    console.log("   Blog content (rich text) needs manual formatting in Notion.");
  } finally {
    await db.end();
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
