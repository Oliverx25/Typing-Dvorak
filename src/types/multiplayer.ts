import type { AvatarSource } from '@/utils/user/userDisplay';
import type { WinCondition } from '@/utils/multiplayer/roomConfig';

/** Payload tracked in Supabase Realtime Presence for each lobby player. */
export interface LobbyPlayerPresence {
  userId: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
  avatarSource: AvatarSource;
  isReady: boolean;
  hasFinished: boolean;
  joinedAt: number;
}

export type LobbyConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'reconnecting'
  | 'connected'
  | 'error';

export type RoomPhase = 'lobby' | 'racing';

/** Authoritative room settings broadcast by the owner. */
export interface RoomBroadcastState {
  ownerId: string;
  lessonId: string;
  customText: string;
  blindMode: boolean;
  winCondition: WinCondition;
  phase: RoomPhase;
  raceStartedAt: number | null;
  version: number;
}

export interface RaceProgressPayload {
  userId: string;
  wpm: number;
  percentage: number;
  updatedAt: number;
  finished?: boolean;
}

export interface RaceParticipantProgress extends RaceProgressPayload {
  name: string;
  avatarUrl: string | null;
  initials: string;
  avatarSource: AvatarSource;
}

/** @deprecated use RaceParticipantProgress */
export type RaceOpponentProgress = RaceParticipantProgress;
