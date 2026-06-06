/**
 * navModels.ts — Type definitions for navbar navigation data.
 * Legacy types kept for car-dealer Navbar/PublicLayout compatibility.
 */

export interface NavModel {
  id: string
  slug: string
  name: string
  brand: string
  imageUrl?: string
}

/** Map of brand slug → array of models for nav mega-menu */
export type NavModelsByBrand = Record<string, NavModel[]>

/** Map of brand slug → total car count */
export type NavCountsByBrand = Record<string, number>
