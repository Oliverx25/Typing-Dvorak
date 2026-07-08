import { getSupabaseClient } from '@/lib/supabaseClient';
import { exportProgress } from '@/utils/progress/exportImport';
import { fetchUserKeyErrors, fetchUserProfile, fetchUserSessions, fetchUserAchievements } from '@/services/supabase/queries';
import { getAuthUser } from '@/services/supabase/authSession';

export interface AccountExportBundle {
  version: 2;
  exportedAt: string;
  local: Record<string, unknown>;
  cloud: {
    profile: unknown;
    sessions: unknown[];
    keyErrors: unknown[];
    /** @deprecated Legacy user_badges — kept empty; use achievements. */
    badges: unknown[];
    achievements: unknown[];
  };
}

export async function buildAccountExportBundle(): Promise<AccountExportBundle | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const user = await getAuthUser();
  if (!user) return null;

  const [profile, sessions, keyErrors, achievements] = await Promise.all([
    fetchUserProfile(),
    fetchUserSessions(500),
    fetchUserKeyErrors(),
    fetchUserAchievements(user.id),
  ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    local: exportProgress().data,
    cloud: {
      profile,
      sessions,
      keyErrors,
      badges: [],
      achievements,
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

  const user = await getAuthUser();
  if (!user) return { error: 'notAuthenticated' };

  const { error } = await supabase.rpc('delete_own_account');
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  return { error: null };
}
