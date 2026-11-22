import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class ArtistsPage extends BasePage {
  protected readonly path = '/artists';

  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Artists in the studio' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/artists$/);
    await expect(this.heading).toBeVisible();
  }
}
