'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Property, PropertyFilters as Filters } from '@/lib/notion-types'
import PropertyCard from '@/components/PropertyCard'
import PropertyFiltersComponent from '@/components/PropertyFilters'
import SearchBar from '@/components/SearchBar'
import MapView from '@/components/MapView'
import EmptyState from '@/components/EmptyState'
import { PropertyCardSkeletonGrid } from '@/components/PropertyCardSkeleton'
import { LayoutGrid, List, Map, X } from 'lucide-react'
import { SlidersHorizontal } from 'lucide-react'

interface PropertiesBrowserProps {
  properties: Property[]
  locale: string
  initialFilters: Filters
  initialView: string
  initialSort: string
  initialPage: number
  totalCount: number
  cities: string[]
}

const PAGE_SIZE = 24

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'verified', label: 'Verified First' },
]

function buildFilterChips(filters: Filters) {
  const chips: { key: string; label: string }[] = []
  if (filters.city) chips.push({ key: 'city', label: `City: ${filters.city}` })
  if (filters.district) chips.push({ key: 'district', label: `District: ${filters.district}` })
  if (filters.bedrooms) chips.push({ key: 'bedrooms', label: `${filters.bedrooms}+ beds` })
  if (filters.bathrooms) chips.push({ key: 'bathrooms', label: `${filters.bathrooms}+ baths` })
  if (filters.minPrice || filters.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `฿${filters.minPrice.toLocaleString()} – ฿${filters.maxPrice.toLocaleString()}`
      : filters.minPrice
        ? `From ฿${filters.minPrice.toLocaleString()}`
        : `Up to ฿${filters.maxPrice!.toLocaleString()}`
    chips.push({ key: 'price', label })
  }
  if (filters.availableNow) chips.push({ key: 'availableNow', label: 'Available Now' })
  if (filters.amenities?.length) {
    chips.push({ key: 'amenities', label: `Amenities (${filters.amenities.length})` })
  }
  return chips
}

