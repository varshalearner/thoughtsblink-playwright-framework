import { z } from 'zod';
import { test as base, expect } from '@fixtures';

const sellerProfileSchema = z.looseObject({ verified: z.boolean(), suspended: z.boolean() });
type SellerProfile = z.infer<typeof sellerProfileSchema>;

const test = base.extend<{ artistSellerProfile: SellerProfile }>({
  /** The artist's seller profile before the test; written back afterwards, whatever happened. */
  artistSellerProfile: async ({ artistApi }, use) => {
    const response = await artistApi.profiles.find({
      select: 'seller_profile',
      id: `eq.${artistApi.userId}`,
    });
    const [row] = z
      .tuple([z.object({ seller_profile: sellerProfileSchema })])
      .parse(await response.json());

    await use(row.seller_profile);

    await artistApi.profiles.update(artistApi.userId, { seller_profile: row.seller_profile });
  },
});

test.describe('Seller badges', { tag: ['@api', '@regression'] }, () => {
  test(
    'an artist cannot give themselves the verified badge',
    {
      annotation: { type: 'issue', description: 'BUGS.md#bug-003' },
    },
    async ({ artistApi, artistSellerProfile }) => {
      // test.fail() turns any failure into a pass, so a wrong precondition must skip instead.
      test.skip(artistSellerProfile.verified, 'the test artist is already verified by an admin');
      test.fail(true, 'BUG-003: sellers can edit admin-only fields of their own profile');

      await artistApi.profiles.update(artistApi.userId, {
        seller_profile: { ...artistSellerProfile, verified: true },
      });

      const after = await artistApi.profiles.find({
        select: 'verified:seller_profile->verified',
        id: `eq.${artistApi.userId}`,
      });
      expect(await after.json()).toEqual([{ verified: false }]);
    },
  );
});
