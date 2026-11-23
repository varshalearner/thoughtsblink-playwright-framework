import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '@utils/step';

/** The `profiles` table through Supabase's REST API (PostgREST). */
export class ProfilesClient {
  constructor(private readonly request: APIRequestContext) {}

  @step()
  async find(query: Record<string, string>): Promise<APIResponse> {
    return this.request.get('profiles', { params: query });
  }
}
