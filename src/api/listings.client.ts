import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '@utils/step';

/**
 * The `listings` table through Supabase's REST API (PostgREST).
 * Methods return the raw response so tests can assert on refusals as well as successes.
 */
export class ListingsClient {
  constructor(private readonly request: APIRequestContext) {}

  @step()
  async find(query: Record<string, string>): Promise<APIResponse> {
    return this.request.get('listings', { params: query });
  }
}
