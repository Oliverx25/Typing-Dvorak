import { getSupabaseClient } from '@/lib/supabaseClient';
import { validateDisplayName, validateUsername } from '@/utils/user/profileValidation';

export interface ProfileUpdateInput {
  displayName: string;
  username?: string;
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

  const metaError = await syncAuthDisplayName(displayName);
  if (metaError) return { error: metaError };

  return { error: null };
}
