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
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
  useDroppable,
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
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────────────────

interface PhotoItem {
  id: string
  url: string
}

type ColumnKey = 'unassigned' | 'exterior' | 'interior' | 'community'

const COLUMNS: { key: ColumnKey; label: string; color: string; bg: string; border: string }[] = [
  { key: 'unassigned', label: '📷 Unassigned', color: 'text-gray-700', bg: 'bg-gray-50',     border: 'border-gray-200' },
  { key: 'exterior',  label: '🏠 Exterior',   color: 'text-teal-700',  bg: 'bg-teal-50/50', border: 'border-teal-200' },
  { key: 'interior',  label: '🛋️ Interior',   color: 'text-blue-700',  bg: 'bg-blue-50/50', border: 'border-blue-200' },
  { key: 'community', label: '🏘️ Community',  color: 'text-purple-700',bg: 'bg-purple-50/50',border: 'border-purple-200' },
]

function makeId(url: string, col: ColumnKey, idx: number) {
  return `${col}::${idx}::${url.slice(-16)}`
}

// ── Sortable photo card ────────────────────────────────────────────────────────

function SortablePhoto({ photo, onRemove, isDimmed }: {
  photo: PhotoItem
  onRemove: (id: string) => void
  isDimmed?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : isDimmed ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}
      className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3]">
        <Image src={photo.url} alt="" fill className="object-cover" sizes="200px" draggable={false} />
        <button
          onClick={() => onRemove(photo.id)}
          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-lg p-1 transition-opacity z-10"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div {...attributes} {...listeners}
        className="flex items-center justify-center py-1.5 bg-gray-50 border-t border-gray-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors">
        <GripVertical className="w-3.5 h-3.5" />
      </div>
    </div>
  )
}

// ── Droppable column ───────────────────────────────────────────────────────────

