import type { User } from '@supabase/supabase-js';
import type { AvatarSource } from './userDisplay';
import { getUserDisplay, getUserInitials, type ProfileDisplayInfo } from './userDisplay';

export type MultiplayerPrivacy = 'public' | 'initials' | 'anonymous';

export const MULTIPLAYER_PRIVACY_OPTIONS: MultiplayerPrivacy[] = ['public', 'initials', 'anonymous'];

export function isMultiplayerPrivacy(value: string): value is MultiplayerPrivacy {
  return MULTIPLAYER_PRIVACY_OPTIONS.includes(value as MultiplayerPrivacy);
}

export interface MultiplayerPresenceDisplay {
  name: string;
  avatarUrl: string | null;
  initials: string;
  avatarSource: AvatarSource;
}

export function getMultiplayerPresenceDisplay(
  user: User,
  profile?: ProfileDisplayInfo | null,
): MultiplayerPresenceDisplay {
  const display = getUserDisplay(user, profile);
  const privacy = profile?.multiplayer_privacy ?? 'public';

  if (privacy === 'initials') {
    return {
      name: display.initials,
      avatarUrl: null,
      initials: display.initials,
      avatarSource: 'none',
    };
  }

  if (privacy === 'anonymous') {
    const anonName = profile?.username?.trim() || 'Player';
    return {
      name: anonName,
      avatarUrl: null,
      initials: getUserInitials(anonName),
      avatarSource: 'none',
    };
  }

  return {
    name: display.name,
    avatarUrl: display.avatarUrl,
    initials: display.initials,
    avatarSource: display.avatarSource,
  };
}
