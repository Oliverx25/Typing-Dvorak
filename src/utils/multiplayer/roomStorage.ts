import { normalizeWinConditions, type WinCondition } from '@/utils/multiplayer/roomConfig';
import type { SelectedSongMeta } from '@/utils/lyrics/types';

export type TextSource = 'lesson' | 'custom' | 'song';

export interface CreateRoomConfig {
  lessonId: string;
  customText: string;
  blindMode: boolean;
  winConditions: WinCondition[];
  textSource: TextSource;
  songMeta: SelectedSongMeta | null;
}

const PREFIX = 'typing-dvorak:mp-create:';

export function saveCreateRoomConfig(roomCode: string, config: CreateRoomConfig): void {
  try {
    sessionStorage.setItem(`${PREFIX}${roomCode}`, JSON.stringify(config));
  } catch {
    /* ignore quota errors */
  }
}

export function readCreateRoomConfig(roomCode: string): CreateRoomConfig | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${roomCode}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CreateRoomConfig> & {
      winCondition?: WinCondition;
    };
    if (!parsed.lessonId) return null;
    const textSource: TextSource =
      parsed.textSource === 'song'
        ? 'song'
        : parsed.textSource === 'custom'
          ? 'custom'
          : 'lesson';
    return {
      lessonId: parsed.lessonId,
      customText: parsed.customText ?? '',
      blindMode: Boolean(parsed.blindMode),
      winConditions: normalizeWinConditions(parsed.winConditions ?? parsed.winCondition),
      textSource,
      songMeta: textSource === 'song' ? (parsed.songMeta ?? null) : null,
    };
  } catch {
    return null;
  }
}

export function clearCreateRoomConfig(roomCode: string): void {
  try {
    sessionStorage.removeItem(`${PREFIX}${roomCode}`);
  } catch {
    /* ignore */
  }
}
