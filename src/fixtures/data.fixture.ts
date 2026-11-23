import { z } from 'zod';
import { test as apiTest } from '@fixtures/api.fixture';
import type { NewListing } from '@api/listings.client';
import { listingSchema, type Listing } from '@api/schemas';
import { buildListing } from '@data/listing.factory';

export interface DataFixtures {
  /** Creates a draft listing owned by the test artist; every one is deleted after the test. */
  createListing: (overrides?: Partial<NewListing>) => Promise<Listing>;
}

export const test = apiTest.extend<DataFixtures>({
  createListing: async ({ artistApi }, use) => {
    const created: string[] = [];

    await use(async (overrides) => {
      const response = await artistApi.listings.create(buildListing(artistApi.userId, overrides));
      if (!response.ok()) {
        throw new Error(`Could not create a listing: ${await response.text()}`);
      }
      const [listing] = z.tuple([listingSchema]).parse(await response.json());
      created.push(listing.id);
      return listing;
    });

    // Artists may only delete drafts, so a test that moved a listing on is reset first.
    for (const id of created) {
      await artistApi.listings.update(id, { status: 'draft' });
      const removed = await artistApi.listings.remove(id);
      const rows: unknown = await removed.json();
      if (!Array.isArray(rows) || rows.length !== 1) {
        throw new Error(`Test listing ${id} was not deleted: ${JSON.stringify(rows)}`);
      }
    }
  },
});
