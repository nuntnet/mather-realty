'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
  useDroppable,
  type CollisionDetection,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Star, Trash2, ArrowLeft, Save, CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────────────────

interface PhotoItem { id: string; url: string }
type ColumnKey = 'gallery' | 'exterior' | 'interior' | 'community'

const COLUMNS: { key: ColumnKey; label: string; hint: string; color: string; bg: string; border: string }[] = [
  { key: 'gallery',   label: '📷 General',   hint: 'Shows in "All" tab + hero. Photos not assigned to a specific category.',     color: 'text-gray-700',  bg: 'bg-gray-50',      border: 'border-gray-200' },
  { key: 'exterior',  label: '🏠 Exterior',  hint: 'Façade, garden, entrance, parking. Shows in Exterior tab.',                  color: 'text-teal-700',  bg: 'bg-teal-50/40',   border: 'border-teal-200' },
  { key: 'interior',  label: '🛋️ Interior',  hint: 'Living room, bedroom, kitchen, bathroom. Shows in Interior tab.',           color: 'text-blue-700',  bg: 'bg-blue-50/40',   border: 'border-blue-200' },
  { key: 'community', label: '🏘️ Community', hint: 'Pool, gym, lobby, rooftop, neighbourhood. Shows in Community tab.',         color: 'text-purple-700',bg: 'bg-purple-50/40', border: 'border-purple-200' },
]

const COLUMN_IDS = new Set<string>(COLUMNS.map(c => c.key))

function makeId(url: string, col: ColumnKey, idx: number) {
  return `${col}::${idx}::${url.slice(-16)}`
}

// ── Collision detection ────────────────────────────────────────────────────────

const columnFirstCollision: CollisionDetection = (args) => {
  const ptr = pointerWithin(args)
  const colHit = ptr.find(c => COLUMN_IDS.has(c.id as string))
  if (colHit) return [colHit]
  if (ptr.length > 0) return [ptr[0]]
  const rect = rectIntersection(args)
  const rectCol = rect.find(c => COLUMN_IDS.has(c.id as string))
  if (rectCol) return [rectCol]
  if (rect.length > 0) return [rect[0]]
  return closestCenter(args)
}

// ── Sortable photo card ────────────────────────────────────────────────────────

