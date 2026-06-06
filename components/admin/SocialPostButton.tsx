'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Share2, ExternalLink, MessageCircle, Loader2, Check,
  Copy, Download, X,
} from 'lucide-react'

interface SocialPostButtonProps {
  propertyId: string
  propertySlug: string
  propertyTitle: string
  propertyCity?: string
  priceTHB: number
  coverImage?: string
  gallery?: string[]   // all property photos
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://doublen-realty.com'
const THB_TO_USD = 34

function buildCaption(data: SocialPostButtonProps, custom?: string): string {
  const usd = Math.round(data.priceTHB / THB_TO_USD)
  const url = `${SITE_URL}/en/properties/${data.propertySlug}`
  const city = data.propertyCity ? ` in ${data.propertyCity}` : ''
  const msg = custom ? `\n\n${custom}` : ''
  return `🏠 New Listing${city}: ${data.propertyTitle}

💰 ฿${data.priceTHB.toLocaleString()}/month (~$${usd.toLocaleString()} USD)

✅ Verified listing on DoubleN Realty — Thailand's expat rental platform.
🔗 ${url}${msg}

📞 Contact us to arrange a viewing!

#BangkokRental #ThailandExpat #ExpatLiving #ExpatThailand #DoubleNRealty${data.propertyCity ? ` #${data.propertyCity.replace(/\s/g, '')}` : ''}`
}

export default function SocialPostButton(props: SocialPostButtonProps) {
  const { propertySlug, coverImage, gallery = [] } = props
  const [open, setOpen] = useState(false)
  const [posting, setPosting] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [fbGroupUrl, setFbGroupUrl] = useState('')

  // All photos for the post
  const allPhotos = Array.from(new Set([
    ...(coverImage ? [coverImage] : []),
    ...gallery,
  ])).filter(Boolean).slice(0, 10) // FB allows up to 10 per post

  const caption = buildCaption(props, customMessage || undefined)
  const propertyUrl = `${SITE_URL}/en/properties/${propertySlug}`

  async function copyCaption() {
    await navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Caption copied! Now paste it in your Facebook Group post.')
  }

  function openFbGroup() {
    if (!fbGroupUrl && !confirm('No Facebook Group URL set. Open Facebook instead?')) return
    const target = fbGroupUrl || 'https://www.facebook.com'
    window.open(target, '_blank', 'noopener,noreferrer')
  }

  async function postToFbPage() {
    setPosting('fb_page')
    try {
      const res = await fetch('/api/admin/social', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: props.propertyId,
          propertySlug, propertyTitle: props.propertyTitle,
          propertyCity: props.propertyCity, priceTHB: props.priceTHB,
          coverImage, channels: ['facebook_page'],
          customMessage: customMessage || undefined,
        }),
      })
      const data = await res.json()
      if (data.results?.facebook_page?.success) {
        toast.success('Posted to Facebook Page!')
      } else {
        toast.error(data.results?.facebook_page?.error ?? 'Failed to post')
      }
    } catch (e) {
      toast.error('Error: ' + (e instanceof Error ? e.message : 'Unknown'))
    } finally {
      setPosting(null)
    }
  }

  async function postToLine() {
    setPosting('line')
    try {
      const res = await fetch('/api/admin/social', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: props.propertyId,
          propertySlug, propertyTitle: props.propertyTitle,
          propertyCity: props.propertyCity, priceTHB: props.priceTHB,
          coverImage, channels: ['line_notify'],
          customMessage: customMessage || undefined,
        }),
      })
      const data = await res.json()
      if (data.results?.line_notify?.success) {
        toast.success('Sent to LINE Notify!')
      } else {
        toast.error(data.results?.line_notify?.error ?? 'Failed to send')
      }
    } catch (e) {
      toast.error('Error: ' + (e instanceof Error ? e.message : 'Unknown'))
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
        Share
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 z-50 w-96 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Post to Social Media</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">

              {/* Custom message */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add Custom Message</label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Limited availability! Contact us today."
                  className="mt-1.5 w-full text-xs border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1E6B69]/20"
                />
              </div>

              {/* Caption preview */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Generated Caption</label>
                <pre className="mt-1.5 text-[11px] text-gray-600 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap font-sans leading-relaxed border border-gray-100 max-h-32 overflow-y-auto">
                  {caption}
                </pre>
                <button
                  onClick={copyCaption}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Caption'}
                </button>
              </div>

              {/* Photos for group post */}
              {allPhotos.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Photos ({allPhotos.length}) — click to download
                  </label>
                  <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                    {allPhotos.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        download={`property-photo-${i + 1}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group block"
                        title={`Download photo ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Download className="w-4 h-4 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Click each photo to download, then upload to your FB Group post</p>
                </div>
              )}

              {/* === FACEBOOK GROUP (Prepare & Go) === */}
              <div className="rounded-xl border border-[#1877F2]/20 bg-[#1877F2]/5 p-3 space-y-2.5">
                <p className="text-xs font-semibold text-[#1877F2]">📘 Facebook Group — Post manually</p>
                <div>
                  <label className="text-[10px] text-gray-500">Your group URL (optional)</label>
                  <input
                    type="url"
                    value={fbGroupUrl}
                    onChange={e => setFbGroupUrl(e.target.value)}
                    placeholder="https://www.facebook.com/groups/..."
                    className="mt-0.5 w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyCaption}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white border border-[#1877F2]/30 text-[#1877F2] text-xs font-medium hover:bg-[#1877F2]/5 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy caption'}
                  </button>
                  <button
                    onClick={openFbGroup}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-[#1877F2] text-white text-xs font-medium hover:bg-[#1569d8] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open Group
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  1. Copy caption → 2. Open Group → 3. Create post → paste caption → upload photos
                </p>
              </div>

              {/* === FACEBOOK PAGE (auto-post via API) === */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-600">📄 Facebook Page — Auto-post</p>
                <button
                  onClick={postToFbPage}
                  disabled={!!posting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#1569d8] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {posting === 'fb_page'
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <span className="font-bold text-sm">f</span>}
                  Post to Page (caption + photo)
                </button>
                <p className="text-[10px] text-gray-400">Posts automatically to your Facebook Page via Graph API</p>
              </div>

              {/* Facebook Share Dialog */}
              <div className="rounded-xl border border-gray-100 p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-600">🔗 Facebook Share Dialog</p>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#1877F2] text-[#1877F2] text-xs font-medium hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Share Link (popup) — choose profile/page/group
                </a>
                <p className="text-[10px] text-gray-400">Opens popup — Facebook auto-generates preview card from og: tags</p>
              </div>

              {/* LINE Notify */}
              <div className="rounded-xl border border-gray-100 p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-600">💚 LINE Notify</p>
                <button
                  onClick={postToLine}
                  disabled={!!posting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00B900] hover:bg-[#009900] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {posting === 'line'
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <MessageCircle className="w-3.5 h-3.5" />}
                  Send caption to LINE group
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
