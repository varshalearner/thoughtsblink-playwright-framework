import { defineConfig, devices } from '@playwright/test';
import { env } from '@utils/env';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Measured on a 16-core laptop: 8 workers failed 6 of 153 tests on main-thread starvation
  // (1s clicks, 6s client navigations); 4 workers failed 0 of 81 in the same wall time.
  workers: isCI ? undefined : '25%',
  reporter: isCI
    ? [['blob'], ['junit', { outputFile: 'reports/junit.xml' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: env.baseURL,
    // The app picks its default currency from the time zone and its language from the browser,
    // so tests pin both instead of inheriting whatever machine (or CI runner) they run on.
    timezoneId: 'Asia/Kolkata',
    locale: 'en-IN',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // API tests do not depend on a browser, so running them once per browser would only
    // triple the run time and the logins against Supabase's auth rate limit.
    { name: 'api', testDir: './tests/api' },
    // Signs every role in once per run; browser projects reuse the saved states in .auth/.
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
