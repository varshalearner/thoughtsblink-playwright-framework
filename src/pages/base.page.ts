import type { Page } from '@playwright/test';
import { CookieConsentComponent } from '@pages/components/cookie-consent.component';
import { HeaderComponent } from '@pages/components/header.component';
import { step } from '@utils/step';

/** Only what every page shares: the layout widgets and "open, then wait until loaded". */
export abstract class BasePage {
  readonly header: HeaderComponent;
  readonly cookieConsent: CookieConsentComponent;

  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.cookieConsent = new CookieConsentComponent(page);
  }

  /** The one assertion a page object may own: proof that this page has rendered. */
  abstract expectLoaded(): Promise<void>;

  @step()
  async open(): Promise<void> {
    await this.page.goto(this.path);
    await this.expectLoaded();
  }
}
