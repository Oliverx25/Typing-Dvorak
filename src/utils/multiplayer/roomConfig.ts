import type { Locale } from '@/i18n';
import type { RoomBroadcastState } from '@/types/multiplayer';
import { CORE_LESSONS, getLessonById, getLessonText } from '@/utils/curriculum/lessons';
import { sanitizeTypableText } from '@/utils/security/sanitizeText';
import {
  MODIFIER_EXCLUSIVE_PAIRS,
  resolveModifierConflicts,
  toggleRaceModifier,
} from '@/utils/multiplayer/modifierExclusive';
import type { RaceModifier, VictoryCondition } from '@/utils/multiplayer/roomConfig.types';

export type { RaceModifier, VictoryCondition } from '@/utils/multiplayer/roomConfig.types';
export { MODIFIER_EXCLUSIVE_PAIRS, resolveModifierConflicts, toggleRaceModifier };

export const DEFAULT_RACE_LESSON_ID = 'alphabet_mastery';

export const RACE_LESSONS = CORE_LESSONS.filter((lesson) => !lesson.adaptive);

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
  'vampire',
  'hidden',
  'double_time',
  'rhythm_lock',
  'half_time',
];

export const SONG_ONLY_MODIFIERS: RaceModifier[] = [
  'double_time',
  'rhythm_lock',
  'half_time',
];

export const GENERAL_MODIFIERS: RaceModifier[] = [
  'sudden_death',
  'blind_mode',
  'strict',
  'flashlight',
  'vampire',
  'hidden',
];

export const DEFAULT_WIN_CONDITION: VictoryCondition = 'max_score';

/** @deprecated Use DEFAULT_WIN_CONDITION */
export const DEFAULT_WIN_CONDITIONS: VictoryCondition[] = [DEFAULT_WIN_CONDITION];

/** @deprecated Use ALL_MODIFIERS */
export const WIN_CONDITIONS: WinCondition[] = [...VICTORY_CONDITIONS, 'sudden_death'];

/** @deprecated */
export const MODIFIER_WIN_CONDITIONS: WinCondition[] = ['sudden_death'];

export const VICTORY_CONDITION_ICONS: Record<VictoryCondition, string> = {
  first_finish: 'timer',
  highest_wpm: 'speed',
  max_score: 'max-score',
};

export const MODIFIER_ICONS: Record<RaceModifier, string> = {
  sudden_death: 'skull',
  blind_mode: 'blind-mode',
  strict: 'lock',
  flashlight: 'flashlight',
  double_time: 'double-time',
  rhythm_lock: 'rhythm-lock',
  vampire: 'vampire',
  hidden: 'hidden',
  half_time: 'half-time',
};

/** i18n keys under `t.multiplayer` for modifier labels and descriptions. */
export const MODIFIER_TITLE_KEYS: Record<RaceModifier, string> = {
  sudden_death: 'modifierSuddenDeath',
  blind_mode: 'modifierBlindMode',
  strict: 'modifierStrict',
  flashlight: 'modifierFlashlight',
  double_time: 'modifierDoubleTime',
  rhythm_lock: 'modifierRhythmLock',
  vampire: 'modifierVampire',
  hidden: 'modifierHidden',
  half_time: 'modifierHalfTime',
};

export const MODIFIER_DESC_KEYS: Record<RaceModifier, string> = {
  sudden_death: 'modifierSuddenDeathDesc',
  blind_mode: 'modifierBlindModeDesc',
  strict: 'modifierStrictDesc',
  flashlight: 'modifierFlashlightDesc',
  double_time: 'modifierDoubleTimeDesc',
  rhythm_lock: 'modifierRhythmLockDesc',
  vampire: 'modifierVampireDesc',
  hidden: 'modifierHiddenDesc',
  half_time: 'modifierHalfTimeDesc',
};

/** @deprecated Use VICTORY_CONDITION_ICONS + MODIFIER_ICONS (IconName keys) */
export const WIN_CONDITION_ICONS: Record<WinCondition, string> = {
  ...VICTORY_CONDITION_ICONS,
  sudden_death: MODIFIER_ICONS.sudden_death,
};

export const BLIND_MODE_ICON = MODIFIER_ICONS.blind_mode;

