import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Server-side admin guard for /api/admin/* route handlers.
 *
 * Returns `null` when the caller is an authenticated admin (proceed),
 * or a `NextResponse` (401/403/503) to return early when not.
 *
 * Usage:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (!auth) {
    // Turso not configured — auth disabled. Fail closed.
    return NextResponse.json(
      { error: "Authentication not configured" },
      { status: 503 }
    );
  }

  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
