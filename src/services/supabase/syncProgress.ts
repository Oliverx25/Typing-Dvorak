import { getSupabaseClient } from '../../lib/supabaseClient';
import type { SessionRecord } from '../../utils/storage';
import { calculateStars } from '../../utils/stars';
import { getKeyStats } from '../../utils/keyStats';

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
    mode: record.mode,
  });

  if (error) console.warn('[sync] session insert failed:', error.message);
}

/** Upserts aggregated key errors from local heatmap data. */
export async function syncKeyErrorsToCloud(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const stats = getKeyStats();
  const rows = Object.entries(stats.misses).map(([code, count]) => ({
    user_id: userId,
    key_char: code.slice(-1),
    error_count: count,
  }));

  if (rows.length === 0) return;

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
    mode: r.mode,
    created_at: r.completedAt,
  }));

  const { error } = await supabase.from('typing_sessions').insert(payload);
  if (error) {
    console.warn('[sync] migration failed:', error.message);
    return 0;
  }
  return payload.length;
}
