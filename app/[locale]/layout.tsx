import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Mather',
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const messages = await getMessages()

  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar locale={locale} />
      {/* dir for RTL languages (Arabic) — applied to main content wrapper */}
      {/* pt-16 clears the fixed h-16 navbar; full-bleed heroes opt out with -mt-16 */}
      <main lang={locale} dir={dir} className="pt-16">{children}</main>
      <Footer />
      <Analytics />
      <SpeedInsights />
      {/* Load Maps only on pages that need it — defer well past hydration */}
      <Script
        id="google-maps"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async`}
        strategy="lazyOnload"
      />
    </NextIntlClientProvider>
  )
}
