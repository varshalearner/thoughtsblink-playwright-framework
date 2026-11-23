import { test, expect } from '@fixtures';
import { listingSchema } from '@api/schemas';

test.describe('Listings read access', { tag: '@api' }, () => {
  test(
    'visitors see approved listings in the documented shape',
    { tag: '@smoke' },
    async ({ anonApi }) => {
      const response = await anonApi.listings.find({ select: '*', limit: '20' });

      await expect(response).toBeOK();
      const listings = listingSchema
        .array()
        .min(1)
        .parse(await response.json());
      expect(listings.filter((listing) => listing.status !== 'approved')).toEqual([]);
    },
  );

  test(
    'visitors cannot read unapproved listings even when they ask for them',
    { tag: '@regression' },
    async ({ anonApi }) => {
      const response = await anonApi.listings.find({ select: 'id,status', status: 'neq.approved' });

      await expect(response).toBeOK();
      expect(await response.json()).toEqual([]);
    },
  );
});
