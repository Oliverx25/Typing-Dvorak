import { bestGrade } from '@/utils/grading';
import { STORAGE_KEYS } from '@/utils/progress/keys';
import { readJson, writeJson } from '@/utils/progress/localStorage';
import {
  getSessionHistory,
  getProgress,
  type SessionRecord,
  type UserProgress,
  type LessonProgress,
} from '@/utils/progress/storage';
import { mergeLessonProgressEntries } from '@/utils/progress/lessonProgressAggregate';
import { isLegacyLessonId, resolveLessonId } from '@/utils/progress/legacyLessonIds';

function mergeLessonProgress(
  target: LessonProgress | undefined,
  source: LessonProgress,
): LessonProgress {
  return mergeLessonProgressEntries(target, source) ?? source;
}

function remapSessionRecord(session: SessionRecord): SessionRecord {
  const newId = resolveLessonId(session.lessonId);
  if (newId === session.lessonId) return session;
  return { ...session, lessonId: newId };
}

function remapProgressLessons(
  lessons: Record<string, LessonProgress>,
): Record<string, LessonProgress> {
  const remapped: Record<string, LessonProgress> = {};

  for (const [lessonId, progress] of Object.entries(lessons)) {
    const newId = resolveLessonId(lessonId);
    remapped[newId] = mergeLessonProgress(remapped[newId], progress);
  }

  return remapped;
}

function historyHasLegacyIds(history: SessionRecord[]): boolean {
  return history.some((session) => isLegacyLessonId(session.lessonId));
}

function progressHasLegacyIds(progress: UserProgress): boolean {
  return Object.keys(progress.lessons).some(isLegacyLessonId);
}

/**
 * Remaps legacy lesson IDs in local progress to the new ergonomic curriculum.
 * Merges stats when both old and new IDs exist. Removes orphan legacy keys.
 * Returns true when any data was changed.
 */
export function migrateLegacyProgress(): boolean {
  const history = getSessionHistory();
  const progress = getProgress();

  const needsHistory = historyHasLegacyIds(history);
  const needsProgress = progressHasLegacyIds(progress);

  if (!needsHistory && !needsProgress) return false;

  const remappedHistory = history.map(remapSessionRecord);
  const remappedProgress: UserProgress = {
    ...progress,
    lessons: remapProgressLessons(progress.lessons),
  };

  writeJson(STORAGE_KEYS.history, remappedHistory);
  writeJson(STORAGE_KEYS.progress, remappedProgress);
  writeJson(STORAGE_KEYS.legacyLessonsMigrated, true);

  return true;
}

export function wasLegacyProgressMigrated(): boolean {
  return readJson(STORAGE_KEYS.legacyLessonsMigrated, false);
}

/** Remap cloud session rows before building local progress. */
export function remapCloudSessionRows<T extends { lesson_id: string }>(rows: T[]): T[] {
  return rows.map((row) => {
    const newId = resolveLessonId(row.lesson_id);
    if (newId === row.lesson_id) return row;
    return { ...row, lesson_id: newId };
  });
}

/** Remap cloud mastery rows, merging duplicates that map to the same new ID. */
export function remapCloudMasteryRows<T extends { lesson_id: string; mastery_xp: number }>(
  rows: T[],
): T[] {
  const byId = new Map<string, T>();

  for (const row of rows) {
    const newId = resolveLessonId(row.lesson_id);
    const existing = byId.get(newId);
    if (!existing) {
      byId.set(newId, { ...row, lesson_id: newId });
      continue;
    }
    byId.set(newId, {
      ...existing,
      ...row,
      lesson_id: newId,
      mastery_xp: Math.max(existing.mastery_xp ?? 0, row.mastery_xp ?? 0),
    });
  }

  return [...byId.values()];
}
