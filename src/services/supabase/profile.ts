import { getSupabaseClient } from '@/lib/supabaseClient';
import type { MultiplayerPrivacy } from '@/utils/user/multiplayerPrivacy';
import { validateDisplayName, validateUsername } from '@/utils/user/profileValidation';
import type { AppSettings } from '@/utils/app/settings';
import { userSettingsPayloadFromAppPreferences } from '@/utils/app/settingsSync';
import type { Theme } from '@/utils/progress/storage';

/** Persists all app settings + theme to user_settings. No-op when offline/guest. */
export async function syncAppSettingsToProfile(
  settings: AppSettings,
  theme: Theme,
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: null };

  const payload = userSettingsPayloadFromAppPreferences(settings, theme);

  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, ...payload }, { onConflict: 'user_id' });

  if (error) {
    console.warn('[sync] user_settings update failed:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

export interface ProfileUpdateInput {
  displayName: string;
  username?: string;
  multiplayerPrivacy?: MultiplayerPrivacy;
}

async function syncAuthDisplayName(displayName: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return 'notConfigured';

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: displayName,
      display_name: displayName,
      display_name_custom: true,
    },
  });

  return error?.message ?? null;
}

export async function updateUserProfile(input: ProfileUpdateInput): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'notConfigured' };

  const displayName = input.displayName.trim();
  const username = input.username?.trim() ?? '';

  const nameError = validateDisplayName(displayName);
  if (nameError) return { error: nameError };

  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'notAuthenticated' };

  if (username) {
    const { data: taken } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .maybeSingle();

    if (taken) return { error: 'usernameTaken' };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      display_name_custom: true,
      username: username || null,
    })
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  if (input.multiplayerPrivacy) {
    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: user.id, multiplayer_privacy: input.multiplayerPrivacy },
        { onConflict: 'user_id' },
      );
    if (settingsError) return { error: settingsError.message };
  }

  const metaError = await syncAuthDisplayName(displayName);
  if (metaError) return { error: metaError };

  return { error: null };
}
