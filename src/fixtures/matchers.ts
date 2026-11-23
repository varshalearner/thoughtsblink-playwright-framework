import { expect as baseExpect, type APIResponse } from '@playwright/test';
import { z } from 'zod';

export const expect = baseExpect.extend({
  /** Passes when the response body is JSON that satisfies the zod schema (the API contract). */
  async toMatchSchema(response: APIResponse, schema: z.ZodType) {
    const name = 'toMatchSchema';
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return {
        name,
        pass: false,
        message: () => `Expected a JSON body, got: ${response.headers()['content-type'] ?? '?'}`,
      };
    }
    const result = schema.safeParse(body);
    return {
      name,
      pass: result.success,
      message: () =>
        result.success
          ? 'Expected the response body not to match the schema, but it does.'
          : `Response body does not match the schema:\n${z.prettifyError(result.error)}`,
    };
  },
});
