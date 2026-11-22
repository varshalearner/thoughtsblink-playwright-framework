import { test, expect } from '@playwright/test';
import { ArtistsPage } from '@pages/artists.page';
import { HomePage } from '@pages/home.page';
import { ShopPage } from '@pages/shop.page';

test.describe('Home page', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.open();
  });

  test('visitor can go from the hero to the gallery', { tag: '@smoke' }, async ({ page }) => {
    await home.openGallery();

    await new ShopPage(page).expectLoaded();
  });

  test('main navigation opens the artists page', { tag: '@regression' }, async ({ page }) => {
    await home.header.navigateTo('Artists');

    await new ArtistsPage(page).expectLoaded();
  });

  test('cookie choice is remembered after a reload', { tag: '@regression' }, async ({ page }) => {
    await expect(home.cookieConsent.root).toBeVisible();
    await home.cookieConsent.acceptAll();
    await expect(home.cookieConsent.root).toBeHidden();

    await page.reload();
    // The banner is opened by client code after hydration; asserting "hidden" before the
    // featured artworks render could pass even if the choice was forgotten.
    await expect(home.featuredArtworks).not.toHaveCount(0);

    await expect(home.cookieConsent.root).toBeHidden();
  });
});
