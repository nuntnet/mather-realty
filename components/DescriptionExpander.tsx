'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface DescriptionExpanderProps {
  text: string
}

export default function DescriptionExpander({ text }: DescriptionExpanderProps) {
  const [expanded, setExpanded] = useState(false)

  // Only show toggle if text is long enough to warrant collapsing
  const lines = text.split('\n').filter(Boolean)
  const isLong = lines.length > 4 || text.length > 400

  return (
    <div>
      <p
        className={`text-gray-600 leading-relaxed whitespace-pre-line prose prose-gray max-w-none transition-[max-height] ${
          !expanded && isLong ? 'line-clamp-4' : ''
        }`}
      >
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-2.5 flex items-center gap-1 text-sm font-semibold text-[#46a758] hover:text-[#297c3b] transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="w-4 h-4" />Show less</>
          ) : (
            <><ChevronDown className="w-4 h-4" />Read more</>
          )}
        </button>
      )}
    </div>
  )
}
