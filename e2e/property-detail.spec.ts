import { test, expect } from '@playwright/test'

const PROPERTY_SLUG = 'indy2-bangna-km7-2bed'

test.describe('Property detail page', () => {
  test('loads property with correct title', async ({ page }) => {
    await page.goto(`/en/properties/${PROPERTY_SLUG}`)
    await expect(page.locator('h1, h2').first()).toBeVisible()
    await expect(page).not.toHaveURL(/404|not-found/)
  })

  test('shows price in THB', async ({ page }) => {
    await page.goto(`/en/properties/${PROPERTY_SLUG}`)
    await expect(page.getByText(/฿[\d,]+/)).toBeVisible()
  })

  test('shows USD hint for non-Thai locales', async ({ page }) => {
    await page.goto(`/ko/properties/${PROPERTY_SLUG}`)
    await expect(page.getByText(/~\$[\d,]+/)).toBeVisible()
  })

  test('does NOT show USD hint for Thai locale', async ({ page }) => {
    await page.goto(`/th/properties/${PROPERTY_SLUG}`)
    await expect(page.getByText(/~\$[\d,]/)).not.toBeVisible()
  })

  test('inquiry form sends successfully', async ({ page }) => {
    await page.goto(`/en/properties/${PROPERTY_SLUG}`)
    await page.click('button:has-text("Send Inquiry"), button:has-text("Schedule Viewing")')
    // fill the form
    const nameInput = page.getByPlaceholder(/full name|your name/i)
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User')
      const contactInput = page.getByPlaceholder(/line|email|contact/i).first()
      await contactInput.fill('test@example.com')
      await page.click('button:has-text("Send"), button[type="submit"]:has-text("Inquiry")')
      await expect(page.getByText(/sent|success/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('locale switch preserves slug', async ({ page }) => {
    await page.goto(`/en/properties/${PROPERTY_SLUG}`)
    // switch to Korean
    const langBtn = page.locator('button').filter({ hasText: /^EN$/i }).first()
    if (await langBtn.isVisible()) {
      await langBtn.click()
      await page.click('text=한국어')
      await expect(page).toHaveURL(new RegExp(`/ko/properties/${PROPERTY_SLUG}`))
    }
  })
})
