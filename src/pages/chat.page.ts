import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { step } from '@utils/step';

/** One conversation, /messages/<threadId>. */
export class ChatPage extends BasePage {
  // Only a prefix: use openThread(id) rather than open().
  protected readonly path = '/messages';

  /** The scrolling list of messages; it has no accessible role, so the app's test id is used. */
  readonly messages: Locator;
  readonly messageInput: Locator;
  private readonly sendButton: Locator;

  constructor(page: Page) {
    super(page);
    this.messages = page.getByTestId('chat-messages');
    this.messageInput = page.getByRole('textbox', { name: 'Message' });
    this.sendButton = page.getByRole('button', { name: 'Send', exact: true });
  }

  @step()
  async sendMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.messageInput).toBeVisible();
  }

  @step()
  async openThread(threadId: string): Promise<void> {
    await this.page.goto(`${this.path}/${threadId}`);
    await this.expectLoaded();
  }
}
