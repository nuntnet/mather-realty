import { NextRequest, NextResponse } from "next/server";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics";

const ALLOWED_EVENTS: AnalyticsEventType[] = ["car_view", "booking", "contact", "search"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, path, brand, model, meta } = body;
    if (!ALLOWED_EVENTS.includes(event)) {
      return NextResponse.json({ error: "invalid event" }, { status: 400 });
    }
    await trackEvent(event, { path, brand, model, meta });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
