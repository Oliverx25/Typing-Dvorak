import { getSupabaseClient } from '../../lib/supabaseClient';
import type { SessionRecord } from '../../utils/progress/storage';
import { calculateStars } from '../../utils/curriculum/stars';
import { calculateGrade } from '../../utils/grading';
import { getKeyStats } from '../../utils/stats/keyStats';
import { collectPracticeDates, computeStreakFromPracticeDates, type StreakResult } from '../../utils/progress/streak';
import { fetchUserSessionTimestamps } from './queries';

/** Writes computed streak fields to user_stats (cache for quick reads). */
export async function updateProfileStreak(
  userId: string,
  { streak, lastPracticeDate }: StreakResult,
): Promise<void> {
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
}

/** Recompute streak from all cloud sessions and persist to user_stats. */
export async function syncStreakToProfile(userId: string): Promise<StreakResult> {
  const timestamps = await fetchUserSessionTimestamps();
  const result = computeStreakFromPracticeDates(collectPracticeDates(timestamps));
  await updateProfileStreak(userId, result);
  return result;
}

/** Persists a session to Supabase. No-op when unauthenticated or offline. */
export async function syncSessionToCloud(userId: string, record: SessionRecord): Promise<void> {
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
}

/** Upserts aggregated key stats (hits + errors) from local heatmap data. */
export async function syncKeyErrorsToCloud(userId: string): Promise<void> {
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
}

/** One-time migration: push local session history after first login. */
export async function migrateLocalSessionsToCloud(userId: string, history: SessionRecord[]): Promise<number> {
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
}
