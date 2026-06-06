'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
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
  ChevronDown,
  Home,
  Compass,
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

/* ── Per-card photo carousel ──────────────────────────────────────────────── */
function PhotoCarousel({ property, isActive }: { property: Property; isActive: boolean }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false })
  const [photoIndex, setPhotoIndex] = useState(0)

  const photos = useMemo(() => {
    const all = new Set<string>()
    if (property.coverImage) all.add(property.coverImage)
    property.gallery.forEach(u => all.add(u))
    if (property.galleryCategories) {
      const { exterior, interior, community } = property.galleryCategories
      ;[...exterior, ...interior, ...community].forEach(u => all.add(u))
    }
    return [...all].filter(Boolean)
  }, [property])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setPhotoIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  // Reset to first photo when card becomes active
  useEffect(() => {
    if (isActive && emblaApi) emblaApi.scrollTo(0, true)
  }, [isActive, emblaApi])

  return (
    <>
      {/* Embla viewport */}
      <div ref={emblaRef} className="absolute inset-0 overflow-hidden">
        <div className="flex h-full">
          {photos.length > 0 ? photos.map((img, idx) => (
            <div key={idx} className="relative flex-shrink-0 w-full h-full">
              <Image
                src={img}
                alt={`Photo ${idx + 1}`}
                fill
                className={cn(
                  'object-cover transition-transform duration-700',
                  isActive && idx === photoIndex ? 'scale-100' : 'scale-105'
                )}
                priority={isActive && idx === 0}
                sizes="100vw"
                draggable={false}
              />
            </div>
          )) : (
            <div className="relative flex-shrink-0 w-full h-full bg-gradient-to-br from-[#124E4C] to-[#1d211c]" />
          )}
        </div>
      </div>

      {/* Story-style progress bars — below header
          mobile: top-16 (64px, below 56px header)
          desktop: top-28 (112px, below stacked chevron header ~100px) */}
      {photos.length > 1 && (
        <div className="absolute top-16 lg:top-28 left-4 right-4 z-20 flex gap-1">
          {photos.slice(0, 12).map((_, idx) => (
            <div
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={cn(
                'flex-1 h-[3px] rounded-full transition-all duration-300 cursor-pointer',
                idx === photoIndex ? 'bg-white' : idx < photoIndex ? 'bg-white/70' : 'bg-white/30'
              )}
            />
          ))}
        </div>
      )}

      {/* Photo count badge */}
      {photos.length > 1 && (
        <div className="absolute top-[4.5rem] right-4 z-20 hidden">
          {/* hidden — progress bars replace this */}
        </div>
      )}
    </>
  )
}

/* ── Property card ─────────────────────────────────────────────────────────── */
function PropertyCard({
  property,
  locale,
  isActive,
  isDesktop = false,
}: {
  property: Property
  locale: string
  isActive: boolean
  isDesktop?: boolean
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
    <section className={cn(
      'relative w-full snap-start overflow-hidden flex flex-col justify-end flex-shrink-0',
      isDesktop ? 'h-full' : 'h-dvh'
    )}>

      {/* ── Swipeable photo carousel ── */}
      <PhotoCarousel property={property} isActive={isActive} />

      {/* Dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/35 pointer-events-none z-10" />

      {/* Status badge — below progress bars */}
      {property.status === 'available' && (
        <div className="absolute top-[5.5rem] lg:top-36 left-4 z-20">
          <span className="bg-[#1E6B69]/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            ● Available
          </span>
        </div>
      )}

      {/* Right side actions — mobile, positioned above the info card */}
      <div className={cn(
        'absolute right-4 bottom-[340px] flex flex-col gap-4 z-20 items-center',
        isDesktop && 'hidden'
      )}>
        <button onClick={handleSave} className="flex flex-col items-center gap-1" aria-label={isSaved ? 'Unsave' : 'Save'}>
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all active:scale-90',
            isSaved ? 'bg-red-500/90' : 'bg-white/20 border border-white/30'
          )}>
            <Heart className={cn('w-6 h-6 transition-all', isSaved ? 'fill-white text-white' : 'text-white', hearted && 'scale-125')} />
          </div>
          <span className="text-white text-xs font-medium drop-shadow">{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button onClick={handleView} className="flex flex-col items-center gap-1" aria-label="Inquire">
          <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-all">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow">Inquire</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1" aria-label="Share">
          <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-all">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow">Share</span>
        </button>
      </div>

      {shareToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-black/80 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
          Link copied!
        </div>
      )}

      {/* Property info card — mobile */}
      <div
        onClick={handleView}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleView()}
        aria-label={`View ${title}`}
        className={cn(
          'relative z-20 mx-3 mb-24 px-4 py-3.5 rounded-2xl shadow-2xl transition-all duration-500 cursor-pointer',
          'bg-black/55 backdrop-blur-xl border border-white/15 active:scale-[0.98]',
          isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          isDesktop && 'hidden'
        )}
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h2 className="text-white font-bold text-lg leading-tight flex-1">{title}</h2>
          {property.verifiedAt && <CheckCircle2 className="w-4 h-4 text-[#4DB5B2] shrink-0 mt-0.5" />}
        </div>

        {/* Location + specs in one compact row */}
        <div className="flex items-center gap-3 text-white/70 text-xs mb-2.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {[property.district, property.city].filter(Boolean).join(', ')}
          </span>
          <span className="text-white/30">·</span>
          <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>
          <span className="text-white/30">·</span>
          <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>
          <span className="text-white/30">·</span>
          <span>{property.sizeSqm}m²</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <p className="text-white font-bold text-xl">฿{property.priceTHB.toLocaleString()}
            <span className="text-white/50 text-xs font-normal ml-1">/mo</span>
          </p>
          <div className="flex items-center gap-1 text-[#4DB5B2] text-xs font-semibold">
            View detail <ChevronUp className="w-3.5 h-3.5 rotate-90" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Main feed ─────────────────────────────────────────────────────────────── */
