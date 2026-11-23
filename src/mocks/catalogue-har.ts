import path from 'node:path';
import type { Page } from '@playwright/test';

const HAR_DIR = path.resolve(__dirname, '..', '..', 'tests', 'hars');

/**
 * Serves Supabase `listings` requests from a recorded HAR, so catalogue tests see the same
 * artworks every run however the live gallery changes. Run `npm run har:update` to re-record.
 *
 * Only `listings` is recorded: the page also loads `profiles`, which currently exposes every
 * artist's email and payout id (BUG-002), and HAR files are committed to a public repo.
 */
export async function replayCatalogue(page: Page, name: string): Promise<void> {
  await page.routeFromHAR(path.join(HAR_DIR, `${name}.har`), {
    url: /\/rest\/v1\/listings\?/,
    update: process.env.UPDATE_HAR === '1',
    updateMode: 'minimal',
    updateContent: 'embed',
  });
}
