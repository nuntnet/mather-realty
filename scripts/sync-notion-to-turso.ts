/**
 * Sync all Notion properties into the Turso hot-cache table.
 * Run this once (or any time you add properties in Notion) to populate
 * the admin panel.
 *
 * Usage:  bun run sync:notion
 */

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { getProperties } from '@/lib/notion'
import { properties } from '@/lib/db/schema'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  console.error('❌  TURSO_DATABASE_URL not set')
  process.exit(1)
}

if (!process.env.NOTION_API_KEY || !process.env.NOTION_PROPERTIES_DB_ID) {
  console.error('❌  NOTION_API_KEY or NOTION_PROPERTIES_DB_ID not set')
  process.exit(1)
}

console.log('📥  Fetching properties from Notion...')
const notionProperties = await getProperties(undefined, 'en').catch(err => {
  console.error('❌  Failed to fetch from Notion:', err.message)
  process.exit(1)
})

console.log(`   Found ${notionProperties.length} properties in Notion`)

const client = createClient({ url, authToken })
const db = drizzle(client, { schema: { properties } })

let inserted = 0
let updated = 0
let failed = 0

for (const p of notionProperties) {
  try {
    await db
      .insert(properties)
      .values({
        id: p.id,
        notionPageId: p.id,
        slug: p.slug || null,
        status: p.status,
        availableFrom: p.availableFrom || null,
        address: p.address || null,
        city: p.city || null,
        district: p.district || null,
        lat: p.lat || null,
        lng: p.lng || null,
        priceTHB: p.priceTHB || null,
        bedrooms: p.bedrooms || null,
        bathrooms: p.bathrooms || null,
        sizeSqm: p.sizeSqm || null,
        algoliaObjectId: null,
        verifiedAt: p.verifiedAt || null,
        approvedAt: p.approvedAt || null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })
      .onConflictDoUpdate({
        target: properties.id,
        set: {
          slug: p.slug || null,
          status: p.status,
          availableFrom: p.availableFrom || null,
          address: p.address || null,
          city: p.city || null,
          district: p.district || null,
          lat: p.lat || null,
          lng: p.lng || null,
          priceTHB: p.priceTHB || null,
          bedrooms: p.bedrooms || null,
          bathrooms: p.bathrooms || null,
          sizeSqm: p.sizeSqm || null,
          verifiedAt: p.verifiedAt || null,
          approvedAt: p.approvedAt || null,
          updatedAt: p.updatedAt,
        },
      })

    const title = p.title.en ?? p.slug ?? p.id
    console.log(`   ✓  ${title}`)
    inserted++
  } catch (err) {
    const title = p.title.en ?? p.id
    console.error(`   ✗  ${title}:`, (err as Error).message)
    failed++
  }
}

await client.close()

console.log(`\n✅  Sync complete: ${inserted} synced, ${failed} failed`)
console.log('   → Refresh /admin/properties to see them.')
