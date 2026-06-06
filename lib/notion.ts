/**
 * lib/notion.ts
 * Server-side Notion API client for DoubleN Realty
 * All functions are async and server-side only.
 */

import { Client } from '@notionhq/client'
import type {
  PageObjectResponse,
  QueryDatabaseParameters,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints'
import type {
  Property,
  BlogPost,
  StaticPage,
  PropertyFilters,
} from './notion-types'

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------

let _notionClient: Client | null = null

function getNotionClient(): Client {
  if (!_notionClient) {
    _notionClient = new Client({
      auth: process.env.NOTION_API_KEY,
    })
  }
  return _notionClient
}

// ---------------------------------------------------------------------------
// Database IDs
// ---------------------------------------------------------------------------

const PROPERTIES_DB_ID = process.env.NOTION_PROPERTIES_DB_ID ?? ''
const BLOG_DB_ID = process.env.NOTION_BLOG_DB_ID ?? ''
const PAGES_DB_ID = process.env.NOTION_PAGES_DB_ID ?? ''

// Fail fast at startup if critical env vars are missing
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  if (!PROPERTIES_DB_ID) console.error('[notion] NOTION_PROPERTIES_DB_ID is not set — property queries will fail')
  if (!process.env.NOTION_API_KEY) console.error('[notion] NOTION_API_KEY is not set')
}

// ---------------------------------------------------------------------------
// Supported locales
// ---------------------------------------------------------------------------

const LOCALES = ['en', 'th', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ru', 'de', 'fr', 'es', 'it', 'nl', 'sv', 'ar', 'hi'] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a Notion rich_text array to a plain string.
 */
export function notionRichTextToString(
  rich_text: RichTextItemResponse[] | undefined | null,
): string {
  if (!rich_text || rich_text.length === 0) return ''
  return rich_text.map((r) => r.plain_text).join('')
}

/**
 * Read a multi-lang field from a Notion page.
 * Tries `{field}_{locale}` first, falls back to `{field}_en`.
 */
export function getMultiLang(
  page: PageObjectResponse,
  field: string,
  locale: string,
): string {
  const props = page.properties

  // Try exact locale
  const localeKey = `${field}_${locale}`
  if (props[localeKey]) {
    const p = props[localeKey] as any
    if (p.type === 'rich_text') return notionRichTextToString(p.rich_text)
    if (p.type === 'title') return notionRichTextToString(p.title)
  }

  // Fallback to English
  const enKey = `${field}_en`
  if (props[enKey]) {
    const p = props[enKey] as any
    if (p.type === 'rich_text') return notionRichTextToString(p.rich_text)
    if (p.type === 'title') return notionRichTextToString(p.title)
  }

  return ''
}

/**
 * Build a Record<locale, string> for a given field across all supported locales.
 */
function buildMultiLangRecord(
  page: PageObjectResponse,
  field: string,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const locale of LOCALES) {
    const value = getMultiLang(page, field, locale)
    if (value) result[locale] = value
  }
  // Always ensure 'en' exists (even if empty)
  if (!result['en']) result['en'] = ''
  return result
}

function getPropString(page: PageObjectResponse, key: string): string {
  const p = (page.properties as any)[key]
  if (!p) return ''
  if (p.type === 'rich_text') return notionRichTextToString(p.rich_text)
  if (p.type === 'title') return notionRichTextToString(p.title)
  if (p.type === 'select') return p.select?.name ?? ''
  if (p.type === 'url') return p.url ?? ''
  if (p.type === 'email') return p.email ?? ''
  if (p.type === 'phone_number') return p.phone_number ?? ''
  return ''
}

function getPropNumber(page: PageObjectResponse, key: string): number {
  const p = (page.properties as any)[key]
  if (!p || p.type !== 'number') return 0
  return p.number ?? 0
}

function getPropBoolean(page: PageObjectResponse, key: string): boolean {
  const p = (page.properties as any)[key]
  if (!p || p.type !== 'checkbox') return false
  return p.checkbox ?? false
}

function getPropDate(page: PageObjectResponse, key: string): string | null {
  const p = (page.properties as any)[key]
  if (!p || p.type !== 'date') return null
  return p.date?.start ?? null
}

