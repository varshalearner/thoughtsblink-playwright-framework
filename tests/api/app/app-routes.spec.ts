import { test, expect } from '@fixtures';
import { exchangeRatesSchema } from '@api/schemas';

test.describe('App API routes', { tag: '@api' }, () => {
  test(
    'exchange rates are served per rupee for every display currency',
    { tag: '@smoke' },
    async ({ appApi }) => {
      const response = await appApi.getExchangeRates();

      await expect(response).toBeOK();
      const { rates } = exchangeRatesSchema.parse(await response.json());
      // Per-rupee rates are fractions; an inverted rate (about 84 for USD) would show every
      // price thousands of times too high.
      for (const currency of ['USD', 'EUR', 'GBP'] as const) {
        expect(rates[currency], currency).toBeLessThan(1);
      }
    },
  );

  test(
    'setup status is not available to visitors',
    {
      tag: '@regression',
      annotation: { type: 'issue', description: 'BUGS.md#bug-001' },
    },
    async ({ appApi }) => {
      test.fail(true, 'BUG-001: /api/setup/status answers anonymous requests');

      const response = await appApi.getSetupStatus();

      expect([401, 403]).toContain(response.status());
    },
  );
});
