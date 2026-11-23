import { test as base, type PlaywrightWorkerArgs } from '@playwright/test';
import { ListingsClient } from '@api/listings.client';
import { signIn, supabaseHeaders, type Session } from '@api/supabase';
import { env, type Role } from '@utils/env';

/** The Supabase REST API as one user (or an anonymous visitor) sees it. */
export interface SupabaseApi {
  listings: ListingsClient;
}

export interface ApiFixtures {
  anonApi: SupabaseApi;
  buyerApi: SupabaseApi;
  artistApi: SupabaseApi;
}

interface ApiWorkerFixtures {
  signInAs: (role: Role) => Promise<Session>;
}

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  // Worker scope: a token lives an hour, longer than a worker, so each role signs in once per
  // worker, not once per test, which keeps us far below Supabase's sign-in rate limit.
  // Lazy and per role: a broken admin account cannot fail tests that only need a buyer.
  signInAs: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext();
      const sessions = new Map<Role, Promise<Session>>();
      await use((role) => {
        let session = sessions.get(role);
        if (!session) {
          session = signIn(request, env.accounts[role]);
          sessions.set(role, session);
        }
        return session;
      });
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  anonApi: async ({ playwright }, use) => {
    await provideApi(playwright, use);
  },
  buyerApi: async ({ playwright, signInAs }, use) => {
    await provideApi(playwright, use, await signInAs('buyer'));
  },
  artistApi: async ({ playwright, signInAs }, use) => {
    await provideApi(playwright, use, await signInAs('artist'));
  },
});

async function provideApi(
  playwright: PlaywrightWorkerArgs['playwright'],
  use: (api: SupabaseApi) => Promise<void>,
  session?: Session,
): Promise<void> {
  const request = await playwright.request.newContext({
    // Trailing slash: relative paths such as 'listings' then resolve under /rest/v1/.
    baseURL: `${env.supabase.url}/rest/v1/`,
    extraHTTPHeaders: supabaseHeaders(session),
  });
  await use({ listings: new ListingsClient(request) });
  await request.dispose();
}
