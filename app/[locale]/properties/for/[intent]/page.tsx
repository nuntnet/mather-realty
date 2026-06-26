import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import { getPropertiesByPersona } from '@/lib/notion'
import { INTENT_CONFIG, PERSONAS, type Persona } from '@/lib/intent-config'
import { SITE_URL, SITE_NAME, canonicalUrl } from '@/lib/site'
import PropertyCard from '@/components/PropertyCard'

interface IntentPageProps {
  params: Promise<{ locale: string; intent: string }>
}

export async function generateStaticParams() {
  const params: { locale: string; intent: string }[] = []
  for (const locale of routing.locales) {
    for (const intent of PERSONAS) {
      params.push({ locale, intent })
    }
  }
  return params
}

export async function generateMetadata({ params }: IntentPageProps): Promise<Metadata> {
  const { locale, intent } = await params

  if (!PERSONAS.includes(intent as Persona)) {
    return { title: 'Not Found' }
  }

  const config = INTENT_CONFIG[intent as Persona]
  const pageUrl = `${SITE_URL}/${locale}/properties/for/${intent}`

  return {
    title: `${config.metaTitle} | ${SITE_NAME}`,
    description: config.metaDesc,
    keywords: config.keywords,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${config.metaTitle} | ${SITE_NAME}`,
      description: config.metaDesc,
      url: pageUrl,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.metaTitle} | ${SITE_NAME}`,
      description: config.metaDesc,
    },
  }
}

export const revalidate = 3600

export default async function IntentPage({ params }: IntentPageProps) {
  const { locale, intent } = await params
  setRequestLocale(locale)

  if (!PERSONAS.includes(intent as Persona)) {
    notFound()
  }

  const config = INTENT_CONFIG[intent as Persona]
  const properties = await getPropertiesByPersona(intent, locale).catch(() => [])

  const pageUrl = `${SITE_URL}/${locale}/properties/for/${intent}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.metaTitle,
    description: config.metaDesc,
    url: pageUrl,
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${locale}/properties/${p.slug}`,
      name: p.title[locale] ?? p.title['en'] ?? '',
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl(`/${locale}`) },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: canonicalUrl(`/${locale}/properties`) },
      { '@type': 'ListItem', position: 3, name: 'Rentals For', item: canonicalUrl(`/${locale}/properties/for`) },
      { '@type': 'ListItem', position: 4, name: config.title, item: pageUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className={`bg-gradient-to-br ${config.bgClass} border-b border-gray-200`}>
          <div className="max-w-7xl mx-auto px-4 py-14 md:py-20">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
              <Link href={`/${locale}`} className="hover:text-gray-700 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href={`/${locale}/properties`} className="hover:text-gray-700 transition-colors">
                Properties
              </Link>
              <span>/</span>
              <Link href={`/${locale}/properties/for`} className="hover:text-gray-700 transition-colors">
                Rentals For
              </Link>
              <span>/</span>
              <span className={`font-medium ${config.color}`}>{config.title}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="mb-4 text-5xl md:text-6xl">{config.emoji}</div>
              <h1 className={`text-3xl md:text-5xl font-bold text-gray-900 mb-4`}>
                {config.headline}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-2">{config.subtitle}</p>
              <p className="text-gray-500 mt-4 max-w-2xl leading-relaxed">{config.description}</p>
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/50 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                <p className="text-sm text-gray-500">Available properties</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/50 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-sm text-gray-500">Verified listings</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/50 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">Free</p>
                <p className="text-sm text-gray-500">Agent assistance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Property Grid */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          {properties.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                </h2>
                <Link
                  href={`/${locale}/properties`}
                  className="text-sm text-[#1E6B69] hover:text-[#18605E] transition-colors"
                >
                  Browse all properties
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} locale={locale} view="grid" />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center">
              <div className="text-5xl mb-4">{config.emoji}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No properties listed yet</h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                We&apos;re curating properties for {config.title.toLowerCase()}. Check back soon or browse all
                listings.
              </p>
              <Link
                href={`/${locale}/properties`}
                className="inline-flex items-center gap-2 rounded-full bg-[#1E6B69] px-6 py-3 text-sm font-medium text-white hover:bg-[#18605E] transition-colors"
              >
                Browse all properties
              </Link>
            </div>
          )}
        </section>

        {/* Other personas */}
        <section className="max-w-7xl mx-auto px-4 pb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by other categories</h2>
          <div className="flex flex-wrap gap-3">
            {PERSONAS.filter((p) => p !== intent).map((p) => {
              const cfg = INTENT_CONFIG[p]
              return (
                <Link
                  key={p}
                  href={`/${locale}/properties/for/${p}`}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#7FCECC] hover:bg-[#E8F6F5] hover:text-[#18605E] transition-colors shadow-sm"
                >
                  <span>{cfg.emoji}</span>
                  <span>{cfg.title.replace(/^(Homes for |Rentals for |Premium Rentals for |Family Homes for Rent in Bangkok$)/, '').trim() || cfg.title}</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#1E6B69] to-[#1E6B69] py-14">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Need help finding the right home?
            </h2>
            <p className="text-[#cde9e8] mb-8 max-w-xl mx-auto">
              Our team specialises in helping expats relocate to Thailand. Tell us what you need and
              we&apos;ll find the perfect match.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/${locale}/properties`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#18605E] hover:bg-[#E8F6F5] transition-colors shadow-md"
              >
                Browse All Listings
              </Link>
              <a
                href="https://line.me/ti/p/~@doublenrealty"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Contact via LINE
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