export default function DiscoverFeed({ properties, locale }: DiscoverFeedProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0
  }, [])

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
    const sections = containerRef.current.querySelectorAll('[data-index]')
    sections.forEach(s => observerRef.current!.observe(s))
    return () => observerRef.current?.disconnect()
  }, [properties])

  const scrollTo = (idx: number) => {
    setActiveIndex(idx)
    containerRef.current?.querySelectorAll('[data-index]')[idx]?.scrollIntoView({ behavior: 'smooth' })
  }

  if (properties.length === 0) {
    return (
      <div className="h-dvh flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">No properties available</p>
          <button onClick={() => router.back()} className="text-[#1E6B69] underline">Go back</button>
        </div>
      </div>
    )
  }

  const activeProperty = properties[activeIndex]

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-hidden flex">

      {/* ── Desktop sidebar ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-white font-bold text-base">
            Double<span className="text-[#4DB5B2]">N</span> Realty
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wider px-2 pb-1">Properties</p>
          {properties.map((p, idx) => {
            const ptitle = p.title[locale] ?? p.title.en ?? p.slug
            return (
              <button key={p.id} onClick={() => scrollTo(idx)}
                className={cn('w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all',
                  idx === activeIndex ? 'bg-[#1E6B69]/20 border border-[#1E6B69]/40' : 'hover:bg-white/5'
                )}>
                {p.coverImage && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{ptitle}</p>
                  <p className="text-[#4DB5B2] text-xs mt-0.5 font-medium">฿{p.priceTHB.toLocaleString()}/mo</p>
                </div>
                {idx === activeIndex && <div className="w-1.5 h-1.5 rounded-full bg-[#1E6B69] shrink-0" />}
              </button>
            )
          })}
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2">
          <button onClick={() => router.push('/properties')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors">
            <Home className="w-4 h-4" /> Browse
          </button>
          <button onClick={() => router.push('/discover' as '/')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1E6B69]/20 text-[#4DB5B2] text-xs font-medium">
            <Compass className="w-4 h-4" /> Discover
          </button>
        </div>
      </aside>

      {/* ── Feed ─────────────────────────────────────── */}
      <div className="flex-1 flex relative overflow-hidden">
        <div className="relative overflow-hidden bg-black w-full h-full">

          {/* Header */}
          <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
            <button onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center lg:hidden"
              aria-label="Back">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="hidden lg:block w-10" />

            <h1 className="text-white font-bold text-base drop-shadow lg:hidden">
              Double<span className="text-[#4DB5B2]">N</span> Realty
            </h1>
            {/* counter removed — sidebar shows "1 of N properties" */}
            <div className="hidden lg:block w-10" />

            {/* Mobile: vertical dots for property progress */}
            <div className="flex flex-col gap-1 lg:hidden">
              {properties.slice(0, 8).map((_, idx) => (
                <div key={idx} onClick={() => scrollTo(idx)}
                  className={cn('w-1 rounded-full transition-all duration-300 cursor-pointer',
                    idx === activeIndex ? 'h-4 bg-[#1E6B69]' : 'h-1.5 bg-white/40'
                  )} />
              ))}
            </div>

            {/* Desktop: up/down nav */}
            <div className="hidden lg:flex flex-col gap-1.5">
              <button onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30"
                disabled={activeIndex === 0}>
                <ChevronUp className="w-4 h-4 text-white" />
              </button>
              <button onClick={() => scrollTo(Math.min(properties.length - 1, activeIndex + 1))}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30"
                disabled={activeIndex === properties.length - 1}>
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
            </div>
          </header>

          {/* Vertical snap feed */}
          <div ref={containerRef}
            className={cn('h-full overflow-y-scroll snap-y snap-mandatory', isDesktop && 'flex flex-col')}
            style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}>
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>

            {properties.map((property, idx) => (
              <div key={property.id} data-index={idx}
                className={isDesktop ? 'h-full' : 'h-dvh'}
                style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                <PropertyCard property={property} locale={locale} isActive={idx === activeIndex} isDesktop={isDesktop} />
              </div>
            ))}

            {/* End card */}
            <div className={cn(isDesktop ? 'h-full' : 'h-dvh', 'flex flex-col items-center justify-center bg-[#1d211c]')}
              style={{ scrollSnapAlign: 'start' }}>
              <div className="text-center space-y-4 px-8">
                <Home className="w-12 h-12 text-[#1E6B69] mx-auto" />
                <p className="text-white text-xl font-bold">That&apos;s all for now</p>
                <p className="text-[#cdd1cb] text-sm">More properties coming soon</p>
                <button onClick={() => router.push('/properties')}
                  className="bg-[#1E6B69] text-white font-semibold px-6 py-3 rounded-full mt-4">
                  Browse all properties
                </button>
              </div>
            </div>
          </div>

          {/* Bottom nav — mobile */}
          <nav className="absolute bottom-0 left-0 right-0 z-30 flex justify-around items-center px-4 pb-8 pt-3 bg-black/60 backdrop-blur-xl lg:hidden">
            <button onClick={() => router.push('/discover' as '/')}
              className="flex flex-col items-center gap-0.5 bg-[#1E6B69]/20 text-[#4DB5B2] px-5 py-2 rounded-full">
              <Compass className="w-5 h-5" />
              <span className="text-xs font-semibold">Explore</span>
            </button>
            <button onClick={() => router.push('/properties' as '/')}
              className="flex flex-col items-center gap-0.5 text-white/60 px-4 py-2">
              <Home className="w-5 h-5" />
              <span className="text-xs">Browse</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 text-white/60 px-4 py-2">
              <Heart className="w-5 h-5" />
              <span className="text-xs">Saved</span>
            </button>
          </nav>
        </div>

        {/* Desktop right panel */}
        {activeProperty && (
          <div className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 gap-4 p-6 overflow-y-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-white font-bold text-lg leading-snug">
                {activeProperty.title[locale] ?? activeProperty.title.en}
              </h3>
              <p className="text-[#4DB5B2] text-2xl font-bold">
                ฿{activeProperty.priceTHB.toLocaleString()}
                <span className="text-white/50 text-sm font-normal">/mo</span>
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: <Bed className="w-4 h-4 mx-auto mb-1 text-[#4DB5B2]" />, val: activeProperty.bedrooms, label: 'Bed' },
                  { icon: <Bath className="w-4 h-4 mx-auto mb-1 text-[#4DB5B2]" />, val: activeProperty.bathrooms, label: 'Bath' },
                  { icon: <Maximize2 className="w-4 h-4 mx-auto mb-1 text-[#4DB5B2]" />, val: activeProperty.sizeSqm, label: 'sqm' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl py-2.5">
                    {s.icon}
                    <p className="text-white font-bold text-sm">{s.val}</p>
                    <p className="text-white/40 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeProperty.amenities.slice(0, 4).map(a => (
                  <span key={a} className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push(`/properties/${activeProperty.slug}#inquiry` as '/properties')}
              className="w-full bg-[#1E6B69] hover:bg-[#18605E] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Schedule Viewing
            </button>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm transition-colors">
                <Heart className="w-4 h-4" /> Save
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            <p className="text-white/30 text-xs text-center">
              {activeIndex + 1} of {properties.length} properties
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
