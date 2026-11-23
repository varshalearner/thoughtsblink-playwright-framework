import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';
import type { UploadFile } from '@data/files';
import { step } from '@utils/step';

/** Sell > Upload artwork, /sell/new. */
export class NewListingPage extends BasePage {
  protected readonly path = '/sell/new';

  readonly heading: Locator;
  /** Previews of files chosen in this session, before they are uploaded. */
  readonly newImagePreviews: Locator;
  // The file input is visually hidden inside a label reading "add"; setInputFiles needs no click.
  private readonly imageInput: Locator;
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly saveDraftButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Upload artwork' });
    this.newImagePreviews = page.getByRole('img', { name: /^New image \d+$/ });
    this.imageInput = page.getByLabel('add', { exact: true });
    this.titleInput = page.getByLabel('Title');
    this.descriptionInput = page.getByLabel('Description');
    this.saveDraftButton = page.getByRole('button', { name: 'Save as draft' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  @step()
  async addImages(...files: UploadFile[]): Promise<void> {
    await this.imageInput.setInputFiles(files);
  }

  @step()
  async describe(details: { title: string; description: string }): Promise<void> {
    await this.titleInput.fill(details.title);
    await this.descriptionInput.fill(details.description);
  }

  @step()
  async saveAsDraft(): Promise<void> {
    await this.saveDraftButton.click();
  }
}
