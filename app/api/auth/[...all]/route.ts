import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

function notConfigured() {
  return NextResponse.json(
    { error: "Auth not configured — set TURSO_DATABASE_URL and BETTER_AUTH_SECRET" },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
  if (!auth) return notConfigured();
  return toNextJsHandler(auth).GET(req);
}

export async function POST(req: NextRequest) {
  if (!auth) return notConfigured();
  return toNextJsHandler(auth).POST(req);
}
