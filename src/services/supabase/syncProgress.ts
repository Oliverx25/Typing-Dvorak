import { getSupabaseClient } from '@/lib/supabaseClient';
import type { SessionRecord } from '@/utils/progress/storage';
import { getMasteryXpForLesson } from '@/utils/progress/storage';
import { calculateStars } from '@/utils/curriculum/stars';
import { calculateGrade } from '@/utils/grading';
import { getKeyStats } from '@/utils/stats/keyStats';
import { collectPracticeDates, computeStreakFromPracticeDates, type StreakResult } from '@/utils/progress/streak';
import { fetchUserSessionTimestamps } from '@/services/supabase/queries';
import { safeAsyncVoid } from '@/utils/network/graceful';

/** Writes computed streak fields to user_stats (cache for quick reads). */
export async function updateProfileStreak(
  userId: string,
  { streak, lastPracticeDate }: StreakResult,
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
      .from('user_stats')
      .upsert(
        {
          user_id: userId,
          current_day_streak: streak,
          last_practice_date: lastPracticeDate,
        },
        { onConflict: 'user_id' },
      );

    if (error) console.warn('[sync] user_stats streak update failed:', error.message);
  } catch (error) {
    console.warn('[sync] user_stats streak update failed:', error);
  }
}

/** Recompute streak from all cloud sessions and persist to user_stats. */
export async function syncStreakToProfile(userId: string): Promise<StreakResult> {
  const timestamps = await fetchUserSessionTimestamps();
  const result = computeStreakFromPracticeDates(collectPracticeDates(timestamps));
  await updateProfileStreak(userId, result);
  return result;
}

/** Persists per-lesson mastery XP to Supabase (source of truth for signed-in users). */
export async function syncLessonMasteryToCloud(
  userId: string,
  lessonId: string,
  masteryXp: number,
): Promise<void> {
  if (lessonId === 'multiplayer' || masteryXp <= 0) return;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from('user_lesson_mastery').upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        mastery_xp: masteryXp,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' },
    );

    if (error) console.warn('[sync] lesson mastery upsert failed:', error.message);
  } catch (error) {
    console.warn('[sync] lesson mastery upsert failed:', error);
  }
}

/** Persists a session to Supabase. No-op when unauthenticated or offline. */
export async function syncSessionToCloud(userId: string, record: SessionRecord): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from('typing_sessions').insert({
      user_id: userId,
      lesson_id: record.lessonId,
      wpm: record.wpm,
      accuracy: record.accuracy,
      stars: calculateStars(record.accuracy, record.wpm),
      grade: record.grade ?? calculateGrade(record.accuracy),
      score: record.score ?? 0,
      max_wpm: record.wpm,
      mode: record.mode,
      max_combo: record.maxCombo ?? 0,
      race_source: record.multiplayerSource ?? null,
      song_title: record.songTitle ?? null,
      race_modifiers: record.raceModifiers ?? [],
    });

    if (error) {
      console.warn('[sync] session insert failed:', error.message);
      return;
    }

    await syncStreakToProfile(userId);
    await syncLessonMasteryToCloud(userId, record.lessonId, getMasteryXpForLesson(record.lessonId));
  } catch (error) {
    console.warn('[sync] session insert failed:', error);
  }
}

/** Upserts aggregated key stats (hits + errors) from local heatmap data. */
export async function syncKeyErrorsToCloud(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const stats = getKeyStats();
    const codes = new Set([...Object.keys(stats.hits), ...Object.keys(stats.misses)]);
    if (codes.size === 0) return;

    const rows = [...codes].map((code) => ({
      user_id: userId,
      key_char: code.slice(-1),
      hit_count: stats.hits[code] ?? 0,
      error_count: stats.misses[code] ?? 0,
    }));

    for (const row of rows) {
      const { error } = await supabase.from('key_errors').upsert(row, {
        onConflict: 'user_id,key_char',
      });
      if (error) console.warn('[sync] key_errors upsert failed:', error.message);
    }
  } catch (error) {
    console.warn('[sync] key_errors upsert failed:', error);
  }
}

/** One-time migration: push local session history after first login. */
export async function migrateLocalSessionsToCloud(userId: string, history: SessionRecord[]): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase || history.length === 0) return 0;

    const payload = history.map((r) => ({
      user_id: userId,
      lesson_id: r.lessonId,
      wpm: r.wpm,
      accuracy: r.accuracy,
      stars: calculateStars(r.accuracy, r.wpm),
      grade: r.grade ?? calculateGrade(r.accuracy),
      score: r.score ?? 0,
      max_wpm: r.wpm,
      mode: r.mode,
      max_combo: r.maxCombo ?? 0,
      race_source: r.multiplayerSource ?? null,
      song_title: r.songTitle ?? null,
      race_modifiers: r.raceModifiers ?? [],
      created_at: r.completedAt,
    }));

    const { error } = await supabase.from('typing_sessions').insert(payload);
    if (error) {
      console.warn('[sync] migration failed:', error.message);
      return 0;
    }

    await syncStreakToProfile(userId);
    return payload.length;
  } catch (error) {
    console.warn('[sync] migration failed:', error);
    return 0;
  }
}

/** Fire-and-forget background sync helpers for UI event handlers. */
export function scheduleSessionCloudSync(userId: string, record: SessionRecord): void {
  safeAsyncVoid('session cloud sync', () => syncSessionToCloud(userId, record));
}

export function scheduleKeyErrorsCloudSync(userId: string): void {
  safeAsyncVoid('key errors cloud sync', () => syncKeyErrorsToCloud(userId));
}
