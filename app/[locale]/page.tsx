import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getFeaturedProperties } from '@/lib/notion'
import { routing } from '@/i18n/routing'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { HERO_IMAGE } from '@/lib/images'
import PropertyCard from '@/components/PropertyCard'
import HomeSearchBar from './HomeSearchBar'
import { Link } from '@/i18n/navigation'
import { Building2, Search, MessageCircle, Home, ArrowRight, Compass } from 'lucide-react'
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
      icon: <Search className="w-8 h-8 text-[#1E6B69]" />,
      title: 'Browse',
      description: 'Search thousands of verified rental properties across Thailand',
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-[#1E6B69]" />,
      title: 'Inquire',
      description: 'Contact landlords directly via LINE, WhatsApp, or email',
    },
    {
      icon: <Home className="w-8 h-8 text-[#1E6B69]" />,
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
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'DoubleN Realty',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` },
        description: 'Premium rental platform for expats and foreigners in Thailand',
        email: 'hello@doublen-realty.com',
        areaServed: { '@type': 'Country', name: 'Thailand' },
        sameAs: [],
      },
      {
        '@type': ['LocalBusiness', 'RealEstateAgent'],
        '@id': `${SITE_URL}/#localbusiness`,
        name: 'DoubleN Realty',
        url: SITE_URL,
        description: 'Rental property platform for expats in Thailand. Verified listings in Bangkok, Chiang Mai, Phuket and beyond.',
        email: 'hello@doublen-realty.com',
        areaServed: [
          { '@type': 'City', name: 'Bangkok' },
          { '@type': 'City', name: 'Chiang Mai' },
          { '@type': 'City', name: 'Phuket' },
          { '@type': 'City', name: 'Pattaya' },
        ],
        address: { '@type': 'PostalAddress', addressCountry: 'TH' },
        currenciesAccepted: 'THB',
        priceRange: '฿฿-฿฿฿',
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
            "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Neutral dark overlay — lets the photo breathe, teal branding comes from UI elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/55 pointer-events-none" />
        {/* Subtle teal tint at bottom for brand cohesion */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0C3837]/40 to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center w-full py-24">
          {/* text-white overrides the base h1 teal rule */}
          <h1 className="text-white text-4xl md:text-6xl font-lexend font-extrabold tracking-tight mb-6 leading-tight drop-shadow-lg">
            {t('hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 drop-shadow">
            {t('hero_subtitle')}
          </p>

          {/* Glassmorphism search bar wrapper */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl mb-8">
            <HomeSearchBar locale={locale} />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/80 mb-10">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DB5B2] inline-block" />
              500+ Expats Helped
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4581A] inline-block" />
              Bangkok · Chiang Mai · Phuket
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DB5B2] inline-block" />
              Verified Listings
            </span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/12 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 text-center min-w-[120px]">
              <p className="text-2xl font-bold text-white">2</p>
              <p className="text-xs text-white/60 mt-0.5">Active Listings</p>
            </div>
            <div className="bg-white/12 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 text-center min-w-[120px]">
              <p className="text-2xl font-bold text-white">Bangkok</p>
              <p className="text-xs text-white/60 mt-0.5">Top Location</p>
            </div>
            <div className="bg-white/12 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 text-center min-w-[120px]">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-white/60 mt-0.5">Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Discover Mode Banner ─────────────────────────────────────────── */}
      <section className="bg-[#0C1A1A] py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-8">

          {/* Stacked-cards visual — three depth layers with teal/orange accent */}
          <div className="relative shrink-0 w-36 h-52 sm:order-last">
            {/* Back card — orange accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F4581A] to-[#B43E10] rounded-2xl shadow-lg rotate-6 opacity-50" />
            {/* Mid card — muted teal */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#18605E] to-[#0C3837] rounded-2xl shadow-lg rotate-2 opacity-80" />
            {/* Front card — primary teal */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E6B69] to-[#124E4C] rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white gap-3">
              <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold tracking-widest opacity-60 uppercase">Swipe</p>
                <p className="text-lg font-black leading-none">→</p>
              </div>
            </div>
          </div>

          {/* Text + CTA */}
          <div className="flex-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4DB5B2] bg-[#4DB5B2]/15 px-3 py-1 rounded-full mb-4">
              ✨ New feature
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
              Swipe to find<br className="hidden sm:block" /> your dream home
            </h2>
            <p className="text-white/50 text-sm sm:text-base mb-6 max-w-sm mx-auto sm:mx-0">
              Browse properties like you&apos;d swipe through a feed — fast, visual, and fun.
              Tap ♡ to save, skip what doesn&apos;t fit.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 bg-[#F4581A] hover:bg-[#D84C14] text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg shadow-[#F4581A]/20"
            >
              <Compass className="w-5 h-5" />
              Try Discover Mode
            </Link>
          </div>

        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-lexend font-bold text-[#1E6B69]">{t('featured_title')}</h2>
          <Link href="/properties" className="flex items-center gap-1 text-[#124E4C] hover:text-[#1E6B69] font-medium">
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
          <h2 className="text-3xl font-bold text-[#1E6B69] mb-4">How It Works</h2>
          <p className="text-gray-500 mb-12">
            Finding your next home in Thailand is easy with DoubleN Realty
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-[#1E6B69]/10 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1E6B69] text-white text-sm font-bold flex items-center justify-center mb-3">
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
      <section className="bg-gradient-to-r from-[#0C3837] to-[#1E6B69] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-green-200" />
          <h2 className="text-3xl font-bold text-white mb-4">Are you a landlord?</h2>
          <p className="text-green-100 text-lg mb-8">
            List your property and reach thousands of expats looking for rental homes in Thailand.
            It&apos;s free to get started.
          </p>
          <Button asChild size="lg" className="bg-white text-[#0C3837] hover:bg-green-50 font-semibold rounded-full">
            <Link href="/submit">List Your Property</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
