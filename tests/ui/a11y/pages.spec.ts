import type AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@fixtures';
import { KNOWN_A11Y_RULES } from '@fixtures/a11y.fixture';

type Result = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

/** "color-contrast (3 elements)": enough to act on, without dumping axe's full report. */
function summarise(violations: Result[]): string[] {
  return violations.map((v) => `${v.id} (${String(v.nodes.length)} elements): ${v.help}`);
}

const knownRules = Object.keys(KNOWN_A11Y_RULES);
const knownIssues = Object.values(KNOWN_A11Y_RULES).map((bug) => ({
  type: 'issue',
  description: `BUGS.md#${bug.toLowerCase()}`,
}));

test.describe('Accessibility (WCAG 2.1 AA)', { tag: '@a11y' }, () => {
  test(
    'the home page has no new violations',
    { tag: '@regression', annotation: knownIssues },
    async ({ homePage, makeAxeBuilder }) => {
      await homePage.open();
      const results = await makeAxeBuilder().disableRules(knownRules).analyze();
      expect(summarise(results.violations)).toEqual([]);
    },
  );

  test(
    'the gallery has no new violations',
    { tag: '@regression', annotation: knownIssues },
    async ({ shopPage, makeAxeBuilder }) => {
      await shopPage.open();
      await expect(shopPage.artworkCards).not.toHaveCount(0);
      const results = await makeAxeBuilder().disableRules(knownRules).analyze();
      expect(summarise(results.violations)).toEqual([]);
    },
  );

  test(
    'the login page has no new violations',
    { tag: '@regression', annotation: knownIssues },
    async ({ loginPage, makeAxeBuilder }) => {
      await loginPage.open();
      const results = await makeAxeBuilder().disableRules(knownRules).analyze();
      expect(summarise(results.violations)).toEqual([]);
    },
  );

  test(
    'known violations are fixed',
    { tag: '@regression', annotation: knownIssues },
    async ({ loginPage, makeAxeBuilder }) => {
      test.fail(true, 'BUG-007 and BUG-008: contrast and label-in-name failures on every page');
      await loginPage.open();
      const results = await makeAxeBuilder().withRules(knownRules).analyze();
      expect(summarise(results.violations)).toEqual([]);
    },
  );
});
