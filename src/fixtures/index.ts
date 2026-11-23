import { mergeTests } from '@playwright/test';
import { test as a11yTest } from '@fixtures/a11y.fixture';
import { test as dataTest } from '@fixtures/data.fixture';
import { test as pageErrorsTest } from '@fixtures/page-errors.fixture';
import { test as pagesTest } from '@fixtures/pages.fixture';
import { test as rolesTest } from '@fixtures/roles.fixture';
import { test as siteHealthTest } from '@fixtures/site-health.fixture';

// dataTest builds on the API fixtures, so it brings anonApi, buyerApi and artistApi with it.
export const test = mergeTests(
  siteHealthTest,
  pageErrorsTest,
  pagesTest,
  rolesTest,
  dataTest,
  a11yTest,
);
// expect with the project's custom matchers (toMatchSchema).
export { expect } from '@fixtures/matchers';
