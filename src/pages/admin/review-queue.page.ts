import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { step } from '@utils/step';

/** Admin > Review queue: listings waiting for approval. */
export class ReviewQueuePage extends BasePage {
  protected readonly path = '/admin/review';

  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Review queue' });
  }

  /** A queued listing. Cards have no accessible role, so the app's per-slug test id is used. */
  item(slug: string): Locator {
    return this.page.getByTestId(`review-item-${slug}`);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/review$/);
    await expect(this.heading).toBeVisible();
  }

  @step()
  async approve(slug: string): Promise<void> {
    await this.item(slug).getByRole('button', { name: 'Approve' }).click();
  }
}
