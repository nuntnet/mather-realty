/**
 * scripts/algolia-index.ts
 * Bulk-index all approved properties to Algolia.
 *
 * Usage:
 *   bun run algolia:index
 *   # or directly:
 *   bun run scripts/algolia-index.ts
 *
 * Required env vars:
 *   NOTION_API_KEY, NOTION_PROPERTIES_DB_ID
 *   ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY
 */

import 'dotenv/config'
import { getProperties } from '../lib/notion'
import { bulkSyncPropertiesToAlgolia, PROPERTIES_INDEX } from '../lib/algolia'

async function main() {
  console.log('─── DoubleN Realty — Algolia full re-index ───')

  // Validate required env vars
  const required = [
    'NOTION_API_KEY',
    'NOTION_PROPERTIES_DB_ID',
    'ALGOLIA_APP_ID',
    'ALGOLIA_ADMIN_KEY',
  ]
  const missing = required.filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error('Missing required env vars:', missing.join(', '))
    process.exit(1)
  }

  console.log('Fetching approved properties from Notion...')
  const properties = await getProperties({ status: 'available' })

  console.log(`Found ${properties.length} properties.`)

  if (properties.length === 0) {
    console.log('No properties to index. Exiting.')
    return
  }

  console.log(`Syncing ${properties.length} properties to Algolia index "${PROPERTIES_INDEX}"...`)

  const BATCH_SIZE = 100
  let synced = 0

  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE)
    await bulkSyncPropertiesToAlgolia(batch)
    synced += batch.length
    console.log(`  Progress: ${synced}/${properties.length}`)
  }

  console.log(`Done. ${synced} properties indexed to Algolia.`)
}

main().catch((err) => {
  console.error('algolia-index failed:', err)
  process.exit(1)
})
