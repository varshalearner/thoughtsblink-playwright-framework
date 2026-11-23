import path from 'node:path';
import type { Page } from '@playwright/test';

const PLAYGROUND_ORIGIN = 'https://playground.test';
const PLAYGROUND_DIR = path.resolve(__dirname, '..', '..', 'tests', 'playground');

/**
 * Opens a page from tests/playground, served by page.route at a fake origin. No server is
 * needed, and every file shares one origin, so iframes behave like a real embedded page.
 */
export async function openPlayground(page: Page, file: string): Promise<void> {
  await page.route(`${PLAYGROUND_ORIGIN}/**`, (route) =>
    route.fulfill({ path: path.join(PLAYGROUND_DIR, new URL(route.request().url()).pathname) }),
  );
  await page.goto(`${PLAYGROUND_ORIGIN}/${file}`);
}
