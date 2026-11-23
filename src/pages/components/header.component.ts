import type { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';

export type MainNavLink = 'Browse Art' | 'Artists' | 'Commission' | 'Sell' | 'About';

export class HeaderComponent {
  readonly root: Locator;
  readonly mainNav: Locator;
  /** Shown only to signed-in users. */
  readonly accountMenu: Locator;
  /** Shown only to visitors. */
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('banner');
    this.mainNav = this.root.getByRole('navigation', { name: 'Main' });
    this.accountMenu = this.root.getByRole('button', { name: 'My Account' });
    this.loginButton = this.root.getByRole('button', { name: 'Log in' });
  }

  @step()
  async navigateTo(link: MainNavLink): Promise<void> {
    await this.mainNav.getByRole('link', { name: link }).click();
  }
}
