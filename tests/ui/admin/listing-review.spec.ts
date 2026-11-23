import { test, expect } from '@fixtures';

test.describe('Listing review', () => {
  test(
    'an artist submission goes live once an admin approves it',
    { tag: '@regression' },
    async ({ createListing, openAs, artworkPage }) => {
      // Two browser contexts, two full page loads and API calls: about 15s when healthy
      // (measured), so a few slow responses exceeded the 30s budget. Assertions keep their 5s.
      test.slow();
      // The artist's side is set up through the API; this test is about the review hand-off.
      const listing = await createListing({ status: 'pending' });
      const admin = await openAs('admin');

      await admin.reviewQueuePage.open();
      await admin.reviewQueuePage.approve(listing.slug);
      await expect(admin.reviewQueuePage.item(listing.slug)).toBeHidden();

      // `artworkPage` belongs to the test's own page: a visitor who is not signed in.
      await artworkPage.openArtwork(listing.slug);
      await expect(artworkPage.title).toHaveText(listing.title);
    },
  );
});
