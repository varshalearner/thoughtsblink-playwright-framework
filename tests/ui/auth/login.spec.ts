import { faker } from '@faker-js/faker';
import { test, expect } from '@fixtures';
import { env } from '@utils/env';

// A trace records the values passed to fill(), so it would contain the password, and CI
// publishes traces. Screenshots and video are safe: a password field only shows dots.
test.use({ trace: 'off' });

test.describe('Login form', () => {
  test(
    'a buyer can log in with email and password',
    { tag: '@smoke' },
    async ({ loginPage, homePage }) => {
      await loginPage.open();

      await loginPage.logIn(env.accounts.buyer);

      await expect(homePage.header.accountMenu).toBeVisible();
    },
  );

  test(
    'a wrong password is refused with a message',
    { tag: '@regression' },
    async ({ page, loginPage, homePage }) => {
      await loginPage.open();

      await loginPage.logIn({
        email: env.accounts.buyer.email,
        password: faker.internet.password(),
      });

      await expect(page.getByText('Invalid login credentials')).toBeVisible();
      await expect(homePage.header.loginButton).toBeVisible();
    },
  );
});
