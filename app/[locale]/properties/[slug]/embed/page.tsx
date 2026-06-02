import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getProperty } from '@/lib/notion'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'

type Props = { params: Promise<{ locale: string; slug: string }> }

export const revalidate = 3600

export default async function PropertyEmbedPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const property = await getProperty(slug, locale).catch(() => null)
  if (!property) notFound()

  const title = property.title[locale] ?? property.title.en ?? slug

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title} — Availability</title>
      </head>
      <body style={{ margin: 0, padding: '16px', fontFamily: 'sans-serif', background: '#fff' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
          Availability for <strong>{title}</strong>
        </p>
        <AvailabilityCalendar
          propertyId={property.id}
          blockedRanges={[]}
          availableFrom={property.availableFrom ?? undefined}
        />
      </body>
    </html>
  )
}
