import type { WinCondition } from '@/utils/multiplayer/roomConfig';

export type TextSource = 'lesson' | 'custom';

export interface CreateRoomConfig {
  lessonId: string;
  customText: string;
  blindMode: boolean;
  winCondition: WinCondition;
  textSource: TextSource;
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
    const parsed = JSON.parse(raw) as Partial<CreateRoomConfig>;
    if (!parsed.lessonId) return null;
    return {
      lessonId: parsed.lessonId,
      customText: parsed.customText?.trim() ?? '',
      blindMode: Boolean(parsed.blindMode),
      winCondition: parsed.winCondition ?? 'first_finish',
      textSource: parsed.textSource === 'custom' ? 'custom' : 'lesson',
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
