import { getSupabaseClient } from '../../lib/supabaseClient';

export async function fetchUserSessions(limit = 50) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('typing_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[supabase] fetch sessions failed:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchUserKeyErrors() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('key_errors')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.warn('[supabase] fetch key_errors failed:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchUserProfile() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.warn('[supabase] fetch profile failed:', error.message);
    return null;
  }
  return data;
}
