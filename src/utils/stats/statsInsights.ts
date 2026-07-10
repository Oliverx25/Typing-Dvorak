import { CORE_LESSONS } from '@/utils/curriculum/lessons';
import {
  getBestAccuracyForLesson,
  getBestWpmForLesson,
  getHighestGradeForLesson,
  getAggregateStats,
} from '@/utils/progress/storage';
import {
  getKeyStats,
  getKeyAccuracy,
  getKeyAttemptCount,
  codeToLabel,
  HEATMAP_MIN_SAMPLES,
} from '@/utils/stats/keyStats';

export const TROUBLE_KEY_ACCURACY_THRESHOLD = 0.9;

export interface LessonInsight {
  id: string;
  titleKey: string;
  wpm: number;
  accuracy: number;
  grade: string | null;
}

export interface StatsInsights {
  lessonRows: LessonInsight[];
  lowestWpmLesson: LessonInsight | null;
  lowestAccuracyLesson: LessonInsight | null;
  troubleKeys: string[];
  maxWpmOverall: number;
  suggestedAction: 'adaptive' | 'retry';
  retryLessonId: string | null;
}

export function getTroubleKeysFromHeatmap(
  stats = getKeyStats(),
  minAttempts = HEATMAP_MIN_SAMPLES,
  accuracyThreshold = TROUBLE_KEY_ACCURACY_THRESHOLD,
): string[] {
  const codes = new Set([...Object.keys(stats.hits), ...Object.keys(stats.misses)]);
  const trouble: { label: string; accuracy: number }[] = [];

  for (const code of codes) {
    if (getKeyAttemptCount(code, stats) < minAttempts) continue;
    const accuracy = getKeyAccuracy(code, stats);
    if (accuracy < accuracyThreshold) {
      trouble.push({ label: codeToLabel(code), accuracy });
    }
  }

  return trouble
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((entry) => entry.label);
}

export function buildLessonInsightRows(lessons = CORE_LESSONS): LessonInsight[] {
  return lessons.flatMap((lesson) => {
    const wpm = getBestWpmForLesson(lesson.id);
    if (wpm === null) return [];
    return [
      {
        id: lesson.id,
        titleKey: lesson.titleKey,
        wpm,
        accuracy: getBestAccuracyForLesson(lesson.id) ?? 0,
        grade: getHighestGradeForLesson(lesson.id),
      },
    ];
  });
}

function pickLowestWpm(rows: LessonInsight[]): LessonInsight | null {
  if (rows.length === 0) return null;
  return rows.reduce((lowest, row) => (row.wpm < lowest.wpm ? row : lowest));
}

function pickLowestAccuracy(rows: LessonInsight[]): LessonInsight | null {
  if (rows.length === 0) return null;
  return rows.reduce((lowest, row) => (row.accuracy < lowest.accuracy ? row : lowest));
}

/** Aggregates lesson + heatmap data for actionable stats insights. */
export function computeStatsInsights(): StatsInsights {
  const lessonRows = buildLessonInsightRows();
  const lowestWpmLesson = pickLowestWpm(lessonRows);
  const lowestAccuracyLesson = pickLowestAccuracy(lessonRows);
  const troubleKeys = getTroubleKeysFromHeatmap();
  const maxFromLessons = lessonRows.reduce((max, row) => Math.max(max, row.wpm), 0);
  const maxWpmOverall = Math.max(getAggregateStats().bestWpm, maxFromLessons, 1);
  const suggestedAction = troubleKeys.length > 0 ? 'adaptive' : 'retry';

  return {
    lessonRows: [...lessonRows].sort((a, b) => b.wpm - a.wpm),
    lowestWpmLesson,
    lowestAccuracyLesson,
    troubleKeys,
    maxWpmOverall,
    suggestedAction,
    retryLessonId: lowestWpmLesson?.id ?? null,
  };
}
