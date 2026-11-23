import { test, expect } from '@fixtures';

// Phone layout only: the desktop projects exclude @mobile, and these phones run @smoke + @mobile.
test.describe('Mobile navigation', { tag: '@mobile' }, () => {
  test(
    'the menu opens the mobile navigation and leads to the artists page',
    { tag: '@smoke' },
    async ({ homePage, artistsPage }) => {
      await homePage.open();

      await homePage.header.openMobileMenu();
      await expect(homePage.header.mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
      await homePage.header.mobileNav.getByRole('link', { name: 'Artists' }).click();

      await artistsPage.expectLoaded();
      await expect(homePage.header.mobileNav).toBeHidden();
    },
  );

  test(
    'a visitor finds the login link in the menu',
    { tag: '@smoke' },
    async ({ homePage, loginPage }) => {
      await homePage.open();

      await homePage.header.openMobileMenu();
      await homePage.header.mobileNav.getByRole('link', { name: 'Log in' }).click();

      await loginPage.expectLoaded();
    },
  );
});
