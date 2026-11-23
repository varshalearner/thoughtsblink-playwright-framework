import { test, expect } from '@fixtures';
import { authFile } from '@utils/auth-state';

test.describe('Account menu', () => {
  test('a visitor is offered the login button', { tag: '@smoke' }, async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.header.loginButton).toBeVisible();
    await expect(homePage.header.accountMenu).toBeHidden();
  });

  test.describe('as a buyer', () => {
    test.use({ storageState: authFile('buyer') });

    test(
      'shows account links but not the admin dashboard',
      { tag: '@regression' },
      async ({ homePage }) => {
        await homePage.open();
        await homePage.header.openAccountMenu();

        await expect(homePage.header.accountMenuItem('My Account')).toBeVisible();
        await expect(homePage.header.accountMenuItem('Admin')).toBeHidden();
      },
    );

    test(
      'does not offer the setup page',
      {
        tag: '@regression',
        annotation: { type: 'issue', description: 'BUGS.md#bug-001' },
      },
      async ({ homePage }) => {
        test.fail(true, 'BUG-001: the setup page is offered to every signed-in user');
        await homePage.open();
        await homePage.header.openAccountMenu();
        await expect(homePage.header.accountMenuItem('My Account')).toBeVisible();

        await expect(homePage.header.accountMenuItem('Setup')).toBeHidden();
      },
    );
  });

  test.describe('as an admin', () => {
    test.use({ storageState: authFile('admin') });

    test('offers the admin dashboard', { tag: '@regression' }, async ({ homePage }) => {
      await homePage.open();
      await homePage.header.openAccountMenu();

      await expect(homePage.header.accountMenuItem('Admin')).toBeVisible();
    });
  });
});
