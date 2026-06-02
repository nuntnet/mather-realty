import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getProperty, getProperties } from '@/lib/notion'
import { routing } from '@/i18n/routing'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import PropertyGallery from '@/components/PropertyGallery'
import InquiryForm from '@/components/InquiryForm'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import NearbyPanel from '@/components/NearbyPanel'
import PropertyCard from '@/components/PropertyCard'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Bed, Bath, Maximize2, CheckCircle2, CalendarDays, MapPin, ArrowLeft } from 'lucide-react'
import PropertyDetailActions from './PropertyDetailActions'

interface PropertyDetailPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const properties = await getProperties(undefined, 'en')
    return properties
      .filter((p) => p.slug)
      .flatMap((p) =>
        routing.locales.map((locale) => ({ locale, slug: p.slug }))
      )
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const property = await getProperty(slug, locale).catch(() => null)

  if (!property) {
    return { title: 'Property Not Found' }
  }

  const title = property.title[locale] ?? property.title.en ?? slug
  const description = property.description[locale] ?? property.description.en ?? ''
  const image = property.coverImage

  const alternates: Record<string, string> = {}
  for (const l of routing.locales) {
    alternates[l] = `${SITE_URL}/${l}/properties/${slug}`
  }

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/properties/${slug}`,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/properties/${slug}`,
      siteName: SITE_NAME,
      type: 'website',
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
  }
}

export const revalidate = 3600

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const property = await getProperty(slug, locale).catch(() => null)
  if (!property) notFound()

  const t = await getTranslations({ locale, namespace: 'property' })

  const title = property.title[locale] ?? property.title.en ?? slug
  const description = property.description[locale] ?? property.description.en ?? ''

  // Similar properties (same city, exclude self)
  const allCityProps = await getProperties({ city: property.city }, locale).catch(() => [])
  const similarProperties = allCityProps
    .filter((p) => p.id !== property.id && p.status === 'available')
    .slice(0, 3)

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    rented: 'bg-red-100 text-red-800',
    coming_soon: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-gray-100 text-gray-700',
  }

  const statusLabel: Record<string, string> = {
    available: t('available'),
    rented: t('rented'),
    coming_soon: t('coming_soon'),
    pending: 'Pending',
  }

  // JSON-LD Accommodation schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: title,
    description,
    url: `${SITE_URL}/${locale}/properties/${slug}`,
    numberOfRooms: property.bedrooms,
    floorSize: { '@type': 'QuantitativeValue', value: property.sizeSqm, unitCode: 'MTK' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressCountry: 'TH',
      streetAddress: property.address,
    },
    ...(property.lat && property.lng
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: property.lat,
            longitude: property.lng,
          },
        }
      : {}),
    ...(property.coverImage ? { image: property.coverImage } : {}),
    offers: {
      '@type': 'Offer',
      price: property.priceTHB,
      priceCurrency: 'THB',
      availability:
        property.status === 'available'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  const propertiesHref = locale === 'en' ? '/properties' : `/${locale}/properties`
  const homeHref = locale === 'en' ? '/' : `/${locale}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Breadcrumb + back nav bar */}
        <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <a
              href={propertiesHref}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </a>

            <Breadcrumb className="flex-1 min-w-0">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={homeHref}>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={propertiesHref}>Properties</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="truncate max-w-[200px] sm:max-w-xs">
                    {title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Share button — client component */}
            <PropertyDetailActions title={title} />
          </div>
        </div>

        {/* Gallery */}
        <PropertyGallery
          images={property.gallery}
          coverImage={property.coverImage}
          virtualTourUrl={property.virtualTourUrl ?? undefined}
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & price */}
              <div>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[property.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {statusLabel[property.status] ?? property.status}
                    </span>
                    {property.verifiedAt && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('verified')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{property.address}{property.district ? `, ${property.district}` : ''}, {property.city}</span>
                </div>

                <p className="text-3xl font-bold text-blue-600">
                  ฿{property.priceTHB.toLocaleString()}<span className="text-base font-normal text-gray-500">{t('price_per_month')}</span>
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
                  <Bed className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-xl font-bold">{property.bedrooms}</span>
                  <span className="text-xs text-gray-500">{t('bedrooms')}</span>
                </div>
                <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
                  <Bath className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-xl font-bold">{property.bathrooms}</span>
                  <span className="text-xs text-gray-500">{t('bathrooms')}</span>
                </div>
                <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4">
                  <Maximize2 className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-xl font-bold">{property.sizeSqm}</span>
                  <span className="text-xs text-gray-500">sqm</span>
                </div>
              </div>

              {/* Description */}
              {description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('description')}</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('amenities')}</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-sm px-3 py-1">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Calendar */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  {t('availability')}
                </h2>
                <AvailabilityCalendar
                  propertyId={property.id}
                  blockedRanges={[]}
                  availableFrom={property.availableFrom ?? undefined}
                />
              </div>

              {/* Nearby */}
              {property.lat && property.lng && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('nearby')}</h2>
                  <NearbyPanel
                    propertyId={property.id}
                    lat={property.lat}
                    lng={property.lng}
                  />
                </div>
              )}

              {/* Similar Properties */}
              {similarProperties.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Similar properties in {property.city}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {similarProperties.map((similar) => (
                      <PropertyCard
                        key={similar.id}
                        property={similar}
                        locale={locale}
                        view="grid"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar — Inquiry form (sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <InquiryForm
                  propertyId={property.id}
                  propertyTitle={title}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
