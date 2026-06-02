import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getFeaturedProperties } from '@/lib/notion'
import { routing } from '@/i18n/routing'
import { SITE_URL, SITE_NAME } from '@/lib/site'
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
  const t = await getTranslations({ locale, namespace: 'home' })

  const alternates: Record<string, string> = {}
  for (const l of routing.locales) {
    alternates[l] = `${SITE_URL}/${l}`
  }

  return {
    title: `${SITE_NAME} — Rental Properties in Thailand`,
    description: t('hero_subtitle'),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: alternates,
    },
    openGraph: {
      title: `${SITE_NAME} — Rental Properties in Thailand`,
      description: t('hero_subtitle'),
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_NAME,
      type: 'website',
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
      icon: <Search className="w-8 h-8 text-blue-600" />,
      title: 'Browse',
      description: 'Search thousands of verified rental properties across Thailand',
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: 'Inquire',
      description: 'Contact landlords directly via LINE, WhatsApp, or email',
    },
    {
      icon: <Home className="w-8 h-8 text-blue-600" />,
      title: 'Move In',
      description: 'Sign your lease and move into your new Thai home',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t('hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10">
            {t('hero_subtitle')}
          </p>
          <div className="max-w-2xl mx-auto">
            <HomeSearchBar locale={locale} />
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t('featured_title')}</h2>
          <Link href="/properties" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
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
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mb-3">
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
      <section className="bg-blue-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-300" />
          <h2 className="text-3xl font-bold mb-4">Are you a landlord?</h2>
          <p className="text-blue-200 text-lg mb-8">
            List your property and reach thousands of expats looking for rental homes in Thailand.
            It&apos;s free to get started.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold">
            <Link href="/submit">List Your Property</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
