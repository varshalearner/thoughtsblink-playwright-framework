import { test, expect } from '@fixtures';
import { postgrestErrorSchema } from '@api/schemas';
import { buildListing } from '@data/listing.factory';

// Postgres SQLSTATE codes PostgREST passes through.
const RLS_VIOLATION = '42501';
const RAISED_BY_TRIGGER = 'P0001';

test.describe('Listing permissions', { tag: ['@api', '@regression'] }, () => {
  test('a visitor cannot create a listing', async ({ anonApi, artistApi }) => {
    const response = await anonApi.listings.create(buildListing(artistApi.userId));

    expect(response.status()).toBe(401);
    expect(postgrestErrorSchema.parse(await response.json())).toMatchObject({
      code: RLS_VIOLATION,
    });
  });

  test('a buyer who is not a seller cannot create a listing', async ({ buyerApi }) => {
    const response = await buyerApi.listings.create(buildListing(buyerApi.userId));

    expect(response.status()).toBe(403);
    expect(postgrestErrorSchema.parse(await response.json())).toMatchObject({
      code: RLS_VIOLATION,
    });
  });

  test('an artist cannot create a listing for another user', async ({ artistApi, buyerApi }) => {
    const response = await artistApi.listings.create(buildListing(buyerApi.userId));

    expect(response.status()).toBe(403);
  });

  test('an artist cannot publish a listing without review', async ({ artistApi }) => {
    const response = await artistApi.listings.create(
      buildListing(artistApi.userId, { status: 'approved' }),
    );

    expect(response.status()).toBe(403);
  });

  test('an artist cannot approve their own draft', async ({ createListing, artistApi }) => {
    const draft = await createListing();

    const response = await artistApi.listings.update(draft.id, { status: 'approved' });

    expect(response.status()).toBe(400);
    expect(postgrestErrorSchema.parse(await response.json())).toMatchObject({
      code: RAISED_BY_TRIGGER,
      message: 'Only the studio admin can approve listings',
    });
  });

  test('a buyer cannot edit a listing they do not own', async ({
    createListing,
    buyerApi,
    artistApi,
  }) => {
    const draft = await createListing({ price_inr: 5000 });

    const response = await buyerApi.listings.update(draft.id, { price_inr: 1 });

    // RLS hides rows the buyer may not update, so PostgREST reports success with no rows.
    await expect(response).toBeOK();
    expect(await response.json()).toEqual([]);
    const after = await artistApi.listings.find({ select: 'price_inr', id: `eq.${draft.id}` });
    expect(await after.json()).toEqual([{ price_inr: 5000 }]);
  });
});
