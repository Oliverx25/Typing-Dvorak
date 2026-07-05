import type { Locale } from '@/i18n';
import type { RoomBroadcastState } from '@/types/multiplayer';
import { CORE_LESSONS, getLessonById, getLessonText } from '@/utils/curriculum/lessons';

export const DEFAULT_RACE_LESSON_ID = 'common-words';

export const RACE_LESSONS = CORE_LESSONS.filter(
  (lesson) => !lesson.adaptive && lesson.texts.length > 0,
);

/** Mutually exclusive — how the winner is determined. */
export type VictoryCondition = 'max_score' | 'first_finish' | 'highest_wpm';

/** Stackable rule modifiers (osu!-style). */
export type RaceModifier =
  | 'sudden_death'
  | 'blind_mode'
  | 'strict'
  | 'flashlight'
  | 'double_time'
  | 'rhythm_lock';

/** @deprecated Legacy alias — use VictoryCondition or RaceModifier. */
export type WinCondition = VictoryCondition | 'sudden_death';

export const VICTORY_CONDITIONS: VictoryCondition[] = [
  'max_score',
  'first_finish',
  'highest_wpm',
];

export const ALL_MODIFIERS: RaceModifier[] = [
  'sudden_death',
  'blind_mode',
  'strict',
  'flashlight',
  'double_time',
  'rhythm_lock',
];

export const SONG_ONLY_MODIFIERS: RaceModifier[] = ['double_time', 'rhythm_lock'];

export const DEFAULT_WIN_CONDITION: VictoryCondition = 'max_score';

/** @deprecated Use DEFAULT_WIN_CONDITION */
export const DEFAULT_WIN_CONDITIONS: VictoryCondition[] = [DEFAULT_WIN_CONDITION];

/** @deprecated Use ALL_MODIFIERS */
export const WIN_CONDITIONS: WinCondition[] = [...VICTORY_CONDITIONS, 'sudden_death'];

/** @deprecated */
export const MODIFIER_WIN_CONDITIONS: WinCondition[] = ['sudden_death'];

export const VICTORY_CONDITION_ICONS: Record<VictoryCondition, string> = {
  first_finish: '/icons/timer.svg',
  highest_wpm: '/icons/speed.svg',
  max_score: '/icons/max-score.svg',
};

export const MODIFIER_ICONS: Record<RaceModifier, string> = {
  sudden_death: '/icons/skull.svg',
  blind_mode: '/icons/blind-mode.svg',
  strict: '/icons/lock.svg',
  flashlight: '/icons/flashlight.svg',
  double_time: '/icons/double-time.svg',
  rhythm_lock: '/icons/rhythm-lock.svg',
};

/** @deprecated Use VICTORY_CONDITION_ICONS + MODIFIER_ICONS */
export const WIN_CONDITION_ICONS: Record<WinCondition, string> = {
  ...VICTORY_CONDITION_ICONS,
  sudden_death: MODIFIER_ICONS.sudden_death,
};

export const BLIND_MODE_ICON = MODIFIER_ICONS.blind_mode;

/** Active-state Tailwind classes per modifier (muted semantic palette). */
export const MODIFIER_ACTIVE_CLASSES: Record<RaceModifier, string> = {
  sudden_death: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  strict: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  blind_mode: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  flashlight: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  double_time: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400',
  rhythm_lock: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
};

export function normalizeWinCondition(value: unknown): VictoryCondition {
  if (typeof value === 'string' && VICTORY_CONDITIONS.includes(value as VictoryCondition)) {
    return value as VictoryCondition;
  }
  if (Array.isArray(value)) {
    const first = value.find(
      (v): v is VictoryCondition =>
        typeof v === 'string' && VICTORY_CONDITIONS.includes(v as VictoryCondition),
    );
    if (first) return first;
  }
  return DEFAULT_WIN_CONDITION;
}

