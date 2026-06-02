'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ExternalLink, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface PropertyGalleryProps {
  images: string[]
  coverImage: string
  virtualTourUrl?: string
}

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
}

export default function PropertyGallery({
  images,
  coverImage,
  virtualTourUrl,
}: PropertyGalleryProps) {
  // Deduplicate and ensure cover is first
  const allImages = React.useMemo(() => {
    const deduped = [coverImage, ...images.filter((img) => img !== coverImage)]
    return deduped
  }, [images, coverImage])

  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [tourOpen, setTourOpen] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      const clampedIndex = (index + allImages.length) % allImages.length
      setDirection(clampedIndex > activeIndex ? 1 : -1)
      setActiveIndex(clampedIndex)
    },
    [activeIndex, allImages.length],
  )

  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main image */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100" style={{ aspectRatio: '16/9' }}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={allImages[activeIndex]}
              alt={`Property image ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-9 rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
            >
              <ChevronLeft className="size-5 text-gray-800" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-9 rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-colors"
            >
              <ChevronRight className="size-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm select-none">
          {activeIndex + 1} / {allImages.length}
        </div>

        {/* Virtual tour button */}
        {virtualTourUrl && (
          <button
            onClick={() => setTourOpen(true)}
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow transition-colors"
          >
            <Video className="size-3.5" />
            Virtual Tour
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > activeIndex ? 1 : -1)
                setActiveIndex(idx)
              }}
              aria-label={`View image ${idx + 1}`}
              className={cn(
                'relative shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                idx === activeIndex
                  ? 'border-blue-600 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90',
              )}
              style={{ width: 72, height: 52 }}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Virtual Tour Modal */}
      {virtualTourUrl && (
        <Dialog open={tourOpen} onOpenChange={setTourOpen}>
          <DialogContent className="max-w-4xl w-full p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-white">
              <DialogTitle className="text-base font-semibold">Virtual Tour</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(virtualTourUrl, '_blank')}
                  className="gap-1.5 text-xs"
                >
                  <ExternalLink className="size-3.5" />
                  Open in new tab
                </Button>
                <button
                  onClick={() => setTourOpen(false)}
                  aria-label="Close"
                  className="size-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                >
                  <X className="size-4 text-gray-600" />
                </button>
              </div>
            </DialogHeader>
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={virtualTourUrl}
                title="Virtual Tour"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
