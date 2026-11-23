import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '@utils/step';

const RETURN_ROWS = { Prefer: 'return=representation' };

/** The `threads` and `messages` tables through Supabase's REST API (PostgREST). */
export class ChatClient {
  constructor(private readonly request: APIRequestContext) {}

  @step()
  async findThreads(query: Record<string, string>): Promise<APIResponse> {
    return this.request.get('threads', { params: query });
  }

  @step()
  async createThread(thread: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('threads', { data: thread, headers: RETURN_ROWS });
  }

  @step()
  async sendMessage(message: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('messages', { data: message, headers: RETURN_ROWS });
  }
}
