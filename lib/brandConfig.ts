/**
 * brandConfig.ts — Legacy car dealership config.
 * Kept as a stub so old admin/component pages compile.
 * Not used in the Mather public-facing app.
 */

export interface BrandConfig {
  slug: string
  displayName: string
  displayNameTh: string
  hubPath: string
  logoPath: string
  logoOnDark?: 'white' | 'native'
}

export const BRANDS: BrandConfig[] = []

/** Legacy redirect helper — no-op in Mather */
export function legacyBrandQueryToPath(_brand: string): string | null {
  return null
}
