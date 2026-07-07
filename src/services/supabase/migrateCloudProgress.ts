import { getSupabaseClient } from '@/lib/supabaseClient';
import { LEGACY_LESSON_ID_MAP } from '@/utils/progress/legacyLessonIds';
import { readJson, writeJson } from '@/utils/progress/localStorage';
import { STORAGE_KEYS } from '@/utils/progress/keys';
import { safeAsyncVoid } from '@/utils/network/graceful';

/**
 * Rewrites legacy lesson_id values in Supabase for the signed-in user.
 * Runs once per account (flagged in localStorage).
 */
export async function migrateCloudLegacyLessonIds(userId: string): Promise<void> {
  if (readJson(STORAGE_KEYS.cloudLegacyLessonsMigrated, false)) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    for (const [oldId, newId] of Object.entries(LEGACY_LESSON_ID_MAP)) {
      const { error: sessionError } = await supabase
        .from('typing_sessions')
        .update({ lesson_id: newId })
        .eq('user_id', userId)
        .eq('lesson_id', oldId);

      if (sessionError) {
        console.warn(`[migrate] sessions ${oldId}→${newId}:`, sessionError.message);
      }

      const { data: oldMastery } = await supabase
        .from('user_lesson_mastery')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', oldId)
        .maybeSingle();

      if (!oldMastery) continue;

      const { data: newMastery } = await supabase
        .from('user_lesson_mastery')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', newId)
        .maybeSingle();

      if (newMastery) {
        await supabase.from('user_lesson_mastery').upsert(
          {
            user_id: userId,
            lesson_id: newId,
            mastery_xp: Math.max(oldMastery.mastery_xp ?? 0, newMastery.mastery_xp ?? 0),
            best_wpm: Math.max(oldMastery.best_wpm ?? 0, newMastery.best_wpm ?? 0),
            best_accuracy: Math.max(
              Number(oldMastery.best_accuracy ?? 0),
              Number(newMastery.best_accuracy ?? 0),
            ),
            highest_score: Math.max(oldMastery.highest_score ?? 0, newMastery.highest_score ?? 0),
            test_attempts: Math.max(oldMastery.test_attempts ?? 0, newMastery.test_attempts ?? 0),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' },
        );
      } else {
        await supabase
          .from('user_lesson_mastery')
          .update({ lesson_id: newId })
          .eq('user_id', userId)
          .eq('lesson_id', oldId);
      }

      if (newMastery) {
        await supabase
          .from('user_lesson_mastery')
          .delete()
          .eq('user_id', userId)
          .eq('lesson_id', oldId);
      }
    }

    writeJson(STORAGE_KEYS.cloudLegacyLessonsMigrated, true);
  } catch (error) {
    console.warn('[migrate] cloud legacy lesson ids failed:', error);
  }
}

/** Fire-and-forget cloud migration after login. */
export function scheduleCloudLegacyMigration(userId: string): void {
  safeAsyncVoid('cloud legacy lesson migration', () => migrateCloudLegacyLessonIds(userId));
}
