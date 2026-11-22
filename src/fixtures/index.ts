import { mergeTests } from '@playwright/test';
import { test as pageErrorsTest } from '@fixtures/page-errors.fixture';
import { test as pagesTest } from '@fixtures/pages.fixture';

export const test = mergeTests(pageErrorsTest, pagesTest);
export { expect } from '@playwright/test';
