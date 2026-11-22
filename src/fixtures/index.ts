import { mergeTests } from '@playwright/test';
import { test as pageErrorsTest } from '@fixtures/page-errors.fixture';
import { test as pagesTest } from '@fixtures/pages.fixture';
import { test as siteHealthTest } from '@fixtures/site-health.fixture';

export const test = mergeTests(siteHealthTest, pageErrorsTest, pagesTest);
export { expect } from '@playwright/test';
