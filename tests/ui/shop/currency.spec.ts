import { z } from 'zod';
import { test, expect } from '@fixtures';
import { mockExchangeRates } from '@mocks/exchange-rates.mock';

const approvedSchema = z.tuple([z.object({ slug: z.string(), price_inr: z.number() })]);

test.describe('Currency', () => {
  test(
    'prices convert with the exchange rates the server provides',
    { tag: '@regression' },
    async ({ page, anonApi, artworkPage }) => {
      const response = await anonApi.listings.find({
        select: 'slug,price_inr',
        status: 'eq.approved',
        limit: '1',
      });
      const [artwork] = approvedSchema.parse(await response.json());
      // Far from any real rate, so the price below can only come from the mocked response.
      const usdPerRupee = 0.01;
      await mockExchangeRates(page, { INR: 1, USD: usdPerRupee, EUR: 0.02, GBP: 0.03 });

      await artworkPage.openArtwork(artwork.slug);
      await artworkPage.header.chooseCurrency('USD');

      const expected = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(artwork.price_inr * usdPerRupee);
      await expect(artworkPage.price).toHaveText(expected);
    },
  );
});
