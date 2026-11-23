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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // API tests do not depend on a browser, so running them once per browser would only
    // triple the run time and the logins against Supabase's auth rate limit.
    { name: 'api', testDir: './tests/api' },
    { name: 'chromium', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/ui', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testDir: './tests/ui', use: { ...devices['Desktop Safari'] } },
  ],
});
