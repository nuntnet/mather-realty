import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasApiKey: !!process.env.NOTION_API_KEY,
      carsDb: process.env.NOTION_CARS_DB_ID?.slice(0, 8) + "...",
      blogDb: process.env.NOTION_BLOG_DB_ID?.slice(0, 8) + "...",
      storiesDb: process.env.NOTION_STORIES_DB_ID?.slice(0, 8) + "...",
    },
  };

  // Test each database
  const dbTests = [
    { name: "cars", id: process.env.NOTION_CARS_DB_ID! },
    { name: "blog", id: process.env.NOTION_BLOG_DB_ID! },
    { name: "stories", id: process.env.NOTION_STORIES_DB_ID! },
  ];

  for (const db of dbTests) {
    try {
      const dbInfo = await notion.databases.retrieve({ database_id: db.id });
      results[db.name] = {
        status: "ok",
        title: (dbInfo as any).title?.[0]?.plain_text || "untitled",
        properties: Object.keys((dbInfo as any).properties || {}),
      };
    } catch (err: any) {
      results[db.name] = {
        status: "error",
        code: err.code,
        message: err.message,
      };
    }
  }

  return NextResponse.json(results, { status: 200 });
}
