import { getSupabaseClient } from '@/lib/supabaseClient';

const AVATAR_BUCKET = 'avatars';
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function extForMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

function avatarObjectPath(userId: string, mime: string): string {
  return `${userId}/avatar.${extForMime(mime)}`;
}

async function syncProfileAvatar(userId: string, avatarUrl: string | null, avatarCustom: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, avatar_custom: avatarCustom })
    .eq('id', userId);

  if (error) console.warn('[avatar] profile sync failed:', error.message);
}

async function updateAuthAvatarMetadata(avatarUrl: string | null, avatarCustom: boolean): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return 'Supabase is not configured.';

  const { error } = await supabase.auth.updateUser({
    data: {
      avatar_url: avatarUrl,
      avatar_custom: avatarCustom,
    },
  });

  return error?.message ?? null;
}

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'invalidType';
  }
  if (file.size > MAX_BYTES) {
    return 'tooLarge';
  }
  return null;
}

export async function uploadUserAvatar(file: File): Promise<{ error: string | null; url?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'notConfigured' };

  const validation = validateAvatarFile(file);
  if (validation) return { error: validation };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'notAuthenticated' };

  const objectPath = avatarObjectPath(user.id, file.type);
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, file, { upsert: true, contentType: file.type, cacheControl: '3600' });

  if (uploadError) return { error: uploadError.message };

  const { data: publicData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);
  const publicUrl = `${publicData.publicUrl}?t=${Date.now()}`;

  const metaError = await updateAuthAvatarMetadata(publicUrl, true);
  if (metaError) return { error: metaError };

  await syncProfileAvatar(user.id, publicUrl, true);
  return { error: null, url: publicUrl };
}

export async function removeCustomUserAvatar(): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: 'notConfigured' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'notAuthenticated' };

  const paths = ['jpg', 'png', 'webp'].map((ext) => `${user.id}/avatar.${ext}`);
  await supabase.storage.from(AVATAR_BUCKET).remove(paths);

  const metaError = await updateAuthAvatarMetadata(null, false);
  if (metaError) return { error: metaError };

  await syncProfileAvatar(user.id, null, false);
  return { error: null };
}
