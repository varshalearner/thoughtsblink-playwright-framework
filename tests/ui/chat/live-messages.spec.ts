import { faker } from '@faker-js/faker';
import { test, expect } from '@fixtures';
import { fakeRealtime } from '@mocks/realtime.mock';
import { authFile } from '@utils/auth-state';

test.use({ storageState: authFile('buyer') });

test.describe('Live chat', () => {
  test(
    'a reply appears for the buyer as soon as realtime announces it',
    { tag: '@regression' },
    async ({ page, chatPage, chatThreadId, artistApi }) => {
      const realtime = await fakeRealtime(page);
      await chatPage.openThread(chatThreadId);

      const text = `[e2e] ${faker.lorem.sentence()}`;
      const sent = await artistApi.chat.sendMessage({
        thread_id: chatThreadId,
        sender_id: artistApi.userId,
        sender_name: 'E2E artist',
        text,
      });
      await expect(sent).toBeOK();
      // The real Supabase Realtime is cut off, so only this event can make the page re-fetch.
      realtime.announceChange('messages');

      await expect(chatPage.messages.getByText(text)).toBeVisible();
    },
  );
});
