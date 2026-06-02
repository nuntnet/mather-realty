import { algoliasearch } from 'algoliasearch'
import type { Property } from './notion-types'

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/** Server-side client that uses the admin key (never expose to the browser). */
export function getAlgoliaClient() {
  const appId = process.env.ALGOLIA_APP_ID
  const adminKey = process.env.ALGOLIA_ADMIN_KEY

  if (!appId || !adminKey) {
    throw new Error(
      'Missing Algolia credentials: ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY must be set'
    )
  }

  return algoliasearch(appId, adminKey)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PROPERTIES_INDEX = 'properties'

/** All 15 supported locale codes. */
const LOCALES = [
  'en', 'th', 'zh-CN', 'zh-TW', 'ja', 'ko',
  'ru', 'de', 'fr', 'es', 'it', 'nl', 'sv', 'ar', 'hi',
] as const

type Locale = (typeof LOCALES)[number]

// ---------------------------------------------------------------------------
// AlgoliaPropertyRecord
// ---------------------------------------------------------------------------

/** Flat locale-specific field names (e.g. "title_en", "title_zh_CN"). */
type LocaleKey<F extends string> = {
  [L in Locale as `${F}_${L extends `${infer A}-${infer B}` ? `${A}_${B}` : L}`]: string
}

export type AlgoliaPropertyRecord =
  // Core filterable / sortable fields
  {
    objectID: string
    slug: string
    city: string
    district: string
    priceTHB: number
    bedrooms: number
    bathrooms: number
    sizeSqm: number
    status: Property['status']
    availableFrom: string | null
    verifiedAt: string | null
    amenities: string[]
    tags: string[]
    coverImage: string
    hasVirtualTour: boolean
    listingScore: number
    /** Geo search support */
    _geoloc: { lat: number; lng: number }
  } &
  // title_en … title_hi  (locale key uses underscore, not hyphen)
  LocaleKey<'title'> &
  // description_en … description_hi
  LocaleKey<'description'>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a locale code to a valid JS identifier suffix.
 * "zh-CN" → "zh_CN", "en" → "en", etc.
 */
function localeToSuffix(locale: string): string {
  return locale.replace(/-/g, '_')
}

/** Build the flat Algolia record from a Property object. */
export function buildAlgoliaRecord(property: Property): AlgoliaPropertyRecord {
  const record: Record<string, unknown> = {
    objectID: property.id,
    slug: property.slug,
    city: property.city,
    district: property.district,
    priceTHB: property.priceTHB,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sizeSqm: property.sizeSqm,
    status: property.status,
    availableFrom: property.availableFrom ?? null,
    verifiedAt: property.verifiedAt ?? null,
    amenities: property.amenities,
    tags: property.tags,
    coverImage: property.coverImage,
    hasVirtualTour: property.hasVirtualTour,
    listingScore: property.listingScore,
    _geoloc: {
      lat: property.lat,
      lng: property.lng,
    },
  }

  // Flatten multilingual title and description
  for (const locale of LOCALES) {
    const suffix = localeToSuffix(locale)
    record[`title_${suffix}`] = property.title[locale] ?? property.title['en'] ?? ''
    record[`description_${suffix}`] = property.description[locale] ?? property.description['en'] ?? ''
  }

  return record as AlgoliaPropertyRecord
}

// ---------------------------------------------------------------------------
// Sync helpers
// ---------------------------------------------------------------------------

/**
 * Upsert a single property into the Algolia properties index.
 * Safe to call on create or update — Algolia will replace the existing object
 * if objectID already exists.
 */
export async function syncPropertyToAlgolia(property: Property): Promise<void> {
  const client = getAlgoliaClient()
  const algoliaRecord = buildAlgoliaRecord(property)

  await client.saveObject({
    indexName: PROPERTIES_INDEX,
    body: algoliaRecord,
  })
}

/**
 * Remove a property from the Algolia properties index.
 * No-ops gracefully if the object does not exist.
 */
export async function removePropertyFromAlgolia(propertyId: string): Promise<void> {
  const client = getAlgoliaClient()

  await client.deleteObject({
    indexName: PROPERTIES_INDEX,
    objectID: propertyId,
  })
}

/**
 * Bulk-upsert multiple properties in one API call (efficient for full re-index).
 * Processes in batches of 1 000 to stay within Algolia's payload limits.
 */
export async function bulkSyncPropertiesToAlgolia(properties: Property[]): Promise<void> {
  if (properties.length === 0) return

  const client = getAlgoliaClient()
  const BATCH_SIZE = 1_000

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE)
    const objects = batch.map(buildAlgoliaRecord)

    await client.saveObjects({
      indexName: PROPERTIES_INDEX,
      objects,
    })
  }
}
