import type { Locale } from '@/i18n';
import type { RoomBroadcastState } from '@/types/multiplayer';
import { CORE_LESSONS, getLessonById, getLessonText } from '@/utils/curriculum/lessons';

export const DEFAULT_RACE_LESSON_ID = 'common-words';

export const RACE_LESSONS = CORE_LESSONS.filter(
  (lesson) => !lesson.adaptive && lesson.texts.length > 0,
);

export type WinCondition = 'first_finish' | 'highest_wpm' | 'sudden_death';

export const WIN_CONDITIONS: WinCondition[] = ['first_finish', 'highest_wpm', 'sudden_death'];

export const DEFAULT_WIN_CONDITIONS: WinCondition[] = ['first_finish'];

/** Icon file (in /public/icons) associated with each win condition. */
export const WIN_CONDITION_ICONS: Record<WinCondition, string> = {
  first_finish: '/icons/timer.svg',
  highest_wpm: '/icons/speed.svg',
  sudden_death: '/icons/skull.svg',
};

/**
 * Normalize a possibly-legacy win condition value (single string or array)
 * into a de-duplicated, non-empty array of valid conditions.
 */
export function normalizeWinConditions(value: unknown): WinCondition[] {
  const raw = Array.isArray(value) ? value : value != null ? [value] : [];
  const valid = raw.filter((v): v is WinCondition =>
    WIN_CONDITIONS.includes(v as WinCondition),
  );
  const unique = Array.from(new Set(valid));
  return unique.length > 0 ? unique : [...DEFAULT_WIN_CONDITIONS];
}

export const CUSTOM_RACE_TEXT_MAX = 1000;
export const CUSTOM_RACE_TEXT_MIN = 10;

export const LESSON_GRID_GROUPS = [
  {
    id: 'basics' as const,
    lessonIds: ['home-row', 'top-row', 'bottom-row', 'shift-caps', 'all-rows', 'common-words'],
  },
  {
    id: 'symbols' as const,
    lessonIds: ['punctuation', 'numbers', 'dev-symbols'],
  },
  {
    id: 'advanced' as const,
    lessonIds: ['sentences', 'advanced'],
  },
];

export function createDefaultRoomState(ownerId: string): RoomBroadcastState {
  return {
    ownerId,
    lessonId: DEFAULT_RACE_LESSON_ID,
    customText: '',
    blindMode: false,
    winConditions: [...DEFAULT_WIN_CONDITIONS],
    phase: 'lobby',
    raceStartedAt: null,
    version: 1,
  };
}

export function resolveRaceText(
  state: Pick<RoomBroadcastState, 'lessonId' | 'customText'>,
  locale: Locale,
): string {
  const custom = state.customText.trim();
  if (custom) return custom;

  const lesson = getLessonById(state.lessonId) ?? getLessonById(DEFAULT_RACE_LESSON_ID);
  if (!lesson) return 'the quick brown fox jumps over the lazy dog';

  return getLessonText(lesson, (texts) => texts[0] ?? '', undefined, locale);
}

export function mergeRoomState(
  current: RoomBroadcastState | null,
  incoming: Partial<RoomBroadcastState>,
): RoomBroadcastState | null {
  if (!incoming.ownerId) return current;

  if (!current || (incoming.version ?? 0) >= current.version) {
    return {
      ownerId: incoming.ownerId,
      lessonId: incoming.lessonId ?? current?.lessonId ?? DEFAULT_RACE_LESSON_ID,
      customText: incoming.customText ?? current?.customText ?? '',
      blindMode: incoming.blindMode ?? current?.blindMode ?? false,
      winConditions: normalizeWinConditions(
        incoming.winConditions ?? current?.winConditions,
      ),
      phase: incoming.phase ?? current?.phase ?? 'lobby',
      raceStartedAt: incoming.raceStartedAt !== undefined
        ? incoming.raceStartedAt
        : (current?.raceStartedAt ?? null),
      version: incoming.version ?? current?.version ?? 1,
    };
  }

  return current;
}
