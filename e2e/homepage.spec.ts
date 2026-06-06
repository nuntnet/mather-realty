import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/en')
  await expect(page.getByText('Find Your Perfect Home')).toBeVisible()
})

test('properties page loads', async ({ page }) => {
  await page.goto('/en/properties')
  await expect(page.getByText(/properties/i)).toBeVisible()
})

test('language switcher works', async ({ page }) => {
  await page.goto('/en')
  // Click language button (EN button or aria-label with "language")
  await page.click('[aria-label*="language"], button:has-text("EN")')
  // Should see Thai option visible after clicking the switcher
  await expect(page.getByText(/ภาษาไทย|Thai|TH/i).first()).toBeVisible()
})