export default function PropertiesBrowser({
  properties,
  locale,
  initialFilters,
  initialView,
  initialSort,
  initialPage,
  totalCount,
  cities,
}: PropertiesBrowserProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [view, setView] = useState(initialView)
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(initialPage)
  const [searchQuery, setSearchQuery] = useState('')

  function buildParams(
    f: Filters,
    overrides: Record<string, string | undefined> = {},
  ) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(f)) {
      if (v !== undefined && v !== '' && v !== null && v !== false) {
        if (Array.isArray(v)) {
          for (const item of v) params.append(k, String(item))
        } else {
          params.set(k, String(v))
        }
      }
    }
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) params.delete(k)
      else params.set(k, v)
    }
    return params.toString()
  }

  const navigate = useCallback(
    (qs: string) => {
      startTransition(() => {
        router.replace(`${pathname}?${qs}`)
      })
    },
    [pathname, router],
  )

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    setPage(1)
  }, [])

  const handleFiltersChange = useCallback(
    (newFilters: Filters) => {
      setFilters(newFilters)
      setPage(1)
      navigate(buildParams(newFilters, { view, sort, page: '1' }))
    },
    [view, sort, navigate],
  )

  const handleDismissChip = useCallback(
    (key: string) => {
      const next: Filters = { ...filters }
      if (key === 'price') {
        delete next.minPrice
        delete next.maxPrice
      } else if (key === 'amenities') {
        delete next.amenities
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (next as any)[key]
      }
      setFilters(next)
      setPage(1)
      navigate(buildParams(next, { view, sort, page: '1' }))
    },
    [filters, view, sort, navigate],
  )

  const handleClearAll = useCallback(() => {
    const cleared: Filters = {}
    setFilters(cleared)
    setSearchQuery('')
    setPage(1)
    navigate(buildParams(cleared, { view, sort, page: '1' }))
  }, [view, sort, navigate])

  // Client-side filter by search query
  const filtered = searchQuery
    ? properties.filter((p) => {
        const q = searchQuery.toLowerCase()
        return (
          Object.values(p.title).some((t) => t.toLowerCase().includes(q)) ||
          p.city.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
        )
      })
    : properties

  // Client-side sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price_asc') return a.priceTHB - b.priceTHB
    if (sort === 'price_desc') return b.priceTHB - a.priceTHB
    if (sort === 'verified') return (b.verifiedAt ? 1 : 0) - (a.verifiedAt ? 1 : 0)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const filterChips = buildFilterChips(filters)
  const hasActiveFilters = filterChips.length > 0 || searchQuery

  const cityLabel = filters.city ?? null

  return (
    <div className="flex-1 min-w-0 flex gap-6">
      {/* Sidebar filters (desktop) */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <PropertyFiltersComponent
          filters={filters}
          onChange={handleFiltersChange}
          cities={cities}
        />
      </aside>

      <div className="flex-1 min-w-0">
      {/* Search */}
      <div className="mb-4">
        <SearchBar onSearch={handleSearch} className="max-w-2xl" />
      </div>

      {/* Results header */}
      <div className="mb-3">
        <h2 className="text-sm font-medium text-gray-700">
          <span className="text-gray-900 font-semibold">{sorted.length}</span>{' '}
          {sorted.length === 1 ? 'property' : 'properties'} found
          {cityLabel && (
            <> in <span className="text-blue-700">{cityLabel}</span></>
          )}
        </h2>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center gap-2 mb-4"
          >
            {filterChips.map((chip) => (
              <motion.button
                key={chip.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleDismissChip(chip.key)}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {chip.label}
                <X className="w-3 h-3" />
              </motion.button>
            ))}
            {searchQuery && (
              <motion.button
                key="search"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                &ldquo;{searchQuery}&rdquo;
                <X className="w-3 h-3" />
              </motion.button>
            )}
            <button
              onClick={handleClearAll}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 hidden sm:block" />
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={sort}
            onChange={(e) => {
              const newSort = e.target.value
              setSort(newSort)
              setPage(1)
              navigate(buildParams(filters, { sort: newSort, view, page: '1' }))
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['grid', 'list', 'map'] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v)
                navigate(buildParams(filters, { view: v, sort, page: String(page) }))
              }}
              aria-label={v}
              className={`p-2 transition-colors ${
                view === v
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v === 'grid' && <LayoutGrid className="w-4 h-4" />}
              {v === 'list' && <List className="w-4 h-4" />}
              {v === 'map' && <Map className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Filters (mobile) */}
      <div className="lg:hidden mb-4">
        <PropertyFiltersComponent
          filters={filters}
          onChange={handleFiltersChange}
          cities={cities}
        />
      </div>

      {/* Map view */}
      <AnimatePresence mode="wait">
        {view === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl overflow-hidden border border-gray-200 h-[600px]"
          >
            <MapView properties={paginated} locale={locale} />
          </motion.div>
        )}

        {view !== 'map' && (
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Loading skeleton */}
            {isPending ? (
              <PropertyCardSkeletonGrid count={PAGE_SIZE} view={view as 'grid' | 'list'} />
            ) : paginated.length === 0 ? (
              <EmptyState
                title="No properties found"
                description="Try adjusting your filters or search query to find more properties."
                action={{ label: 'Clear filters', href: pathname }}
              />
            ) : (
              <motion.div
                layout
                className={
                  view === 'list'
                    ? 'flex flex-col gap-4'
                    : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                }
              >
                <AnimatePresence mode="popLayout">
                  {paginated.map((property, idx) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.3) }}
                    >
                      <PropertyCard
                        property={property}
                        locale={locale}
                        view={view as 'grid' | 'list'}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Pagination */}
            {!isPending && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 1 && (
                  <button
                    onClick={() => {
                      setPage((p) => p - 1)
                      navigate(buildParams(filters, { view, sort, page: String(page - 1) }))
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        setPage(p)
                        navigate(buildParams(filters, { view, sort, page: String(p) }))
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                {page < totalPages && (
                  <button
                    onClick={() => {
                      setPage((p) => p + 1)
                      navigate(buildParams(filters, { view, sort, page: String(page + 1) }))
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
