import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAuditLogs } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const days = Number(req.nextUrl.searchParams.get("days") ?? 30);
  const resource = req.nextUrl.searchParams.get("resource") ?? undefined;
  const logs = await getAuditLogs({ days, resource, limit: 200 });
  return NextResponse.json(logs);
}
