import { normalizeWinCondition, normalizeModifiers, stripSongOnlyModifiers, CUSTOM_RACE_TEXT_MAX, type RaceModifier, type VictoryCondition } from '@/utils/multiplayer/roomConfig';
import { sanitizeTypableText } from '@/utils/security/sanitizeText';
import type { SelectedSongMeta } from '@/utils/lyrics/types';

export type TextSource = 'lesson' | 'custom' | 'song';

export interface CreateRoomConfig {
  lessonId: string;
  customText: string;
  winCondition: VictoryCondition;
  modifiers: RaceModifier[];
  textSource: TextSource;
  songMeta: SelectedSongMeta | null;
}

const PREFIX = 'typing-dvorak:mp-create:';

export function saveCreateRoomConfig(roomCode: string, config: CreateRoomConfig): void {
  try {
    const safe: CreateRoomConfig = {
      ...config,
      customText:
        config.textSource === 'lesson'
          ? ''
          : sanitizeTypableText(config.customText, CUSTOM_RACE_TEXT_MAX),
    };
    sessionStorage.setItem(`${PREFIX}${roomCode}`, JSON.stringify(safe));
  } catch {
    /* ignore quota errors */
  }
}

export function readCreateRoomConfig(roomCode: string): CreateRoomConfig | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${roomCode}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CreateRoomConfig> & {
      winCondition?: VictoryCondition;
      winConditions?: unknown;
      blindMode?: boolean;
    };
    if (!parsed.lessonId) return null;
    const textSource: TextSource =
      parsed.textSource === 'song'
        ? 'song'
        : parsed.textSource === 'custom'
          ? 'custom'
          : 'lesson';

    const winCondition = normalizeWinCondition(
      parsed.winCondition ?? parsed.winConditions,
    );
    const modifiers = normalizeModifiers(
      [
        ...(Array.isArray(parsed.modifiers) ? parsed.modifiers : []),
        ...(Array.isArray(parsed.winConditions)
          ? parsed.winConditions.filter((v) => v === 'sudden_death')
          : []),
      ],
      Boolean(parsed.blindMode),
    );

    return {
      lessonId: parsed.lessonId,
      customText: sanitizeTypableText(parsed.customText ?? '', CUSTOM_RACE_TEXT_MAX),
      winCondition,
      modifiers:
        textSource === 'song' ? modifiers : stripSongOnlyModifiers(modifiers),
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
