import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { step } from '@utils/step';

/** One artwork's public page, /artwork/<slug>. */
export class ArtworkPage extends BasePage {
  // Only a prefix: the page exists per artwork, so use openArtwork(slug) rather than open().
  protected readonly path = '/artwork';

  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  @step()
  async openArtwork(slug: string): Promise<void> {
    await this.page.goto(`${this.path}/${slug}`);
    await this.expectLoaded();
  }
}
