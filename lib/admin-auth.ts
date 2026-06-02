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
    return NextResponse.json(
      { error: "Authentication not configured" },
      { status: 503 },
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

/**
 * Server-side landlord guard for /api/landlord/* and dashboard route handlers.
 *
 * Allows both "landlord" and "admin" roles through.
 * Returns the session on success (so callers can access session.user.id).
 *
 * Usage:
 *   const result = await requireLandlord();
 *   if (result instanceof NextResponse) return result;
 *   const { session } = result;
 */
export async function requireLandlord(): Promise<
  { session: NonNullable<Awaited<ReturnType<NonNullable<typeof auth>["api"]["getSession"]>>> } | NextResponse
> {
  if (!auth) {
    return NextResponse.json(
      { error: "Authentication not configured" },
      { status: 503 },
    );
  }

  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role as string | undefined;
  if (role !== "landlord" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { session };
}

/**
 * Lightweight boolean check — use inside Server Components / layout guards
 * where you want to redirect rather than return a response.
 */
export async function getSessionUser() {
  if (!auth) return null;
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  return session?.user ?? null;
}
