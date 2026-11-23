import { test, expect } from '@fixtures';

// From the app's messages/hi.json.
const HINDI = {
  browseArt: 'कला देखें',
  heroTitle: 'हाथों से बनी कला, दिल से चुनी हुई',
};

test.describe('Language', () => {
  test(
    'a visitor can switch the site to Hindi and it stays Hindi',
    { tag: '@regression' },
    async ({ page, homePage }) => {
      await homePage.open();

      await homePage.header.chooseLanguage('हिन्दी');

      await expect(
        homePage.header.mainNav.getByRole('link', { name: HINDI.browseArt }),
      ).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
      await page.reload();
      await expect(page.getByRole('heading', { level: 1, name: HINDI.heroTitle })).toBeVisible();
    },
  );

  test(
    'the saved language is rendered by the server on the first load',
    { tag: '@regression' },
    async ({ page, baseURL }) => {
      // The app keeps the choice in a "locale" cookie and renders on the server, so setting the
      // cookie before the first request must be enough: no client-side switch involved.
      await page.context().addCookies([{ name: 'locale', value: 'hi', url: baseURL ?? '' }]);

      const response = await page.goto('/');

      expect(await response?.text()).toContain(HINDI.heroTitle);
      await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
    },
  );
});