/** Active-state Tailwind classes per modifier (muted semantic palette). */
export const MODIFIER_ACTIVE_CLASSES: Record<RaceModifier, string> = {
  sudden_death: 'bg-rose-500/10 border-rose-500/50 text-rose-400',
  strict: 'bg-amber-500/10 border-amber-500/50 text-amber-400',
  blind_mode: 'bg-purple-500/10 border-purple-500/50 text-purple-400',
  flashlight: 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400',
  double_time: 'bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-400',
  rhythm_lock: 'bg-pink-500/10 border-pink-500/50 text-pink-400',
  vampire: 'bg-red-500/10 border-red-500/50 text-red-500',
  hidden: 'bg-teal-500/10 border-teal-500/50 text-teal-400',
  half_time: 'bg-sky-500/10 border-sky-500/50 text-sky-400',
};

/** Hover-state Tailwind classes per modifier (border + icon only). */
export const MODIFIER_HOVER_CLASSES: Record<RaceModifier, string> = {
  sudden_death: 'hover:border-rose-500/50 hover:text-rose-400',
  strict: 'hover:border-amber-500/50 hover:text-amber-400',
  blind_mode: 'hover:border-purple-500/50 hover:text-purple-400',
  flashlight: 'hover:border-cyan-500/50 hover:text-cyan-400',
  double_time: 'hover:border-fuchsia-500/50 hover:text-fuchsia-400',
  rhythm_lock: 'hover:border-pink-500/50 hover:text-pink-400',
  vampire: 'hover:border-red-500/50 hover:text-red-500',
  hidden: 'hover:border-teal-500/50 hover:text-teal-400',
  half_time: 'hover:border-sky-500/50 hover:text-sky-400',
};

/** Risk/reward score multipliers. Values below 1 reduce reward for easier settings. */
export const MODIFIER_MULTIPLIERS: Record<RaceModifier, number> = {
  sudden_death: 1.2,
  blind_mode: 1.15,
  strict: 1.1,
  flashlight: 1.15,
  vampire: 1.15,
  hidden: 1.1,
  double_time: 1.2,
  rhythm_lock: 1.15,
  half_time: 0.5,
};

export function totalModifierMultiplier(modifiers: RaceModifier[]): number {
  const normalized = normalizeModifiers(modifiers);
  const total = normalized.reduce(
    (product, modifier) => product * MODIFIER_MULTIPLIERS[modifier],
    1,
  );
  return Math.round(total * 100) / 100;
}

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

  return resolveModifierConflicts(ALL_MODIFIERS.filter((mod) => seen.has(mod)));
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

export function isVampireModeActive(modifiers: RaceModifier[]): boolean {
  return modifiers.includes('vampire');
}

export function isSuddenDeathActive(modifiers: RaceModifier[]): boolean {
  return modifiers.includes('sudden_death');
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
    lessonIds: [
      'base_vowels',
      'base_consonants',
      'base_alternation',
      'top_left',
      'top_right',
      'alphabet_mastery',
    ],
  },
  {
    id: 'symbols' as const,
    lessonIds: ['num_mixed', 'dev_math_logic', 'dev_brackets', 'dev_strings', 'dev_terminal'],
  },
  {
    id: 'advanced' as const,
    lessonIds: ['code_js_ts', 'code_python', 'advanced_prose'],
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
    raceParticipantIds: [],
    version: 1,
  };
}

export function resolveRaceText(
  state: Pick<RoomBroadcastState, 'lessonId' | 'customText'>,
  locale: Locale,
): string {
  const custom = sanitizeTypableText(state.customText, CUSTOM_RACE_TEXT_MAX).trim();
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
      customText: sanitizeTypableText(
        incoming.customText ?? current?.customText ?? '',
        CUSTOM_RACE_TEXT_MAX,
      ),
      textSource,
      songMeta: textSource === 'song' ? songMeta : null,
      winCondition: rules.winCondition,
      modifiers,
      phase: incoming.phase ?? current?.phase ?? 'lobby',
      raceStartedAt: incoming.raceStartedAt !== undefined
        ? incoming.raceStartedAt
        : (current?.raceStartedAt ?? null),
      raceParticipantIds:
        incoming.raceParticipantIds !== undefined
          ? incoming.raceParticipantIds
          : (current?.raceParticipantIds ?? []),
      version: incoming.version ?? current?.version ?? 1,
    };
  }

  return current;
}
