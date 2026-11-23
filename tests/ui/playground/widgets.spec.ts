import type { Locator, Page } from '@playwright/test';
import { test, expect } from '@fixtures';
import { openPlayground } from '@mocks/playground';

function dialogsSection(page: Page): Locator {
  return page.getByRole('region', { name: 'Browser dialogs' });
}

// Widgets the app under test does not have, on a static practice page (tests/playground).
test.describe('Playground widgets', () => {
  test.beforeEach(async ({ page }) => {
    await openPlayground(page, 'widgets.html');
  });

  test(
    'a form inside an iframe is filled through a frame locator',
    { tag: '@regression' },
    async ({ page }) => {
      const frame = page.getByTitle('Greeting form').contentFrame();

      await frame.getByLabel('Your name').fill('Varsha');
      await frame.getByRole('button', { name: 'Greet me' }).click();

      await expect(frame.getByRole('status')).toHaveText('Hello, Varsha!');
    },
  );

  test(
    'a slider is set with fill and moved with the keyboard',
    { tag: '@regression' },
    async ({ page }) => {
      const slider = page.getByRole('slider', { name: 'Brush size' });
      const value = page.getByLabel('Current brush size');

      await slider.fill('35');
      await expect(value).toHaveText('35');

      await slider.press('ArrowRight');
      await expect(slider).toHaveValue('36');
      await expect(value).toHaveText('36');
    },
  );

  // The handler only records and answers: an expect() failing inside an event handler runs
  // outside the test body, so the assertions come after the click.
  test('a confirm dialog is dismissed', { tag: '@regression' }, async ({ page }) => {
    let seen: { type: string; message: string } | undefined;
    page.once('dialog', (dialog) => {
      seen = { type: dialog.type(), message: dialog.message() };
      void dialog.dismiss();
    });

    await page.getByRole('button', { name: 'Delete sketch' }).click();

    // The slider's <output> is a status too, so scope to the dialogs section.
    await expect(dialogsSection(page).getByRole('status')).toHaveText('Kept the sketch');
    expect(seen).toEqual({ type: 'confirm', message: 'Delete this sketch?' });
  });

  test('a prompt dialog is answered', { tag: '@regression' }, async ({ page }) => {
    let defaultValue: string | undefined;
    page.once('dialog', (dialog) => {
      defaultValue = dialog.defaultValue();
      void dialog.accept('Monsoon study');
    });

    await page.getByRole('button', { name: 'Rename sketch' }).click();

    await expect(dialogsSection(page).getByRole('status')).toHaveText('Renamed to Monsoon study');
    expect(defaultValue).toBe('Untitled');
  });
});