function Column({ col, photos, onRemove, activeId }: {
  col: typeof COLUMNS[number]
  photos: PhotoItem[]
  onRemove: (id: string) => void
  activeId: UniqueIdentifier | null
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key })

  return (
    <div className={`flex flex-col rounded-2xl border-2 transition-colors min-h-[200px]
      ${isOver ? 'border-[#1E6B69] bg-[#1E6B69]/5' : col.border + ' ' + col.bg}`}>
      {/* Header */}
      <div className={`px-3 py-2.5 border-b ${col.border} flex items-center justify-between`}>
        <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
        <span className="text-xs text-gray-400 font-medium">{photos.length}</span>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} className="flex-1 p-2">
        <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-2">
            {photos.map(p => (
              <SortablePhoto
                key={p.id}
                photo={p}
                onRemove={onRemove}
                isDimmed={activeId !== null && p.id === activeId}
              />
            ))}
          </div>
        </SortableContext>

        {photos.length === 0 && (
          <div className={`flex items-center justify-center h-20 rounded-xl border-2 border-dashed
            ${isOver ? 'border-[#1E6B69] text-[#1E6B69]' : 'border-gray-200 text-gray-300'} transition-colors`}>
            <span className="text-xs font-medium">
              {isOver ? 'Drop here' : 'Drag photos here'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Drag overlay preview ────────────────────────────────────────────────────────

function PhotoPreview({ url }: { url: string }) {
  return (
    <div className="w-28 h-20 rounded-xl overflow-hidden shadow-2xl ring-2 ring-[#1E6B69] rotate-2">
      <img src={url} alt="" className="w-full h-full object-cover" />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PhotoManagerPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [columns, setColumns] = useState<Record<ColumnKey, PhotoItem[]>>({
    unassigned: [], exterior: [], interior: [], community: [],
  })
  const [heroPhotos, setHeroPhotos] = useState<string[]>([])
  const [mainOrder, setMainOrder] = useState<PhotoItem[]>([])     // for cover / main gallery order
  const [propertyTitle, setPropertyTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [activeUrl, setActiveUrl] = useState<string>('')
  const [view, setView] = useState<'categories' | 'hero' | 'order'>('categories')

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
      if (!res.ok) throw new Error()
      const data = await res.json()

      setPropertyTitle(data.titles?.en || data.title || 'Property')

      const toArr = (v: unknown): string[] => {
        if (Array.isArray(v)) return v as string[]
        if (typeof v === 'string') return v.split(',').map((u: string) => u.trim()).filter(Boolean)
        return []
      }

      const ext = toArr(data.exteriorPhotos)
      const int_ = toArr(data.interiorPhotos)
      const com = toArr(data.communityPhotos)
      const hero = toArr(data.heroPhotos)

      const categorised = new Set([...ext, ...int_, ...com])

      // Main gallery = cover + gallery
      const galleryArr: string[] = Array.isArray(data.gallery) ? data.gallery : toArr(data.gallery)
      const cover: string = data.coverImage || ''
      const allMain = cover
        ? [cover, ...galleryArr.filter((u: string) => u !== cover)]
        : galleryArr

      // Unassigned = photos in main gallery not in any category
      const unassigned = allMain.filter(u => !categorised.has(u))

      setColumns({
        unassigned: unassigned.map((url, i) => ({ id: makeId(url, 'unassigned', i), url })),
        exterior:   ext.map((url, i)  => ({ id: makeId(url, 'exterior',   i), url })),
        interior:   int_.map((url, i) => ({ id: makeId(url, 'interior',   i), url })),
        community:  com.map((url, i)  => ({ id: makeId(url, 'community',  i), url })),
      })
      setHeroPhotos(hero)
      setMainOrder(allMain.map((url, i) => ({ id: makeId(url, 'unassigned', i), url })))
    } catch {
      toast.error('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  // ── Find which column an item belongs to ──────────────────────────────────

  function findColumn(id: UniqueIdentifier): ColumnKey | null {
    for (const key of Object.keys(columns) as ColumnKey[]) {
      if (columns[key].some(p => p.id === id)) return key
    }
    return null
  }

  // ── DnD handlers ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
    const col = findColumn(event.active.id)
    if (col) {
      const photo = columns[col].find(p => p.id === event.active.id)
      if (photo) setActiveUrl(photo.url)
    }
  }, [columns])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const fromCol = findColumn(active.id)
    const toCol = (over.id as string).includes('::')
      ? findColumn(over.id)
      : over.id as ColumnKey

    if (!fromCol || !toCol || fromCol === toCol) return

    setColumns(prev => {
      const srcPhotos = [...prev[fromCol]]
      const dstPhotos = [...prev[toCol]]
      const srcIdx = srcPhotos.findIndex(p => p.id === active.id)
      const [moved] = srcPhotos.splice(srcIdx, 1)
      dstPhotos.push(moved)
      return { ...prev, [fromCol]: srcPhotos, [toCol]: dstPhotos }
    })
    setSaved(false)
  }, [columns])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveUrl('')
    if (!over) return

    const fromCol = findColumn(active.id)
    const toCol = findColumn(over.id)
    if (!fromCol || !toCol || fromCol !== toCol) return

    setColumns(prev => {
      const arr = [...prev[fromCol]]
      const oldIdx = arr.findIndex(p => p.id === active.id)
      const newIdx = arr.findIndex(p => p.id === over.id)
      return { ...prev, [fromCol]: arrayMove(arr, oldIdx, newIdx) }
    })
    setSaved(false)
  }, [columns])

  const handleRemove = useCallback((id: string) => {
    setColumns(prev => {
      const col = Object.keys(prev).find(k => prev[k as ColumnKey].some(p => p.id === id)) as ColumnKey
      if (!col) return prev
      return { ...prev, [col]: prev[col].filter(p => p.id !== id) }
    })
    setSaved(false)
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    try {
      const allCategorised = [
        ...columns.exterior,
        ...columns.interior,
        ...columns.community,
        ...columns.unassigned,
      ]

      const body = {
        coverImage: allCategorised[0]?.url || mainOrder[0]?.url || '',
        gallery: allCategorised.slice(1).map(p => p.url),
        exteriorPhotos:  columns.exterior.map(p => p.url).join(','),
        interiorPhotos:  columns.interior.map(p => p.url).join(','),
        communityPhotos: columns.community.map(p => p.url).join(','),
        heroPhotos:      heroPhotos.join(','),
      }

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
      toast.success('Photos saved — categories, order and hero updated.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ── All available photos (for hero picker) ────────────────────────────────

  const allPhotos = [
    ...columns.unassigned,
    ...columns.exterior,
    ...columns.interior,
    ...columns.community,
  ]

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Manage Photos</h1>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{propertyTitle}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || saved}
          className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-600' : 'bg-[#1E6B69] hover:bg-[#18605E]'}`}
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</>
            : saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
            : <><Save className="w-4 h-4" /> Save</>}
        </Button>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[
          { key: 'categories', label: '🗂 Categories' },
          { key: 'hero',       label: `🎠 Hero Carousel (${heroPhotos.length || 'all'})` },
        ].map(t => (
          <button key={t.key} onClick={() => setView(t.key as typeof view)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              view === t.key ? 'border-[#1E6B69] text-[#1E6B69]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CATEGORIES VIEW — drag between columns ── */}
      {view === 'categories' && (
        <>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <GripVertical className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              <strong>Drag</strong> photos between columns to assign categories ·
              Drag within a column to reorder · <strong>First photo</strong> in any column = hero image if no Exterior photos
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {COLUMNS.map(col => (
                <Column
                  key={col.key}
                  col={col}
                  photos={columns[col.key]}
                  onRemove={handleRemove}
                  activeId={activeId}
                />
              ))}
            </div>

            <DragOverlay>
              {activeUrl ? <PhotoPreview url={activeUrl} /> : null}
            </DragOverlay>
          </DndContext>

          <p className="text-xs text-gray-400 mt-4">
            Total: {allPhotos.length} photos ·
            Unassigned: {columns.unassigned.length} ·
            Exterior: {columns.exterior.length} ·
            Interior: {columns.interior.length} ·
            Community: {columns.community.length}
          </p>
        </>
      )}

      {/* ── HERO VIEW — click to pick ── */}
      {view === 'hero' && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-lg shrink-0">🎠</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">Hero Carousel</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Click photos to select which ones appear in the fullscreen hero slider.
                Numbers show display order. <strong>Empty = show all photos.</strong>
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => { setHeroPhotos(allPhotos.map(p => p.url)); setSaved(false) }}
              className="text-xs px-3 py-1.5 bg-[#1E6B69] text-white rounded-lg hover:bg-[#18605E] transition-colors">
              Select all ({allPhotos.length})
            </button>
            <button onClick={() => { setHeroPhotos([]); setSaved(false) }}
              className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              Clear (show all)
            </button>
          </div>

          {allPhotos.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="font-medium">No photos yet</p>
              <p className="text-sm mt-1">Upload via Edit page → Cover Image / Gallery sections</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {allPhotos.map((photo, idx) => {
                const selected = heroPhotos.includes(photo.url)
                const pos = heroPhotos.indexOf(photo.url)
                return (
                  <button key={idx}
                    onClick={() => {
                      setHeroPhotos(prev => selected ? prev.filter(u => u !== photo.url) : [...prev, photo.url])
                      setSaved(false)
                    }}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                      selected
                        ? 'border-[#F4581A] ring-2 ring-[#F4581A]/30 shadow-md'
                        : 'border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {selected && (
                      <div className="absolute inset-0 bg-[#F4581A]/10 flex items-end justify-end p-2">
                        <span className="bg-[#F4581A] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                          {pos + 1}
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
              {heroPhotos.length} photos selected · displayed in selection order
            </p>
          )}
        </div>
      )}
    </div>
  )
}
