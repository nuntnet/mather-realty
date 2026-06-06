'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import PropertyDetailActions from './PropertyDetailActions'

interface HeroCarouselProps {
  images: string[]
  title: string
  statusLabel: string
  statusClassName: string
  verified: boolean
  verifiedLabel: string
  priceTHB: number
  pricePerMonthLabel: string
  backHref: string
}

export default function HeroCarousel({
  images,
  title,
  statusLabel,
  statusClassName,
  verified,
  verifiedLabel,
  priceTHB,
  pricePerMonthLabel,
  backHref,
}: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  // Fallback: gradient background if no images
  const hasImages = images.length > 0

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: '72vh', minHeight: '500px', maxHeight: '820px' }}
    >
      {/* ── Image carousel ─────────────────────────────────── */}
      {hasImages ? (
        <div ref={emblaRef} className="absolute inset-0">
          <div className="flex h-full">
            {images.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0 w-full h-full overflow-hidden"
                style={{ willChange: 'transform' }}>
                {/* Blurred atmospheric backdrop */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(18px) brightness(0.5) saturate(0.85)',
                    transform: 'scale(1.08)',
                  }}
                />
                {/* Sharp image — object-contain so it's NEVER stretched or pixelated */}
                <Image
                  src={img}
                  alt={`${title} — photo ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  quality={90}
                  className="object-contain"
                  sizes="100vw"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C3837] via-[#124E4C] to-[#1E6B69]" />
      )}

      {/* ── Vignettes ──────────────────────────────────────── */}
      {/* Top: very light — floating buttons have their own frosted glass */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10" />
      {/* Bottom: only covers lower 55% — keeps top of image bright */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none z-10" />

      {/* ── Floating nav ───────────────────────────────────── */}
      <div className="absolute top-3 left-0 right-0 px-4 flex items-center justify-between z-20">
        <a
          href={backHref}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-black/25 backdrop-blur-sm border border-white/20 text-white hover:bg-black/40 transition-colors"
          aria-label="Back to properties"
        >
          <ArrowLeft className="w-5 h-5" />
        </a>

        {/* Counter removed — dots below serve this purpose */}

        <PropertyDetailActions title={title} variant="glass" />
      </div>

      {/* ── Swipe dot indicators ────────────────────────────── */}
      {images.length > 1 && images.length <= 20 && (
        <div className="absolute z-20 flex gap-1.5" style={{ bottom: '6rem', left: '50%', transform: 'translateX(-50%)' }}>
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              aria-label={`Photo ${idx + 1}`}
              className={`rounded-full transition-all duration-200 ${
                idx === selectedIndex
                  ? 'w-4 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/45 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Bottom overlay ─────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 px-5 md:px-10 pb-16 z-20">
        <div className="max-w-7xl mx-auto">

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClassName}`}>
              {statusLabel}
            </span>
            {verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {verifiedLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
            {title}
          </h1>

          {/* Price */}
          <p className="text-2xl md:text-3xl font-bold text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
            ฿{priceTHB.toLocaleString()}
            <span className="text-base font-normal text-white/70 ml-1">
              {pricePerMonthLabel}
            </span>
          </p>

        </div>
      </div>
    </section>
  )
}
