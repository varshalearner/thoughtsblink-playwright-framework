import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '@utils/step';

/** The `orders` table through Supabase's REST API (PostgREST). */
export class OrdersClient {
  constructor(private readonly request: APIRequestContext) {}

  @step()
  async create(order: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('orders', {
      data: order,
      headers: { Prefer: 'return=representation' },
    });
  }

  @step()
  async update(id: string, changes: Record<string, unknown>): Promise<APIResponse> {
    return this.request.patch('orders', {
      params: { id: `eq.${id}` },
      data: changes,
      headers: { Prefer: 'return=representation' },
    });
  }
}
