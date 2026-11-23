import { test, expect } from '@fixtures';
import { authFile } from '@utils/auth-state';
import { env } from '@utils/env';

// This file types the admin password; a trace would store it (see login.spec.ts).
test.use({ trace: 'off' });

test.describe('Admin area access', () => {
  test(
    'a visitor is sent to log in and returned to the admin area afterwards',
    { tag: '@regression' },
    async ({ page, reviewQueuePage, loginPage }) => {
      await reviewQueuePage.visit();

      await loginPage.expectLoaded();
      await expect(page).toHaveURL(/[?&]next=\/admin$/);

      await loginPage.logIn(env.accounts.admin);
      await expect(page).toHaveURL(/\/admin$/);
    },
  );

  test.describe('as a buyer', () => {
    test.use({ storageState: authFile('buyer') });

    test(
      'a buyer cannot open the review queue',
      { tag: '@regression' },
      async ({ reviewQueuePage, loginPage }) => {
        await reviewQueuePage.visit();

        await loginPage.expectLoaded();
        await expect(reviewQueuePage.heading).toBeHidden();
      },
    );
  });
});
