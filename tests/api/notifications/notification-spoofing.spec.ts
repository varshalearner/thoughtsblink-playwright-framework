import { faker } from '@faker-js/faker';
import { z } from 'zod';
import { test as base, expect } from '@fixtures';
import { TEST_DATA_PREFIX } from '@data/listing.factory';

const rowsSchema = z.array(z.object({ id: z.uuid() }));

const test = base.extend<{ spoofedTitle: string }>({
  /**
   * A unique notification title. Clients cannot delete notifications, so teardown finds any
   * that reached the artist by this title and marks them read, as the artist.
   */
  spoofedTitle: async ({ artistApi }, use) => {
    const title = `[${TEST_DATA_PREFIX}] Payout on hold - confirm your bank details ${faker.string.alphanumeric(8)}`;
    await use(title);
    const response = await artistApi.notifications.find({ select: 'id', title: `eq.${title}` });
    for (const { id } of rowsSchema.parse(await response.json())) {
      await artistApi.notifications.update(id, { read: true });
    }
  },
});

test.describe('Notification spoofing', { tag: ['@api', '@regression'] }, () => {
  test(
    'a user cannot send another user a notification with any link',
    {
      annotation: { type: 'issue', description: 'BUGS.md#bug-005' },
    },
    async ({ buyerApi, artistApi, spoofedTitle }) => {
      test.fail(true, "BUG-005: any signed-in user can write into anyone else's notifications");

      const response = await buyerApi.notifications.create({
        user_id: artistApi.userId,
        type: 'system',
        title: spoofedTitle,
        href: 'https://example.com/phishing',
      });

      expect(response.status(), 'a notification from another user was accepted').not.toBe(201);
    },
  );
});
