'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Grid2X2, Video, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface PropertyGalleryProps {
  images: string[]
  coverImage: string
  virtualTourUrl?: string
}

export default function PropertyGallery({ images, coverImage, virtualTourUrl }: PropertyGalleryProps) {
  const allImages = React.useMemo(() => {
    const deduped = [coverImage, ...images.filter((img) => img !== coverImage)].filter(Boolean)
    return deduped
  }, [images, coverImage])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

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
      {/* ── Swipe Carousel ───────────────────────────────────────────────────── */}
      <div className="relative w-full select-none">
        {/* Embla viewport */}
        <div
          ref={emblaRef}
          className="overflow-hidden rounded-none"
          style={{ cursor: 'grab' }}
        >
          <div className="flex">
            {allImages.map((img, idx) => (
              <div
                key={idx}
                className="relative flex-shrink-0 w-full"
                style={{ height: '65vw', maxHeight: 480, minHeight: 260 }}
                onClick={() => { setSelectedIndex(idx); setLightboxOpen(true) }}
              >
                <Image
                  src={img}
                  alt={`Photo ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  className="object-cover"
                  sizes="100vw"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next arrows (desktop only) */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex size-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
            >
              <ChevronLeft className="size-5 text-gray-800" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex size-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
            >
              <ChevronRight className="size-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Counter top-right */}
        <div className="absolute top-3 right-3 z-10 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm select-none">
          {selectedIndex + 1} / {allImages.length}
        </div>

        {/* Dots indicator */}
        {allImages.length > 1 && allImages.length <= 20 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={cn(
                  'rounded-full transition-all duration-200',
                  idx === selectedIndex
                    ? 'w-4 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50',
                )}
                aria-label={`Go to photo ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Action buttons bottom-right */}
        <div className="absolute bottom-3 right-3 z-10 flex gap-2">
          {virtualTourUrl && (
            <button
              onClick={() => setTourOpen(true)}
              className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow backdrop-blur-sm border border-white/20"
            >
              <Video className="w-3.5 h-3.5 text-[#46a758]" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}
          <button
            onClick={() => { setSelectedIndex(selectedIndex); setLightboxOpen(true) }}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow backdrop-blur-sm border border-white/20"
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span>All {allImages.length}</span>
          </button>
        </div>
      </div>

      {/* ── Lightbox fullscreen carousel ─────────────────────────────────────── */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-none w-screen h-dvh p-0 bg-black border-0 rounded-none flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0 z-10">
            <span className="text-white/60 text-sm font-medium">{lightboxIndex + 1} / {allImages.length}</span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="size-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Lightbox carousel */}
          <div ref={lightboxEmblaRef} className="flex-1 overflow-hidden">
            <div className="flex h-full">
              {allImages.map((img, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-full h-full flex items-center justify-center px-2">
                  <div className="relative w-full h-full">
                    <Image
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      draggable={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lightbox nav arrows */}
          {allImages.length > 1 && (
            <>
              <button onClick={lightboxPrev} className="absolute left-3 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button onClick={lightboxNext} className="absolute right-3 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          <div className="flex gap-1.5 overflow-x-auto px-4 py-3 shrink-0 scrollbar-hide">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => lightboxEmblaApi?.scrollTo(idx)}
                className={cn(
                  'relative shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                  idx === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70',
                )}
                style={{ width: 56, height: 40 }}
              >
                <Image src={img} alt={`Thumb ${idx + 1}`} fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
