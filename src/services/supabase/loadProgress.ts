import { getSupabaseClient } from '@/lib/supabaseClient';
import { fetchUserProfile, fetchUserKeyErrors, fetchUserSessions, fetchUserSessionTimestamps, fetchAllUserSessionSummaries } from './queries';
import type { SessionRecord, UserProgress, LessonProgress } from '@/utils/progress/storage';
import { replaceLocalProgress } from '@/utils/progress/storage';
import { replaceKeyStats, type KeyStatsData } from '@/utils/stats/keyStats';
import { charToKeyCode } from '@/utils/keyboard/dvorak';
import { getLessonById } from '@/utils/curriculum/lessons';
import type { Locale } from '@/i18n';
import type { AppSettings, PracticeMode } from '@/utils/app/settings';
import { getSettings, saveSettings } from '@/utils/app/settings';
import { appPreferencesFromUserSettings } from '@/utils/app/settingsSync';
import { dispatchSessionComplete, dispatchKeyStatsUpdated, dispatchProfilePreferencesSynced } from '@/utils/app/events';
import { applyHighlightTheme } from '@/utils/app/highlightTheme';
import { setStoredTheme } from '@/utils/progress/storage';
import { collectPracticeDates, computeStreakFromPracticeDates } from '@/utils/progress/streak';
import { updateProfileStreak } from './syncProgress';
import { syncBadgesFromSessionRows } from './syncBadges';
import type { UserProfileRow } from './profileRow';

export type { UserProfileRow } from './profileRow';

function mapSessionRow(row: {
  lesson_id: string;
  wpm: number;
  accuracy: number;
  mode: string;
  created_at: string;
}): SessionRecord {
  const lesson = getLessonById(row.lesson_id);
  return {
    lessonId: row.lesson_id,
    lessonTitle: lesson?.titleKey ?? row.lesson_id,
    wpm: row.wpm,
    accuracy: Number(row.accuracy),
    elapsedSeconds: 0,
    mode: (row.mode === 'test' ? 'test' : 'practice') as PracticeMode,
    completedAt: row.created_at,
  };
}

function buildProgressFromSessions(
  sessions: SessionRecord[],
  streakResult: { streak: number; lastPracticeDate: string | null },
): UserProgress {
  const lessons: Record<string, LessonProgress> = {};

  for (const session of sessions) {
    const existing = lessons[session.lessonId];
    lessons[session.lessonId] = {
      bestWpm: Math.max(existing?.bestWpm ?? 0, session.wpm),
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, session.accuracy),
      attempts: (existing?.attempts ?? 0) + 1,
      lastPlayedAt:
        !existing || session.completedAt > existing.lastPlayedAt
          ? session.completedAt
          : existing.lastPlayedAt,
    };
  }

  return {
    lessons,
    streak: streakResult.streak,
    lastPracticeDate: streakResult.lastPracticeDate,
  };
}

function mapKeyErrors(rows: { key_char: string; error_count: number }[]): KeyStatsData {
  const misses: Record<string, number> = {};
  for (const row of rows) {
    const code = charToKeyCode(row.key_char) ?? row.key_char;
    misses[code] = row.error_count;
  }
  return { hits: {}, misses };
}

/** Replace local progress with this account's cloud data. Call after clearing guest keys. */
export async function loadProgressFromCloud(): Promise<UserProfileRow | null> {
  const supabase = getSupabaseClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const [sessions, keyErrors, profile, timestamps] = await Promise.all([
    fetchUserSessions(100),
    fetchUserKeyErrors(),
    fetchUserProfile(),
    fetchUserSessionTimestamps(),
  ]);

  const streakResult = computeStreakFromPracticeDates(collectPracticeDates(timestamps));
  const history = sessions.map(mapSessionRow);
  const progress = buildProgressFromSessions(history, streakResult);
  replaceLocalProgress(history, progress);
  replaceKeyStats(mapKeyErrors(keyErrors));

  if (user) {
    await updateProfileStreak(user.id, streakResult);
    const sessionSummaries = await fetchAllUserSessionSummaries();
    await syncBadgesFromSessionRows(user.id, sessionSummaries, streakResult.streak);
  }

  dispatchSessionComplete();
  dispatchKeyStatsUpdated();

  if (profile && user) {
    return {
      ...profile,
      current_streak: streakResult.streak,
      last_practice_date: streakResult.lastPracticeDate,
    };
  }

  return profile;
}

/** Sync all app settings + theme from profile to local storage after login. */
export async function restoreProfilePreferencesFromProfile(): Promise<void> {
  const profile = await fetchUserProfile();
  if (!profile) return;

  const { settings, theme } = appPreferencesFromUserSettings(profile);
  if (Object.keys(settings).length === 0 && !theme) return;

  if (Object.keys(settings).length > 0) {
    saveSettings(settings);
    if (settings.locale) document.documentElement.lang = settings.locale;
  }

  if (theme) {
    setStoredTheme(theme);
    const merged = getSettings();
    applyHighlightTheme(merged.highlightTheme, theme);
  }

  dispatchProfilePreferencesSynced();
}

/** Re-apply profile display name to auth metadata after OAuth sign-in overwrites it. */
export async function restoreProfileDisplayFromProfile(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const profile = await fetchUserProfile();
  const dbName = profile?.display_name?.trim();
  if (!dbName) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const meta = user.user_metadata ?? {};
  if (meta.full_name === dbName && meta.display_name_custom === true) return;

  await supabase.auth.updateUser({
    data: {
      full_name: dbName,
      display_name: dbName,
      display_name_custom: true,
    },
  });
}

/** Re-apply custom avatar to auth metadata after OAuth sign-in overwrites it. */
export async function restoreCustomAvatarFromProfile(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const profile = await fetchUserProfile();
  if (!profile?.avatar_custom || !profile.avatar_url) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const meta = user.user_metadata ?? {};
  if (meta.avatar_custom === true && meta.avatar_url === profile.avatar_url) return;

  await supabase.auth.updateUser({
    data: {
      avatar_url: profile.avatar_url,
      avatar_custom: true,
    },
  });
}
