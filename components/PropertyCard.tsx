'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Bed, Bath, Maximize2, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: {
    id: string
    slug: string
    title: Record<string, string>
    city: string
    district: string
    priceTHB: number
    bedrooms: number
    bathrooms: number
    sizeSqm: number
    coverImage: string
    gallery?: string[]
    status: string
    amenities: string[]
    tags?: string[]
    verifiedAt: string | null
    availableFrom: string | null
    listingScore: number
  }
  locale: string
  view?: 'grid' | 'list'
}

const STATUS_CONFIG: Record<string, { label: string; className: string; barClass: string }> = {
  available: {
    label: 'Available',
    className: 'bg-[#ebf9eb] text-[#297c3b] border border-[#b2e5b4]',
    barClass: 'bg-[#46a758]',
  },
  rented: {
    label: 'Rented',
    className: 'bg-[#f1f4f0] text-[#5e6360] border border-[#d9ddd8]',
    barClass: 'bg-[#898e87]',
  },
  coming_soon: {
    label: 'Coming Soon',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    barClass: 'bg-amber-400',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    barClass: 'bg-[#c9f0ca]',
  },
}

function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(price)
}

function getSavedIds(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('saved_properties') ?? '[]') }
  catch { return [] }
}

function toggleSaved(id: string): boolean {
  const saved = getSavedIds()
  const idx = saved.indexOf(id)
  if (idx === -1) { saved.push(id) } else { saved.splice(idx, 1) }
  localStorage.setItem('saved_properties', JSON.stringify(saved))
  return idx === -1
}

