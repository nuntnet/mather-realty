import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET() {
  const dbId = process.env.NOTION_CONTACTS_DB_ID;

  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    dbId: dbId ? `${dbId.slice(0, 8)}...` : "NOT SET",
  };

  // Test 1: Can we read the database?
  try {
    const db = await notion.databases.retrieve({ database_id: dbId! });
    result.readTest = {
      status: "ok",
      title: (db as { title?: { plain_text: string }[] }).title?.[0]?.plain_text,
    };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    result.readTest = {
      status: "error",
      code: error.code,
      message: error.message,
    };
  }

  // Test 2: Try to create a test page
  try {
    const page = await notion.pages.create({
      parent: { database_id: dbId! },
      properties: {
        Name: { title: [{ text: { content: "TEST - Delete Me" } }] },
        Message: { rich_text: [{ text: { content: "This is a test message" } }] },
        Email: { email: "test@example.com" },
        Phone: { phone_number: "0812345678" },
        Branch: { rich_text: [{ text: { content: "Test Branch" } }] },
        "Submitted At": { date: { start: new Date().toISOString() } },
      },
    });
    result.createTest = {
      status: "ok",
      pageId: page.id,
      message: "Test page created successfully! Delete it from Notion.",
    };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string; body?: unknown };
    result.createTest = {
      status: "error",
      code: error.code,
      message: error.message,
      body: error.body,
    };
  }

  return NextResponse.json(result, { status: 200 });
}
