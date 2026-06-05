import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getProperty, getProperties } from '@/lib/notion'
import { routing } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import PropertyGallery from '@/components/PropertyGallery'
import InquiryForm from '@/components/InquiryForm'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import NearbyPanel from '@/components/NearbyPanel'
import PropertyCard from '@/components/PropertyCard'
import { Badge } from '@/components/ui/badge'
import {
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  CalendarDays,
  MapPin,
  ArrowLeft,
  Layers,
  ParkingSquare,
  Phone,
  MessageCircle,
  ScrollText,
  Banknote,
} from 'lucide-react'
import PropertyDetailActions from './PropertyDetailActions'
import PersonaSection from '@/components/PersonaSection'
import FAQSection from '@/components/FAQSection'
import PropertyMap from '@/components/PropertyMap'
import StickyPropertyCTA from '@/components/StickyPropertyCTA'

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
  const description = property.seoDescription ||
    (property.description[locale] ?? property.description.en ?? '')
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
    keywords: [
      ...property.perfectFor.map(p => p + ' housing thailand'),
      property.city,
      'expat rental',
      'rental property thailand',
      property.tags.join(', '),
    ].filter(Boolean),
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
    available: 'bg-[#daf6da] text-[#297c3b]',
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

  // Availability display text (server-side safe — no hydration concerns)
  const availabilityText = (() => {
    if (property.status !== 'available') return statusLabel[property.status] ?? property.status
    if (!property.availableFrom) return 'Available Now'
    const d = new Date(property.availableFrom)
    if (d <= new Date()) return 'Available Now'
    return `From ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  })()
  const isAvailableNow = property.status === 'available'

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
    ...(property.perfectFor.length > 0
      ? {
          audience: property.perfectFor.map(persona => ({
            '@type': 'Audience',
            audienceType: persona,
          })),
        }
      : {}),
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

  // Build WhatsApp number: strip leading 0, prepend country code 66
  const whatsappNumber = property.contactPhone
    ? `66${property.contactPhone.replace(/^0/, '').replace(/\D/g, '')}`
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#f1f4f0] pt-16 pb-28 lg:pb-0">

        {/* HERO — full-bleed with floating nav buttons */}
        <section
          className="relative w-full"
          style={{ height: '72vh', minHeight: '500px', maxHeight: '820px' }}
        >
          {/* Background: photo or gradient fallback */}
          {property.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.coverImage}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1b512a] via-[#297c3b] to-[#46a758]" />
          )}

          {/* Top vignette — makes floating buttons legible on bright photos */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

          {/* Bottom vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

          {/* Floating nav bar */}
          <div className="absolute top-3 left-0 right-0 px-4 flex items-center justify-between z-10">
            <Link
              href="/properties"
              className="flex items-center justify-center h-10 w-10 rounded-full bg-black/25 backdrop-blur-sm border border-white/20 text-white hover:bg-black/40 transition-colors"
              aria-label="Back to properties"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <PropertyDetailActions title={title} variant="glass" />
          </div>

          {/* Bottom overlay: badges · title · location · price + photos */}
          <div className="absolute bottom-0 left-0 right-0 px-5 md:px-10 pb-16">
            <div className="max-w-7xl mx-auto">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    statusColors[property.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {statusLabel[property.status] ?? property.status}
                </span>
                {property.verifiedAt && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('verified')}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
                {title}
              </h1>

              {/* Price */}
              <p className="text-2xl md:text-3xl font-bold text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
                ฿{property.priceTHB.toLocaleString()}
                <span className="text-base font-normal text-white/70 ml-1">
                  {t('price_per_month')}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT CARD — slides up over the hero bottom */}
        <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)]">

          {/* ── Availability + Location strip ── */}
          <div className="px-5 sm:px-8 pt-7 pb-6 border-b border-[#eaece9]">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-start gap-5">

              {/* Availability */}
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                  isAvailableNow ? 'bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.18)]' :
                  property.status === 'coming_soon' ? 'bg-yellow-400 shadow-[0_0_0_4px_rgba(250,204,21,0.2)]' :
                  'bg-red-400'
                }`} />
                <div>
                  <p className="text-[10px] font-bold text-[#898e87] uppercase tracking-widest mb-0.5">Availability</p>
                  <p className={`text-base font-bold leading-snug ${isAvailableNow ? 'text-green-700' : 'text-[#1d211c]'}`}>
                    {availabilityText}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-px self-stretch bg-[#eaece9]" />

              {/* Location */}
              <div className="flex items-start gap-3 flex-1">
                <MapPin className="w-4 h-4 text-[#46a758] shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-[#898e87] uppercase tracking-widest mb-0.5">Location</p>
                  <p className="text-base font-semibold text-[#1d211c] leading-snug">
                    {property.address}{property.district ? `, ${property.district}` : ''}, {property.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery strip */}
          {(property.gallery.length > 0 || property.coverImage) && (
            <section className="max-w-7xl mx-auto px-4 pt-8 pb-2">
              <PropertyGallery
                images={property.gallery}
                coverImage={property.coverImage}
                virtualTourUrl={property.virtualTourUrl ?? undefined}
              />
            </section>
          )}

          {/* MAIN CONTENT GRID */}
          <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-10">

              {/* 1. SPECS GRID — 3 per row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Bedrooms */}
                <div className="flex flex-col items-center bg-white rounded-2xl px-2 py-4 text-center border border-[#e8ebe7] shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#edf9ee] flex items-center justify-center mb-2.5">
                    <Bed className="w-5 h-5 text-[#46a758]" />
                  </div>
                  <span className="text-2xl font-black text-[#1d211c] leading-none">{property.bedrooms}</span>
                  <span className="text-[11px] font-medium text-[#898e87] mt-1 leading-tight">{t('bedrooms')}</span>
                </div>

                {/* Bathrooms */}
                <div className="flex flex-col items-center bg-white rounded-2xl px-2 py-4 text-center border border-[#e8ebe7] shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#edf9ee] flex items-center justify-center mb-2.5">
                    <Bath className="w-5 h-5 text-[#46a758]" />
                  </div>
                  <span className="text-2xl font-black text-[#1d211c] leading-none">{property.bathrooms}</span>
                  <span className="text-[11px] font-medium text-[#898e87] mt-1 leading-tight">{t('bathrooms')}</span>
                </div>

                {/* Size */}
                <div className="flex flex-col items-center bg-white rounded-2xl px-2 py-4 text-center border border-[#e8ebe7] shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#edf9ee] flex items-center justify-center mb-2.5">
                    <Maximize2 className="w-5 h-5 text-[#46a758]" />
                  </div>
                  <span className="text-2xl font-black text-[#1d211c] leading-none">{property.sizeSqm}</span>
                  <span className="text-[11px] font-medium text-[#898e87] mt-1 leading-tight">sqm</span>
                </div>

                {/* Floors */}
                {property.floors > 0 && (
                  <div className="flex flex-col items-center bg-white rounded-2xl px-2 py-4 text-center border border-[#e8ebe7] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#edf9ee] flex items-center justify-center mb-2.5">
                      <Layers className="w-5 h-5 text-[#46a758]" />
                    </div>
                    <span className="text-2xl font-black text-[#1d211c] leading-none">{property.floors}</span>
                    <span className="text-[11px] font-medium text-[#898e87] mt-1 leading-tight">Floors</span>
                  </div>
                )}

                {/* Parking */}
                {property.parkingSpots > 0 && (
                  <div className="flex flex-col items-center bg-white rounded-2xl px-2 py-4 text-center border border-[#e8ebe7] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#edf9ee] flex items-center justify-center mb-2.5">
                      <ParkingSquare className="w-5 h-5 text-[#46a758]" />
                    </div>
                    <span className="text-2xl font-black text-[#1d211c] leading-none">{property.parkingSpots}</span>
                    <span className="text-[11px] font-medium text-[#898e87] mt-1 leading-tight">Parking</span>
                  </div>
                )}
              </div>

              {/* 2. RENTAL TERMS */}
              {(property.minLeaseTerm || property.depositMonths) && (
                <div className="rounded-2xl border border-[#e8ebe7] bg-[#f8faf8] px-5 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-[#1d211c] mb-3">
                    <ScrollText className="w-4 h-4 text-[#46a758]" />
                    Rental Terms
                  </h3>
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {property.minLeaseTerm && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#46a758] shrink-0" />
                        <div>
                          <p className="text-[11px] text-[#898e87] font-medium leading-none mb-0.5">Min. contract</p>
                          <p className="text-sm font-bold text-[#1d211c]">{property.minLeaseTerm} month{property.minLeaseTerm > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    )}
                    {property.depositMonths && (
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#46a758] shrink-0" />
                        <div>
                          <p className="text-[11px] text-[#898e87] font-medium leading-none mb-0.5">Security deposit</p>
                          <p className="text-sm font-bold text-[#1d211c]">{property.depositMonths} months&apos; rent</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. HIGHLIGHTS */}
              {property.highlights.length > 0 && (
                <div className="bg-gradient-to-r from-[#f3fcf3] to-[#ebf9eb] border border-[#c9f0ca] rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Highlights</h2>
                  <ul className="space-y-2.5">
                    {property.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#46a758] shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 2b. PERFECT FOR — persona section */}
              {property.perfectFor.length > 0 && (
                <PersonaSection
                  perfectFor={property.perfectFor}
                  personaDescriptions={property.personaDescriptions}
                  propertySlug={property.slug}
                />
              )}

              {/* 3. DESCRIPTION */}
              {description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    About this property
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line prose prose-gray max-w-none">
                    {description}
                  </p>
                </div>
              )}

              {/* 4. AMENITIES */}
              {property.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-sm px-3 py-1">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. AVAILABILITY CALENDAR */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#46a758]" />
                  {t('availability')}
                </h2>
                <AvailabilityCalendar
                  propertyId={property.id}
                  blockedRanges={[]}
                  availableFrom={property.availableFrom ?? undefined}
                />
              </div>

              {/* 6. MAP + NEARBY */}
              {property.lat > 0 && property.lng > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Location</h2>
                  {/* Google Maps embed */}
                  <PropertyMap
                    lat={property.lat}
                    lng={property.lng}
                    title={title}
                    address={[property.address, property.district, property.city].filter(Boolean).join(', ')}
                  />
                  {/* Nearby POIs */}
                  <div className="mt-4">
                    <NearbyPanel
                      propertyId={property.id}
                      lat={property.lat}
                      lng={property.lng}
                    />
                  </div>
                </div>
              )}

              {/* 7. FAQ */}
              {property.faqJson && property.faqJson.length > 0 && (
                <FAQSection faqItems={property.faqJson} propertyTitle={title} />
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

            {/* ── RIGHT COLUMN — Contact Card (sticky) ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-[130px]">
                <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white">

                  {/* Card header — price + status */}
                  <div className="bg-gradient-to-br from-[#1b512a] via-[#297c3b] to-[#46a758] px-6 py-5 text-white">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-2xl font-bold">
                          ฿{property.priceTHB.toLocaleString()}
                          <span className="text-sm font-normal text-white/70 ml-1">
                            {t('price_per_month')}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          statusColors[property.status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabel[property.status] ?? property.status}
                      </span>
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-5">

                    {/* Direct contact buttons */}
                    {(property.contactLine || property.contactPhone) && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Contact owner directly:
                        </p>

                        {/* LINE button */}
                        {property.contactLine && (
                          <a
                            href={`https://line.me/R/ti/p/${property.contactLine}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2.5 w-full bg-[#00B900] hover:bg-[#009900] text-white font-semibold rounded-xl px-4 py-3 transition-colors text-sm"
                          >
                            {/* LINE logo SVG */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.627.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                            Chat on LINE: {property.contactLine}
                          </a>
                        )}

                        {/* WhatsApp button */}
                        {property.contactPhone && whatsappNumber && (
                          <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#1dbd57] text-white font-semibold rounded-xl px-4 py-3 transition-colors text-sm"
                          >
                            {/* WhatsApp logo SVG */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            WhatsApp: {property.contactPhone}
                          </a>
                        )}

                        {/* Phone call button */}
                        {property.contactPhone && (
                          <a
                            href={`tel:${property.contactPhone}`}
                            className="flex items-center justify-center gap-2.5 w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl px-4 py-3 transition-colors text-sm"
                          >
                            <Phone className="w-4 h-4" />
                            Call: {property.contactPhone}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Divider */}
                    {(property.contactLine || property.contactPhone) && (
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-white px-3 text-[#898e87] font-medium">
                            or leave a message
                          </span>
                        </div>
                      </div>
                    )}

                    {/* INQUIRY FORM */}
                    <div id="inquiry">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        <p className="text-sm font-semibold text-gray-700">Send an enquiry</p>
                      </div>
                      <InquiryForm
                        propertyId={property.id}
                        propertyTitle={title}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>{/* /content card */}
      </div>

      <StickyPropertyCTA
        propertySlug={property.slug}
        propertyTitle={title}
        priceTHB={property.priceTHB}
        contactLine={property.contactLine ?? null}
        contactPhone={property.contactPhone ?? null}
        status={property.status}
      />
    </>
  )
}
