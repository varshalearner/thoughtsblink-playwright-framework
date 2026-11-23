import type { Locator } from '@playwright/test';
import { test, expect } from '@fixtures';
import { replayCatalogue } from '@mocks/catalogue-har';

/** Whether the displayed prices ("₹24,500", "$185.00", ...) run from low to high. */
async function pricesAscend(prices: Locator): Promise<boolean> {
  const values = (await prices.allTextContents()).map((text) =>
    Number(text.replace(/[^\d.]/g, '')),
  );
  return values.length > 1 && values.slice(1).every((value, i) => (values[i] ?? value) <= value);
}

test.describe('Gallery sorting', () => {
  test(
    'price low to high lists the cheapest artwork first',
    { tag: ['@regression', '@har'] },
    async ({ page, shopPage }) => {
      // Recorded catalogue: the same artworks every run, so the precondition below always holds.
      await replayCatalogue(page, 'catalogue');
      await shopPage.open();
      await expect(shopPage.artworkCards).not.toHaveCount(0);
      expect(await pricesAscend(shopPage.cardPrices), 'newest order is already by price').toBe(
        false,
      );

      await shopPage.sortBy('Price: low to high');

      // Polls until the re-sorted grid has rendered, the way a web-first assertion retries.
      await expect.poll(() => pricesAscend(shopPage.cardPrices)).toBe(true);
    },
  );
});
