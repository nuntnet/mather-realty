'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Share2, ExternalLink, MessageCircle, Loader2, Check } from 'lucide-react'

interface SocialPostButtonProps {
  propertyId: string
  propertySlug: string
  propertyTitle: string
  propertyCity?: string
  priceTHB: number
  coverImage?: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://doublen-realty.com'

export default function SocialPostButton({
  propertyId, propertySlug, propertyTitle, propertyCity, priceTHB, coverImage,
}: SocialPostButtonProps) {
  const [open, setOpen] = useState(false)
  const [posting, setPosting] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState('')

  const propertyUrl = `${SITE_URL}/en/properties/${propertySlug}`
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`
  const fbGroupShareUrl = `https://www.facebook.com/dialog/share?app_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? ''}&href=${encodeURIComponent(propertyUrl)}&redirect_uri=${encodeURIComponent(propertyUrl)}`

  async function postTo(channels: string[]) {
    const key = channels.join('+')
    setPosting(key)
    try {
      const res = await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId, propertySlug, propertyTitle, propertyCity, priceTHB, coverImage,
          channels,
          customMessage: customMessage || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Posted to ${channels.join(' + ')} successfully!`)
      } else {
        const errors = Object.entries(data.results as Record<string, { error?: string }>)
          .filter(([, r]) => !r?.error === false)
          .map(([ch, r]) => `${ch}: ${r.error}`)
          .join(', ')
        toast.error(`Partial failure: ${errors}`)
      }
    } catch (e) {
      toast.error('Failed to post: ' + (e instanceof Error ? e.message : 'Unknown error'))
    } finally {
      setPosting(null)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share to Social
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Post to Social Media</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>

            {/* Custom message */}
            <div>
              <label className="text-xs font-medium text-gray-600">Add custom message (optional)</label>
              <textarea
                rows={2}
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder="e.g. Limited availability! Contact us today."
                className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Facebook Page (Graph API) */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Facebook Page (auto-post)</p>
              <button
                onClick={() => postTo(['facebook_page'])}
                disabled={!!posting}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#1569d8] text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {posting === 'facebook_page'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <span className="text-sm font-bold">f</span>}
                Post to Facebook Page
              </button>
            </div>

            {/* Facebook Share Dialog (client-side — works for groups) */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Facebook Share (browser popup)</p>
              <a
                href={fbShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#1877F2] text-[#1877F2] hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Share via Facebook Dialog
              </a>
              <p className="text-[10px] text-gray-400">Opens popup — you can choose personal profile, page, or group</p>
            </div>

            {/* LINE Notify */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">LINE Notify</p>
              <button
                onClick={() => postTo(['line_notify'])}
                disabled={!!posting}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#00B900] hover:bg-[#009900] text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {posting === 'line_notify'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <MessageCircle className="w-4 h-4" />}
                Send to LINE Notify
              </button>
            </div>

            {/* Post all */}
            <button
              onClick={() => postTo(['facebook_page', 'line_notify'])}
              disabled={!!posting}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#131F3C] hover:bg-[#1f2d52] text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {posting === 'facebook_page+line_notify'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Check className="w-4 h-4" />}
              Post to All Channels
            </button>
          </div>
        </>
      )}
    </div>
  )
}
