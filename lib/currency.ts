/**
 * Currency utilities for DoubleN Realty
 * THB → USD conversion for foreign visitors
 */

// Conservative exchange rate — update via env var or edge config
// 1 USD ≈ 33-36 THB (2025). We use 34 as a conservative midpoint.
export const THB_TO_USD_RATE = parseFloat(
  process.env.NEXT_PUBLIC_THB_TO_USD_RATE ?? '34'
)

/**
 * Convert THB price to approximate USD
 */
export function thbToUsd(thb: number, rate = THB_TO_USD_RATE): number {
  return Math.round(thb / rate)
}

/**
 * Format THB price for display
 */
export function formatThb(price: number): string {
  return `฿${price.toLocaleString()}`
}

/**
 * Format USD price for display (approximate)
 */
export function formatUsd(thb: number, rate = THB_TO_USD_RATE): string {
  const usd = thbToUsd(thb, rate)
  return `~$${usd.toLocaleString()}`
}

/**
 * Format combined THB + USD display
 * e.g. "฿30,000 (~$882)"
 */
export function formatDualCurrency(thb: number, rate = THB_TO_USD_RATE): string {
  return `${formatThb(thb)} (${formatUsd(thb, rate)})`
}

/**
 * Whether to show USD for a given locale
 * Non-Thai, non-EN locales from USD-zone countries get USD by default
 */
export function shouldShowUsd(locale: string): boolean {
  // All non-Thai locales show USD as a helpful reference
  return locale !== 'th'
}
