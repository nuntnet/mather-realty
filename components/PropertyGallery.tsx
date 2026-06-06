'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Grid2X2, Video, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog' // still used for virtual tour
import { cn } from '@/lib/utils'

interface GalleryCategories {
  exterior: string[]
  interior: string[]
  community: string[]
}

interface PropertyGalleryProps {
  images: string[]
  coverImage: string
  virtualTourUrl?: string
  galleryCategories?: GalleryCategories | null
}

type CategoryKey = 'exterior' | 'interior' | 'community'

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  exterior: 'Exterior',
  interior: 'Interior',
  community: 'Community',
}

export default function PropertyGallery({
  images,
  coverImage,
  virtualTourUrl,
  galleryCategories,
}: PropertyGalleryProps) {
  const allImages = useMemo(() => {
    // All tab = cover + gallery_urls + ALL category photos (deduped)
    const seen = new Set<string>()
    const result: string[] = []
    const add = (url: string) => { if (url && !seen.has(url)) { seen.add(url); result.push(url) } }
    if (coverImage) add(coverImage)
    images.forEach(add)
    if (galleryCategories) {
      galleryCategories.exterior.forEach(add)
      galleryCategories.interior.forEach(add)
      galleryCategories.community.forEach(add)
    }
    return result
  }, [images, coverImage, galleryCategories])

  // Determine available tabs (those with at least 1 image)
  const availableTabs = useMemo<CategoryKey[]>(() => {
    if (!galleryCategories) return []
    return (['exterior', 'interior', 'community'] as CategoryKey[]).filter(
      (k) => galleryCategories[k]?.length > 0,
    )
  }, [galleryCategories])

  // 'all' | CategoryKey — null means no categories configured
  type Tab = 'all' | CategoryKey
  const defaultTab = useMemo<Tab | null>(() => {
    if (availableTabs.length === 0) return null
    return 'all'
  }, [availableTabs])

  const [activeTab, setActiveTab] = useState<Tab | null>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  // Images shown in carousel based on active tab
  const displayImages = useMemo(() => {
    if (!galleryCategories || !activeTab || activeTab === 'all') return allImages
    const catImages = galleryCategories[activeTab as CategoryKey] ?? []
    return catImages.length > 0 ? catImages : allImages
  }, [galleryCategories, activeTab, allImages])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  // Reset selected index when tab changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [activeTab])

  // ── Carousel (mobile-first swipe) ──────────────────────────────────────────
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    dragFree: false,
  })

  const [lightboxEmblaRef, lightboxEmblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: selectedIndex,
  })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  // Re-init embla when displayImages changes (tab switch)
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit()
      emblaApi.scrollTo(0, true)
    }
  }, [emblaApi, displayImages])

  // Sync lightbox to start image
  useEffect(() => {
    if (lightboxOpen && lightboxEmblaApi) {
      lightboxEmblaApi.scrollTo(selectedIndex, true)
    }
  }, [lightboxOpen, lightboxEmblaApi, selectedIndex])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const lightboxPrev = useCallback(() => lightboxEmblaApi?.scrollPrev(), [lightboxEmblaApi])
  const lightboxNext = useCallback(() => lightboxEmblaApi?.scrollNext(), [lightboxEmblaApi])

  // Lightbox index tracking
  const [lightboxIndex, setLightboxIndex] = useState(0)
  useEffect(() => {
    if (!lightboxEmblaApi) return
    const update = () => setLightboxIndex(lightboxEmblaApi.selectedScrollSnap())
    lightboxEmblaApi.on('select', update)
    return () => { lightboxEmblaApi.off('select', update) }
  }, [lightboxEmblaApi])

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, lightboxPrev, lightboxNext])

  return (
    <>
      {/* ── Category Tabs ────────────────────────────────────────────────────── */}
      {availableTabs.length > 0 && (
        <div className="flex gap-1.5 px-1 pt-3 pb-1 overflow-x-auto scrollbar-hide">
          {/* All tab */}
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200',
              activeTab === 'all'
                ? 'bg-[#1d211c] text-white shadow-sm'
                : 'bg-[#f1f4f0] text-[#5e6360] hover:bg-[#e2e5e0] hover:text-[#1d211c]',
            )}
          >
            All
            <span className={cn('text-[11px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center',
              activeTab === 'all' ? 'bg-white/20' : 'bg-[#1d211c]/10'
            )}>
              {allImages.length}
            </span>
          </button>
          {availableTabs.map((tab) => {
            const count = galleryCategories?.[tab]?.length ?? 0
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200',
                  tab === activeTab
                    ? 'bg-[#1E6B69] text-white shadow-sm'
                    : 'bg-[#f1f4f0] text-[#5e6360] hover:bg-[#E0F4F4] hover:text-[#1E6B69]',
                )}
              >
                {CATEGORY_LABELS[tab]}
                <span className={cn('text-[11px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center',
                  tab === activeTab ? 'bg-white/25' : 'bg-[#1E6B69]/12 text-[#1E6B69]'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Mobile: swipeable carousel ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab ?? 'all'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full select-none sm:hidden"
        >
          <div ref={emblaRef} className="overflow-hidden" style={{ cursor: 'grab' }}>
            <div className="flex">
              {displayImages.map((img, idx) => (
                <div key={idx}
                  className="relative flex-shrink-0 w-full h-[65vw] max-h-[400px] min-h-[240px] landscape:h-[55vh]"
                  onClick={() => { setSelectedIndex(idx); setLightboxOpen(true) }}>
                  <Image src={img} alt={`Photo ${idx + 1}`} fill priority={idx === 0}
                    className="object-cover" sizes="100vw" draggable={false} />
                </div>
              ))}
            </div>
          </div>
          {/* Counter */}
          <div className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full select-none">
            {selectedIndex + 1} / {displayImages.length}
          </div>
          {/* Dots */}
          {displayImages.length > 1 && displayImages.length <= 20 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1">
              {displayImages.map((_, idx) => (
                <button key={idx} onClick={() => emblaApi?.scrollTo(idx)}
                  className={cn('rounded-full transition-all duration-200',
                    idx === selectedIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50')}
                  aria-label={`Photo ${idx + 1}`} />
              ))}
            </div>
          )}
          <div className="absolute bottom-3 right-3 z-10 flex gap-2">
            {virtualTourUrl && (
              <button onClick={() => setTourOpen(true)}
                className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow">
                <Video className="w-3.5 h-3.5 text-[#1E6B69]" /> Tour
              </button>
            )}
            <button onClick={() => setLightboxOpen(true)}
              className="flex items-center gap-1.5 bg-black/45 hover:bg-black/60 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
              <Grid2X2 className="w-3 h-3" /> All {displayImages.length}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Desktop: Airbnb-style hero grid ─────────────────────────────────── */}
      {displayImages.length > 0 && (
        <div className="hidden sm:block">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab ?? 'all'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {displayImages.length === 1 ? (
                /* Single image — full width */
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => { setSelectedIndex(0); setLightboxOpen(true) }}>
                  <Image src={displayImages[0]} alt="Photo 1" fill priority
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width:1280px) 100vw, 1280px" />
                </div>
              ) : displayImages.length < 3 ? (
                /* 2 images — 50/50 */
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden" style={{ height: 420 }}>
                  {displayImages.slice(0, 2).map((img, idx) => (
                    <div key={idx} className="relative cursor-pointer group overflow-hidden"
                      onClick={() => { setSelectedIndex(idx); setLightboxOpen(true) }}>
                      <Image src={img} alt={`Photo ${idx + 1}`} fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="50vw" priority={idx === 0} />
                    </div>
                  ))}
                </div>
              ) : (
                /* 3+ images — hero grid (1 large + 2×2 thumbnails) */
                <div className="relative grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden"
                  style={{ height: 440 }}>
                  {/* Main large photo — left, spans 2 rows */}
                  <div className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden"
                    onClick={() => { setSelectedIndex(0); setLightboxOpen(true) }}>
                    <Image src={displayImages[0]} alt="Photo 1" fill priority
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="50vw" />
                  </div>

                  {/* Thumbnails — right 2×2 */}
                  {displayImages.slice(1, 5).map((img, i) => (
                    <div key={i + 1} className="relative cursor-pointer group overflow-hidden"
                      onClick={() => { setSelectedIndex(i + 1); setLightboxOpen(true) }}>
                      <Image src={img} alt={`Photo ${i + 2}`} fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        sizes="25vw" />
                      {/* Dim last thumbnail if more photos */}
                      {i === 3 && displayImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">+{displayImages.length - 5}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* "See all photos" button */}
                  <button
                    onClick={() => { setSelectedIndex(0); setLightboxOpen(true) }}
                    className="absolute bottom-4 right-4 flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl shadow-md border border-gray-200 transition-colors z-10"
                  >
                    <Grid2X2 className="w-4 h-4" />
                    Show all {displayImages.length} photos
                  </button>

                  {/* Virtual tour button */}
                  {virtualTourUrl && (
                    <button onClick={() => setTourOpen(true)}
                      className="absolute bottom-4 left-4 flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl shadow-md border border-gray-200 transition-colors z-10">
                      <Video className="w-4 h-4 text-[#1E6B69]" /> Virtual Tour
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── Lightbox fullscreen carousel ─────────────────────────────────────── */}
      {/* ── Lightbox — portal to body, bypasses all Dialog CSS constraints ── */}
      {lightboxOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black"
          style={{ width: '100vw', height: '100dvh' }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightboxOpen(false)
            if (e.key === 'ArrowLeft') lightboxPrev()
            if (e.key === 'ArrowRight') lightboxNext()
          }}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
        >
          {/* Carousel — fills the entire viewport */}
          <div ref={lightboxEmblaRef} className="w-full h-full overflow-hidden">
            <div className="flex h-full">
              {displayImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative flex-shrink-0 w-full h-full flex items-center justify-center"
                >
                  <Image
                    src={img}
                    alt={`Photo ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    draggable={false}
                    priority={idx === lightboxIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Counter — top left */}
          <span className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full select-none pointer-events-none">
            {lightboxIndex + 1} / {displayImages.length}
          </span>

          {/* Close — top right */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 size-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Prev / Next */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={lightboxPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={lightboxNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Thumbnail strip — hidden in landscape */}
          <div className="landscape:hidden absolute bottom-0 left-0 right-0 z-10 flex gap-1.5 overflow-x-auto px-4 py-3 bg-gradient-to-t from-black/70 to-transparent scrollbar-hide">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => lightboxEmblaApi?.scrollTo(idx)}
                className={cn(
                  'relative shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                  idx === lightboxIndex
                    ? 'border-white opacity-100'
                    : 'border-transparent opacity-40 hover:opacity-70',
                )}
                style={{ width: 56, height: 40 }}
              >
                <Image src={img} alt={`Thumb ${idx + 1}`} fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* ── Virtual Tour ─────────────────────────────────────────────────────── */}
      {virtualTourUrl && (
        <Dialog open={tourOpen} onOpenChange={setTourOpen}>
          <DialogContent className="max-w-4xl w-full p-0 overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Virtual Tour</span>
              <div className="flex gap-2">
                <button onClick={() => window.open(virtualTourUrl, '_blank')} className="flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 hover:bg-gray-50">
                  <ExternalLink className="size-3.5" /> Open
                </button>
                <button onClick={() => setTourOpen(false)} className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                  <X className="size-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe src={virtualTourUrl} title="Virtual Tour" allowFullScreen className="absolute inset-0 w-full h-full border-0" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
