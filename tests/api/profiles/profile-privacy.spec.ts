import { z } from 'zod';
import type { APIResponse } from '@playwright/test';
import { test, expect } from '@fixtures';

const BUG_002 = { type: 'issue', description: 'BUGS.md#bug-002' };

/**
 * Counts rows that carry a value for `field`. Only the count reaches the report: failure
 * output is published by CI, so a leaked email must not be printed in the assertion message.
 */
async function countExposed(response: APIResponse, field: string): Promise<number> {
  if (!response.ok()) return 0; // a refused request exposes nothing
  const rows = z.array(z.record(z.string(), z.unknown())).parse(await response.json());
  return rows.filter((row) => row[field] !== null && row[field] !== '').length;
}

test.describe('Profile privacy', { tag: ['@api', '@regression'] }, () => {
  test('a visitor can read an artist public name', async ({ anonApi, artistApi }) => {
    const response = await anonApi.profiles.find({ select: 'name', id: `eq.${artistApi.userId}` });

    await expect(response).toBeOK();
    expect(await countExposed(response, 'name')).toBe(1);
  });

  test(
    'a visitor cannot read an artist email address',
    { annotation: BUG_002 },
    async ({ anonApi, artistApi }) => {
      test.fail(true, 'BUG-002: profiles expose every column to visitors');

      const response = await anonApi.profiles.find({
        select: 'email',
        id: `eq.${artistApi.userId}`,
      });

      expect(await countExposed(response, 'email')).toBe(0);
    },
  );

  test(
    'a visitor cannot read an artist payout details',
    { annotation: BUG_002 },
    async ({ anonApi, artistApi }) => {
      test.fail(true, 'BUG-002: profiles expose every column to visitors');

      const response = await anonApi.profiles.find({
        select: 'payout:seller_profile->>payoutMethod',
        id: `eq.${artistApi.userId}`,
      });

      expect(await countExposed(response, 'payout')).toBe(0);
    },
  );
});
