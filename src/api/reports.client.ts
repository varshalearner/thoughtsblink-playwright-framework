import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '@utils/step';

/** The `reports` table (visitor reports about listings) through Supabase's REST API. */
export class ReportsClient {
  constructor(private readonly request: APIRequestContext) {}

  @step()
  async find(query: Record<string, string>): Promise<APIResponse> {
    return this.request.get('reports', { params: query });
  }

  @step()
  async update(id: string, changes: Record<string, unknown>): Promise<APIResponse> {
    return this.request.patch('reports', {
      params: { id: `eq.${id}` },
      data: changes,
      headers: { Prefer: 'return=representation' },
    });
  }
}
