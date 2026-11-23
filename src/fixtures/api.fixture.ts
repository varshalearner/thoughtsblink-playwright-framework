import { test as base, type APIRequestContext, type PlaywrightWorkerArgs } from '@playwright/test';
import { AppApiClient } from '@api/app.client';
import { ChatClient } from '@api/chat.client';
import { ListingsClient } from '@api/listings.client';
import { NotificationsClient } from '@api/notifications.client';
import { OrdersClient } from '@api/orders.client';
import { ProfilesClient } from '@api/profiles.client';
import { ReportsClient } from '@api/reports.client';
import { StorageClient } from '@api/storage.client';
import { signIn, signOut, supabaseHeaders, type Session } from '@api/supabase';
import { env, type Role } from '@utils/env';

/** The Supabase REST API as an anonymous visitor sees it. */
export interface SupabaseApi {
  listings: ListingsClient;
  profiles: ProfilesClient;
  orders: OrdersClient;
  notifications: NotificationsClient;
  chat: ChatClient;
  storage: StorageClient;
  reports: ReportsClient;
}

/** The Supabase REST API as one signed-in user sees it. */
export interface SignedInApi extends SupabaseApi {
  userId: string;
}

export interface ApiFixtures {
  /** The app's Next.js API routes, called without signing in. */
  appApi: AppApiClient;
  anonApi: SupabaseApi;
  buyerApi: SignedInApi;
  artistApi: SignedInApi;
  adminApi: SignedInApi;
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
      // A failed API call prints its request headers, bearer token included, into the report.
      // The token keeps working against REST until it expires, but once signed out it can no
      // longer change the account's email or password.
      for (const result of await Promise.allSettled(sessions.values())) {
        if (result.status === 'fulfilled') await signOut(request, result.value);
      }
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  // The built-in request fixture already uses the project's baseURL, which is the app.
  appApi: async ({ request }, use) => {
    await use(new AppApiClient(request));
  },
  anonApi: async ({ playwright }, use) => {
    await withRestContext(playwright, undefined, (request) => use(clientsFor(request)));
  },
  buyerApi: async ({ playwright, signInAs }, use) => {
    const session = await signInAs('buyer');
    await withRestContext(playwright, session, (request) =>
      use({ userId: session.userId, ...clientsFor(request) }),
    );
  },
  artistApi: async ({ playwright, signInAs }, use) => {
    const session = await signInAs('artist');
    await withRestContext(playwright, session, (request) =>
      use({ userId: session.userId, ...clientsFor(request) }),
    );
  },
  adminApi: async ({ playwright, signInAs }, use) => {
    const session = await signInAs('admin');
    await withRestContext(playwright, session, (request) =>
      use({ userId: session.userId, ...clientsFor(request) }),
    );
  },
});

function clientsFor(request: APIRequestContext): SupabaseApi {
  return {
    listings: new ListingsClient(request),
    profiles: new ProfilesClient(request),
    orders: new OrdersClient(request),
    notifications: new NotificationsClient(request),
    chat: new ChatClient(request),
    storage: new StorageClient(request),
    reports: new ReportsClient(request),
  };
}

async function withRestContext(
  playwright: PlaywrightWorkerArgs['playwright'],
  session: Session | undefined,
  run: (request: APIRequestContext) => Promise<void>,
): Promise<void> {
  const request = await playwright.request.newContext({
    // Trailing slash: relative paths such as 'listings' then resolve under /rest/v1/.
    baseURL: `${env.supabase.url}/rest/v1/`,
    extraHTTPHeaders: supabaseHeaders(session),
  });
  await run(request);
  await request.dispose();
}
