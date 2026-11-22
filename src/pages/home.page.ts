import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { step } from '@utils/step';

export class HomePage extends BasePage {
  protected readonly path = '/';

  readonly heading: Locator;
  readonly featuredArtworks: Locator;
  private readonly browseArtButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', {
      level: 1,
      name: 'Art made by hand, found by heart',
    });
    this.featuredArtworks = page
      .getByRole('region', { name: 'Fresh off the easel' })
      .getByTestId('artwork-card');
    // "Browse Art" is also a header link, so scope to the page content.
    this.browseArtButton = page.getByRole('main').getByRole('link', { name: 'Browse Art' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  @step()
  async openGallery(): Promise<void> {
    await this.browseArtButton.click();
  }
}
