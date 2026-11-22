import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class ShopPage extends BasePage {
  protected readonly path = '/shop';

  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'The Gallery' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/shop$/);
    await expect(this.heading).toBeVisible();
  }
}
