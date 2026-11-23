import { z } from 'zod';
import { test, expect } from '@fixtures';
import { failListing } from '@mocks/listing.mock';

const approvedSchema = z.tuple([z.object({ slug: z.string() })]);

test.describe('Artwork page errors', () => {
  test(
    'an unknown artwork shows the not-found message',
    { tag: '@regression' },
    async ({ artworkPage }) => {
      await artworkPage.visitArtwork('e2e-no-such-artwork');

      await expect(artworkPage.notFoundHeading).toBeVisible();
      await expect(artworkPage.addToCartButton).toBeHidden();
    },
  );

  test(
    'a server error is not reported as a missing artwork',
    {
      tag: '@regression',
      annotation: { type: 'issue', description: 'BUGS.md#bug-006' },
    },
    async ({ page, anonApi, artworkPage }) => {
      test.fail(true, 'BUG-006: a failed request shows "wandered off the wall" (sold or paused)');
      // The app's own retries take about 15s (measured below), too close to the 30s budget.
      test.slow();
      const response = await anonApi.listings.find({
        select: 'slug',
        status: 'eq.approved',
        limit: '1',
      });
      const [artwork] = approvedSchema.parse(await response.json());
      await failListing(page, artwork.slug);

      await artworkPage.visitArtwork(artwork.slug);

      // Measured: supabase-js tries 4 times and React Query repeats that once, 8 requests over
      // about 15s, before the page settles. Wait for either outcome, then check which one.
      const retryButton = page.getByRole('button', { name: /try again|retry/i });
      await expect(retryButton.or(artworkPage.notFoundHeading)).toBeVisible({ timeout: 20_000 });

      // A visitor should be told to try again, not that an existing artwork is gone.
      await expect(retryButton).toBeVisible();
    },
  );
});
