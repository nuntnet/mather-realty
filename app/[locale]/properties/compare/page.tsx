'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Property } from '@/lib/notion-types'
import { Link } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { CheckCircle2, X, ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const ROWS: Array<{ key: keyof Property | string; label: string }> = [
  { key: 'priceTHB', label: 'Price (THB/mo)' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'sizeSqm', label: 'Size (sqm)' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'status', label: 'Status' },
  { key: 'city', label: 'City' },
  { key: 'verifiedAt', label: 'Verified' },
]

function getValue(property: Property, key: string, locale: string): string {
  const p = property as Record<string, any>
  const v = p[key]
  if (v === undefined || v === null) return '—'
  if (key === 'priceTHB') return `฿${Number(v).toLocaleString()}`
  if (key === 'amenities') return Array.isArray(v) ? v.join(', ') || '—' : String(v)
  if (key === 'verifiedAt') return v ? 'Verified' : 'Not verified'
  if (key === 'title') return (v as Record<string, string>)[locale] ?? v.en ?? '—'
  return String(v)
}

function ComparePageInner() {
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'en'

  const ids = (searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, 3)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ids.length === 0) return
    setLoading(true)
    Promise.all(
      ids.map((id) =>
        fetch(`/api/properties/${id}?locale=${locale}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    )
      .then((results) => setProperties(results.filter(Boolean)))
      .catch(() => setError('Failed to load properties'))
      .finally(() => setLoading(false))
  }, [ids.join(','), locale])

  if (ids.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <p>No properties selected for comparison.</p>
        <Button asChild variant="outline">
          <Link href="/properties">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse Properties
          </Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || properties.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <p>{error ?? 'Properties not found.'}</p>
        <Button asChild variant="outline">
          <Link href="/properties">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse Properties
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/properties">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Compare Properties</h1>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 font-semibold text-gray-500 w-36">Feature</th>
                {properties.map((p) => {
                  const title = p.title[locale] ?? p.title.en ?? p.slug
                  return (
                    <th key={p.id} className="p-4 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-3">
                        {p.coverImage && (
                          <div className="relative w-full h-36 rounded-xl overflow-hidden">
                            <Image src={p.coverImage} alt={title} fill className="object-cover" />
                          </div>
                        )}
                        <Link
                          href={`/properties/${p.slug}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 text-center"
                        >
                          {title}
                        </Link>
                        {p.verifiedAt && (
                          <span className="flex items-center gap-1 text-xs text-blue-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ key, label }) => (
                <tr key={key} className="border-b border-gray-50 even:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-600">{label}</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4 text-center text-gray-700">
                      {key === 'verifiedAt' ? (
                        p.verifiedAt ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        getValue(p, key, locale)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {/* CTA row */}
              <tr>
                <td className="p-4 font-medium text-gray-600">Action</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Link href={`/properties/${p.slug}`}>
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule Viewing
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ComparePageInner />
    </Suspense>
  )
}
