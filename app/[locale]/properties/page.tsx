import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getProperties } from '@/lib/notion'
import type { PropertyFilters } from '@/lib/notion-types'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import PropertyFiltersComponent from '@/components/PropertyFilters'
import PropertiesBrowser from './PropertiesBrowser'

interface PropertiesPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getString(val: string | string[] | undefined): string | undefined {
  if (Array.isArray(val)) return val[0]
  return val
}

function getNumber(val: string | string[] | undefined): number | undefined {
  const s = getString(val)
  if (!s) return undefined
  const n = Number(s)
  return isNaN(n) ? undefined : n
}

function parseFilters(sp: Record<string, string | string[] | undefined>): PropertyFilters {
  const amenities = sp.amenities
    ? Array.isArray(sp.amenities) ? sp.amenities : [sp.amenities]
    : undefined

  return {
    city: getString(sp.city),
    district: getString(sp.district),
    minPrice: getNumber(sp.minPrice),
    maxPrice: getNumber(sp.maxPrice),
    bedrooms: getNumber(sp.bedrooms),
    bathrooms: getNumber(sp.bathrooms),
    minSize: getNumber(sp.minSize),
    maxSize: getNumber(sp.maxSize),
    amenities,
    availableNow: sp.availableNow === 'true',
    availableFrom: getString(sp.availableFrom),
    status: getString(sp.status),
  }
}

export async function generateMetadata({ params, searchParams }: PropertiesPageProps): Promise<Metadata> {
  const { locale } = await params
  const sp = await searchParams
  const city = getString(sp.city)

  const titleSuffix = city ? ` in ${city}` : ' in Thailand'
  const title = `Rental Properties${titleSuffix} | ${SITE_NAME}`
  const description = `Browse verified rental properties${titleSuffix}. Filter by price, bedrooms, amenities and more.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/${locale}/properties` },
    openGraph: { title, description, url: `${SITE_URL}/${locale}/properties`, siteName: SITE_NAME },
  }
}

export const revalidate = 3600

export default async function PropertiesPage({ params, searchParams }: PropertiesPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const sp = await searchParams

  const filters = parseFilters(sp)
  const view = getString(sp.view) ?? 'grid'
  const sort = getString(sp.sort) ?? 'newest'
  const page = getNumber(sp.page) ?? 1

  const properties = await getProperties(filters, locale).catch(() => [])

  // Derive unique cities from results for filter dropdown
  const cities = Array.from(new Set(properties.map((p) => p.city).filter(Boolean))).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Properties</h1>
          <p className="text-gray-500 text-sm">Verified rental properties for expats across Thailand</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar filters (desktop) — client component with URL push */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <PropertyFiltersComponent
            filters={filters}
            onChange={() => {}}
            cities={cities}
          />
        </aside>

        {/* Main browser (client) */}
        <PropertiesBrowser
          properties={properties}
          locale={locale}
          initialFilters={filters}
          initialView={view}
          initialSort={sort}
          initialPage={page}
          totalCount={properties.length}
          cities={cities}
        />
      </div>
    </div>
  )
}
