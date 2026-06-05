'use client'

import { useState, useCallback } from 'react'
import { Share2, Check } from 'lucide-react'

interface PropertyDetailActionsProps {
  title: string
  /** glass — circular frosted button for use over hero images */
  variant?: 'default' | 'glass'
}

export default function PropertyDetailActions({
  title,
  variant = 'default',
}: PropertyDetailActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled or error
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }, [title])

  if (variant === 'glass') {
    return (
      <button
        onClick={handleShare}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-black/25 backdrop-blur-sm border border-white/20 text-white hover:bg-black/40 transition-colors"
        aria-label="Share this property"
      >
        {copied ? (
          <Check className="w-4.5 h-4.5 text-green-300" />
        ) : (
          <Share2 className="w-4.5 h-4.5" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0"
      aria-label="Share this property"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="hidden sm:inline text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </>
      )}
    </button>
  )
}
