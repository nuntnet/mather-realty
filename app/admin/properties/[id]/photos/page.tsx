'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Star, Trash2, ArrowLeft, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface PhotoItem {
  id: string
  url: string
  isCover: boolean
}

function SortablePhoto({
  photo,
  index,
  onSetCover,
  onRemove,
}: {
  photo: PhotoItem
  index: number
  onSetCover: (id: string) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-150 ${
        photo.isCover
          ? 'border-blue-500 shadow-lg shadow-blue-100'
          : 'border-gray-200 hover:border-gray-300'
      } ${isDragging ? 'shadow-2xl ring-2 ring-blue-400' : ''}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image
          src={photo.url}
          alt={`Photo ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width:768px) 50vw, 25vw"
        />

        {/* Cover badge */}
        {photo.isCover && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-blue-600 text-white text-xs gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-white" /> Cover Photo
            </Badge>
          </div>
        )}

        {/* Index number */}
        <div className="absolute top-2 right-2 z-10 size-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center font-medium">
          {index + 1}
        </div>

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 z-10">
          {!photo.isCover && (
            <button
              onClick={() => onSetCover(photo.id)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow"
            >
              <Star className="w-3.5 h-3.5" /> Set as Cover
            </button>
          )}
          <button
            onClick={() => onRemove(photo.id)}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      </div>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center gap-1.5 py-2 bg-gray-50 border-t border-gray-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors text-xs"
      >
        <GripVertical className="w-4 h-4" />
        <span>Drag to reorder</span>
      </div>
    </div>
  )
}

export default function PhotoManagerPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [propertyTitle, setPropertyTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    fetchProperty()
  }, [propertyId])

  async function fetchProperty() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`)
      if (!res.ok) throw new Error('Failed to fetch property')
      const data = await res.json()
      setPropertyTitle(data.title || data.name || 'Property')

      // Build photo list: cover first, then gallery
      const coverUrl = data.cover_image || data.coverImage || ''
      const galleryUrls: string[] = (data.gallery_urls || data.gallery || '')
        .split(',')
        .map((u: string) => u.trim())
        .filter(Boolean)

      const allUrls = coverUrl
        ? [coverUrl, ...galleryUrls.filter((u: string) => u !== coverUrl)]
        : galleryUrls

      setPhotos(
        allUrls.map((url, idx) => ({
          id: `photo-${idx}-${url.slice(-20)}`,
          url,
          isCover: idx === 0,
        })),
      )
    } catch (e) {
      toast.error('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setPhotos((prev) => {
      const oldIdx = prev.findIndex((p) => p.id === active.id)
      const newIdx = prev.findIndex((p) => p.id === over.id)
      const reordered = arrayMove(prev, oldIdx, newIdx)
      // First item is always cover
      return reordered.map((p, i) => ({ ...p, isCover: i === 0 }))
    })
    setSaved(false)
  }, [])

  const handleSetCover = useCallback((id: string) => {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx === -1) return prev
      const moved = arrayMove(prev, idx, 0)
      return moved.map((p, i) => ({ ...p, isCover: i === 0 }))
    })
    setSaved(false)
  }, [])

  const handleRemove = useCallback((id: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id)
      return filtered.map((p, i) => ({ ...p, isCover: i === 0 }))
    })
    setSaved(false)
  }, [])

  async function handleSave() {
    if (photos.length === 0) {
      toast.error('No photos to save')
      return
    }
    setSaving(true)
    try {
      const coverImage = photos[0].url
      const galleryUrls = photos
        .slice(1)
        .map((p) => p.url)
        .join(',')

      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cover_image: coverImage,
          gallery_urls: galleryUrls,
        }),
      })

      if (!res.ok) throw new Error('Save failed')

      setSaved(true)
      toast.success('Photo order saved! Cover photo updated.')
    } catch (e) {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading photos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Manage Photos</h1>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{propertyTitle}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || saved}
          className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Saved
            </>
          ) : saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Order
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Star className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">How to manage photos</p>
          <p className="text-sm text-blue-700 mt-0.5">
            <strong>Drag</strong> to reorder · <strong>First photo</strong> becomes the cover/hero image ·
            Click <strong>Set as Cover</strong> to promote any photo · Click <strong>Remove</strong> to hide from listing
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
        <span><strong className="text-gray-900">{photos.length}</strong> photos</span>
        <span>·</span>
        <span>Cover: <strong className="text-gray-900">{photos[0]?.url?.split('/').pop()?.slice(0, 20)}...</strong></span>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-lg font-medium">No photos</p>
          <p className="text-sm mt-1">Upload photos via Cloudinary first</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, idx) => (
                <SortablePhoto
                  key={photo.id}
                  photo={photo}
                  index={idx}
                  onSetCover={handleSetCover}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
