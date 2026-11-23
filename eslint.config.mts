import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import playwright from 'eslint-plugin-playwright';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['test-results/', 'playwright-report/', 'blob-report/', 'reports/', 'docs/']),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name='locator'] > Literal[value=/^(\\/\\/|xpath=)/]",
          message:
            'XPath is not allowed. Use getByRole/getByLabel/getByTestId, or CSS as a last resort.',
        },
      ],
    },
  },

  {
    files: ['tests/**/*.ts', 'src/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // Debug output belongs in test.step, attachments or the trace, not stdout.
      'no-console': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-nth-methods': 'error',
      // Convention: page-object methods named expect* (e.g. expectLoaded) assert.
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect[A-Z]'] }],
      // A forgotten test.skip() hides a test; test.skip(condition, reason) documents a real limit.
      'playwright/no-skipped-test': ['error', { allowConditional: true }],
    },
  },

  {
    files: ['tests/**/*.spec.ts'],
    rules: {
      'playwright/require-tags': 'error',
    },
  },

  // Last, so formatting is Prettier's job only.
  prettier,
);
