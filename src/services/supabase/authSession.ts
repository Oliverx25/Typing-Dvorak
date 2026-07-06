import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';

let cachedUser: User | null = null;
let resolvePromise: Promise<User | null> | null = null;

/** Keeps the in-memory auth user in sync with AuthProvider / onAuthStateChange. */
export function setAuthSessionUser(user: User | null): void {
  cachedUser = user;
  resolvePromise = null;
}

/** Synchronous read — null until AuthProvider has hydrated session. */
export function getAuthSessionUserSync(): User | null {
  return cachedUser;
}

/**
 * Resolves the signed-in user once per burst of concurrent callers.
 * Prefer {@link getAuthSessionUserSync} when AuthProvider already loaded the session.
 */
export async function getAuthUser(): Promise<User | null> {
  if (cachedUser) return cachedUser;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  if (!resolvePromise) {
    resolvePromise = supabase.auth
      .getUser()
      .then(({ data }) => {
        cachedUser = data.user ?? null;
        return cachedUser;
      })
      .catch(() => null)
      .finally(() => {
        resolvePromise = null;
      });
  }

  return resolvePromise;
}

export async function getAuthUserId(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.id ?? null;
}
