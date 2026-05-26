/**
 * Setup Notion Database Schema for ch-erawan-next
 * Run: npx tsx scripts/setup-notion-schema.ts
 */

import { Client } from "@notionhq/client";
import { config } from "dotenv";
config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const DB = {
  cars: process.env.NOTION_CARS_DB_ID!,
  blog: process.env.NOTION_BLOG_DB_ID!,
  stories: process.env.NOTION_STORIES_DB_ID!,
};

async function setupCarsDatabase() {
  console.log("🚗 Setting up Cars database...");

  await notion.databases.update({
    database_id: DB.cars,
    title: [{ type: "text", text: { content: "รถยนต์ (Cars)" } }],
    properties: {
      "Name": { title: {} },
      "Brand": {
        select: {
          options: [
            { name: "GWM", color: "blue" },
            { name: "HAVAL", color: "green" },
            { name: "ORA", color: "pink" },
            { name: "TANK", color: "gray" },
            { name: "Other", color: "default" },
          ],
        },
      },
      "Model": { rich_text: {} },
      "Year": { number: { format: "number" } },
      "Type": {
        select: {
          options: [
            { name: "SUV", color: "blue" },
            { name: "Sedan", color: "green" },
            { name: "Pickup", color: "orange" },
            { name: "EV", color: "purple" },
            { name: "Hybrid", color: "yellow" },
          ],
        },
      },
      "Condition": {
        select: {
          options: [
            { name: "new", color: "green" },
            { name: "used", color: "orange" },
          ],
        },
      },
      "Price Min": { number: { format: "number" } },
      "Price Max": { number: { format: "number" } },
      "Engine Size": { rich_text: {} },
      "Transmission": {
        select: {
          options: [
            { name: "automatic", color: "blue" },
            { name: "manual", color: "green" },
            { name: "CVT", color: "purple" },
          ],
        },
      },
      "Fuel Type": {
        select: {
          options: [
            { name: "petrol", color: "orange" },
            { name: "diesel", color: "gray" },
            { name: "electric", color: "green" },
            { name: "hybrid", color: "blue" },
          ],
        },
      },
      "Description": { rich_text: {} },
      "Specs": { rich_text: {} },
      "Image URLs": { rich_text: {} },
      "Video URL": { url: {} },
      "Is Active": { checkbox: {} },
      "Is Featured": { checkbox: {} },
      "Slug": { rich_text: {} },
    },
  });

  console.log("✅ Cars database updated!");
}

async function setupBlogDatabase() {
  console.log("📝 Setting up Blog database...");

  await notion.databases.update({
    database_id: DB.blog,
    title: [{ type: "text", text: { content: "บทความ (Blog)" } }],
    properties: {
      // Rename existing "Name" to "Title" (title property already exists, just rename it)
      "Name": { name: "Title", title: {} },
      "Slug": { rich_text: {} },
      "Excerpt": { rich_text: {} },
      "Cover Image URL": { rich_text: {} },
      "Category": {
        select: {
          options: [
            { name: "news", color: "blue" },
            { name: "review", color: "green" },
            { name: "tips", color: "orange" },
            { name: "promotion", color: "red" },
            { name: "company", color: "purple" },
          ],
        },
      },
      "Tags": {
        multi_select: {
          options: [
            { name: "GWM", color: "blue" },
            { name: "HAVAL", color: "green" },
            { name: "ORA", color: "pink" },
            { name: "รีวิว", color: "orange" },
            { name: "โปรโมชั่น", color: "red" },
            { name: "เคล็ดลับ", color: "yellow" },
          ],
        },
      },
      "SEO Title": { rich_text: {} },
      "SEO Description": { rich_text: {} },
      "Is Published": { checkbox: {} },
      "Published At": { date: {} },
      "Author Name": { rich_text: {} },
    },
  });

  console.log("✅ Blog database updated!");
}

async function setupStoriesDatabase() {
  console.log("⭐ Setting up Stories database...");

  await notion.databases.update({
    database_id: DB.stories,
    title: [{ type: "text", text: { content: "รีวิวลูกค้า (Customer Stories)" } }],
    properties: {
      "Name": { title: {} },
      "Customer Name": { rich_text: {} },
      "Email": { email: {} },
      "Phone": { phone_number: {} },
      "Story": { rich_text: {} },
      "Rating": { number: { format: "number" } },
      "Car Model": { rich_text: {} },
      "Image URL": { url: {} },
      "Status": {
        select: {
          options: [
            { name: "pending", color: "yellow" },
            { name: "approved", color: "green" },
            { name: "rejected", color: "red" },
          ],
        },
      },
      "Is Public": { checkbox: {} },
    },
  });

  console.log("✅ Stories database updated!");
}

async function main() {
  console.log("\n🔧 Setting up Notion databases for ch-erawan-next\n");

  try {
    await setupCarsDatabase();
    await setupBlogDatabase();
    await setupStoriesDatabase();

    console.log("\n🎉 All databases configured successfully!\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