function SortablePhoto({ photo, onRemove, onSetCover, isCover, isDragging }: {
  photo: PhotoItem
  onRemove: (id: string) => void
  onSetCover: (id: string) => void
  isCover: boolean
  isDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: thisDragging } = useSortable({ id: photo.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: thisDragging ? 0 : 1,
    zIndex: thisDragging ? 50 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}
      className={`relative group rounded-xl overflow-hidden border-2 bg-white shadow-sm transition-all ${
        isCover ? 'border-[#F4581A] ring-2 ring-[#F4581A]/20' : 'border-gray-200'
      }`}>
      <div className="relative aspect-[4/3]">
        <Image src={photo.url} alt="" fill className="object-cover" sizes="200px" draggable={false} />
        {isCover && (
          <div className="absolute top-1.5 left-1.5 z-10 bg-[#F4581A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-white" /> Cover
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 z-10">
          {!isCover && (
            <button onClick={() => onSetCover(photo.id)}
              className="bg-[#F4581A] text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3" /> Cover
            </button>
          )}
          <button onClick={() => onRemove(photo.id)}
            className="bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        </div>
      </div>
      <div {...attributes} {...listeners}
        className="flex items-center justify-center py-1.5 bg-gray-50 border-t border-gray-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 text-xs gap-1">
        <GripVertical className="w-3.5 h-3.5" />
        <span>drag to reorder / move</span>
      </div>
    </div>
  )
}

// ── Droppable column ───────────────────────────────────────────────────────────

function Column({ col, photos, onRemove, onSetCover, coverId, activeId }: {
  col: typeof COLUMNS[number]
  photos: PhotoItem[]
  onRemove: (id: string) => void
  onSetCover: (id: string) => void
  coverId: string
  activeId: UniqueIdentifier | null
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key })

  return (
    <div className={`flex flex-col rounded-2xl border-2 transition-all min-h-[280px] ${
      isOver ? 'border-[#1E6B69] bg-[#1E6B69]/5 shadow-md' : `${col.border} ${col.bg}`
    }`}>
      <div className={`px-3 py-2.5 border-b ${col.border}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
          <span className="text-xs text-gray-400">{photos.length}</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{col.hint}</p>
      </div>
      <div ref={setNodeRef} className="flex-1 p-2">
        <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-2">
            {photos.map(p => (
              <SortablePhoto key={p.id} photo={p}
                onRemove={onRemove} onSetCover={onSetCover}
                isCover={p.id === coverId}
                isDragging={activeId !== null}
              />
            ))}
          </div>
        </SortableContext>
        {photos.length === 0 && (
          <div className={`flex items-center justify-center rounded-xl border-2 border-dashed min-h-[120px] transition-colors ${
            isOver ? 'border-[#1E6B69] text-[#1E6B69] bg-[#1E6B69]/5' : 'border-gray-200 text-gray-300'
          }`}>
            <span className="text-xs font-medium">{isOver ? '↓ Drop here' : 'Drag photos here'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function PhotoPreview({ url }: { url: string }) {
  return (
    <div className="w-28 h-20 rounded-xl overflow-hidden shadow-2xl ring-2 ring-[#1E6B69] rotate-2">
      <img src={url} alt="" className="w-full h-full object-cover" />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PhotoManagerPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [columns, setColumns] = useState<Record<ColumnKey, PhotoItem[]>>({
    gallery: [], exterior: [], interior: [], community: [],
  })
  const [coverId, setCoverId] = useState<string>('')         // id of the cover photo
  const [heroPhotos, setHeroPhotos] = useState<string[]>([])
  const [propertyTitle, setPropertyTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [activeUrl, setActiveUrl] = useState<string>('')
  const [view, setView] = useState<'photos' | 'hero'>('photos')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => { fetchProperty() }, [propertyId])

  async function fetchProperty() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setPropertyTitle(data.titles?.en || 'Property')

      const isUrl = (u: string) => /^https?:\/\/.+/.test(u)
      const toArr = (v: unknown): string[] => {
        if (Array.isArray(v)) return (v as string[]).filter(isUrl)
        if (typeof v === 'string') return v.split(',').map(u => u.trim()).filter(isUrl)
        return []
      }

      const ext = toArr(data.exteriorPhotos)
      const int_ = toArr(data.interiorPhotos)
      const com = toArr(data.communityPhotos)
      const hero = toArr(data.heroPhotos)
      const coverUrl: string = isUrl(data.coverImage) ? data.coverImage : ''

      // Gallery = all photos in gallery_urls that are not in a category
      const galleryArr = toArr(data.gallery)
      const categorised = new Set([...ext, ...int_, ...com])
      // Include cover in gallery if not already categorised (so it stays visible)
      const allGalleryUrls = coverUrl && !categorised.has(coverUrl)
        ? [coverUrl, ...galleryArr.filter(u => u !== coverUrl)]
        : galleryArr
      const unassigned = allGalleryUrls.filter(u => !categorised.has(u))

      const cols: Record<ColumnKey, PhotoItem[]> = {
        gallery:   unassigned.map((url, i) => ({ id: makeId(url, 'gallery',   i), url })),
        exterior:  ext.map(       (url, i) => ({ id: makeId(url, 'exterior',  i), url })),
        interior:  int_.map(      (url, i) => ({ id: makeId(url, 'interior',  i), url })),
        community: com.map(       (url, i) => ({ id: makeId(url, 'community', i), url })),
      }
      setColumns(cols)

      // Find which photo ID corresponds to the cover URL
      const allItems = [...cols.gallery, ...cols.exterior, ...cols.interior, ...cols.community]
      const coverItem = coverUrl ? allItems.find(p => p.url === coverUrl) : null
      setCoverId(coverItem?.id ?? '')
      setHeroPhotos(hero)
    } catch {
      toast.error('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function findColumn(id: UniqueIdentifier): ColumnKey | null {
    for (const key of Object.keys(columns) as ColumnKey[]) {
      if (columns[key].some(p => p.id === id)) return key
    }
    return null
  }

  function allPhotos() {
    return [...columns.gallery, ...columns.exterior, ...columns.interior, ...columns.community]
  }

  // ── DnD ───────────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(e.active.id)
    const col = findColumn(e.active.id)
    if (col) setActiveUrl(columns[col].find(p => p.id === e.active.id)?.url ?? '')
  }, [columns])

  const handleDragOver = useCallback((e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    const fromCol = findColumn(active.id)
    // Determine target column: if over.id is a column key → use it, else find photo's column
    const toCol = COLUMN_IDS.has(over.id as string)
      ? (over.id as ColumnKey)
      : findColumn(over.id)

    if (!fromCol || !toCol || fromCol === toCol) return

    setColumns(prev => {
      const src = [...prev[fromCol]]
      const dst = [...prev[toCol]]
      const idx = src.findIndex(p => p.id === active.id)
      if (idx === -1) return prev
      const [moved] = src.splice(idx, 1)
      dst.push(moved)
      return { ...prev, [fromCol]: src, [toCol]: dst }
    })
    setSaved(false)
  }, [columns])

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null); setActiveUrl('')
    if (!over) return

    const fromCol = findColumn(active.id)
    if (!fromCol) return

    // If dropped on a column zone (not a photo), nothing to reorder
    if (COLUMN_IDS.has(over.id as string)) return

    // Same-column reorder
    const toCol = findColumn(over.id)
    if (!toCol || toCol !== fromCol) return

    setColumns(prev => {
      const arr = [...prev[fromCol]]
      const oldIdx = arr.findIndex(p => p.id === active.id)
      const newIdx = arr.findIndex(p => p.id === over.id)
      if (oldIdx === -1 || newIdx === -1) return prev
      return { ...prev, [fromCol]: arrayMove(arr, oldIdx, newIdx) }
    })
    setSaved(false)
  }, [columns])

  const handleRemove = useCallback((id: string) => {
    setColumns(prev => {
      const col = (Object.keys(prev) as ColumnKey[]).find(k => prev[k].some(p => p.id === id))
      if (!col) return prev
      return { ...prev, [col]: prev[col].filter(p => p.id !== id) }
    })
    if (coverId === id) setCoverId('')
    setSaved(false)
  }, [coverId])

  const handleSetCover = useCallback((id: string) => {
    setCoverId(id)
    setSaved(false)
    toast.success('Cover photo updated — save to apply.')
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    try {
      const isUrl = (u: string) => /^https?:\/\/.+/.test(u)
      const all = allPhotos()

      // Cover image = the selected cover photo
      const coverPhoto = all.find(p => p.id === coverId)
      const coverImageUrl = coverPhoto?.url || ''

      // gallery_urls = all general/unassigned photos (in order)
      // The gallery column photos ARE the unassigned ones
      const galleryUrls = columns.gallery.filter(p => isUrl(p.url)).map(p => p.url)

      const body = {
        coverImage:      coverImageUrl,
        gallery:         galleryUrls,
        exteriorPhotos:  columns.exterior.filter(p => isUrl(p.url)).map(p => p.url).join(','),
        interiorPhotos:  columns.interior.filter(p => isUrl(p.url)).map(p => p.url).join(','),
        communityPhotos: columns.community.filter(p => isUrl(p.url)).map(p => p.url).join(','),
        heroPhotos:      heroPhotos.filter(isUrl).join(','),
      }

      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || err.error || `Save failed (${res.status})`)
      }
      setSaved(true)
      toast.success('Photos saved successfully.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-[#1E6B69] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading photos…</span>
        </div>
      </div>
    )
  }

  const all = allPhotos()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Photo Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{propertyTitle}</p>
        </div>
        <Button onClick={handleSave} disabled={saving || saved}
          className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-600' : 'bg-[#1E6B69] hover:bg-[#18605E]'}`}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</>
            : saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
            : <><Save className="w-4 h-4" /> Save</>}
        </Button>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[
          { key: 'photos', label: '🗂 Organise Photos' },
          { key: 'hero',   label: `🎠 Hero Carousel (${heroPhotos.length || 'all'})` },
        ].map(t => (
          <button key={t.key} onClick={() => setView(t.key as typeof view)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              view === t.key ? 'border-[#1E6B69] text-[#1E6B69]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ORGANISE PHOTOS ── */}
      {view === 'photos' && (
        <>
          {/* How it works */}
          <div className="bg-[#EEF9F9] border border-[#C2E8E7] rounded-xl p-4 mb-5 flex gap-3">
            <Info className="w-5 h-5 text-[#1E6B69] shrink-0 mt-0.5" />
            <div className="text-sm text-[#124E4C] space-y-1">
              <p><strong>Drag</strong> photos between columns to categorise them · <strong>Drag within</strong> a column to reorder</p>
              <p>Hover a photo → <strong>Set as Cover</strong> (orange badge) · <strong>Remove</strong> deletes from this property</p>
              <p>Photos in <strong>General</strong> show in the "All" gallery tab · Category photos show in their own tab too</p>
            </div>
          </div>

          {/* Cover indicator */}
          {coverId && (
            <div className="flex items-center gap-2 mb-4 text-sm text-[#F4581A] font-medium">
              <Star className="w-4 h-4 fill-[#F4581A]" />
              Cover photo is set — it will be the hero image on the listing page
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={columnFirstCollision}
            onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {COLUMNS.map(col => (
                <Column key={col.key} col={col} photos={columns[col.key]}
                  onRemove={handleRemove} onSetCover={handleSetCover}
                  coverId={coverId} activeId={activeId} />
              ))}
            </div>
            <DragOverlay>
              {activeUrl ? <PhotoPreview url={activeUrl} /> : null}
            </DragOverlay>
          </DndContext>

          <p className="text-xs text-gray-400 mt-4">
            {all.length} photos total · General: {columns.gallery.length} · Exterior: {columns.exterior.length} · Interior: {columns.interior.length} · Community: {columns.community.length}
          </p>
        </>
      )}

      {/* ── HERO CAROUSEL ── */}
      {view === 'hero' && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
            <span className="text-lg shrink-0">🎠</span>
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-0.5">Hero Carousel — photos at the very top of the listing page</p>
              <p>Click to select which photos appear in the swipeable hero. Numbers show order.{' '}
                <strong>Leave empty to show all photos automatically.</strong></p>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => { setHeroPhotos(all.map(p => p.url)); setSaved(false) }}
              className="text-xs px-3 py-1.5 bg-[#1E6B69] text-white rounded-lg hover:bg-[#18605E] transition-colors">
              Select all ({all.length})
            </button>
            <button onClick={() => { setHeroPhotos([]); setSaved(false) }}
              className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              Clear (show all automatically)
            </button>
          </div>
          {all.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="font-medium">No photos yet</p>
              <p className="text-sm mt-1">Upload photos in the Organise tab first</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {all.map((photo, idx) => {
                const selected = heroPhotos.includes(photo.url)
                const pos = heroPhotos.indexOf(photo.url)
                return (
                  <button key={idx} onClick={() => {
                      setHeroPhotos(prev => selected ? prev.filter(u => u !== photo.url) : [...prev, photo.url])
                      setSaved(false)
                    }}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                      selected ? 'border-[#F4581A] ring-2 ring-[#F4581A]/30 shadow-md' : 'border-gray-200 opacity-60 hover:opacity-80'
                    }`}>
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {selected && (
                      <div className="absolute inset-0 bg-[#F4581A]/10 flex items-end justify-end p-1.5">
                        <span className="bg-[#F4581A] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                          {pos + 1}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
          {heroPhotos.length > 0 && (
            <p className="text-xs text-gray-500 mt-3">{heroPhotos.length} photos selected · shown in order</p>
          )}
        </div>
      )}
    </div>
  )
}
