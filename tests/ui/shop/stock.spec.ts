import { z } from 'zod';
import { test, expect } from '@fixtures';
import { overrideListing } from '@mocks/listing.mock';

const physicalSchema = z.tuple([z.object({ slug: z.string() })]);

test.describe('Stock', () => {
  test(
    'an artwork with no stock left cannot be added to the cart',
    { tag: '@regression' },
    async ({ page, anonApi, artworkPage }) => {
      // Selling the last piece for real would need a payment; editing the response is enough
      // to check how the page treats stock.
      const response = await anonApi.listings.find({
        select: 'slug',
        status: 'eq.approved',
        kind: 'eq.physical',
        stock: 'gt.0',
        limit: '1',
      });
      const [artwork] = physicalSchema.parse(await response.json());
      await overrideListing(page, artwork.slug, { stock: 0 });

      await artworkPage.openArtwork(artwork.slug);

      await expect(artworkPage.addToCartButton).toBeDisabled();
      await expect(artworkPage.addToCartButton).toHaveText('Sold');
    },
  );
});
