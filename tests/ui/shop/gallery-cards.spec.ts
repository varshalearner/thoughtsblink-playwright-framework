import { test, expect } from '@fixtures';
import { replayCatalogue } from '@mocks/catalogue-har';

// tests/hars/catalogue.har holds six approved artworks.
const RECORDED_ARTWORKS = 6;

test.describe('Gallery cards', () => {
  test(
    'every card shows a title, a price, a described image and a link',
    { tag: ['@regression', '@har'] },
    async ({ page, shopPage }) => {
      await replayCatalogue(page, 'catalogue');
      await shopPage.open();
      // all() snapshots the list, so wait for the full grid first.
      await expect(shopPage.artworkCards).toHaveCount(RECORDED_ARTWORKS);

      // Soft: a broken card is recorded and the loop goes on, so one run reports every
      // broken card instead of stopping at the first.
      for (const [index, card] of (await shopPage.artworkCards.all()).entries()) {
        const label = `card ${String(index + 1)}`;
        await expect.soft(card.getByRole('heading', { level: 3 }), label).not.toBeEmpty();
        await expect.soft(card.getByTestId('artwork-price'), label).toHaveText(/^₹[\d,]+$/);
        // The rating stars are an aria-labelled img too; only the artwork has an alt text.
        await expect.soft(card.getByAltText(/\S/), label).toBeVisible();
        await expect.soft(card.getByRole('link'), label).toHaveAttribute('href', /^\/artwork\/.+/);
      }
    },
  );
});
