import { test, expect } from '@playwright/test';

test('Angular application loads', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();
});
