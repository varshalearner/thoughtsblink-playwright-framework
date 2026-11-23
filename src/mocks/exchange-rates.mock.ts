import type { Page } from '@playwright/test';
import type { z } from 'zod';
import type { exchangeRatesSchema } from '@api/schemas';

type ExchangeRates = z.infer<typeof exchangeRatesSchema>['rates'];

/**
 * Answers the app's /api/exchange-rates call with fixed rates, so price conversions are
 * deterministic. Register before navigating: the app fetches rates once, on first load.
 */
export async function mockExchangeRates(page: Page, rates: ExchangeRates): Promise<void> {
  await page.route('**/api/exchange-rates', (route) =>
    route.fulfill({ json: { rates, source: 'fallback' } }),
  );
}
