import type { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';

/** The "Report this listing" modal on an artwork page. */
export class ReportDialogComponent {
  readonly root: Locator;
  readonly reasonInput: Locator;
  readonly sendButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog', { name: 'Report this listing' });
    this.reasonInput = this.root.getByRole('textbox', { name: 'Report reason' });
    this.sendButton = this.root.getByRole('button', { name: 'Send report' });
  }

  @step()
  async send(reason: string): Promise<void> {
    await this.reasonInput.fill(reason);
    await this.sendButton.click();
  }
}
