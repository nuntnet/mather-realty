'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Bed, Bath, Maximize2, ShieldCheck, CalendarDays } from 'lucide-react'
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
    className: 'bg-green-100 text-green-800 border-green-200',
    barClass: 'bg-green-500',
  },
  rented: {
    label: 'Rented',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    barClass: 'bg-gray-400',
  },
  coming_soon: {
    label: 'Coming Soon',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    barClass: 'bg-orange-400',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    barClass: 'bg-yellow-400',
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
  try {
    return JSON.parse(localStorage.getItem('saved_properties') ?? '[]')
  } catch {
    return []
  }
}

function toggleSaved(id: string): boolean {
  const saved = getSavedIds()
  const idx = saved.indexOf(id)
  if (idx === -1) {
    saved.push(id)
    localStorage.setItem('saved_properties', JSON.stringify(saved))
    return true
  } else {
    saved.splice(idx, 1)
    localStorage.setItem('saved_properties', JSON.stringify(saved))
    return false
  }
}

export default function PropertyCard({ property, locale, view = 'grid' }: PropertyCardProps) {
  const t = useTranslations('property')

  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return getSavedIds().includes(property.id)
  })

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const next = toggleSaved(property.id)
      setIsSaved(next)
    },
    [property.id],
  )

  const title = property.title[locale] ?? property.title['en'] ?? ''
  const statusCfg = STATUS_CONFIG[property.status] ?? STATUS_CONFIG['available']
  const topAmenities = property.amenities.slice(0, 3)

  const isList = view === 'list'

  const typeBadge = property.tags?.[0] ?? null

  return (
    <article
      className={cn(
        'group relative rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden',
        'transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl',
        'w-full',
        isList ? 'flex flex-row' : 'flex flex-col',
      )}
    >
      {/* Colored status bar at top */}
      <div className={cn('h-1 w-full shrink-0', statusCfg.barClass)} />

      {/* Image container */}
      <Link
        href={`/properties/${property.slug}`}
        locale={locale as Parameters<typeof Link>[0]['locale']}
        className={cn(
          'relative block shrink-0 overflow-hidden',
          isList ? 'w-64 h-full min-h-[180px]' : 'w-full',
        )}
        tabIndex={-1}
        aria-hidden
      >
        <div className={cn('relative', isList ? 'h-full' : 'aspect-[4/3]')}>
          {property.coverImage ? (
            <Image
              src={property.coverImage}
              alt={title}
              fill
              sizes={isList ? '256px' : '(max-width:768px) 100vw, 400px'}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-4xl">🏠</span>
            </div>
          )}
        </div>

        {/* Property type badge — top-left */}
        {typeBadge && (
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {typeBadge}
          </span>
        )}

        {/* Verified badge */}
        {property.verifiedAt && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-semibold px-2 py-1 rounded-full border border-blue-200 shadow-sm">
            <ShieldCheck className="size-3.5 text-blue-600" />
            {t('verified')}
          </span>
        )}

        {/* Status badge */}
        <span
          className={cn(
            'absolute bottom-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full border',
            statusCfg.className,
          )}
        >
          {t(`status.${property.status}`, { fallback: statusCfg.label })}
        </span>
      </Link>

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
              className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 hover:text-blue-700 transition-colors"
              title={title}
            >
              {title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-0.5 truncate">
            {[property.district, property.city].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Price — more prominent */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-blue-700">
            {formatPrice(property.priceTHB, locale)}
          </span>
          <span className="text-sm text-gray-500">{t('perMonth')}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Bed className="size-4 text-gray-400" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-4 text-gray-400" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 className="size-4 text-gray-400" />
            {property.sizeSqm} {t('sqm')}
          </span>
        </div>

        {/* Amenity pills */}
        {topAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topAmenities.map((a) => (
              <Badge key={a} variant="secondary" className="text-xs font-normal">
                {t(`amenities.${a}`, { fallback: a })}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal text-gray-500">
                +{property.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Available from */}
        {property.availableFrom && property.status === 'coming_soon' && (
          <p className="flex items-center gap-1.5 text-xs text-orange-700">
            <CalendarDays className="size-3.5" />
            {t('availableFrom')}{' '}
            {new Date(property.availableFrom).toLocaleDateString(locale, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}

        {/* Actions — schedule viewing full-width gradient + save */}
        <div className="flex items-center gap-2 pt-1 mt-auto">
          <Button
            asChild
            size="sm"
            variant="gradient"
            className="flex-1 h-11 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
          >
            <Link
              href={`/properties/${property.slug}#inquiry`}
              locale={locale as Parameters<typeof Link>[0]['locale']}
            >
              {t('scheduleViewing')}
            </Link>
          </Button>
          <button
            onClick={handleSave}
            aria-label={isSaved ? t('unsave') : t('save')}
            className={cn(
              'size-11 rounded-md flex items-center justify-center border transition-colors',
              isSaved
                ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-400',
            )}
          >
            <Heart className={cn('size-5', isSaved && 'fill-current')} />
          </button>
        </div>
      </div>
    </article>
  )
}
