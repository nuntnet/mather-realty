import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = req.cookies.get("better-auth.session_token")
      ?? req.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie?.value) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate session with auth API
    const sessionRes = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
    }).catch(() => null);

    if (!sessionRes?.ok) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await sessionRes.json().catch(() => null);

    // Must be admin role
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
