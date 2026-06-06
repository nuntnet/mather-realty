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
  const [exteriorPhotos, setExteriorPhotos] = useState<string[]>([])
  const [interiorPhotos, setInteriorPhotos] = useState<string[]>([])
  const [communityPhotos, setCommunityPhotos] = useState<string[]>([])
  const [heroPhotos, setHeroPhotos] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'main' | 'hero' | 'exterior' | 'interior' | 'community'>('main')
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
      setPropertyTitle(data.titles?.en || data.title || data.name || 'Property')

      // API returns gallery as string[] already
      const coverUrl: string = data.coverImage || ''
      const galleryArr: string[] = Array.isArray(data.gallery)
        ? data.gallery
        : typeof data.gallery === 'string'
          ? data.gallery.split(',').map((u: string) => u.trim()).filter(Boolean)
          : []

      const allUrls = coverUrl
        ? [coverUrl, ...galleryArr.filter((u: string) => u !== coverUrl)]
        : galleryArr

      setPhotos(
        allUrls.map((url, idx) => ({
          id: `photo-${idx}-${url.slice(-20)}`,
          url,
          isCover: idx === 0,
        })),
      )

      // Gallery categories
      const toArr = (v: unknown): string[] => {
        if (Array.isArray(v)) return v
        if (typeof v === 'string') return v.split(',').map((u: string) => u.trim()).filter(Boolean)
        return []
      }
      setExteriorPhotos(toArr(data.exteriorPhotos))
      setInteriorPhotos(toArr(data.interiorPhotos))
      setCommunityPhotos(toArr(data.communityPhotos))
      setHeroPhotos(toArr(data.heroPhotos))
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
    setSaving(true)
    try {
      const body: Record<string, unknown> = {}

      // Main gallery: first photo = cover
      if (photos.length > 0) {
        body.coverImage = photos[0].url
        body.gallery = photos.slice(1).map((p) => p.url)
      }

      // Gallery categories (comma-joined for Notion rich_text)
      body.exteriorPhotos = exteriorPhotos.join(',')
      body.interiorPhotos = interiorPhotos.join(',')
      body.communityPhotos = communityPhotos.join(',')
      body.heroPhotos = heroPhotos.join(',')

      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Save failed (${res.status})`)
      }

      setSaved(true)
      toast.success('Photos saved — cover, order and categories updated.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save changes')
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {([
          { key: 'main',      label: `📷 All Photos (${photos.length})` },
          { key: 'hero',      label: `🎠 Hero Carousel (${heroPhotos.length || 'all'})` },
          { key: 'exterior',  label: `🏠 Exterior (${exteriorPhotos.length})` },
          { key: 'interior',  label: `🛋️ Interior (${interiorPhotos.length})` },
          { key: 'community', label: `🏘️ Community (${communityPhotos.length})` },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-[#1E6B69] text-[#1E6B69]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main tab — drag-and-drop reorder */}
      {activeTab === 'main' && (
        <>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Star className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              <strong>Drag</strong> to reorder · <strong>First photo</strong> = cover/hero ·
              Hover to <strong>Set as Cover</strong> or <strong>Remove</strong>
            </p>
          </div>
          {photos.length === 0 ? (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-lg font-medium">No photos yet</p>
              <p className="text-sm mt-1">Upload via the Edit page → Cover Image / Gallery sections</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, idx) => (
                    <SortablePhoto key={photo.id} photo={photo} index={idx}
                      onSetCover={handleSetCover} onRemove={handleRemove} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}

      {/* Hero Carousel tab — pick which photos appear in the fullscreen hero swipe */}
      {activeTab === 'hero' && (() => {
        const allAvailable = [
          ...photos.map(p => p.url),
          ...exteriorPhotos,
          ...interiorPhotos,
          ...communityPhotos,
        ].filter((u, i, arr) => arr.indexOf(u) === i) // dedupe

        return (
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <span className="text-lg shrink-0">🎠</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">Hero Carousel</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  เลือกรูปที่ต้องการให้แสดงใน hero slider ด้านบนสุดของหน้า property.{' '}
                  <strong>ถ้าไม่เลือก = แสดงทุกรูป</strong> (cover + gallery + categories ทั้งหมด)
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setHeroPhotos(allAvailable); setSaved(false) }}
                className="text-xs px-3 py-1.5 bg-[#1E6B69] text-white rounded-lg hover:bg-[#18605E] transition-colors"
              >
                Select all ({allAvailable.length})
              </button>
              <button
                onClick={() => { setHeroPhotos([]); setSaved(false) }}
                className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear (show all)
              </button>
            </div>

            {allAvailable.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="font-medium">No photos available yet</p>
                <p className="text-sm mt-1">Upload photos first via the Edit page</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {allAvailable.map((url, idx) => {
                  const selected = heroPhotos.includes(url)
                  const position = heroPhotos.indexOf(url)
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setHeroPhotos(prev =>
                          selected ? prev.filter(u => u !== url) : [...prev, url]
                        )
                        setSaved(false)
                      }}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                        selected
                          ? 'border-[#F4581A] ring-2 ring-[#F4581A]/30 shadow-md'
                          : 'border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-80'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {selected && (
                        <div className="absolute inset-0 bg-[#F4581A]/10 flex items-end justify-end p-2">
                          <span className="bg-[#F4581A] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                            {position + 1}
                          </span>
                        </div>
                      )}
                      {!selected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-2 border-white/60 bg-black/20" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
            {heroPhotos.length > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                เลือกแล้ว {heroPhotos.length} รูป · จะแสดงในลำดับที่เลือก (รูปแรก = แรกสุดใน carousel)
              </p>
            )}
          </div>
        )
      })()}

      {/* Category tabs — simple grid with add/remove */}
      {(activeTab === 'exterior' || activeTab === 'interior' || activeTab === 'community') && (() => {
        const catMap = {
          exterior:  { urls: exteriorPhotos,  setUrls: setExteriorPhotos,  label: '🏠 Exterior',  hint: 'Façade, garden, entrance, parking' },
          interior:  { urls: interiorPhotos,  setUrls: setInteriorPhotos,  label: '🛋️ Interior',  hint: 'Living room, bedroom, kitchen, bathroom' },
          community: { urls: communityPhotos, setUrls: setCommunityPhotos, label: '🏘️ Community', hint: 'Pool, gym, lobby, rooftop, neighbourhood' },
        }
        const cat = catMap[activeTab]
        return (
          <div>
            <p className="text-sm text-gray-500 mb-4">{cat.hint} — photos shown when visitors filter by this tab.</p>
            {cat.urls.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl mb-4">
                <p className="font-medium">No photos in this category</p>
                <p className="text-sm mt-1">Paste Cloudinary URLs below to add</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {cat.urls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200">
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <img src={url} alt={`${activeTab} ${idx + 1}`}
                        className="w-full h-full object-cover" />
                      <button
                        onClick={() => cat.setUrls(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-lg p-1.5 transition-opacity"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Add URLs from main gallery */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add from main gallery</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
                {photos.map((photo, idx) => {
                  const alreadyIn = cat.urls.includes(photo.url)
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!alreadyIn) cat.setUrls(prev => [...prev, photo.url])
                        else cat.setUrls(prev => prev.filter(u => u !== photo.url))
                        setSaved(false)
                      }}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                        alreadyIn ? 'border-[#1E6B69] ring-2 ring-[#1E6B69]/30' : 'border-transparent hover:border-gray-300'
                      }`}
                      title={alreadyIn ? 'Click to remove' : 'Click to add'}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      {alreadyIn && (
                        <div className="absolute inset-0 bg-[#1E6B69]/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-[#1E6B69]" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              {photos.length === 0 && (
                <p className="text-sm text-gray-400">Upload photos via Edit page first.</p>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
