import { mergeTests } from '@playwright/test';
import { test as apiTest } from '@fixtures/api.fixture';
import { test as pageErrorsTest } from '@fixtures/page-errors.fixture';
import { test as pagesTest } from '@fixtures/pages.fixture';
import { test as siteHealthTest } from '@fixtures/site-health.fixture';

export const test = mergeTests(siteHealthTest, pageErrorsTest, pagesTest, apiTest);
export { expect } from '@playwright/test';
