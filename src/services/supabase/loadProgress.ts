import { getSupabaseClient } from '@/lib/supabaseClient';
import { fetchUserProfile, fetchUserKeyErrors, fetchUserSessions, fetchUserSessionTimestamps, fetchAllUserSessionSummaries, fetchUserLessonMastery } from './queries';
import type { SessionRecord, UserProgress, LessonProgress } from '@/utils/progress/storage';
import { replaceLocalProgress } from '@/utils/progress/storage';
import { replaceKeyStats, type KeyStatsData } from '@/utils/stats/keyStats';
import { charToKeyCode } from '@/utils/keyboard/dvorak';
import { getLessonById } from '@/utils/curriculum/lessons';
import type { RaceTextSource } from '@/utils/stats/sessionTypes';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig.types';
import type { PracticeMode } from '@/utils/app/settings';
import { calculateGrade, bestGrade } from '@/utils/grading';
import { parseStoredRaceModifiers } from '@/utils/stats/sessionDisplay';
import { getSettings, saveSettings } from '@/utils/app/settings';
import { appPreferencesFromUserSettings } from '@/utils/app/settingsSync';
import { dispatchSessionComplete, dispatchKeyStatsUpdated, dispatchProfilePreferencesSynced } from '@/utils/app/events';
import { applyHighlightTheme } from '@/utils/app/highlightTheme';
import { setStoredTheme } from '@/utils/progress/storage';
import { collectPracticeDates, computeStreakFromPracticeDates } from '@/utils/progress/streak';
import { updateProfileStreak } from './syncProgress';
import { syncBadgesFromSessionRows } from './syncBadges';
import type { LessonMasteryRow } from './queries';
export type { UserProfileRow } from './profileRow';

function mapSessionRow(row: {
  lesson_id: string;
  wpm: number;
  accuracy: number;
  mode: string;
  created_at: string;
  race_source?: string | null;
  song_title?: string | null;
  race_modifiers?: string[] | null;
  grade?: string | null;
  score?: number | null;
  max_combo?: number | null;
}): SessionRecord {
  const isMultiplayer = row.lesson_id === 'multiplayer';
  const lesson = isMultiplayer ? null : getLessonById(row.lesson_id);
  const raceSource = row.race_source as RaceTextSource | null | undefined;
  return {
    lessonId: row.lesson_id,
    lessonTitle: isMultiplayer ? 'multiplayer' : (lesson?.titleKey ?? row.lesson_id),
    wpm: row.wpm,
    accuracy: Number(row.accuracy),
    elapsedSeconds: 0,
    mode: (row.mode === 'test' ? 'test' : 'practice') as PracticeMode,
    completedAt: row.created_at,
    maxCombo: row.max_combo ?? undefined,
    grade: row.grade ?? calculateGrade(Number(row.accuracy)),
    score: row.score ?? undefined,
    multiplayerSource: raceSource ?? undefined,
    songTitle: row.song_title ?? undefined,
    raceModifiers: parseStoredRaceModifiers(row.race_modifiers),
  };
}

function buildProgressFromSessions(
  sessions: SessionRecord[],
  streakResult: { streak: number; lastPracticeDate: string | null },
): UserProgress {
  const lessons: Record<string, LessonProgress> = {};

  for (const session of sessions) {
    if (session.lessonId === 'multiplayer') continue;
    const existing = lessons[session.lessonId];
    lessons[session.lessonId] = {
      bestWpm: Math.max(existing?.bestWpm ?? 0, session.wpm),
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, session.accuracy),
      attempts: (existing?.attempts ?? 0) + 1,
      lastPlayedAt:
        !existing || session.completedAt > existing.lastPlayedAt
          ? session.completedAt
          : existing.lastPlayedAt,
      highestGrade: bestGrade(existing?.highestGrade, session.grade) ?? undefined,
      highestScore: Math.max(existing?.highestScore ?? 0, session.score ?? 0),
      maxWpm: Math.max(existing?.maxWpm ?? 0, session.wpm),
    };
  }

  return {
    lessons,
    streak: streakResult.streak,
    lastPracticeDate: streakResult.lastPracticeDate,
  };
}

function mergeMasteryIntoProgress(
  progress: UserProgress,
  masteryRows: LessonMasteryRow[],
): UserProgress {
  if (masteryRows.length === 0) return progress;

  const lessons = { ...progress.lessons };

  for (const row of masteryRows) {
    const existing = lessons[row.lesson_id];
    const masteryXp = Math.max(existing?.masteryXp ?? 0, row.mastery_xp);

    lessons[row.lesson_id] = {
      bestWpm: existing?.bestWpm ?? 0,
      bestAccuracy: existing?.bestAccuracy ?? 0,
      attempts: existing?.attempts ?? 0,
      lastPlayedAt: existing?.lastPlayedAt ?? '',
      highestGrade: existing?.highestGrade,
      highestScore: existing?.highestScore,
      maxWpm: existing?.maxWpm,
      masteryXp,
    };
  }

  return { ...progress, lessons };
}

function mapKeyErrors(rows: { key_char: string; error_count: number; hit_count?: number }[]): KeyStatsData {
  const hits: Record<string, number> = {};
  const misses: Record<string, number> = {};
  for (const row of rows) {
    const code = charToKeyCode(row.key_char) ?? row.key_char;
    const hitCount = row.hit_count ?? 0;
    const errorCount = row.error_count ?? 0;
    if (hitCount > 0) hits[code] = hitCount;
    if (errorCount > 0) misses[code] = errorCount;
  }
  return { hits, misses };
}

/** Replace local progress with this account's cloud data. Call after clearing guest keys. */
export async function loadProgressFromCloud(): Promise<UserProfileRow | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    const [sessions, keyErrors, profile, timestamps, masteryRows] = await Promise.all([
      fetchUserSessions(100),
      fetchUserKeyErrors(),
      fetchUserProfile(),
      fetchUserSessionTimestamps(),
      fetchUserLessonMastery(),
    ]);

    const streakResult = computeStreakFromPracticeDates(collectPracticeDates(timestamps));
    const history = sessions.map(mapSessionRow);
    const progress = mergeMasteryIntoProgress(
      buildProgressFromSessions(history, streakResult),
      masteryRows,
    );
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
  } catch (error) {
    console.warn('[load] cloud progress failed:', error);
    return null;
  }
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
