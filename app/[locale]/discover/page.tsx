import { setRequestLocale } from 'next-intl/server'
import { getProperties } from '@/lib/notion'
import { SITE_NAME } from '@/lib/site'
import type { Metadata } from 'next'
import DiscoverFeed from './DiscoverFeed'

interface DiscoverPageProps {
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: `Discover Properties | ${SITE_NAME}`,
  description: 'Swipe through premium rental properties in Thailand',
}

export const revalidate = 3600

export default async function DiscoverPage({ params }: DiscoverPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const properties = await getProperties(undefined, locale).catch(() => [])

  return <DiscoverFeed properties={properties} locale={locale} />
}
