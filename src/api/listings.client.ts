import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Listing } from '@api/schemas';
import { step } from '@utils/step';

/** What a client must send; the database fills in ids, timestamps and defaults. */
export type NewListing = Pick<Listing, 'slug' | 'seller_id' | 'title' | 'price_inr'> &
  Partial<Omit<Listing, 'id' | 'created_at' | 'updated_at'>>;

// PostgREST answers writes with an empty body unless asked to return the affected rows.
const RETURN_ROWS = { Prefer: 'return=representation' };

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

  @step()
  async create(listing: NewListing): Promise<APIResponse> {
    return this.request.post('listings', { data: listing, headers: RETURN_ROWS });
  }

  @step()
  async update(id: string, changes: Partial<NewListing>): Promise<APIResponse> {
    return this.request.patch('listings', {
      params: { id: `eq.${id}` },
      data: changes,
      headers: RETURN_ROWS,
    });
  }

  @step()
  async remove(id: string): Promise<APIResponse> {
    return this.request.delete('listings', { params: { id: `eq.${id}` }, headers: RETURN_ROWS });
  }
}
