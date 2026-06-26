import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import { INTENT_CONFIG, PERSONAS } from '@/lib/intent-config'
import { SITE_URL, SITE_NAME, canonicalUrl } from '@/lib/site'

interface ForIndexPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: ForIndexPageProps): Promise<Metadata> {
  const { locale } = await params
  const pageUrl = `${SITE_URL}/${locale}/properties/for`
  const title = `Rental Properties by Lifestyle | ${SITE_NAME}`
  const description =
    'Find the perfect Bangkok rental tailored to your lifestyle — for teachers, expat couples, families, airline crew, remote workers, digital nomads, and business expats.'

  return {
    title,
    description,
    keywords: [
      'expat housing bangkok',
      'rental properties for teachers',
      'family homes bangkok',
      'airline crew accommodation',
      'digital nomad housing thailand',
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
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

export const revalidate = 86400

export default async function ForIndexPage({ params }: ForIndexPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Rental Properties by Lifestyle Category',
    description:
      'Bangkok rental properties curated by persona — teacher, family, digital nomad, airline crew and more.',
    url: canonicalUrl(`/${locale}/properties/for`),
    numberOfItems: PERSONAS.length,
    itemListElement: PERSONAS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: INTENT_CONFIG[p].title,
      url: canonicalUrl(`/${locale}/properties/for/${p}`),
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl(`/${locale}`) },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: canonicalUrl(`/${locale}/properties`) },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Rentals For',
        item: canonicalUrl(`/${locale}/properties/for`),
      },
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
        <section className="bg-gradient-to-br from-[#E8F6F5] to-[#F7F4EF] border-b border-gray-200">
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
              <span className="font-medium text-[#18605E]">Rentals For</span>
            </nav>

            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Find Your Perfect Bangkok Rental
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                We curate properties by lifestyle. Whether you&apos;re a teacher near an international
                school, a digital nomad, a family, or relocating for work — we have the right home
                for you.
              </p>
            </div>
          </div>
        </section>

        {/* Persona Cards */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Browse by your lifestyle</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERSONAS.map((intent) => {
              const config = INTENT_CONFIG[intent]
              return (
                <Link
                  key={intent}
                  href={`/${locale}/properties/for/${intent}`}
                  className={`group relative rounded-2xl bg-gradient-to-br ${config.bgClass} border border-white/60 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <div className="mb-4 text-4xl">{config.emoji}</div>
                  <h3 className={`text-lg font-bold ${config.color} mb-1`}>{config.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {config.subtitle}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#1E6B69] group-hover:gap-2 transition-all">
                    <span>View properties</span>
                    <span aria-hidden>→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#1E6B69] to-[#1E6B69] py-14">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Not sure which category fits you?
            </h2>
            <p className="text-[#cde9e8] mb-8 max-w-xl mx-auto">
              Browse our full listings and use filters to find exactly what you need — or contact us
              and we&apos;ll match you personally.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/${locale}/properties`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#18605E] hover:bg-[#E8F6F5] transition-colors shadow-md"
              >
                Browse All Properties
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
