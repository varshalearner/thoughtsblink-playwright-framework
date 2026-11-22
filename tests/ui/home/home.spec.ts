import { test, expect } from '@fixtures';

test.describe('Home page', () => {
  test(
    'visitor can go from the hero to the gallery',
    { tag: '@smoke' },
    async ({ homePage, shopPage }) => {
      await homePage.open();
      await homePage.openGallery();

      await shopPage.expectLoaded();
    },
  );

  test(
    'main navigation opens the artists page',
    { tag: '@regression' },
    async ({ homePage, artistsPage }) => {
      await homePage.open();
      await homePage.header.navigateTo('Artists');

      await artistsPage.expectLoaded();
    },
  );

  test(
    'cookie choice is remembered after a reload',
    { tag: '@regression' },
    async ({ page, homePage }) => {
      await homePage.open();
      await expect(homePage.cookieConsent.root).toBeVisible();
      await homePage.cookieConsent.acceptAll();
      await expect(homePage.cookieConsent.root).toBeHidden();

      await page.reload();
      // The banner is opened by client code after hydration; asserting "hidden" before the
      // featured artworks render could pass even if the choice was forgotten.
      await expect(homePage.featuredArtworks).not.toHaveCount(0);

      await expect(homePage.cookieConsent.root).toBeHidden();
    },
  );
});
