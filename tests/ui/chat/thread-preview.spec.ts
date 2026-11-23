import { faker } from '@faker-js/faker';
import { z } from 'zod';
import { test, expect } from '@fixtures';
import { authFile } from '@utils/auth-state';

const threadSchema = z.tuple([
  z.object({ last_message_preview: z.string(), unread_by: z.array(z.uuid()) }),
]);

test.use({ storageState: authFile('buyer') });

test.describe('Conversation list data', () => {
  test(
    'sending a message updates the thread preview and unread list',
    { tag: '@regression' },
    async ({ chatPage, chatThreadId, artistApi }) => {
      const text = `[e2e] ${faker.lorem.sentence()}`;
      await chatPage.openThread(chatThreadId);

      await chatPage.sendMessage(text);
      await expect(chatPage.messages.getByText(text)).toBeVisible();

      // The app updates the thread in a fire-and-forget task after the send has resolved, so a
      // single read could run too early. toPass retries the whole read-and-check block.
      await expect(async () => {
        const response = await artistApi.chat.findThreads({
          select: 'last_message_preview,unread_by',
          id: `eq.${chatThreadId}`,
        });
        const [thread] = threadSchema.parse(await response.json());
        expect(thread.last_message_preview).toBe(text);
        expect(thread.unread_by).toEqual([artistApi.userId]);
      }).toPass({ timeout: 10_000 });
    },
  );
});
