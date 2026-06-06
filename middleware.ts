import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { checkAuthRateLimit } from '@/lib/ratelimit'
import { routing } from './i18n/routing'
import { auth } from './lib/auth'

const intlMiddleware = createMiddleware(routing)

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '127.0.0.1'
}

async function validateAdminSession(req: NextRequest) {
  // Use auth SDK directly — avoids SSRF via req.nextUrl.origin (attacker-controlled)
  if (!auth) return null  // auth is null when TURSO_DATABASE_URL is not set
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) return null
    if ((session.user as { role?: string }).role !== 'admin') return null
    return session
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Standalone auth pages — not localized, bypass i18n middleware ──────────
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next()
  }

  // ── Auth rate limiting ─────────────────────────────────────────────────────
  if (pathname.startsWith('/api/auth')) {
    if (
      req.method === 'POST' &&
      (pathname.includes('sign-in') || pathname.includes('sign-up'))
    ) {
      const { success } = await checkAuthRateLimit(getClientIp(req))
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    }
    return NextResponse.next()
  }

  // ── Protect /api/admin/* ───────────────────────────────────────────────────
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie =
      req.cookies.get('better-auth.session_token') ??
      req.cookies.get('__Secure-better-auth.session_token')

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const session = await validateAdminSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.next()
  }

  // ── Protect /admin UI routes ───────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const sessionCookie =
      req.cookies.get('better-auth.session_token') ??
      req.cookies.get('__Secure-better-auth.session_token')

    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const session = await validateAdminSession(req)
    if (!session) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    return NextResponse.next()
  }

  // ── i18n routing for all other paths ──────────────────────────────────────
  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Admin and API paths (no locale prefix)
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/auth/:path*',
    // i18n paths: exclude _next, _vercel, api, icon, favicon, and static files
    '/((?!_next|_vercel|api|icon|favicon|apple-icon|.*\\..*).*)',
  ],
}
