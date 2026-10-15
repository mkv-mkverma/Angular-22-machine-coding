// `test` defines a test case, `expect` makes assertions (checks).
import { test, expect } from '@playwright/test';

// test('<name shown in the report>', async ({ page }) => { ...steps... })
// `page` is a fresh browser tab that Playwright opens for this test and closes afterwards.
test('user can search for iphone in autocomplete', async ({ page }) => {
  // STEP 1: Open the app.
  // '/' is joined with `baseURL` from playwright.config.ts -> http://localhost:4200/
  // (the app then redirects to /login, and the header with nav links is visible).
  await page.goto('/');

  // STEP 2: Click the "Autocomplete" link in the header.
  // getByRole finds elements the way a user sees them: "a link whose text is Autocomplete".
  await page.getByRole('link', { name: 'Autocomplete' }).click();

  // STEP 3: Verify we landed on the right page.
  // `expect(...)` assertions auto-wait (up to 5s by default) until the condition is true,
  // so there's no need for manual sleeps while Angular navigates and renders.
  await expect(page).toHaveURL(/\/autocomplete$/);
  await expect(page).toHaveTitle('Autocomplete'); // from `title:` in app.routes.ts
  await expect(page.getByText('auto-complete works!')).toBeVisible();

  // STEP 4: Type "iphone" into the search box.
  // getByPlaceholder matches <input placeholder="search...">.
  const searchBox = page.getByPlaceholder('search...');
  await searchBox.fill('iphone');

  // STEP 5: Verify the results are shown.
  // The component waits 500ms (debounceTime) and then calls the dummyjson API,
  // so the results appear a bit later; the assertions below keep retrying until they do.
  const results = page.getByRole('listitem'); // every <li> on the page
  await expect(results.first()).toBeVisible();
  await expect(page.getByText('iPhone 13 Pro')).toBeVisible();
});
