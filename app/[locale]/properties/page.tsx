import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getProperties } from '@/lib/notion'
import type { PropertyFilters } from '@/lib/notion-types'
import { SITE_URL, SITE_NAME } from '@/lib/site'
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

  const title = city
    ? `Rental Properties in ${city} | ${SITE_NAME}`
    : `Rental Properties in Thailand | ${SITE_NAME}`
  const description = city
    ? `Browse verified rental properties in ${city} for expats. Filter by price, bedrooms, amenities and more.`
    : `Browse 500+ verified rental properties in Thailand for expats. Bangkok, Chiang Mai, Phuket. Filter by price, bedrooms, and amenities.`

  const canonicalUrl = city
    ? `${SITE_URL}/${locale}/properties?city=${encodeURIComponent(city)}`
    : `${SITE_URL}/${locale}/properties`

  return {
    title,
    description,
    keywords: city
      ? [`rental properties ${city}`, `expat housing ${city}`, `${city} rent Thailand`]
      : ['rental properties Thailand', 'expat housing Thailand', 'Bangkok rent', 'Chiang Mai rent', 'Phuket rent'],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
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

  const cityLabel = filters.city

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: `${SITE_URL}/${locale}/properties` },
      ...(cityLabel ? [{ '@type': 'ListItem', position: 3, name: cityLabel, item: `${SITE_URL}/${locale}/properties?city=${encodeURIComponent(cityLabel)}` }] : []),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-serif font-medium text-[#1A2624] mb-1">
            {cityLabel ? `Properties in ${cityLabel}` : 'Browse Properties'}
          </h1>
          <p className="text-gray-500 text-sm">
            {properties.length} verified rental {properties.length === 1 ? 'property' : 'properties'} for expats
            {cityLabel ? ` in ${cityLabel}` : ' across Thailand'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Main browser (client) — includes sidebar filters with URL sync */}
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
    </>
  )
}
