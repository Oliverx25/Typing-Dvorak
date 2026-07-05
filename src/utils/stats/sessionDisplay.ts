import type { TranslationKey } from '@/i18n';
import type { SessionRecord } from '@/utils/progress/storage';
import type { ChartPoint } from '@/components/stats/charts/ProgressChart';
import type { RaceTextSource } from '@/utils/stats/sessionTypes';

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

export function formatSessionLabel(
  record: SessionRecord,
  t: TranslationKey,
  getLessonTitle: (t: TranslationKey, titleKey: string) => string,
): string {
  if (record.lessonId === MULTIPLAYER_LESSON_ID) {
    const base = t.stats.multiplayerSession;
    const source = record.multiplayerSource ?? 'lesson';
    if (source === 'custom') return `${base} · ${t.multiplayer.customTextMode}`;
    if (source === 'song') return `${base} · ${t.stats.multiplayerSourceSong}`;
    return `${base} · ${t.multiplayer.systemLesson}`;
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
    };
  });
}
