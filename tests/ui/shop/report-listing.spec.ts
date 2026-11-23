import { faker } from '@faker-js/faker';
import { z } from 'zod';
import { test as base, expect } from '@fixtures';
import { TEST_DATA_PREFIX } from '@data/listing.factory';
import { authFile } from '@utils/auth-state';

const rowsSchema = z.array(z.object({ id: z.uuid(), slug: z.string() }));

const test = base.extend<{ artworkSlug: string; reportReason: string }>({
  artworkSlug: async ({ anonApi }, use) => {
    const response = await anonApi.listings.find({
      select: 'id,slug',
      status: 'eq.approved',
      limit: '1',
    });
    const [artwork] = z.tuple([rowsSchema.element]).parse(await response.json());
    await use(artwork.slug);
  },
  /**
   * A unique report reason. Clients cannot delete reports, so teardown has the admin dismiss
   * any report sent with it, which takes it out of the open moderation queue.
   */
  reportReason: async ({ adminApi }, use) => {
    const reason = `[${TEST_DATA_PREFIX}] automated test report ${faker.string.alphanumeric(8)}`;
    await use(reason);
    const found = await adminApi.reports.find({ select: 'id', reason: `eq.${reason}` });
    for (const { id } of z.array(z.object({ id: z.uuid() })).parse(await found.json())) {
      await adminApi.reports.update(id, { status: 'dismissed' });
    }
  },
});

test.use({ storageState: authFile('buyer') });

test.describe('Report dialog', () => {
  test(
    'the report cannot be sent without a reason and Escape closes it',
    { tag: '@regression' },
    async ({ page, artworkPage, artworkSlug }) => {
      await artworkPage.openArtwork(artworkSlug);
      await artworkPage.openReportDialog();

      await expect(artworkPage.reportDialog.root).toBeVisible();
      await expect(artworkPage.reportDialog.sendButton).toBeDisabled();
      await page.keyboard.press('Escape');
      await expect(artworkPage.reportDialog.root).toBeHidden();
    },
  );

  test(
    'a buyer can report a listing to the studio team',
    { tag: '@regression' },
    async ({ page, artworkPage, artworkSlug, reportReason, adminApi }) => {
      await artworkPage.openArtwork(artworkSlug);
      await artworkPage.openReportDialog();

      await artworkPage.reportDialog.send(reportReason);

      await expect(page.getByText('Thanks — the studio team will take a look.')).toBeVisible();
      await expect(artworkPage.reportDialog.root).toBeHidden();
      const stored = await adminApi.reports.find({
        select: 'status',
        reason: `eq.${reportReason}`,
      });
      expect(await stored.json()).toEqual([{ status: 'open' }]);
    },
  );
});
