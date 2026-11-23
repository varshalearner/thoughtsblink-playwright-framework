import type { APIRequestContext } from '@playwright/test';
import { sessionSchema } from '@api/schemas';
import { env, type Credentials } from '@utils/env';

export interface Session {
  accessToken: string;
  userId: string;
  /** The full Auth response: supabase-js keeps exactly this object in localStorage. */
  stored: Record<string, unknown>;
}

/** The localStorage key supabase-js uses, built from the project ref in the Supabase URL. */
export const SUPABASE_STORAGE_KEY = `sb-${new URL(env.supabase.url).hostname.split('.')[0] ?? ''}-auth-token`;

/** Headers for a Supabase call: the project key, plus the user's token when signed in. */
export function supabaseHeaders(session?: Session): Record<string, string> {
  return {
    apikey: env.supabase.anonKey,
    Authorization: `Bearer ${session?.accessToken ?? env.supabase.anonKey}`,
  };
}

/** Password sign-in through Supabase Auth, the same call the app's login form makes. */
export async function signIn(
  request: APIRequestContext,
  credentials: Credentials,
): Promise<Session> {
  const response = await request.post(`${env.supabase.url}/auth/v1/token?grant_type=password`, {
    headers: supabaseHeaders(),
    data: credentials,
  });
  if (!response.ok()) {
    // Names the account but never the password.
    throw new Error(
      `Sign-in failed for ${credentials.email}: HTTP ${String(response.status())} ${await response.text()}`,
    );
  }
  const session = sessionSchema.parse(await response.json());
  return { accessToken: session.access_token, userId: session.user.id, stored: session };
}

/** Ends the session, so a token leaked in a report can no longer change the account. */
export async function signOut(request: APIRequestContext, session: Session): Promise<void> {
  await request.post(`${env.supabase.url}/auth/v1/logout?scope=local`, {
    headers: supabaseHeaders(session),
  });
}
