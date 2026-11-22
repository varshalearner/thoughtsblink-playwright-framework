import { test as base, expect } from '@playwright/test';

// WebKit reports Next.js RSC prefetches cancelled by a reload or navigation as uncaught
// "Fetch API cannot load …?_rsc=… due to access control checks". Users never see it.
const KNOWN_BROWSER_NOISE = [/\?_rsc=\S+ due to access control checks\.$/];

export interface PageErrorOptions {
  /** Extra uncaught-error messages a test expects, e.g. while mocking a failing API. */
  ignoredPageErrors: RegExp[];
}

/**
 * Wraps the built-in `page` so every UI test fails on uncaught errors in the app.
 * Overriding `page` instead of an `auto` fixture means API-only tests never launch a browser.
 */
export const test = base.extend<PageErrorOptions>({
  ignoredPageErrors: [[], { option: true }],

  page: async ({ page, ignoredPageErrors }, use) => {
    const ignored = [...KNOWN_BROWSER_NOISE, ...ignoredPageErrors];
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      if (!ignored.some((pattern) => pattern.test(error.message))) errors.push(error.message);
    });

    await use(page);

    expect(errors, 'Uncaught errors in the page').toEqual([]);
  },
});
