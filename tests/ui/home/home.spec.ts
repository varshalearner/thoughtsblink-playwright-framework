import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('visitor can go from the hero to the gallery', { tag: '@smoke' }, async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: 'Art made by hand, found by heart' }),
    ).toBeVisible();

    await test.step('open the gallery from the hero', async () => {
      // "Browse Art" is also a header link, so scope to the page content.
      await page.getByRole('main').getByRole('link', { name: 'Browse Art' }).click();
    });

    await expect(page).toHaveURL(/\/shop$/);
    await expect(page.getByRole('heading', { level: 1, name: 'The Gallery' })).toBeVisible();
  });

  test('main navigation opens the artists page', { tag: '@regression' }, async ({ page }) => {
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Artists' })
      .click();

    await expect(page).toHaveURL(/\/artists$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Artists in the studio' }),
    ).toBeVisible();
  });

  test('cookie choice is remembered after a reload', { tag: '@regression' }, async ({ page }) => {
    const banner = page.getByRole('dialog', { name: 'Cookie consent' });

    await test.step('accept cookies', async () => {
      await expect(banner).toBeVisible();
      await banner.getByRole('button', { name: 'Accept all' }).click();
      await expect(banner).toBeHidden();
    });

    await test.step('reload and wait for the app to hydrate', async () => {
      await page.reload();
      // The banner is opened by client code after hydration; asserting "hidden" before the
      // featured artworks render could pass even if the choice was forgotten.
      await expect(
        page.getByRole('region', { name: 'Fresh off the easel' }).getByTestId('artwork-card'),
      ).not.toHaveCount(0);
    });

    await expect(banner).toBeHidden();
  });
});
