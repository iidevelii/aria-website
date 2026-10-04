import { test, expect } from '@playwright/test'
// مسارات لا يجوز أن تنكسر أبداً: الرئيسية، التسجيل، الدخول، تنبيه المخاطر.
test('home renders RTL with hero and risk disclaimer link', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('link', { name: /المخاطر|risk/i }).first()).toBeVisible()
})
test('register and login pages load with forms', async ({ page }) => {
  await page.goto('/register'); await expect(page.locator('input[type="email"]').first()).toBeVisible()
  await page.goto('/login'); await expect(page.locator('input[type="password"]').first()).toBeVisible()
})
test('no horizontal scroll on mobile home', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})
