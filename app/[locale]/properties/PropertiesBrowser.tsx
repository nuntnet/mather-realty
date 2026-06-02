'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { Property, PropertyFilters as Filters } from '@/lib/notion-types'
import PropertyCard from '@/components/PropertyCard'
import PropertyFiltersComponent from '@/components/PropertyFilters'
import SearchBar from '@/components/SearchBar'
import MapView from '@/components/MapView'
import { LayoutGrid, List, Map } from 'lucide-react'

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

  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [view, setView] = useState(initialView)
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(initialPage)
  const [searchQuery, setSearchQuery] = useState('')

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { view, sort, page: String(page), ...overrides }
    for (const [k, v] of Object.entries({ ...filters, ...merged })) {
      if (v !== undefined && v !== '' && v !== null) {
        if (Array.isArray(v)) {
          for (const item of v) params.append(k, String(item))
        } else {
          params.set(k, String(v))
        }
      }
    }
    return `${pathname}?${params.toString()}`
  }

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    setPage(1)
  }, [])

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters)
    setPage(1)
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(newFilters)) {
      if (v !== undefined && v !== '' && v !== null) {
        if (Array.isArray(v)) {
          for (const item of v) params.append(k, String(item))
        } else {
          params.set(k, String(v))
        }
      }
    }
    params.set('view', view)
    params.set('sort', sort)
    router.push(`${pathname}?${params.toString()}`)
  }, [view, sort, pathname, router])

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

  return (
    <div className="flex-1 min-w-0">
      {/* Search */}
      <div className="mb-4">
        <SearchBar onSearch={handleSearch} className="max-w-2xl" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="text-sm text-gray-600">
          {sorted.length} {sorted.length === 1 ? 'property' : 'properties'} found
        </p>

        <div className="flex items-center gap-3">
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
              router.push(buildUrl({ sort: e.target.value, page: '1' }))
            }}
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="verified">Verified First</option>
          </select>

          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['grid', 'list', 'map'] as const).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setView(v)
                  router.push(buildUrl({ view: v }))
                }}
                className={`p-2 ${view === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {v === 'grid' && <LayoutGrid className="w-4 h-4" />}
                {v === 'list' && <List className="w-4 h-4" />}
                {v === 'map' && <Map className="w-4 h-4" />}
              </button>
            ))}
          </div>
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
      {view === 'map' && (
        <div className="rounded-xl overflow-hidden border border-gray-200 h-[600px]">
          <MapView properties={paginated} locale={locale} />
        </div>
      )}

      {/* Grid/list view */}
      {view !== 'map' && (
        <>
          {paginated.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg font-medium mb-2">No properties found</p>
              <button onClick={() => handleFiltersChange({})} className="text-blue-600 hover:underline text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={view === 'list'
              ? 'flex flex-col gap-4'
              : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
            }>
              {paginated.map((property) => (
                <PropertyCard key={property.id} property={property} locale={locale} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <button
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                )
              })}
              {page < totalPages && (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
