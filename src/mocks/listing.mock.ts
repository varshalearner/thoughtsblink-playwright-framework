import type { Page } from '@playwright/test';
import { z } from 'zod';
import type { Listing } from '@api/schemas';

const rowSchema = z.record(z.string(), z.unknown());
// supabase-js asks for one object (maybeSingle) or an array, depending on the call.
const bodySchema = z.union([rowSchema, z.array(rowSchema)]);

function isListingRequest(slug: string) {
  return (url: URL): boolean =>
    url.pathname.endsWith('/rest/v1/listings') && url.searchParams.get('slug') === `eq.${slug}`;
}

/** Makes Supabase fail the request for one listing, as during an outage. */
export async function failListing(page: Page, slug: string, status = 503): Promise<void> {
  await page.route(isListingRequest(slug), (route) =>
    route.fulfill({ status, json: { message: 'Service Unavailable' } }),
  );
}

/**
 * Lets the real Supabase response for one listing through, with only `changes` applied:
 * every other field stays real, so the test cannot drift from the live data shape.
 */
export async function overrideListing(
  page: Page,
  slug: string,
  changes: Partial<Listing>,
): Promise<void> {
  await page.route(isListingRequest(slug), async (route) => {
    const response = await route.fetch();
    const body = bodySchema.parse(await response.json());
    const json = Array.isArray(body)
      ? body.map((row) => ({ ...row, ...changes }))
      : { ...body, ...changes };
    await route.fulfill({ response, json });
  });
}
