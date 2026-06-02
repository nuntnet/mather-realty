import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { checkAuthRateLimit } from '@/lib/ratelimit'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '127.0.0.1'
}

async function validateAdminSession(req: NextRequest) {
  const sessionRes = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
    headers: { cookie: req.headers.get('cookie') ?? '' },
  }).catch(() => null)

  if (!sessionRes?.ok) return null
  const session = await sessionRes.json().catch(() => null)
  if (!session?.user || session.user.role !== 'admin') return null
  return session
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

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
    // i18n paths: match all routes except _next internals, static files, and api
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
