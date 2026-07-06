import type { TranslationKey } from '@/i18n';
import type { SessionRecord } from '@/utils/progress/storage';
import type { ChartPoint } from '@/components/stats/charts/ProgressChart';
import type { RaceTextSource } from '@/utils/stats/sessionTypes';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig.types';

/** i18n keys under `t.multiplayer` — kept in sync with roomConfig.MODIFIER_TITLE_KEYS. */
const MODIFIER_TITLE_KEYS: Record<RaceModifier, string> = {
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

const KNOWN_MODIFIERS = new Set<string>(Object.keys(MODIFIER_TITLE_KEYS));

export const MULTIPLAYER_LESSON_ID = 'multiplayer';
export const CHART_MAX_SESSIONS = 20;

export function resolveRaceTextSource(input: {
  textSource?: RaceTextSource;
  customText?: string;
}): RaceTextSource {
  if (input.textSource === 'song') return 'song';
  if (input.textSource === 'custom') return 'custom';
  if (input.customText?.trim()) return 'custom';
  return 'lesson';
}

export function parseStoredRaceModifiers(value: unknown): RaceModifier[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const parsed = value.filter(
    (entry): entry is RaceModifier =>
      typeof entry === 'string' && KNOWN_MODIFIERS.has(entry),
  );
  return parsed.length > 0 ? parsed : undefined;
}

export function formatModifierLabels(
  modifiers: RaceModifier[] | undefined,
  t: TranslationKey,
): string[] {
  if (!modifiers?.length) return [];
  return modifiers.map((modifier) => {
    const key = MODIFIER_TITLE_KEYS[modifier] as keyof TranslationKey['multiplayer'];
    return t.multiplayer[key] ?? modifier;
  });
}

export function formatSessionLabel(
  record: SessionRecord,
  t: TranslationKey,
  getLessonTitle: (t: TranslationKey, titleKey: string) => string,
): string {
  if (record.lessonId === MULTIPLAYER_LESSON_ID) {
    const source = record.multiplayerSource ?? 'lesson';
    if (source === 'song') {
      return record.songTitle?.trim() || t.stats.multiplayerSourceSong;
    }
    if (source === 'custom') return t.multiplayer.customTextMode;
    return t.multiplayer.systemLesson;
  }

  const lesson = record.lessonTitle;
  if (lesson.includes('.') || /^[a-zA-Z]+$/.test(lesson)) {
    return getLessonTitle(t, lesson);
  }
  return lesson;
}

export function buildChartPoints(
  history: SessionRecord[],
  t: TranslationKey,
  getLessonTitle: (t: TranslationKey, titleKey: string) => string,
): ChartPoint[] {
  const slice = history.slice(0, CHART_MAX_SESSIONS).reverse();
  return slice.map((record, index) => {
    const completed = new Date(record.completedAt);
    return {
      session: index + 1,
      date: completed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      time: completed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      wpm: record.wpm,
      lessonTitle: formatSessionLabel(record, t, getLessonTitle),
      modifierLabels: formatModifierLabels(record.raceModifiers, t),
    };
  });
}
