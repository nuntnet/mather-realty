import { NextRequest, NextResponse } from "next/server";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics";

/**
 * POST /api/track — lightweight event tracking endpoint
 * Body: { event: "car_view"|"booking"|"contact"|"search", path?, brand?, model? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event as AnalyticsEventType;
    if (!event || !["car_view", "booking", "contact", "search"].includes(event)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    void trackEvent(event, {
      path: body.path ?? undefined,
      brand: body.brand ?? undefined,
      model: body.model ?? undefined,
      meta: body.meta ?? undefined,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
