import type { User } from '@supabase/supabase-js';

export interface UserDisplay {
  name: string;
  avatarUrl: string | null;
  initials: string;
}

export function getUserAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const fromMeta = meta.avatar_url ?? meta.picture;
  if (typeof fromMeta === 'string' && fromMeta.length > 0) return fromMeta;

  const identity = user.identities?.find((i) => i.identity_data?.avatar_url ?? i.identity_data?.picture);
  const fromIdentity = identity?.identity_data?.avatar_url ?? identity?.identity_data?.picture;
  if (typeof fromIdentity === 'string' && fromIdentity.length > 0) return fromIdentity;

  return null;
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
  return {
    name,
    avatarUrl: getUserAvatarUrl(user),
    initials: getUserInitials(name),
  };
}
