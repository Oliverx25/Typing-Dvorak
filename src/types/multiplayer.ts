import type { AvatarSource } from '@/utils/user/userDisplay';
import type { RaceModifier, VictoryCondition } from '@/utils/multiplayer/roomConfig';
import type { TextSource } from '@/utils/multiplayer/roomStorage';
import type { SelectedSongMeta } from '@/utils/lyrics/types';

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

export type RoomPhase = 'lobby' | 'racing' | 'results';

/** Authoritative room settings broadcast by the owner. */
export interface RoomBroadcastState {
  ownerId: string;
  lessonId: string;
  customText: string;
  textSource: TextSource;
  /** Song snapshot when textSource === 'song' (drives cover art + musical pacer). */
  songMeta: SelectedSongMeta | null;
  /** Mutually exclusive victory rule. */
  winCondition: VictoryCondition;
  /** Stackable osu!-style modifiers. */
  modifiers: RaceModifier[];
  phase: RoomPhase;
  raceStartedAt: number | null;
  /** Snapshot of connected players when the race started — used to avoid ending early. */
  raceParticipantIds: string[];
  version: number;
}

export interface RaceProgressPayload {
  userId: string;
  wpm: number;
  percentage: number;
  accuracy: number;
  maxCombo: number;
  /** Current correct-key streak; resets to 0 on a mistake. */
  combo: number;
  score: number;
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
