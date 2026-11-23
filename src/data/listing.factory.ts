import { faker } from '@faker-js/faker';
import type { NewListing } from '@api/listings.client';

/** Marks rows this suite created, so leftovers from a crashed run are easy to find. */
export const TEST_DATA_PREFIX = 'e2e';

/**
 * A valid draft listing with a unique slug and title. Drafts never appear in the public gallery
 * or the admin review queue, so test data stays invisible to real visitors.
 */
export function buildListing(sellerId: string, overrides: Partial<NewListing> = {}): NewListing {
  const id = faker.string.alphanumeric({ length: 10, casing: 'lower' });
  return {
    seller_id: sellerId,
    slug: `${TEST_DATA_PREFIX}-${id}`,
    title: `[${TEST_DATA_PREFIX}] ${faker.word.adjective()} ${faker.word.noun()} ${id}`,
    description: faker.lorem.sentence(),
    category: 'painting',
    medium: 'oil',
    width_cm: faker.number.int({ min: 20, max: 120 }),
    height_cm: faker.number.int({ min: 20, max: 120 }),
    price_inr: faker.number.int({ min: 1000, max: 50000 }),
    kind: 'physical',
    status: 'draft',
    ...overrides,
  };
}
