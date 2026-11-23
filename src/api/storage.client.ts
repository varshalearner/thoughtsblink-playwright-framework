import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '@utils/env';
import { step } from '@utils/step';

const PUBLIC_PREFIX = '/storage/v1/object/public/artworks/';

/** The public `artworks` bucket in Supabase Storage. */
export class StorageClient {
  constructor(private readonly request: APIRequestContext) {}

  /** Deletes an uploaded image by the public URL the app stored in a listing. */
  @step()
  async removeArtworkImage(publicUrl: string): Promise<APIResponse> {
    const objectPath = new URL(publicUrl).pathname.replace(PUBLIC_PREFIX, '');
    return this.request.delete(`${env.supabase.url}/storage/v1/object/artworks/${objectPath}`);
  }
}
