import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

export type OAuthProvider = 'github' | 'google';

function authRedirectPath(next = '/lessons'): string {
  if (typeof window === 'undefined') return '/auth/callback';
  const url = new URL('/auth/callback', window.location.origin);
  url.searchParams.set('next', next);
  return url.toString();
}

export async function signInWithOAuth(
  provider: OAuthProvider,
  next = '/lessons',
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: 'Supabase is not configured. Add credentials to .env' };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: authRedirectPath(next) },
  });

  return { error: error?.message ?? null };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase is not configured.' };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null; needsConfirmation: boolean }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase is not configured.', needsConfirmation: false };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: authRedirectPath('/lessons') },
  });

  return {
    error: error?.message ?? null,
    needsConfirmation: !error && !data.session,
  };
}

export async function resetPasswordForEmail(email: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase is not configured.' };

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/reset-password`
      : '/auth/reset-password';

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { error: error?.message ?? null };
}

export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'Supabase is not configured.' };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export { isSupabaseConfigured };
