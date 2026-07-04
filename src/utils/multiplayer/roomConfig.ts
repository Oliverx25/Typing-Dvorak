import type { Locale } from '@/i18n';
import type { RoomBroadcastState } from '@/types/multiplayer';
import { CORE_LESSONS, getLessonById, getLessonText } from '@/utils/curriculum/lessons';

export const DEFAULT_RACE_LESSON_ID = 'common-words';

export const RACE_LESSONS = CORE_LESSONS.filter(
  (lesson) => !lesson.adaptive && lesson.texts.length > 0,
);

export function createDefaultRoomState(ownerId: string): RoomBroadcastState {
  return {
    ownerId,
    lessonId: DEFAULT_RACE_LESSON_ID,
    customText: '',
    blindMode: false,
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
      phase: incoming.phase ?? current?.phase ?? 'lobby',
      raceStartedAt: incoming.raceStartedAt !== undefined
        ? incoming.raceStartedAt
        : (current?.raceStartedAt ?? null),
      version: incoming.version ?? current?.version ?? 1,
    };
  }

  return current;
}
