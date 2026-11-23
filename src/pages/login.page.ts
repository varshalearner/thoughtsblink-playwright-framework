import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { Credentials } from '@utils/env';
import { step } from '@utils/step';

export class LoginPage extends BasePage {
  protected readonly path = '/login';

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  // The header has its own "Log in" button, so the form's button is scoped to <main>.
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('main').getByRole('button', { name: 'Log in' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login(\?|$)/);
    await expect(this.emailInput).toBeVisible();
  }

  @step()
  async logIn({ email, password }: Credentials): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
