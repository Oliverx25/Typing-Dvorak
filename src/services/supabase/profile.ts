import { getSupabaseClient } from '@/lib/supabaseClient';
import type { MultiplayerPrivacy } from '@/utils/user/multiplayerPrivacy';
import { validateDisplayName, validateUsername } from '@/utils/user/profileValidation';
import type { AppSettings } from '@/utils/app/settings';
import { profilePayloadFromAppPreferences } from '@/utils/app/settingsSync';
import type { Theme } from '@/utils/progress/storage';

/** Persists all app settings + theme to the user's profile. No-op when offline/guest. */
export async function syncAppSettingsToProfile(
  settings: AppSettings,
  theme: Theme,
): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: null };

  const payload = profilePayloadFromAppPreferences(settings, theme);

  const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
  if (error) {
    console.warn('[sync] app settings update failed:', error.message);
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
      ...(input.multiplayerPrivacy ? { multiplayer_privacy: input.multiplayerPrivacy } : {}),
    })
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  const metaError = await syncAuthDisplayName(displayName);
  if (metaError) return { error: metaError };

  return { error: null };
}
