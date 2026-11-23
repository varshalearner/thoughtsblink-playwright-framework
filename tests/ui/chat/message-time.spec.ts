import { faker } from '@faker-js/faker';
import { test, expect } from '@fixtures';
import { authFile } from '@utils/auth-state';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

test.use({ storageState: authFile('buyer') });

test.describe('Message times', () => {
  test(
    'a message sent three hours ago is labelled "3h ago"',
    { tag: '@regression' },
    async ({ page, chatPage, chatThreadId, artistApi }) => {
      // The message is dated two days back and the browser clock is pinned exactly 3 hours after
      // it: by real time the label would read "2d ago", so "3h ago" can only come from the
      // pinned clock, and it cannot drift across a boundary while the test runs. The clock moves
      // back, never forward: ahead of real time, supabase-js would treat the saved session as
      // expired and refresh it, rotating the token other tests share.
      const sentAt = new Date(Date.now() - 2 * DAY);
      const text = `[e2e] ${faker.lorem.sentence()}`;
      const sent = await artistApi.chat.sendMessage({
        thread_id: chatThreadId,
        sender_id: artistApi.userId,
        sender_name: 'E2E artist',
        text,
        created_at: sentAt.toISOString(),
      });
      await expect(sent).toBeOK();
      await page.clock.setFixedTime(new Date(sentAt.getTime() + 3 * HOUR));

      await chatPage.openThread(chatThreadId);

      await expect(chatPage.message(text).getByText('3h ago')).toBeVisible();
    },
  );
});