function getPropMultiSelect(page: PageObjectResponse, key: string): string[] {
  const p = (page.properties as any)[key]
  if (!p || p.type !== 'multi_select') return []
  return (p.multi_select as Array<{ name: string }>).map((s) => s.name)
}

function getPropFiles(page: PageObjectResponse, key: string): string[] {
  const p = (page.properties as any)[key]
  if (!p || p.type !== 'files') return []
  return (p.files as any[]).map((f: any) => {
    if (f.type === 'external') return f.external?.url ?? ''
    if (f.type === 'file') return f.file?.url ?? ''
    return ''
  }).filter(Boolean)
}

function getPropCover(page: PageObjectResponse): string {
  // Try cover image from page cover first
  if (page.cover) {
    if (page.cover.type === 'external') return page.cover.external.url
    if (page.cover.type === 'file') return (page.cover as any).file.url
  }
  // Fallback to a "cover_image" files property
  const files = getPropFiles(page, 'cover_image')
  return files[0] ?? ''
}

// ---------------------------------------------------------------------------
// Listing score calculation
// ---------------------------------------------------------------------------

function calculateListingScore(page: PageObjectResponse): number {
  const scoredFields: Array<() => boolean> = [
    () => !!getPropString(page, 'slug'),
    () => !!getMultiLang(page, 'title', 'en'),
    () => !!getMultiLang(page, 'description', 'en'),
    () => !!getPropString(page, 'address'),
    () => !!getPropString(page, 'city'),
    () => !!getPropString(page, 'district'),
    () => getPropNumber(page, 'lat') !== 0,
    () => getPropNumber(page, 'lng') !== 0,
    () => getPropNumber(page, 'price_thb') > 0,
    () => getPropNumber(page, 'bedrooms') > 0,
    () => getPropNumber(page, 'bathrooms') > 0,
    () => getPropNumber(page, 'size_sqm') > 0,
    () => getPropMultiSelect(page, 'amenities').length > 0,
    () => !!getPropCover(page),
    () => getPropFiles(page, 'gallery').length > 0,
    () => !!getPropDate(page, 'available_from'),
    () => getPropBoolean(page, 'has_virtual_tour') ? !!getPropString(page, 'virtual_tour_url') : true,
    () => getPropMultiSelect(page, 'tags').length > 0,
  ]

  const filled = scoredFields.filter((fn) => fn()).length
  return Math.round((filled / scoredFields.length) * 100)
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapProperty(page: PageObjectResponse, locale = 'en'): Property {
  return {
    id: page.id,
    slug: getPropString(page, 'slug'),
    title: buildMultiLangRecord(page, 'title'),
    description: buildMultiLangRecord(page, 'description'),
    address: getPropString(page, 'address'),
    city: getPropString(page, 'city'),
    district: getPropString(page, 'district'),
    lat: getPropNumber(page, 'lat'),
    lng: getPropNumber(page, 'lng'),
    priceTHB: getPropNumber(page, 'price_thb'),
    bedrooms: getPropNumber(page, 'bedrooms'),
    bathrooms: getPropNumber(page, 'bathrooms'),
    sizeSqm: getPropNumber(page, 'size_sqm'),
    amenities: getPropMultiSelect(page, 'amenities'),
    status: (getPropString(page, 'status') || 'pending') as Property['status'],
    availableFrom: getPropDate(page, 'available_from'),
    coverImage: getPropCover(page),
    gallery: getPropFiles(page, 'gallery').length
      ? getPropFiles(page, 'gallery')
      : getPropString(page, 'gallery_urls').split(',').filter(Boolean),
    hasVirtualTour: getPropBoolean(page, 'has_virtual_tour'),
    virtualTourUrl: getPropString(page, 'virtual_tour_url') || null,
    verifiedAt: getPropDate(page, 'verified_at'),
    approvedAt: getPropDate(page, 'approved_at'),
    listingScore: calculateListingScore(page),
    ownerId: getPropString(page, 'owner_id') || null,
    tags: getPropMultiSelect(page, 'tags'),
    floors: getPropNumber(page, 'floors') || 2,
    parkingSpots: getPropNumber(page, 'parking_spots') || 0,
    minLeaseTerm: getPropNumber(page, 'min_lease_months') || null,
    depositMonths: getPropNumber(page, 'deposit_months') || null,
    heroPhotos: getPropString(page, 'hero_photos')
      .split(',').map(u => u.trim()).filter(Boolean),
    highlights: (() => {
      const parseHL = (raw: string) => raw.split('•').map(s => s.trim()).filter(Boolean)
      const rec: Record<string, string[]> = {}
      const en = getPropString(page, 'highlights')
      if (en) rec['en'] = parseHL(en)
      for (const loc of LOCALES.filter(l => l !== 'en')) {
        const v = getPropString(page, `highlights_${loc}`)
        if (v) rec[loc] = parseHL(v)
      }
      return rec
    })(),
    contactLine: getPropString(page, 'contact_line') || null,
    contactPhone: getPropString(page, 'contact_phone') || null,
    perfectFor: getPropMultiSelect(page, 'perfect_for'),
    personaDescriptions: (() => {
      const raw = getPropString(page, 'persona_descriptions')
      if (!raw) return null
      try { return JSON.parse(raw) } catch { return null }
    })(),
    faqJson: (() => {
      const tryParse = (raw: string) => { try { return JSON.parse(raw) } catch { return null } }
      const rec: Record<string, Array<{q: string; a: string}> | null> = {}
      const en = getPropString(page, 'faq_json')
      rec['en'] = en ? tryParse(en) : null
      for (const loc of LOCALES.filter(l => l !== 'en')) {
        const v = getPropString(page, `faq_json_${loc}`)
        if (v) rec[loc] = tryParse(v)
      }
      return rec
    })(),
    seoDescription: (() => {
      const rec: Record<string, string> = {}
      const en = getPropString(page, 'seo_description')
      if (en) rec['en'] = en
      for (const loc of LOCALES.filter(l => l !== 'en')) {
        const v = getPropString(page, `seo_description_${loc}`)
        if (v) rec[loc] = v
      }
      return rec
    })(),
    galleryCategories: (() => {
      // Primary: three separate text fields — easy to fill in Notion
      // Add "exterior_photos", "interior_photos", "community_photos" as
      // Text properties in Notion, each containing comma-separated Cloudinary URLs.
      const split = (s: string) => s.split(',').map(u => u.trim()).filter(Boolean)
      const exterior  = split(getPropString(page, 'exterior_photos'))
      const interior  = split(getPropString(page, 'interior_photos'))
      const community = split(getPropString(page, 'community_photos'))
      if (exterior.length || interior.length || community.length) {
        return { exterior, interior, community }
      }
      // Fallback: legacy JSON blob in "gallery_categories" field
      const raw = getPropString(page, 'gallery_categories')
      if (!raw) return null
      try { return JSON.parse(raw) } catch { return null }
    })(),
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  }
}

function mapBlogPost(page: PageObjectResponse): BlogPost {
  return {
    id: page.id,
    slug: getPropString(page, 'slug'),
    title: buildMultiLangRecord(page, 'title'),
    excerpt: buildMultiLangRecord(page, 'excerpt'),
    content: '', // populated separately via page block content if needed
    category: (getPropString(page, 'category') || 'lifestyle') as BlogPost['category'],
    coverImage: getPropCover(page),
    published: getPropBoolean(page, 'published'),
    publishedAt: getPropDate(page, 'published_at'),
    tags: getPropMultiSelect(page, 'tags'),
    locale: getPropString(page, 'locale') || 'en',
  }
}

function mapStaticPage(page: PageObjectResponse, locale = 'en'): StaticPage {
  return {
    id: page.id,
    pageKey: getPropString(page, 'page_key'),
    title: buildMultiLangRecord(page, 'title'),
    content: buildMultiLangRecord(page, 'content'),
  }
}

// ---------------------------------------------------------------------------
// Filter builder for properties
// ---------------------------------------------------------------------------

function buildPropertyFilters(
  filters?: PropertyFilters,
  publicOnly = true,
): QueryDatabaseParameters['filter'] {
  const conditions: any[] = []

  if (publicOnly) {
    conditions.push({
      property: 'status',
      select: { equals: 'available' },
    })
    conditions.push({
      property: 'approved_at',
      date: { is_not_empty: true },
    })
  } else if (filters?.status) {
    conditions.push({
      property: 'status',
      select: { equals: filters.status },
    })
  }

  if (filters?.city) {
    conditions.push({
      property: 'city',
      rich_text: { equals: filters.city },
    })
  }

  if (filters?.district) {
    conditions.push({
      property: 'district',
      rich_text: { equals: filters.district },
    })
  }

  if (filters?.minPrice != null) {
    conditions.push({
      property: 'price_thb',
      number: { greater_than_or_equal_to: filters.minPrice },
    })
  }

  if (filters?.maxPrice != null) {
    conditions.push({
      property: 'price_thb',
      number: { less_than_or_equal_to: filters.maxPrice },
    })
  }

  if (filters?.bedrooms != null) {
    conditions.push({
      property: 'bedrooms',
      number: { equals: filters.bedrooms },
    })
  }

  if (filters?.bathrooms != null) {
    conditions.push({
      property: 'bathrooms',
      number: { equals: filters.bathrooms },
    })
  }

  if (filters?.minSize != null) {
    conditions.push({
      property: 'size_sqm',
      number: { greater_than_or_equal_to: filters.minSize },
    })
  }

  if (filters?.maxSize != null) {
    conditions.push({
      property: 'size_sqm',
      number: { less_than_or_equal_to: filters.maxSize },
    })
  }

  if (filters?.amenities && filters.amenities.length > 0) {
    for (const amenity of filters.amenities) {
      conditions.push({
        property: 'amenities',
        multi_select: { contains: amenity },
      })
    }
  }

  if (filters?.availableNow) {
    conditions.push({
      property: 'status',
      select: { equals: 'available' },
    })
  }

  if (filters?.availableFrom) {
    conditions.push({
      property: 'available_from',
      date: { on_or_before: filters.availableFrom },
    })
  }

  if (conditions.length === 0) return undefined
  if (conditions.length === 1) return conditions[0]
  return { and: conditions }
}

// ---------------------------------------------------------------------------
// Pagination helper — fetches all pages from a database query
// ---------------------------------------------------------------------------

async function queryAllPages(
  databaseId: string,
  params: Omit<QueryDatabaseParameters, 'database_id'>,
  maxPages = 10,
): Promise<PageObjectResponse[]> {
  const notion = getNotionClient()
  const results: PageObjectResponse[] = []
  let cursor: string | undefined

  for (let i = 0; i < maxPages; i++) {
    const response = await notion.databases.query({
      database_id: databaseId,
      ...params,
      start_cursor: cursor,
    })

    for (const page of response.results) {
      if (page.object === 'page') {
        results.push(page as PageObjectResponse)
      }
    }

    if (!response.has_more || !response.next_cursor) break
    cursor = response.next_cursor
  }

  return results
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

// Caching is handled by Next.js ISR (revalidate: 3600) on each page —
// unstable_cache is not used here to keep scripts/CLI compatibility.
export async function getProperties(
  filters?: PropertyFilters,
  locale = 'en',
): Promise<Property[]> {
  try {
    const pages = await queryAllPages(PROPERTIES_DB_ID, {
      filter: buildPropertyFilters(filters, true),
      sorts: [{ property: 'approved_at', direction: 'descending' }],
    })
    return pages.map((p) => mapProperty(p, locale))
  } catch (err) {
    console.error('[notion] getProperties error:', err)
    return []
  }
}

export async function getProperty(
  slug: string,
  locale = 'en',
): Promise<Property | null> {
  try {
    const notion = getNotionClient()
    const response = await notion.databases.query({
      database_id: PROPERTIES_DB_ID,
      filter: {
        and: [
          { property: 'slug', rich_text: { equals: slug } },
          { property: 'approved_at', date: { is_not_empty: true } },
        ],
      },
      page_size: 1,
    })

    const page = response.results[0]
    if (!page || page.object !== 'page') return null
    return mapProperty(page as PageObjectResponse, locale)
  } catch (err) {
    console.error('[notion] getProperty error:', err)
    return null
  }
}

export async function getFeaturedProperties(locale = 'en', limit = 6): Promise<Property[]> {
  try {
    const notion = getNotionClient()
    const response = await notion.databases.query({
      database_id: PROPERTIES_DB_ID,
      filter: {
        and: [
          { property: 'status', select: { equals: 'available' } },
          { property: 'approved_at', date: { is_not_empty: true } },
          { property: 'tags', multi_select: { contains: 'featured' } },
        ],
      },
      sorts: [{ property: 'approved_at', direction: 'descending' }],
      page_size: limit,
    })

    return response.results
      .filter((p) => p.object === 'page')
      .map((p) => mapProperty(p as PageObjectResponse, locale))
  } catch (err) {
    console.error('[notion] getFeaturedProperties error:', err)
    return []
  }
}

export async function getPropertiesByPersona(
  persona: string,
  locale = 'en',
): Promise<Property[]> {
  try {
    const pages = await queryAllPages(PROPERTIES_DB_ID, {
      filter: {
        and: [
          { property: 'status', select: { equals: 'available' } },
          { property: 'approved_at', date: { is_not_empty: true } },
          { property: 'perfect_for', multi_select: { contains: persona } },
        ],
      },
      sorts: [{ property: 'approved_at', direction: 'descending' }],
    })
    return pages.map((p) => mapProperty(p, locale))
  } catch (err) {
    console.error('[notion] getPropertiesByPersona error:', err)
    return []
  }
}

export async function getPropertiesByCity(
  city: string,
  locale = 'en',
): Promise<Property[]> {
  try {
    const pages = await queryAllPages(PROPERTIES_DB_ID, {
      filter: {
        and: [
          { property: 'status', select: { equals: 'available' } },
          { property: 'approved_at', date: { is_not_empty: true } },
          { property: 'city', rich_text: { equals: city } },
        ],
      },
      sorts: [{ property: 'approved_at', direction: 'descending' }],
    })
    return pages.map((p) => mapProperty(p, locale))
  } catch (err) {
    console.error('[notion] getPropertiesByCity error:', err)
    return []
  }
}

export async function searchProperties(
  query: string,
  filters?: PropertyFilters,
  locale = 'en',
): Promise<Property[]> {
  try {
    // Notion full-text search doesn't support property-level search well;
    // we query with filters then client-filter by query string across title/city/address.
    const pages = await queryAllPages(PROPERTIES_DB_ID, {
      filter: buildPropertyFilters(filters, true),
      sorts: [{ property: 'approved_at', direction: 'descending' }],
    })

    const q = query.toLowerCase()
    const properties = pages.map((p) => mapProperty(p, locale))

    if (!q) return properties

    return properties.filter((prop) => {
      const titleMatch = Object.values(prop.title).some((t) =>
        t.toLowerCase().includes(q),
      )
      const cityMatch = prop.city.toLowerCase().includes(q)
      const districtMatch = prop.district.toLowerCase().includes(q)
      const addressMatch = prop.address.toLowerCase().includes(q)
      const tagMatch = prop.tags.some((t) => t.toLowerCase().includes(q))
      return titleMatch || cityMatch || districtMatch || addressMatch || tagMatch
    })
  } catch (err) {
    console.error('[notion] searchProperties error:', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Admin property functions (no public filter)
// ---------------------------------------------------------------------------

export async function getPropertyForAdmin(id: string): Promise<Property | null> {
  try {
    const notion = getNotionClient()
    const page = await notion.pages.retrieve({ page_id: id })
    if (page.object !== 'page') return null
    return mapProperty(page as PageObjectResponse, 'en')
  } catch (err) {
    console.error('[notion] getPropertyForAdmin error:', err)
    return null
  }
}

export async function updatePropertyStatus(
  id: string,
  status: string,
): Promise<void> {
  try {
    const notion = getNotionClient()
    await notion.pages.update({
      page_id: id,
      properties: {
        status: { select: { name: status } },
      },
    })
  } catch (err) {
    console.error('[notion] updatePropertyStatus error:', err)
  }
}

export async function updatePropertyApproval(
  id: string,
  approved: boolean,
): Promise<void> {
  try {
    const notion = getNotionClient()
    const now = new Date().toISOString().split('T')[0]
    await notion.pages.update({
      page_id: id,
      properties: approved
        ? { approved_at: { date: { start: now } } }
        : { approved_at: { date: null } },
    })
  } catch (err) {
    console.error('[notion] updatePropertyApproval error:', err)
  }
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export async function getBlogPosts(
  locale = 'en',
  limit = 20,
): Promise<BlogPost[]> {
  try {
    const notion = getNotionClient()
    const response = await notion.databases.query({
      database_id: BLOG_DB_ID,
      filter: { property: 'published', checkbox: { equals: true } },
      sorts: [{ property: 'published_at', direction: 'descending' }],
      page_size: limit,
    })

    return response.results
      .filter((p) => p.object === 'page')
      .map((p) => mapBlogPost(p as PageObjectResponse))
  } catch (err) {
    console.error('[notion] getBlogPosts error:', err)
    return []
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const notion = getNotionClient()
    const response = await notion.databases.query({
      database_id: BLOG_DB_ID,
      filter: {
        and: [
          { property: 'slug', rich_text: { equals: slug } },
          { property: 'published', checkbox: { equals: true } },
        ],
      },
      page_size: 1,
    })

    const page = response.results[0]
    if (!page || page.object !== 'page') return null

    const post = mapBlogPost(page as PageObjectResponse)

    // Fetch page content blocks and convert to markdown
    try {
      const blocks = await notion.blocks.children.list({ block_id: page.id })
      post.content = blocksToMarkdown(blocks.results as any[])
    } catch {
      // content stays empty
    }

    return post
  } catch (err) {
    console.error('[notion] getBlogPost error:', err)
    return null
  }
}

export async function getBlogPostsByCategory(
  category: string,
  locale = 'en',
): Promise<BlogPost[]> {
  try {
    const pages = await queryAllPages(BLOG_DB_ID, {
      filter: {
        and: [
          { property: 'published', checkbox: { equals: true } },
          { property: 'category', select: { equals: category } },
        ],
      },
      sorts: [{ property: 'published_at', direction: 'descending' }],
    })
    return pages.map((p) => mapBlogPost(p))
  } catch (err) {
    console.error('[notion] getBlogPostsByCategory error:', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Static Pages
// ---------------------------------------------------------------------------

export async function getStaticPage(
  pageKey: string,
  locale = 'en',
): Promise<StaticPage | null> {
  try {
    const notion = getNotionClient()
    const response = await notion.databases.query({
      database_id: PAGES_DB_ID,
      filter: { property: 'page_key', rich_text: { equals: pageKey } },
      page_size: 1,
    })

    const page = response.results[0]
    if (!page || page.object !== 'page') return null
    return mapStaticPage(page as PageObjectResponse, locale)
  } catch (err) {
    console.error('[notion] getStaticPage error:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Minimal block -> markdown converter (for blog post content)
// ---------------------------------------------------------------------------

function richTextToMd(richText: any[]): string {
  if (!richText) return ''
  return richText
    .map((r: any) => {
      let text = r.plain_text ?? ''
      if (r.annotations?.bold) text = `**${text}**`
      if (r.annotations?.italic) text = `_${text}_`
      if (r.annotations?.code) text = `\`${text}\``
      if (r.href) text = `[${text}](${r.href})`
      return text
    })
    .join('')
}

function blocksToMarkdown(blocks: any[]): string {
  const lines: string[] = []

  for (const block of blocks) {
    const type: string = block.type
    const data = block[type]

    switch (type) {
      case 'paragraph':
        lines.push(richTextToMd(data?.rich_text) || '')
        break
      case 'heading_1':
        lines.push(`# ${richTextToMd(data?.rich_text)}`)
        break
      case 'heading_2':
        lines.push(`## ${richTextToMd(data?.rich_text)}`)
        break
      case 'heading_3':
        lines.push(`### ${richTextToMd(data?.rich_text)}`)
        break
      case 'bulleted_list_item':
        lines.push(`- ${richTextToMd(data?.rich_text)}`)
        break
      case 'numbered_list_item':
        lines.push(`1. ${richTextToMd(data?.rich_text)}`)
        break
      case 'quote':
        lines.push(`> ${richTextToMd(data?.rich_text)}`)
        break
      case 'code':
        lines.push(`\`\`\`${data?.language ?? ''}\n${richTextToMd(data?.rich_text)}\n\`\`\``)
        break
      case 'divider':
        lines.push('---')
        break
      case 'image': {
        const url =
          data?.type === 'external'
            ? data.external?.url
            : data?.file?.url ?? ''
        const caption = richTextToMd(data?.caption)
        lines.push(`![${caption}](${url})`)
        break
      }
      case 'callout':
        lines.push(`> ${richTextToMd(data?.rich_text)}`)
        break
      default:
        break
    }
  }

  return lines.join('\n\n')
}

// ---------------------------------------------------------------------------
// Aliases & additional blog helpers
// ---------------------------------------------------------------------------

/** Alias: published blog posts for public blog listing pages */
export async function getPublishedBlogPosts(
  locale = 'en',
  limit = 50,
): Promise<BlogPost[]> {
  return getBlogPosts(locale, limit)
}

/** All blog post slugs for static generation */
export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const posts = await getBlogPosts('en', 200)
    return posts.map((p) => p.slug).filter(Boolean)
  } catch {
    return []
  }
}

/** Single blog post with full content (markdown) */
export async function getBlogPostWithContent(
  slug: string,
): Promise<BlogPost | null> {
  return getBlogPost(slug)
}

/** Admin listing — all blog posts regardless of published state */
export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  try {
    const notion = getNotionClient()
    const response = await notion.databases.query({
      database_id: BLOG_DB_ID,
      sorts: [{ property: 'created_time', direction: 'descending' }],
      page_size: 100,
    })
    return response.results
      .filter((p) => p.object === 'page')
      .map((p) => mapBlogPost(p as PageObjectResponse))
  } catch (err) {
    console.error('[notion] getAllBlogPostsAdmin error:', err)
    return []
  }
}

/** Admin single post fetch for editing */
export async function getBlogPostForEdit(
  id: string,
): Promise<BlogPost | null> {
  try {
    const notion = getNotionClient()
    const page = await notion.pages.retrieve({ page_id: id })
    if (page.object !== 'page') return null
    return mapBlogPost(page as PageObjectResponse)
  } catch (err) {
    console.error('[notion] getBlogPostForEdit error:', err)
    return null
  }
}

/** Create a new blog post in Notion */
export async function createBlogPost(data: {
  title: string
  slug: string
  excerpt?: string
  category?: string
  coverImageUrl?: string | null
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  authorName?: string
  isPublished?: boolean
  publishedAt?: string | null
  [key: string]: unknown
}, markdown?: string): Promise<BlogPost | null> {
  try {
    const notion = getNotionClient()
    const page = await notion.pages.create({
      parent: { database_id: BLOG_DB_ID },
      properties: {
        title: { title: [{ text: { content: data.title } }] },
        slug: { rich_text: [{ text: { content: data.slug } }] },
        excerpt: { rich_text: [{ text: { content: data.excerpt ?? '' } }] },
        ...(data.category ? { category: { select: { name: data.category } } } : {}),
        published: { checkbox: data.isPublished ?? false },
      },
    })
    return mapBlogPost(page as PageObjectResponse)
  } catch (err) {
    console.error('[notion] createBlogPost error:', err)
    return null
  }
}

/** Update blog post metadata */
export async function updateBlogPost(
  id: string,
  data: Partial<{
    title: string
    slug: string
    excerpt: string
    category: string
    coverImage: string
    isPublished: boolean
  }>,
): Promise<boolean> {
  try {
    const notion = getNotionClient()
    const props: Record<string, unknown> = {}
    if (data.title !== undefined) props.title = { title: [{ text: { content: data.title } }] }
    if (data.slug !== undefined) props.slug = { rich_text: [{ text: { content: data.slug } }] }
    if (data.excerpt !== undefined) props.excerpt = { rich_text: [{ text: { content: data.excerpt } }] }
    if (data.category !== undefined) props.category = { select: { name: data.category } }
    if (data.isPublished !== undefined) props.published = { checkbox: data.isPublished }
    await notion.pages.update({ page_id: id, properties: props as Parameters<typeof notion.pages.update>[0]['properties'] })
    return true
  } catch (err) {
    console.error('[notion] updateBlogPost error:', err)
    return false
  }
}

/** Toggle publish status for a blog post */
export async function setBlogPublished(
  id: string,
  published: boolean,
): Promise<boolean> {
  return updateBlogPost(id, { isPublished: published })
}

/** Archive (soft-delete) a blog post */
export async function archiveBlogPost(id: string): Promise<boolean> {
  try {
    const notion = getNotionClient()
    await notion.pages.update({ page_id: id, archived: true })
    return true
  } catch (err) {
    console.error('[notion] archiveBlogPost error:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Customer stories (public, approved)
// ---------------------------------------------------------------------------

/** Public customer stories */
export async function getPublicStories(): Promise<import('./notion-types').CustomerStory[]> {
  // Stub: stories would typically come from Turso DB, not Notion.
  // Returns empty array until the stories table is populated.
  return []
}
