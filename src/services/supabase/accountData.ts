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
