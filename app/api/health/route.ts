import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { createClient } from "@libsql/client";

export const dynamic = "force-dynamic";

async function checkNotion(): Promise<"ok" | "error" | "skipped"> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_CARS_DB_ID) {
    return "skipped";
  }
  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    await notion.databases.retrieve({
      database_id: process.env.NOTION_CARS_DB_ID,
    });
    return "ok";
  } catch {
    return "error";
  }
}

async function checkTurso(): Promise<"ok" | "error" | "skipped"> {
  if (!process.env.TURSO_DATABASE_URL) {
    return "skipped";
  }
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    await client.execute("SELECT 1");
    return "ok";
  } catch {
    return "error";
  }
}

export async function GET() {
  const [notion, turso] = await Promise.all([checkNotion(), checkTurso()]);
  const healthy = notion !== "error" && turso !== "error";

  return NextResponse.json(
    { notion, turso, ok: healthy },
    { status: healthy ? 200 : 503 }
  );
}
