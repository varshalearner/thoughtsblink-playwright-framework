import { test as setup, expect } from '@fixtures';
import { signIn, SUPABASE_STORAGE_KEY } from '@api/supabase';
import { authFile } from '@utils/auth-state';
import { env, ROLES } from '@utils/env';

/**
 * Signs each role in through the Auth API and saves a browser state the UI tests start from.
 * The app keeps its session in localStorage (supabase-js persistSession), so the state is
 * built there directly instead of typing into the login form for every test.
 */
for (const role of ROLES) {
  setup.describe(role, () => {
    setup.use({
      storageState: async ({ playwright }, use) => {
        const request = await playwright.request.newContext();
        const session = await signIn(request, env.accounts[role]);
        await request.dispose();
        await use({
          cookies: [],
          origins: [
            {
              origin: new URL(env.baseURL).origin,
              localStorage: [{ name: SUPABASE_STORAGE_KEY, value: JSON.stringify(session.stored) }],
            },
          ],
        });
      },
    });

    setup(`sign in as ${role}`, async ({ page, homePage }) => {
      await homePage.open();
      // Proof the app accepted the session, so a broken state fails here, once, not in every test.
      await expect(homePage.header.accountMenu).toBeVisible();

      await page.context().storageState({ path: authFile(role) });
    });
  });
}
