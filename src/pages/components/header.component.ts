import type { Locator, Page } from '@playwright/test';
import { step } from '@utils/step';

export type MainNavLink = 'Browse Art' | 'Artists' | 'Commission' | 'Sell' | 'About';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';
/** Language names as the menu shows them, each in its own script. */
export type Language = 'English' | 'हिन्दी';
export type AccountMenuItem = 'My Account' | 'Wishlist' | 'Sell' | 'Admin' | 'Setup' | 'Log out';

export class HeaderComponent {
  readonly root: Locator;
  readonly mainNav: Locator;
  /** Shown only to signed-in users. */
  readonly accountMenu: Locator;
  /** Shown only to visitors. */
  readonly loginButton: Locator;
  // The open menu renders in a portal at the end of <body>, outside the banner.
  private readonly openMenu: Locator;
  // Labelled "Currency" in every language, although it also holds the language choice.
  private readonly localeMenuButton: Locator;
  /** Phones only: the ☰ button and the navigation it opens. */
  readonly mobileMenuButton: Locator;
  readonly mobileNav: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('banner');
    this.mainNav = this.root.getByRole('navigation', { name: 'Main' });
    this.accountMenu = this.root.getByRole('button', { name: 'My Account' });
    this.loginButton = this.root.getByRole('button', { name: 'Log in' });
    this.openMenu = page.getByRole('menu');
    this.localeMenuButton = this.root.getByRole('button', { name: 'Currency' });
    this.mobileMenuButton = this.root.getByRole('button', { name: 'Menu' });
    this.mobileNav = this.root.getByRole('navigation', { name: 'Mobile' });
  }

  accountMenuItem(name: AccountMenuItem): Locator {
    return this.openMenu.getByRole('menuitem', { name });
  }

  @step()
  async chooseCurrency(currency: Currency): Promise<void> {
    await this.localeMenuButton.click();
    await this.openMenu.getByRole('menuitem', { name: currency, exact: true }).click();
  }

  /** Language shares the globe menu with currency. */
  @step()
  async chooseLanguage(language: Language): Promise<void> {
    await this.localeMenuButton.click();
    await this.openMenu.getByRole('menuitem', { name: language, exact: true }).click();
  }

  @step()
  async openAccountMenu(): Promise<void> {
    await this.accountMenu.click();
  }

  @step()
  async openMobileMenu(): Promise<void> {
    await this.mobileMenuButton.click();
  }

  @step()
  async navigateTo(link: MainNavLink): Promise<void> {
    await this.mainNav.getByRole('link', { name: link }).click();
  }
}
