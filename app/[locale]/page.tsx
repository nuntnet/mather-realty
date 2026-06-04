import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getFeaturedProperties } from '@/lib/notion'
import { routing } from '@/i18n/routing'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { HERO_IMAGE } from '@/lib/images'
import PropertyCard from '@/components/PropertyCard'
import HomeSearchBar from './HomeSearchBar'
import { Link } from '@/i18n/navigation'
import { Building2, Search, MessageCircle, Home, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params

  const alternates: Record<string, string> = {}
  for (const l of routing.locales) {
    alternates[l] = `${SITE_URL}/${l}`
  }

  return {
    title: 'Find Rental Properties in Thailand | DoubleN Realty',
    description:
      'Browse 500+ verified rental properties in Thailand for expats. Bangkok, Chiang Mai, Phuket. Direct contact with landlords.',
    keywords: ['rental properties Thailand', 'expat housing Thailand', 'Bangkok rent'],
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: alternates,
    },
    openGraph: {
      title: 'Find Rental Properties in Thailand | DoubleN Realty',
      description:
        'Browse 500+ verified rental properties in Thailand for expats. Bangkok, Chiang Mai, Phuket. Direct contact with landlords.',
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_NAME,
      type: 'website',
      images: [
        {
          url: HERO_IMAGE,
          width: 1920,
          height: 1080,
          alt: 'Rental Properties in Thailand — DoubleN Realty',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Find Rental Properties in Thailand | DoubleN Realty',
      description:
        'Browse 500+ verified rental properties in Thailand for expats. Bangkok, Chiang Mai, Phuket. Direct contact with landlords.',
      images: [HERO_IMAGE],
    },
  }
}

export const revalidate = 3600

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'home' })

  const featuredProperties = await getFeaturedProperties(locale, 6).catch(() => [])

  const steps = [
    {
      icon: <Search className="w-8 h-8 text-[#46a758]" />,
      title: 'Browse',
      description: 'Search thousands of verified rental properties across Thailand',
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-[#46a758]" />,
      title: 'Inquire',
      description: 'Contact landlords directly via LINE, WhatsApp, or email',
    },
    {
      icon: <Home className="w-8 h-8 text-[#46a758]" />,
      title: 'Move In',
      description: 'Sign your lease and move into your new Thai home',
    },
  ]

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'DoubleN Realty',
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/${locale}/properties?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'RealEstateAgent',
        name: 'DoubleN Realty',
        description: 'Premium rental platform for expats in Thailand',
        areaServed: 'Thailand',
        url: SITE_URL,
        email: 'hello@doublen-realty.com',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'TH',
        },
      },
    ],
  }

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Hero */}
      <section
        className="relative min-h-[75vh] flex items-center text-white px-4"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgba(27,81,42,0.82), rgba(70,167,88,0.5), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtle animated overlay shimmer */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center w-full py-24">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
            {t('hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-10 drop-shadow">
            {t('hero_subtitle')}
          </p>

          {/* Glassmorphism search bar wrapper */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl mb-8">
            <HomeSearchBar locale={locale} />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-green-100 mb-10">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#65c170] inline-block" />
              500+ Expats Helped
            </span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b2e5b4] inline-block" />
              Bangkok · Chiang Mai · Phuket
            </span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#65c170] inline-block" />
              Verified Listings
            </span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-6 py-3 text-center min-w-[120px]">
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-green-200 mt-0.5">Active Listings</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-6 py-3 text-center min-w-[120px]">
              <p className="text-2xl font-bold">Bangkok</p>
              <p className="text-xs text-green-200 mt-0.5">Top Location</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-6 py-3 text-center min-w-[120px]">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-green-200 mt-0.5">Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t('featured_title')}</h2>
          <Link href="/properties" className="flex items-center gap-1 text-[#297c3b] hover:text-[#46a758] font-medium">
            {t('view_all')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>Featured listings coming soon.</p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 mb-12">
            Finding your next home in Thailand is easy with DoubleN Realty
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-[#46a758]/10 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#46a758] text-white text-sm font-bold flex items-center justify-center mb-3">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm text-center">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-[#1b512a] to-[#46a758] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-green-200" />
          <h2 className="text-3xl font-bold mb-4">Are you a landlord?</h2>
          <p className="text-green-100 text-lg mb-8">
            List your property and reach thousands of expats looking for rental homes in Thailand.
            It&apos;s free to get started.
          </p>
          <Button asChild size="lg" className="bg-white text-[#1b512a] hover:bg-green-50 font-semibold">
            <Link href="/submit">List Your Property</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
