import type { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';

export type MainNavLink = 'Browse Art' | 'Artists' | 'Commission' | 'Sell' | 'About';

export class HeaderComponent {
  readonly root: Locator;
  readonly mainNav: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('banner');
    this.mainNav = this.root.getByRole('navigation', { name: 'Main' });
  }

  @step()
  async navigateTo(link: MainNavLink): Promise<void> {
    await this.mainNav.getByRole('link', { name: link }).click();
  }
}
