import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { rentalPeriods, properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema: { rentalPeriods, properties } });
}

function buildCalendarHtml(
  propertyId: string,
  availableFrom: string | null,
  blockedRanges: { start: string; end: string }[]
): string {
  const blockedJson = JSON.stringify(blockedRanges);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://doublen-realty.com";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Availability Calendar</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #111827;
      padding: 16px;
    }
    h2 {
      font-size: 15px;
      font-weight: 600;
      color: #1a3c5e;
      margin-bottom: 12px;
    }
    .calendar {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .day-header {
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      padding: 4px 0;
    }
    .day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      border-radius: 4px;
      cursor: default;
    }
    .day.empty { background: transparent; }
    .day.available { background: #d1fae5; color: #065f46; }
    .day.blocked { background: #fee2e2; color: #991b1b; text-decoration: line-through; }
    .day.past { background: #f3f4f6; color: #9ca3af; }
    .legend {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      font-size: 11px;
      color: #6b7280;
    }
    .legend-item { display: flex; align-items: center; gap: 4px; }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }
    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .nav button {
      background: none;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 2px 8px;
      cursor: pointer;
      font-size: 14px;
      color: #374151;
    }
    .nav button:hover { background: #f3f4f6; }
    .nav span { font-size: 13px; font-weight: 600; color: #1a3c5e; }
    .footer {
      margin-top: 12px;
      font-size: 11px;
      color: #9ca3af;
      text-align: center;
    }
    .footer a { color: #1a3c5e; text-decoration: none; }
  </style>
</head>
<body>
  <h2>Availability Calendar</h2>
  <div class="nav">
    <button id="prev">&lsaquo;</button>
    <span id="month-label"></span>
    <button id="next">&rsaquo;</button>
  </div>
  <div class="calendar" id="calendar"></div>
  <div class="legend">
    <div class="legend-item"><div class="legend-dot" style="background:#d1fae5;"></div> Available</div>
    <div class="legend-item"><div class="legend-dot" style="background:#fee2e2;"></div> Booked</div>
    <div class="legend-item"><div class="legend-dot" style="background:#f3f4f6;"></div> Past</div>
  </div>
  <div class="footer">
    Powered by <a href="${siteUrl}" target="_blank" rel="noopener">DoubleN Realty</a>
  </div>
  <script>
    const blockedRanges = ${blockedJson};
    const availableFrom = ${availableFrom ? `"${availableFrom}"` : "null"};
    const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    function isBlocked(date) {
      const d = date.toISOString().slice(0, 10);
      return blockedRanges.some(r => d >= r.start && d <= r.end);
    }

    function isPast(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    }

    function isBeforeAvailableFrom(date) {
      if (!availableFrom) return false;
      return date.toISOString().slice(0, 10) < availableFrom;
    }

    let current = new Date();
    current.setDate(1);

    function render() {
      const cal = document.getElementById('calendar');
      const label = document.getElementById('month-label');
      label.textContent = MONTHS[current.getMonth()] + ' ' + current.getFullYear();

      cal.innerHTML = DAYS.map(d => '<div class="day-header">' + d + '</div>').join('');

      const firstDay = current.getDay();
      for (let i = 0; i < firstDay; i++) {
        cal.innerHTML += '<div class="day empty"></div>';
      }

      const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(current.getFullYear(), current.getMonth(), d);
        let cls = 'day ';
        if (isPast(date) || isBeforeAvailableFrom(date)) cls += 'past';
        else if (isBlocked(date)) cls += 'blocked';
        else cls += 'available';
        cal.innerHTML += '<div class="' + cls + '">' + d + '</div>';
      }
    }

    document.getElementById('prev').addEventListener('click', () => {
      current.setMonth(current.getMonth() - 1);
      render();
    });
    document.getElementById('next').addEventListener('click', () => {
      current.setMonth(current.getMonth() + 1);
      render();
    });

    render();
  </script>
</body>
</html>`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = getDb();

    const [periods, property] = await Promise.all([
      db
        .select({ startDate: rentalPeriods.startDate, endDate: rentalPeriods.endDate })
        .from(rentalPeriods)
        .where(eq(rentalPeriods.propertyId, id)),
      db
        .select({ availableFrom: properties.availableFrom })
        .from(properties)
        .where(eq(properties.id, id))
        .get(),
    ]);

    const html = buildCalendarHtml(
      id,
      property?.availableFrom ?? null,
      periods.map((p) => ({ start: p.startDate, end: p.endDate }))
    );

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "ALLOWALL",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error(`GET /api/properties/${id}/embed error:`, err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
