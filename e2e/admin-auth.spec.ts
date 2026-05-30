import { test, expect } from "@playwright/test";

test.describe("Admin authentication", () => {
  test("/admin redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "CH.ERAWAN Admin" })).toBeVisible();
    await expect(page.getByLabel("อีเมล")).toBeVisible();
    await expect(page.getByLabel("รหัสผ่าน")).toBeVisible();
  });

  test("/admin/cars preserves callbackUrl on redirect", async ({ page }) => {
    await page.goto("/admin/cars");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toMatch(/callbackUrl=%2Fadmin%2Fcars|callbackUrl=.*admin.*cars/);
  });

  test("/login page renders sign-in form without attempting real auth", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /เข้าสู่ระบบ/i })).toBeVisible();
    // Do not submit — no Turso/admin credentials in e2e by design
  });
});
