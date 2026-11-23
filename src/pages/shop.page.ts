import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import { step } from '@utils/step';

export type ShopSort = 'Newest' | 'Price: low to high' | 'Price: high to low' | 'Top rated';

export class ShopPage extends BasePage {
  protected readonly path = '/shop';

  readonly heading: Locator;
  readonly artworkCards: Locator;
  /** Card prices in display order. Prices are plain text, so the app's test ids are used. */
  readonly cardPrices: Locator;
  private readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'The Gallery' });
    this.artworkCards = page.getByTestId('shop-grid').getByTestId('artwork-card');
    this.cardPrices = this.artworkCards.getByTestId('artwork-price');
    this.sortSelect = page.getByRole('combobox', { name: 'Sort' });
  }

  @step()
  async sortBy(option: ShopSort): Promise<void> {
    await this.sortSelect.selectOption({ label: option });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/shop$/);
    await expect(this.heading).toBeVisible();
  }
}
