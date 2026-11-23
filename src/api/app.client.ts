import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '@utils/step';

/** The app's own Next.js route handlers under /api, as opposed to Supabase. */
export class AppApiClient {
  constructor(private readonly request: APIRequestContext) {}

  @step()
  async getExchangeRates(): Promise<APIResponse> {
    return this.request.get('/api/exchange-rates');
  }

  @step()
  async getSetupStatus(): Promise<APIResponse> {
    return this.request.get('/api/setup/status');
  }
}