// ── Swipeable photo carousel ──────────────────────────────────────────────────
function CardCarousel({
  images,
  title,
  slug,
  locale,
  statusLabel,
  statusClass,
  typeBadge,
  isList,
}: {
  images: string[]
  title: string
  slug: string
  locale: string
  statusLabel: string
  statusClass: string
  typeBadge: string | null
  isList: boolean
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false })
  const [activeIdx, setActiveIdx] = useState(0)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (!emblaApi) return
    const update = () => setActiveIdx(emblaApi.selectedScrollSnap())
    emblaApi.on('select', update)
    return () => { emblaApi.off('select', update) }
  }, [emblaApi])

  const scrollPrev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); emblaApi?.scrollPrev() }
  const scrollNext = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); emblaApi?.scrollNext() }

  const hasMultiple = images.length > 1

  return (
    <Link
      href={`/properties/${slug}`}
      locale={locale as Parameters<typeof Link>[0]['locale']}
      className={cn(
        'relative block shrink-0 overflow-hidden',
        isList ? 'w-64 h-full min-h-[180px]' : 'w-full',
      )}
      tabIndex={-1}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        ref={emblaRef}
        className={cn('overflow-hidden', isList ? 'h-full' : 'aspect-[4/3]')}
      >
        <div className="flex h-full">
          {images.map((img, idx) => (
            <div key={idx} className="relative flex-shrink-0 w-full h-full">
              <Image
                src={img}
                alt={`${title} photo ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes={isList ? '256px' : '(max-width:768px) 100vw, 400px'}
                className={cn(
                  'object-cover transition-transform duration-500',
                  idx === activeIdx && !isList ? 'scale-100' : 'scale-105',
                )}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prev/Next arrows — show on hover (desktop) or always (mobile) */}
      {hasMultiple && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Previous photo"
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity',
              hovering ? 'opacity-100' : 'opacity-0 sm:opacity-0',
            )}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next photo"
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10 size-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity',
              hovering ? 'opacity-100' : 'opacity-0 sm:opacity-0',
            )}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-10 flex gap-1">
            {images.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'rounded-full transition-all duration-200',
                  idx === activeIdx
                    ? 'w-3.5 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50',
                )}
              />
            ))}
            {images.length > 5 && (
              <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            )}
          </div>

          {/* Photo counter */}
          <div className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            {activeIdx + 1}/{images.length}
          </div>
        </>
      )}

      {/* Type badge — top-left */}
      {typeBadge && (
        <span className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {typeBadge}
        </span>
      )}

      {/* Status badge — bottom-left */}
      <span className={cn('absolute bottom-2 left-2 z-10 text-xs font-medium px-2 py-0.5 rounded-full border', statusClass)}>
        {statusLabel}
      </span>
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PropertyCard({ property, locale, view = 'grid' }: PropertyCardProps) {
  const t = useTranslations('property')

  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return getSavedIds().includes(property.id)
  })

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(toggleSaved(property.id))
  }, [property.id])

  const title = property.title[locale] ?? property.title['en'] ?? ''
  const statusCfg = STATUS_CONFIG[property.status] ?? STATUS_CONFIG['available']
  const topAmenities = property.amenities.slice(0, 3)
  const isList = view === 'list'
  const typeBadge = property.tags?.[0] ?? null

  // Build image list: cover + up to 4 gallery photos
  const images = [
    property.coverImage,
    ...(property.gallery ?? []).filter(img => img !== property.coverImage).slice(0, 4),
  ].filter(Boolean)

  return (
    <article
      className={cn(
        'group relative rounded-2xl bg-white shadow-sm border border-[#e2e5e0] overflow-hidden',
        'transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-[#46a758]/10',
        'w-full',
        isList ? 'flex flex-row' : 'flex flex-col',
      )}
    >
      {/* Status bar */}
      <div className={cn('h-1 w-full shrink-0', statusCfg.barClass)} />

      {/* Swipeable photo carousel */}
      <CardCarousel
        images={images}
        title={title}
        slug={property.slug}
        locale={locale}
        statusLabel={t(`status.${property.status}`, { fallback: statusCfg.label })}
        statusClass={statusCfg.className}
        typeBadge={typeBadge}
        isList={isList}
      />

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title & location */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/properties/${property.slug}`}
            locale={locale as Parameters<typeof Link>[0]['locale']}
            className="block"
          >
            <h3
              className="font-semibold text-[#1d211c] text-base leading-snug line-clamp-2 hover:text-[#297c3b] transition-colors"
              title={title}
            >
              {title}
            </h3>
          </Link>
          <p className="text-sm text-[#898e87] mt-0.5 truncate">
            {[property.district, property.city].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#297c3b]">
            {formatPrice(property.priceTHB, locale)}
          </span>
          <span className="text-sm text-[#898e87]">{t('perMonth')}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-[#5e6360]">
          <span className="flex items-center gap-1">
            <Bed className="size-4 text-[#898e87]" />{property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-4 text-[#898e87]" />{property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 className="size-4 text-[#898e87]" />{property.sizeSqm} {t('sqm')}
          </span>
        </div>

        {/* Amenity pills */}
        {topAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topAmenities.map((a) => (
              <Badge key={a} variant="secondary" className="text-xs font-normal text-[#5e6360]">
                {t(`amenities.${a}`, { fallback: a })}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal text-[#898e87]">
                +{property.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Available from */}
        {property.availableFrom && property.status === 'coming_soon' && (
          <p className="flex items-center gap-1.5 text-xs text-amber-700">
            <CalendarDays className="size-3.5" />
            {t('availableFrom')}{' '}
            {new Date(property.availableFrom).toLocaleDateString(locale, {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
        )}

        {/* CTA + Save */}
        <div className="flex items-center gap-2 pt-1 mt-auto">
          <Button
            asChild size="sm" variant="default"
            className="flex-1 h-11 text-sm bg-[#46a758] hover:bg-[#3d9a4f] text-white shadow-sm"
          >
            <Link href={`/properties/${property.slug}#inquiry`} locale={locale as Parameters<typeof Link>[0]['locale']}>
              {t('scheduleViewing')}
            </Link>
          </Button>
          <button
            onClick={handleSave}
            aria-label={isSaved ? t('saved') : t('save')}
            className={cn(
              'size-11 rounded-xl flex items-center justify-center border transition-colors',
              isSaved
                ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                : 'bg-white border-[#d9ddd8] text-[#898e87] hover:bg-[#f1f4f0] hover:text-red-400',
            )}
          >
            <Heart className={cn('size-5', isSaved && 'fill-current')} />
          </button>
        </div>
      </div>
    </article>
  )
}
