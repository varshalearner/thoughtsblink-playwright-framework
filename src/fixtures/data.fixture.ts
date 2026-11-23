import { z } from 'zod';
import { test as apiTest } from '@fixtures/api.fixture';
import type { NewListing } from '@api/listings.client';
import { listingSchema, type Listing } from '@api/schemas';
import { buildListing, TEST_DATA_PREFIX } from '@data/listing.factory';

export interface DataFixtures {
  /** Creates a draft listing owned by the test artist; every one is deleted after the test. */
  createListing: (overrides?: Partial<NewListing>) => Promise<Listing>;
  /** The id of the buyer-artist test conversation. */
  chatThreadId: string;
}

const threadRowsSchema = z.array(z.object({ id: z.uuid() }));

export const test = apiTest.extend<DataFixtures>({
  // Reused, not created per test: clients cannot delete threads or messages. One thread per
  // parallel slot: tests in the same slot never run at once, so they cannot overwrite each
  // other's thread state, and the number of threads stays bounded by the worker count.
  chatThreadId: async ({ buyerApi, artistApi }, use, testInfo) => {
    const participants = `{${buyerApi.userId},${artistApi.userId}}`;
    const contextId = `${TEST_DATA_PREFIX}-${String(testInfo.parallelIndex)}`;
    const existing = await buyerApi.chat.findThreads({
      select: 'id',
      participant_ids: `cs.${participants}`,
      'context->>id': `eq.${contextId}`,
      order: 'created_at.asc',
      limit: '1',
    });
    let [thread] = threadRowsSchema.parse(await existing.json());
    if (!thread) {
      const created = await buyerApi.chat.createThread({
        participant_ids: [buyerApi.userId, artistApi.userId],
        participant_names: { [buyerApi.userId]: 'E2E buyer', [artistApi.userId]: 'E2E artist' },
        context: { type: 'general', id: contextId },
        context_label: `[${TEST_DATA_PREFIX}] test conversation ${String(testInfo.parallelIndex)}`,
      });
      [thread] = threadRowsSchema.length(1).parse(await created.json());
    }
    if (!thread) throw new Error('Could not find or create the e2e chat thread');
    await use(thread.id);
  },

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
