import { test, expect } from '@fixtures';

test.describe('Visual', { tag: '@visual' }, () => {
  test(
    'the login form looks as approved',
    { tag: '@regression' },
    async ({ browserName, loginPage }) => {
      // Each browser renders differently, so baselines are kept for one browser only.
      test.skip(browserName !== 'chromium', 'visual baselines are kept for Chromium only');
      // The banner appears after hydration, so it would be in some screenshots and not others.
      await loginPage.cookieConsent.decideBeforeLoad();
      await loginPage.open();

      // The login card holds only static text, so any difference is a layout or styling change.
      await expect(loginPage.form).toHaveScreenshot('login-form.png', { animations: 'disabled' });
    },
  );
});
