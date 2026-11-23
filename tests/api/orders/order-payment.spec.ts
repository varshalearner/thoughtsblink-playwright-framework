import { z } from 'zod';
import type { APIResponse } from '@playwright/test';
import { test as base, expect } from '@fixtures';
import { TEST_DATA_PREFIX } from '@data/listing.factory';

const createdRowsSchema = z.array(z.object({ id: z.uuid() }));

const test = base.extend<{ createOrder: (order: Record<string, unknown>) => Promise<APIResponse> }>(
  {
    /**
     * Creates an order as the buyer. Clients cannot delete orders, so teardown cancels any it
     * made: cancelled orders count towards no revenue, review rights or seller dashboards.
     */
    createOrder: async ({ buyerApi }, use) => {
      const ids: string[] = [];
      await use(async (order) => {
        const response = await buyerApi.orders.create({ buyer_id: buyerApi.userId, ...order });
        if (response.ok()) {
          ids.push(...createdRowsSchema.parse(await response.json()).map((row) => row.id));
        }
        return response;
      });
      for (const id of ids) await buyerApi.orders.update(id, { status: 'cancelled' });
    },
  },
);

test.describe('Order payment', { tag: ['@api', '@regression'] }, () => {
  test(
    'a buyer cannot record an order as paid without paying',
    {
      annotation: { type: 'issue', description: 'BUGS.md#bug-004' },
    },
    async ({ createOrder }) => {
      test.fail(true, 'BUG-004: the browser marks orders as paid; the server never checks');

      const response = await createOrder({
        status: 'paid',
        total_inr: 0,
        payment_provider: TEST_DATA_PREFIX,
      });

      expect(response.ok(), 'a paid order without a payment was accepted').toBe(false);
    },
  );
});
