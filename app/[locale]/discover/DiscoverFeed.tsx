'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'
import type { Property } from '@/lib/notion-types'
import {
  Heart,
  Share2,
  MessageCircle,
  MapPin,
  ArrowLeft,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiscoverFeedProps {
  properties: Property[]
  locale: string
}

const AMENITY_ICONS: Record<string, string> = {
  Pool: '🏊',
  WiFi: '📶',
  Parking: '🚗',
  Gym: '💪',
  Furnished: '🛋️',
  AirCon: '❄️',
  Security: '🔒',
  EVCharger: '⚡',
  PetFriendly: '🐾',
}

function useSaved() {
  const [saved, setSaved] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = localStorage.getItem('doublen_saved')
      return new Set(raw ? JSON.parse(raw) : [])
    } catch { return new Set() }
  })

  const toggle = useCallback((id: string) => {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      try { localStorage.setItem('doublen_saved', JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  return { saved, toggle }
}

function PropertyCard({
  property,
  locale,
  isActive,
}: {
  property: Property
  locale: string
  isActive: boolean
}) {
  const router = useRouter()
  const { saved, toggle } = useSaved()
  const isSaved = saved.has(property.id)
  const [hearted, setHearted] = useState(false)
  const [shareToast, setShareToast] = useState(false)

  const title = property.title[locale] ?? property.title.en ?? property.slug
  const topAmenities = property.amenities.slice(0, 3)

  const handleSave = () => {
    toggle(property.id)
    if (!isSaved) {
      setHearted(true)
      setTimeout(() => setHearted(false), 600)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/properties/${property.slug}`
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2000)
      }
    } catch {}
  }

  const handleView = () => {
    router.push(`/properties/${property.slug}` as '/properties')
  }

  return (
    <section className="relative h-dvh w-full snap-start overflow-hidden flex flex-col justify-end flex-shrink-0">
      {/* Background image */}
      {property.coverImage ? (
        <Image
          src={property.coverImage}
          alt={title}
          fill
          className={cn(
            'object-cover transition-transform duration-700',
            isActive ? 'scale-100' : 'scale-105'
          )}
          priority={isActive}
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#297c3b] to-[#1d211c]" />
      )}

      {/* Dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 pointer-events-none" />

      {/* Right side actions */}
      <div className="absolute right-4 bottom-[220px] flex flex-col gap-5 z-20 items-center">
        {/* Save / Heart */}
        <button
          onClick={handleSave}
          className="flex flex-col items-center gap-1"
          aria-label={isSaved ? 'Unsave' : 'Save'}
        >
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all active:scale-90',
            isSaved ? 'bg-red-500/90' : 'bg-white/20 border border-white/30'
          )}>
            <Heart
              className={cn(
                'w-6 h-6 transition-all',
                isSaved ? 'fill-white text-white' : 'text-white',
                hearted && 'animate-ping-once'
              )}
            />
          </div>
          <span className="text-white text-xs font-medium drop-shadow">
            {isSaved ? 'Saved' : 'Save'}
          </span>
        </button>

        {/* Inquiry / Chat */}
        <button
          onClick={handleView}
          className="flex flex-col items-center gap-1"
          aria-label="Inquire"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-all">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow">Inquire</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1"
          aria-label="Share"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-all">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow">Share</span>
        </button>
      </div>

      {/* Share toast */}
      {shareToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-black/80 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
          Link copied!
        </div>
      )}

      {/* Property info card */}
      <div
        className={cn(
          'relative z-10 mx-4 mb-24 p-5 rounded-2xl shadow-2xl transition-all duration-500',
          'bg-white/15 backdrop-blur-xl border border-white/20',
          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        {/* Title + verified */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="text-white font-bold text-xl leading-tight flex-1">{title}</h2>
          {property.verifiedAt && (
            <CheckCircle2 className="w-5 h-5 text-[#65c170] shrink-0 mt-0.5" />
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-white/80 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{[property.district, property.city].filter(Boolean).join(', ')}</span>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-white/90 text-sm mb-3">
          <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.bedrooms}</span>
          <span className="text-white/40">·</span>
          <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.bathrooms}</span>
          <span className="text-white/40">·</span>
          <span className="flex items-center gap-1"><Maximize2 className="w-4 h-4" /> {property.sizeSqm} sqm</span>
        </div>

        {/* Amenity pills */}
        {topAmenities.length > 0 && (
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {topAmenities.map(a => (
              <span key={a} className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/20">
                {AMENITY_ICONS[a] ?? ''} {a}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/20">
                +{property.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider">Monthly Rent</p>
            <p className="text-white font-bold text-2xl">฿{property.priceTHB.toLocaleString()}</p>
          </div>
          <button
            onClick={handleView}
            className="bg-[#46a758] hover:bg-[#3d9a4f] active:scale-95 text-white font-semibold px-5 py-2.5 rounded-full shadow-lg transition-all flex items-center gap-1.5"
          >
            View
            <ChevronUp className="w-4 h-4 rotate-90" />
          </button>
        </div>
      </div>

      {/* Status badge */}
      {property.status === 'available' && (
        <div className="absolute top-20 left-4 z-20">
          <span className="bg-[#46a758]/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            ● Available
          </span>
        </div>
      )}
    </section>
  )
}

export default function DiscoverFeed({ properties, locale }: DiscoverFeedProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Track which card is active
  useEffect(() => {
    if (!containerRef.current) return

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index)
            if (!isNaN(idx)) setActiveIndex(idx)
          }
        })
      },
      { threshold: 0.6, root: containerRef.current }
    )

    const sections = containerRef.current.querySelectorAll('section[data-index]')
    sections.forEach(s => observerRef.current!.observe(s))

    return () => observerRef.current?.disconnect()
  }, [properties])

  if (properties.length === 0) {
    return (
      <div className="h-dvh flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">No properties available</p>
          <button onClick={() => router.back()} className="text-[#46a758] underline">Go back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-safe-top py-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <h1 className="text-white font-bold text-lg drop-shadow">
          Double<span className="text-[#65c170]">N</span> Realty
        </h1>

        {/* Dots indicator */}
        <div className="flex flex-col gap-1">
          {properties.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                'w-1 rounded-full transition-all duration-300',
                idx === activeIndex ? 'h-4 bg-[#46a758]' : 'h-1.5 bg-white/40'
              )}
            />
          ))}
        </div>
      </header>

      {/* Swipe feed */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Scrollbar hide */}
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        {properties.map((property, idx) => (
          <div key={property.id} data-index={idx} style={{ scrollSnapAlign: 'start' }}>
            <PropertyCard
              property={property}
              locale={locale}
              isActive={idx === activeIndex}
            />
          </div>
        ))}

        {/* End card */}
        <div
          className="h-dvh flex flex-col items-center justify-center bg-[#1d211c] snap-start"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="text-center space-y-4 px-8">
            <p className="text-4xl">🏠</p>
            <p className="text-white text-xl font-bold">That's all for now</p>
            <p className="text-[#cdd1cb] text-sm">More properties coming soon</p>
            <button
              onClick={() => router.push('/properties')}
              className="bg-[#46a758] text-white font-semibold px-6 py-3 rounded-full mt-4"
            >
              Browse all properties
            </button>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="absolute bottom-0 left-0 right-0 z-30 flex justify-around items-center px-4 pb-8 pt-3 bg-black/50 backdrop-blur-xl">
        <button
          onClick={() => router.push('/discover' as '/')}
          className="flex flex-col items-center gap-0.5 bg-[#46a758]/20 text-[#65c170] px-6 py-2 rounded-full"
        >
          <span className="text-lg">🔍</span>
          <span className="text-xs font-semibold">Explore</span>
        </button>
        <button
          onClick={() => router.push('/properties' as '/')}
          className="flex flex-col items-center gap-0.5 text-white/60 px-4 py-2"
        >
          <span className="text-lg">🏠</span>
          <span className="text-xs">Browse</span>
        </button>
        <button
          className="flex flex-col items-center gap-0.5 text-white/60 px-4 py-2"
        >
          <span className="text-lg">❤️</span>
          <span className="text-xs">Saved</span>
        </button>
      </nav>
    </div>
  )
}
