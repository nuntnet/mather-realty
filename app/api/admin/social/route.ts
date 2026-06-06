/**
 * POST /api/admin/social
 *
 * Post a property listing to social media channels.
 *
 * Supported:
 *  - Facebook Page (Graph API)
 *  - LINE Notify (webhook)
 *
 * Facebook Group: use client-side Share Dialog (no server API needed)
 *
 * Required env vars:
 *  FACEBOOK_PAGE_ID          — Page ID (not username)
 *  FACEBOOK_PAGE_ACCESS_TOKEN — Long-lived Page Access Token
 *  LINE_NOTIFY_TOKEN          — LINE Notify token for LINE group/channel
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

const postSchema = z.object({
  propertyId: z.string(),
  propertySlug: z.string(),
  propertyTitle: z.string(),
  propertyCity: z.string().optional(),
  priceTHB: z.number(),
  coverImage: z.string().url().optional(),
  channels: z.array(z.enum(['facebook_page', 'line_notify'])),
  customMessage: z.string().optional(),
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://doublen-realty.com'

function buildPostMessage(data: z.infer<typeof postSchema>): string {
  const priceUsd = Math.round(data.priceTHB / 34)
  const url = `${SITE_URL}/en/properties/${data.propertySlug}`
  const city = data.propertyCity ? ` in ${data.propertyCity}` : ''
  const custom = data.customMessage ? `\n\n${data.customMessage}` : ''

  return `🏠 New Listing${city}: ${data.propertyTitle}

💰 ฿${data.priceTHB.toLocaleString()}/month (~$${priceUsd.toLocaleString()} USD)

✅ Verified listing on DoubleN Realty — Thailand's expat rental platform.

🔗 View property: ${url}${custom}

#BangkokRental #ThailandExpat #ExpatLiving #DoubleNRealty`
}

async function postToFacebookPage(message: string, imageUrl?: string): Promise<{ success: boolean; postId?: string; error?: string }> {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN

  if (!pageId || !token) {
    return { success: false, error: 'FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN not configured' }
  }

  try {
    let endpoint: string
    let body: Record<string, string>

    if (imageUrl) {
      // Post with photo
      endpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`
      body = { url: imageUrl, caption: message, access_token: token }
    } else {
      // Text/link post
      endpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`
      body = { message, access_token: token }
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      return { success: false, error: data.error?.message ?? `HTTP ${res.status}` }
    }

    return { success: true, postId: data.id ?? data.post_id }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

async function postToLineNotify(message: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.LINE_NOTIFY_TOKEN
  if (!token) {
    return { success: false, error: 'LINE_NOTIFY_TOKEN not configured' }
  }

  try {
    const params = new URLSearchParams({ message })
    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { success: false, error: data.message ?? `HTTP ${res.status}` }
    }

    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const data = parsed.data
  const message = buildPostMessage(data)
  const results: Record<string, { success: boolean; postId?: string; error?: string }> = {}

  await Promise.all(
    data.channels.map(async (channel) => {
      if (channel === 'facebook_page') {
        results.facebook_page = await postToFacebookPage(message, data.coverImage)
      } else if (channel === 'line_notify') {
        results.line_notify = await postToLineNotify(message)
      }
    })
  )

  const allOk = Object.values(results).every(r => r.success)

  return NextResponse.json({
    success: allOk,
    message,
    results,
  }, { status: allOk ? 200 : 207 })
}
