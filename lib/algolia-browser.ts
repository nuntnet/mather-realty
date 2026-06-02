/**
 * Client-side Algolia search client.
 *
 * Uses the `algoliasearch/lite` bundle which omits write operations and is
 * significantly smaller (~8 KB gzipped vs ~30 KB for the full client).
 * Safe to import in any Client Component — it only uses public env vars.
 */
import { liteClient } from 'algoliasearch/lite'

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

if (!appId || !searchKey) {
  // Throw at module evaluation time so missing config surfaces immediately
  // during development rather than as a runtime search failure.
  throw new Error(
    'Missing Algolia public credentials: ' +
      'NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_SEARCH_KEY must be set'
  )
}

/**
 * Singleton lite search client for use with InstantSearch or manual `search()` calls.
 *
 * @example
 * import { searchClient, PROPERTIES_INDEX } from '@/lib/algolia-browser'
 *
 * // With react-instantsearch
 * <InstantSearch searchClient={searchClient} indexName={PROPERTIES_INDEX}>
 *   ...
 * </InstantSearch>
 */
export const searchClient = liteClient(appId, searchKey)

/**
 * Re-export the index name so client-side code doesn't need to import from
 * the server-only `algolia.ts` module.
 */
export const PROPERTIES_INDEX = 'properties'
