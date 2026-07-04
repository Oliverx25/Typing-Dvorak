import type { User } from '@supabase/supabase-js';

export type AvatarSource = 'custom' | 'oauth' | 'none';

export interface UserDisplay {
  name: string;
  avatarUrl: string | null;
  initials: string;
  avatarSource: AvatarSource;
  hasCustomAvatar: boolean;
}

function readOAuthAvatar(user: User): string | null {
  for (const identity of user.identities ?? []) {
    const data = identity.identity_data ?? {};
    const url = data.avatar_url ?? data.picture;
    if (typeof url === 'string' && url.trim().length > 0) return url.trim();
  }

  const meta = user.user_metadata ?? {};
  const fallback = meta.avatar_url ?? meta.picture;
  if (typeof fallback === 'string' && fallback.trim().length > 0 && meta.avatar_custom !== true) {
    return fallback.trim();
  }

  return null;
}

export function getUserAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  if (meta.avatar_custom === true) {
    const custom = meta.avatar_url;
    if (typeof custom === 'string' && custom.trim().length > 0) return custom.trim();
  }

  return readOAuthAvatar(user);
}

export function getUserAvatarSource(user: User): AvatarSource {
  const meta = user.user_metadata ?? {};
  if (meta.avatar_custom === true && typeof meta.avatar_url === 'string' && meta.avatar_url.trim()) {
    return 'custom';
  }
  if (readOAuthAvatar(user)) return 'oauth';
  return 'none';
}

export function getUserDisplayName(user: User): string {
  const meta = user.user_metadata ?? {};
  const name = meta.full_name ?? meta.name ?? meta.user_name;
  if (typeof name === 'string' && name.trim()) return name.trim();
  if (user.email) return user.email.split('@')[0] ?? 'User';
  return 'User';
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getUserDisplay(user: User): UserDisplay {
  const name = getUserDisplayName(user);
  const avatarSource = getUserAvatarSource(user);
  return {
    name,
    avatarUrl: getUserAvatarUrl(user),
    initials: getUserInitials(name),
    avatarSource,
    hasCustomAvatar: avatarSource === 'custom',
  };
}
