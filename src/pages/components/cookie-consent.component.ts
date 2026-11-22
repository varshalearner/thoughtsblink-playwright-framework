import type { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';

export class CookieConsentComponent {
  readonly root: Locator;
  private readonly acceptAllButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog', { name: 'Cookie consent' });
    this.acceptAllButton = this.root.getByRole('button', { name: 'Accept all' });
  }

  @step()
  async acceptAll(): Promise<void> {
    await this.acceptAllButton.click();
  }
}
