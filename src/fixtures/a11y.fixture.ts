import AxeBuilder from '@axe-core/playwright';
import { test as base } from '@playwright/test';

/** WCAG 2.1 levels A and AA: the usual legal and contractual baseline. */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Violations already tracked in BUGS.md. Page scans skip them so that any new violation fails
 * at once; tests/ui/a11y checks these rules separately as expected failures.
 */
export const KNOWN_A11Y_RULES = {
  'color-contrast': 'BUG-007',
  'label-content-name-mismatch': 'BUG-008',
} as const;

export interface A11yFixtures {
  /** A fresh axe scanner for the current page, limited to WCAG 2.1 A/AA rules. */
  makeAxeBuilder: () => AxeBuilder;
}

export const test = base.extend<A11yFixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    await use(() => new AxeBuilder({ page }).withTags(WCAG_TAGS));
  },
});
