import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { step } from '@utils/step';

/** One artwork's public page, /artwork/<slug>. */
export class ArtworkPage extends BasePage {
  // Only a prefix: the page exists per artwork, so use openArtwork(slug) rather than open().
  protected readonly path = '/artwork';

  readonly title: Locator;
  /** The price in the visitor's currency. A plain paragraph, so the app's test id is used. */
  readonly price: Locator;
  /** Reads "Add to Cart" or "Sold" depending on stock, so the test id is the stable handle. */
  readonly addToCartButton: Locator;
  /** Shown when no approved artwork has this slug. */
  readonly notFoundHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    this.price = page.getByTestId('detail-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.notFoundHeading = page.getByRole('heading', {
      name: 'This artwork has wandered off the wall',
    });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
  }

  @step()
  async openArtwork(slug: string): Promise<void> {
    await this.visitArtwork(slug);
    await this.expectLoaded();
  }

  /** Only navigates: for tests that expect the not-found or an error state. */
  @step()
  async visitArtwork(slug: string): Promise<void> {
    await this.page.goto(`${this.path}/${slug}`);
  }
}
