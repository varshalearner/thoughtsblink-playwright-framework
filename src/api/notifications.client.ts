import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '@utils/step';

/** The `notifications` table through Supabase's REST API (PostgREST). */
export class NotificationsClient {
  constructor(private readonly request: APIRequestContext) {}

  @step()
  async create(notification: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('notifications', {
      data: notification,
      headers: { Prefer: 'return=representation' },
    });
  }

  @step()
  async update(id: string, changes: Record<string, unknown>): Promise<APIResponse> {
    return this.request.patch('notifications', {
      params: { id: `eq.${id}` },
      data: changes,
      headers: { Prefer: 'return=representation' },
    });
  }
}
