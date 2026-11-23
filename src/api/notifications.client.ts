import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '@utils/step';

/** The `notifications` table through Supabase's REST API (PostgREST). */
export class NotificationsClient {
  constructor(private readonly request: APIRequestContext) {}

  @step()
  async find(query: Record<string, string>): Promise<APIResponse> {
    return this.request.get('notifications', { params: query });
  }

  /**
   * Inserts without reading the row back, as the app does. Asking for the row back would also
   * require permission to read it, so a notification for someone else would be refused for
   * that reason alone and hide whether the insert itself is allowed.
   */
  @step()
  async create(notification: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('notifications', { data: notification });
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
