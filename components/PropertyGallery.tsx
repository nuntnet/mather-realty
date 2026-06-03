'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Grid2X2, Video, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [tourOpen, setTourOpen] = useState(false)
  const [direction, setDirection] = useState(0)

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx)
    setLightboxOpen(true)
  }

  const goTo = useCallback((idx: number) => {
    const next = (idx + allImages.length) % allImages.length
    setDirection(next > lightboxIndex ? 1 : -1)
    setLightboxIndex(next)
  }, [lightboxIndex, allImages.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(lightboxIndex - 1)
      if (e.key === 'ArrowRight') goTo(lightboxIndex + 1)
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, lightboxIndex, goTo])

  // Grid slots: main (idx 0) + up to 4 side images
  const main = allImages[0]
  const side = allImages.slice(1, 5)
  const remaining = allImages.length - 5

  return (
    <>
      {/* ── Airbnb-style photo grid ── */}
      <div className="relative w-full">
        {allImages.length === 1 ? (
          /* Single image */
          <div
            className="relative w-full cursor-pointer overflow-hidden"
            style={{ height: '60vh', minHeight: 340, maxHeight: 600 }}
            onClick={() => openLightbox(0)}
          >
            <Image src={main} alt="Property" fill className="object-cover" priority sizes="100vw" />
          </div>
        ) : (
          /* Multi-image grid */
          <div
            className={cn(
              'grid w-full overflow-hidden',
              side.length >= 4
                ? 'grid-cols-2 grid-rows-2 gap-1 sm:gap-1.5'
                : side.length >= 2
                ? 'grid-cols-3 gap-1 sm:gap-1.5'
                : 'grid-cols-2 gap-1 sm:gap-1.5',
            )}
            style={{ height: '60vh', minHeight: 340, maxHeight: 600 }}
          >
            {/* Main (large) image */}
            <div
              className={cn(
                'relative cursor-pointer overflow-hidden',
                side.length >= 4 ? 'col-span-1 row-span-2' : 'col-span-2 row-span-1',
              )}
              onClick={() => openLightbox(0)}
            >
              <Image
                src={main}
                alt="Property main photo"
                fill
                priority
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </div>

            {/* Side images */}
            {side.map((img, idx) => (
              <div
                key={idx}
                className="relative cursor-pointer overflow-hidden"
                onClick={() => openLightbox(idx + 1)}
              >
                <Image
                  src={img}
                  alt={`Property photo ${idx + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                {/* "Show all" overlay on last visible */}
                {idx === 3 && remaining > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 text-white font-semibold text-sm">
                    <Grid2X2 className="w-5 h-5" />
                    +{remaining} photos
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Buttons bottom-right */}
        <div className="absolute bottom-3 right-3 flex gap-2 z-10">
          {virtualTourUrl && (
            <button
              onClick={() => setTourOpen(true)}
              className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-2 rounded-lg shadow-md backdrop-blur-sm transition-colors border border-white/20"
            >
              <Video className="w-4 h-4 text-blue-600" />
              Virtual Tour
            </button>
          )}
          {allImages.length > 1 && (
            <button
              onClick={() => openLightbox(0)}
              className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-2 rounded-lg shadow-md backdrop-blur-sm transition-colors border border-white/20"
            >
              <Grid2X2 className="w-4 h-4" />
              All {allImages.length} photos
            </button>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-screen-xl w-screen h-screen p-0 bg-black/95 border-0 rounded-none flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <span className="text-white/70 text-sm">{lightboxIndex + 1} / {allImages.length}</span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="size-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Main lightbox image */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={lightboxIndex}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center p-4"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={allImages[lightboxIndex]}
                    alt={`Photo ${lightboxIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => goTo(lightboxIndex - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => goTo(lightboxIndex + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2 overflow-x-auto px-4 py-3 shrink-0 scrollbar-hide">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { setDirection(idx > lightboxIndex ? 1 : -1); setLightboxIndex(idx) }}
                className={cn(
                  'relative shrink-0 rounded-md overflow-hidden border-2 transition-all',
                  idx === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70',
                )}
                style={{ width: 64, height: 44 }}
              >
                <Image src={img} alt={`Thumb ${idx + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Virtual Tour Modal ── */}
      {virtualTourUrl && (
        <Dialog open={tourOpen} onOpenChange={setTourOpen}>
          <DialogContent className="max-w-4xl w-full p-0 overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Virtual Tour</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open(virtualTourUrl, '_blank')} className="gap-1.5 text-xs">
                  <ExternalLink className="size-3.5" /> Open in new tab
                </Button>
                <button onClick={() => setTourOpen(false)} className="size-8 flex items-center justify-center rounded-md hover:bg-gray-100">
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
