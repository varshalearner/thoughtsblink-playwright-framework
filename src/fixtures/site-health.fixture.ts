import { test as base } from '@playwright/test';

interface SiteHealthWorkerFixtures {
  siteHealthCheck: undefined;
}

/**
 * Fails fast with one clear, actionable message when the site under test is unreachable,
 * instead of each test failing later with a raw navigation or request error.
 *
 * Worker scope: the answer is the same for every test in a worker, so it is checked once per
 * worker, not once per test. Auto: no test has to remember to ask for it. It uses an API
 * request context, so it never launches a browser.
 */
export const test = base.extend<object, SiteHealthWorkerFixtures>({
  siteHealthCheck: [
    async ({ playwright }, use, workerInfo) => {
      const baseURL = workerInfo.project.use.baseURL;
      const api = await playwright.request.newContext({ baseURL });
      try {
        const response = await api.get('/');
        if (!response.ok()) {
          throw new Error(`answered HTTP ${String(response.status())}`);
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
        throw new Error(
          `Site under test is not reachable: ${String(baseURL)} (${String(reason)}).\n` +
            'For TEST_ENV=local, start the app first (npm run dev in the artstudio repo).',
          { cause: error },
        );
      } finally {
        await api.dispose();
      }
      await use(undefined);
    },
    { scope: 'worker', auto: true },
  ],
});
