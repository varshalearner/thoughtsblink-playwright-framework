import { z } from 'zod';
import { test, expect } from '@fixtures';
import { listingSchema } from '@api/schemas';

test.describe('Listing drafts', { tag: '@api' }, () => {
  test(
    'a draft is visible to its artist but hidden from visitors',
    { tag: '@regression' },
    async ({ createListing, artistApi, anonApi }) => {
      const draft = await createListing();

      const asArtist = await artistApi.listings.find({ select: 'id', id: `eq.${draft.id}` });
      const asVisitor = await anonApi.listings.find({ select: 'id', id: `eq.${draft.id}` });

      expect(await asArtist.json()).toEqual([{ id: draft.id }]);
      expect(await asVisitor.json()).toEqual([]);
    },
  );

  test(
    'an artist can change the price of their draft',
    { tag: '@regression' },
    async ({ createListing, artistApi }) => {
      const draft = await createListing({ price_inr: 5000 });

      const response = await artistApi.listings.update(draft.id, { price_inr: 7500 });

      await expect(response).toBeOK();
      const [updated] = z.tuple([listingSchema]).parse(await response.json());
      expect(updated).toMatchObject({ id: draft.id, price_inr: 7500, status: 'draft' });
    },
  );
});
