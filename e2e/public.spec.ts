import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("home page loads with navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ช\.เอราวัณ|CH\.ERAWAN/i);
    await expect(page.getByRole("link", { name: /แบรนด์รถยนต์|รถยนต์/i }).first()).toBeVisible();
  });

  test("/cars page shows listing header", async ({ page }) => {
    await page.goto("/cars");
    await expect(page.getByRole("heading", { name: "ค้นหารถยนต์" })).toBeVisible();
  });

  test("car cards link to /cars/<slug> when cars exist", async ({ page }) => {
    await page.goto("/cars");
    const carLinks = page.locator('a[href^="/cars/"]').filter({
      hasNot: page.locator('[href="/cars"]'),
    });
    const count = await carLinks.count();
    if (count === 0) {
      // Empty Notion data — page should still render without error
      await expect(page.getByRole("heading", { name: "ค้นหารถยนต์" })).toBeVisible();
      return;
    }
    const href = await carLinks.first().getAttribute("href");
    expect(href).toMatch(/^\/cars\/[^/]+$/);
    await carLinks.first().click();
    await expect(page).toHaveURL(new RegExp(`^${escapeRegex(href!)}`));
  });

  test("/blog page loads", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: /บทความ|ข่าวสาร/i })).toBeVisible();
  });

  test("/contact form validates required fields client-side", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "ติดต่อเรา" })).toBeVisible();

    // Submit empty form — should stay on contact page (toast blocks submit)
    await page.getByRole("button", { name: /ส่งข้อความ|ส่ง/i }).click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole("heading", { name: "ติดต่อเรา" })).toBeVisible();
  });

  test("/branches page lists branch locations", async ({ page }) => {
    await page.goto("/branches");
    await expect(page.getByText(/มาสด้า ช\.เอราวัณ/i).first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
