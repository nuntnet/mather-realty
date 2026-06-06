import { test, expect } from '@playwright/test'

test.describe('Property submission form', () => {
  test('step 1 requires property type, city, address, and price', async ({ page }) => {
    await page.goto('/en/submit')
    await expect(page.getByText(/List Your Property|Submit/i)).toBeVisible()

    // Try to go to next step without filling required fields
    await page.click('button:has-text("Next")')
    await expect(page.getByText(/required|is required/i)).toBeVisible()
  })

  test('completes submission with valid data', async ({ page }) => {
    await page.goto('/en/submit')

    // Step 1: Property details
    await page.click('button:has-text("Condo")')
    await page.selectOption('select', 'Bangkok')
    await page.fill('input[placeholder*="address" i], input[placeholder*="Street" i]', '123 Test Street, Building A')
    await page.fill('input[type="number"][placeholder*="price" i], input[placeholder*="25000" i]', '25000')
    await page.click('button:has-text("Next")')

    // Step 2: Photos (skip)
    await page.click('button:has-text("Next")')

    // Step 3: Contact info
    await page.fill('input[placeholder*="full name" i]', 'Test Landlord')
    await page.fill('input[type="email"]', 'landlord@test.com')
    await page.fill('input[type="tel"]', '+66812345678')

    // Submit
    await page.click('button:has-text("Submit")')
    await expect(page.getByText(/submitted|review|success/i)).toBeVisible({ timeout: 15000 })
  })
})
