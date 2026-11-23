import { test as base, type BrowserContext } from '@playwright/test';
import { pagesFor } from '@fixtures/pages.fixture';
import { authFile } from '@utils/auth-state';
import type { Role } from '@utils/env';

export interface RoleFixtures {
  /**
   * A second (third, ...) signed-in user in the same test, each in its own browser context,
   * so their storage and sessions never mix. The test's own `page` stays the main user.
   */
  openAs: (role: Role) => Promise<ReturnType<typeof pagesFor>>;
}

export const test = base.extend<RoleFixtures>({
  openAs: async ({ browser, contextOptions, baseURL }, use) => {
    const contexts: BrowserContext[] = [];

    await use(async (role) => {
      // browser.newContext() does not inherit the project's `use` settings, so pass them on.
      const context = await browser.newContext({
        ...contextOptions,
        baseURL,
        storageState: authFile(role),
      });
      contexts.push(context);
      return pagesFor(await context.newPage());
    });

    for (const context of contexts) await context.close();
  },
});