export function normalizeModifiers(
  value: unknown,
  legacyBlindMode = false,
): RaceModifier[] {
  const seen = new Set<RaceModifier>();

  const push = (mod: unknown) => {
    if (typeof mod !== 'string') return;
    if (!ALL_MODIFIERS.includes(mod as RaceModifier)) return;
    seen.add(mod as RaceModifier);
  };

  if (Array.isArray(value)) {
    for (const mod of value) push(mod);
  }

  // Legacy: sudden_death lived inside winConditions[]
  if (Array.isArray(value)) {
    /* already handled */
  }

  if (legacyBlindMode) push('blind_mode');

  return ALL_MODIFIERS.filter((mod) => seen.has(mod));
}

/** Parse legacy winConditions[] into modifiers (sudden_death only). */
function legacyModifiersFromWinConditions(value: unknown): RaceModifier[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is RaceModifier => v === 'sudden_death');
}

export function normalizeRoomRules(
  partial: {
    winCondition?: unknown;
    winConditions?: unknown;
    modifiers?: unknown;
    blindMode?: boolean;
  },
): { winCondition: VictoryCondition; modifiers: RaceModifier[] } {
  const winCondition = normalizeWinCondition(
    partial.winCondition ?? partial.winConditions,
  );

  const modifiers = normalizeModifiers(
    [
      ...(Array.isArray(partial.modifiers) ? partial.modifiers : []),
      ...legacyModifiersFromWinConditions(partial.winConditions),
    ],
    Boolean(partial.blindMode),
  );

  return { winCondition, modifiers };
}

/** @deprecated Use normalizeWinCondition */
export function getPrimaryVictoryCondition(
  value: VictoryCondition | WinCondition[] | unknown,
): VictoryCondition {
  return normalizeWinCondition(value);
}

/** @deprecated Use normalizeRoomRules */
export function normalizeWinConditions(value: unknown): WinCondition[] {
  const { winCondition, modifiers } = normalizeRoomRules({ winConditions: value });
  return [winCondition, ...modifiers.filter((m) => m === 'sudden_death')];
}

export function isBlindModeActive(modifiers: RaceModifier[]): boolean {
  return modifiers.includes('blind_mode');
}

export function availableModifiers(textSource: 'lesson' | 'custom' | 'song'): RaceModifier[] {
  return ALL_MODIFIERS.filter(
    (mod) => !SONG_ONLY_MODIFIERS.includes(mod) || textSource === 'song',
  );
}

export function stripSongOnlyModifiers(modifiers: RaceModifier[]): RaceModifier[] {
  return modifiers.filter((mod) => !SONG_ONLY_MODIFIERS.includes(mod));
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
    textSource: 'lesson',
    songMeta: null,
    winCondition: DEFAULT_WIN_CONDITION,
    modifiers: [],
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
  incoming: Partial<RoomBroadcastState> & { winConditions?: unknown; blindMode?: boolean },
): RoomBroadcastState | null {
  if (!incoming.ownerId) return current;

  if (!current || (incoming.version ?? 0) >= current.version) {
    const textSource =
      incoming.textSource ??
      current?.textSource ??
      ((incoming.customText ?? current?.customText)?.trim() ? 'custom' : 'lesson');
    const songMeta =
      incoming.songMeta !== undefined ? incoming.songMeta : (current?.songMeta ?? null);

    const rules = normalizeRoomRules({
      winCondition: incoming.winCondition ?? current?.winCondition,
      winConditions: incoming.winConditions,
      modifiers: incoming.modifiers ?? current?.modifiers,
      blindMode: incoming.blindMode ?? isBlindModeActive(current?.modifiers ?? []),
    });

    const modifiers =
      textSource === 'song'
        ? rules.modifiers
        : stripSongOnlyModifiers(rules.modifiers);

    return {
      ownerId: incoming.ownerId,
      lessonId: incoming.lessonId ?? current?.lessonId ?? DEFAULT_RACE_LESSON_ID,
      customText: incoming.customText ?? current?.customText ?? '',
      textSource,
      songMeta: textSource === 'song' ? songMeta : null,
      winCondition: rules.winCondition,
      modifiers,
      phase: incoming.phase ?? current?.phase ?? 'lobby',
      raceStartedAt: incoming.raceStartedAt !== undefined
        ? incoming.raceStartedAt
        : (current?.raceStartedAt ?? null),
      version: incoming.version ?? current?.version ?? 1,
    };
  }

  return current;
}
