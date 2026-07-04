import { getSupabaseClient } from '@/lib/supabaseClient';
import { exportProgress } from '@/utils/progress/exportImport';
import { fetchUserKeyErrors, fetchUserProfile, fetchUserSessions } from './queries';

export interface AccountExportBundle {
  version: 2;
  exportedAt: string;
  local: Record<string, unknown>;
  cloud: {
    profile: unknown;
    sessions: unknown[];
    keyErrors: unknown[];
    badges: unknown[];
  };
}

export async function buildAccountExportBundle(): Promise<AccountExportBundle | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, sessions, keyErrors, badgesResult] = await Promise.all([
    fetchUserProfile(),
    fetchUserSessions(500),
    fetchUserKeyErrors(),
    supabase.from('user_badges').select('*').eq('user_id', user.id),
  ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    local: exportProgress().data,
    cloud: {
      profile,
      sessions,
      keyErrors,
      badges: badgesResult.data ?? [],
    },
  };
}

export function downloadAccountExport(bundle: AccountExportBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `typing-dvorak-account-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function deleteOwnAccount(): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'notConfigured' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'notAuthenticated' };

  const { error } = await supabase.rpc('delete_own_account');
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  return { error: null };
}
