import { NextResponse } from "next/server";

/**
 * Proxy for OpenFreeMap style.json — bypasses browser CORS restriction.
 * GET /api/map-style?theme=dark|light
 */
export const revalidate = 86400; // cache 24h

const STYLES: Record<string, string> = {
  dark:  "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/positron",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const theme = searchParams.get("theme") === "light" ? "light" : "dark";
  const upstream = STYLES[theme];

  try {
    const res = await fetch(upstream, {
      headers: { "User-Agent": "ch-erawan-next/1.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error(`upstream ${res.status}`);

    const json = await res.json();

    return NextResponse.json(json, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[map-style proxy]", err);
    return NextResponse.json({ error: "Failed to fetch map style" }, { status: 502 });
  }
}
