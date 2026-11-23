import type { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';

// The app shows the banner until this localStorage key holds a choice ("all" or "essential").
const CONSENT_KEY = 'aes_cookie_consent';

export class CookieConsentComponent {
  readonly root: Locator;
  private readonly acceptAllButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('dialog', { name: 'Cookie consent' });
    this.acceptAllButton = this.root.getByRole('button', { name: 'Accept all' });
  }

  @step()
  async acceptAll(): Promise<void> {
    await this.acceptAllButton.click();
  }

  /**
   * Stores a consent choice before any page script runs, so the banner never appears. For
   * tests where the banner would only get in the way, such as screenshots: it appears after
   * hydration, so a screenshot could be taken with or without it.
   */
  @step()
  async decideBeforeLoad(): Promise<void> {
    await this.page.addInitScript({
      content: `window.localStorage.setItem('${CONSENT_KEY}', 'essential');`,
    });
  }
}
