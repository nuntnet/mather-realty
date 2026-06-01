import { NextRequest, NextResponse } from "next/server";
import { logFailedSearch } from "@/lib/notion";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const { query, page } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ ok: false });
    }
    // Fire and forget — don't await so the response is instant
    logFailedSearch(query.trim(), page ?? "");
    void trackEvent("search", { path: page ?? "/", meta: { query: query.trim() } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
