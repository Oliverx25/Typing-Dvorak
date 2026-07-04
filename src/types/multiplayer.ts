import type { AvatarSource } from '@/utils/user/userDisplay';

/** Payload tracked in Supabase Realtime Presence for each lobby player. */
export interface LobbyPlayerPresence {
  userId: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
  avatarSource: AvatarSource;
  isReady: boolean;
  joinedAt: number;
}

export type LobbyConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
