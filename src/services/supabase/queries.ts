import { getSupabaseClient } from '@/lib/supabaseClient';
import { getAuthUser, getAuthSessionUserSync } from '@/services/supabase/authSession';
import {
  getCachedQuery,
  setCachedQuery,
  QUERY_CACHE_KEYS,
} from '@/services/supabase/queryCache';
import {
  flattenProfileQueryRow,
  PROFILE_WITH_RELATIONS_SELECT,
  type ProfileQueryRow,
  type UserProfileRow,
} from '@/services/supabase/profileRow';
import { ACHIEVEMENT_CATALOG } from '@/utils/achievements/catalogData';
import type { UserAchievementProgress } from '@/utils/achievements/catalogTypes';
import {
  parseCloudKeystrokeLog,
  parseCloudTroubleKeys,
} from '@/utils/history/sessionTelemetry';
import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';

/** Columns for list/history views — excludes heavy telemetry JSONB. */
const SESSION_LIST_SELECT =
  'id,user_id,lesson_id,wpm,accuracy,stars,mode,created_at,grade,score,max_combo,race_source,song_title,race_modifiers';

async function resolveUserId(): Promise<string | null> {
  return getAuthSessionUserSync()?.id ?? (await getAuthUser())?.id ?? null;
}

export async function fetchUserSessions(limit = 50) {
  const userId = await resolveUserId();
  if (!userId) return [];

  const cacheKey = QUERY_CACHE_KEYS.sessions(limit);
  const cached = getCachedQuery<Awaited<ReturnType<typeof fetchUserSessions>>>(cacheKey, userId);
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('typing_sessions')
    .select(SESSION_LIST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[supabase] fetch sessions failed:', error.message);
    return [];
  }

  const rows = data ?? [];
  setCachedQuery(cacheKey, userId, rows);
  return rows;
}

export interface TypingSessionRow {
  id: string;
  user_id: string;
  lesson_id: string;
  wpm: number;
  accuracy: number;
  stars: number;
  mode: string;
  created_at: string;
  grade?: string | null;
  score?: number | null;
  max_combo?: number | null;
  race_source?: string | null;
  song_title?: string | null;
  race_modifiers?: string[] | null;
}

export interface PaginatedSessionsResult {
  sessions: TypingSessionRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchUserSessionsPage(
  page: number,
  pageSize = 10,
): Promise<PaginatedSessionsResult> {
  const empty = { sessions: [], total: 0, page, pageSize };
  const userId = await resolveUserId();
  if (!userId) return empty;

  const cacheKey = QUERY_CACHE_KEYS.sessionsPage(page, pageSize);
  const cached = getCachedQuery<PaginatedSessionsResult>(cacheKey, userId);
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (!supabase) return empty;

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('typing_sessions')
    .select(SESSION_LIST_SELECT, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.warn('[supabase] fetch sessions page failed:', error.message);
    return empty;
  }

  const result: PaginatedSessionsResult = {
    sessions: (data ?? []) as TypingSessionRow[],
    total: count ?? 0,
    page,
    pageSize,
  };

  setCachedQuery(cacheKey, userId, result, 60_000);
  return result;
}

export interface SessionTelemetryData {
  keystrokeLog: KeystrokeLogEntry[];
  consistency: number | null;
  troubleKeys: string[];
}

export async function fetchSessionTelemetry(sessionId: string): Promise<SessionTelemetryData | null> {
  const userId = await resolveUserId();
  if (!userId) return null;

  const cacheKey = QUERY_CACHE_KEYS.sessionTelemetry(sessionId);
  const cached = getCachedQuery<SessionTelemetryData>(cacheKey, userId);
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('typing_sessions')
    .select('keystroke_log, consistency, trouble_keys')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[supabase] fetch session telemetry failed:', error.message);
    return null;
  }

  if (!data) return null;

  const result: SessionTelemetryData = {
    keystrokeLog: parseCloudKeystrokeLog(data.keystroke_log),
    consistency: data.consistency != null ? Number(data.consistency) : null,
    troubleKeys: parseCloudTroubleKeys(data.trouble_keys),
  };

  setCachedQuery(cacheKey, userId, result, 60_000);
  return result;
}

export async function fetchUserKeyErrors() {
  const userId = await resolveUserId();
  if (!userId) return [];

  const cached = getCachedQuery<Awaited<ReturnType<typeof fetchUserKeyErrors>>>(
    QUERY_CACHE_KEYS.keyErrors,
    userId,
  );
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('key_errors')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.warn('[supabase] fetch key_errors failed:', error.message);
    return [];
  }

  const rows = data ?? [];
  setCachedQuery(QUERY_CACHE_KEYS.keyErrors, userId, rows);
  return rows;
}

export async function fetchUserProfile(): Promise<UserProfileRow | null> {
  const userId = await resolveUserId();
  if (!userId) return null;

  const cached = getCachedQuery<UserProfileRow>(QUERY_CACHE_KEYS.profile, userId);
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_WITH_RELATIONS_SELECT)
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('[supabase] fetch profile failed:', error.message);
    return null;
  }

  const profile = flattenProfileQueryRow(data as ProfileQueryRow);
  setCachedQuery(QUERY_CACHE_KEYS.profile, userId, profile);
  return profile;
}

/** All session timestamps for streak calculation (source of truth). Paginates past the default row cap. */
export async function fetchUserSessionTimestamps(): Promise<string[]> {
  const userId = await resolveUserId();
  if (!userId) return [];

  const cached = getCachedQuery<string[]>(QUERY_CACHE_KEYS.sessionTimestamps, userId);
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const PAGE = 1000;
  const timestamps: string[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('typing_sessions')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);

    if (error) {
      console.warn('[supabase] fetch session timestamps failed:', error.message);
      break;
    }

    if (!data?.length) break;

    timestamps.push(...data.map((row) => row.created_at as string));
    if (data.length < PAGE) break;
    from += PAGE;
  }

  setCachedQuery(QUERY_CACHE_KEYS.sessionTimestamps, userId, timestamps);
  return timestamps;
}

export interface SessionSummaryRow {
  lesson_id: string;
  wpm: number;
  accuracy: number;
  max_combo?: number;
  grade?: string | null;
  created_at?: string;
}

/** All sessions (paginated) for badge evaluation. */
export async function fetchAllUserSessionSummaries(): Promise<SessionSummaryRow[]> {
  const userId = await resolveUserId();
  if (!userId) return [];

  const cached = getCachedQuery<SessionSummaryRow[]>(
    QUERY_CACHE_KEYS.sessionSummaries,
    userId,
  );
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const PAGE = 1000;
  const rows: SessionSummaryRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('typing_sessions')
      .select('lesson_id, wpm, accuracy, max_combo, grade, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);

    if (error) {
      console.warn('[supabase] fetch session summaries failed:', error.message);
      break;
    }

    if (!data?.length) break;

    rows.push(
      ...data.map((row) => ({
        lesson_id: row.lesson_id as string,
        wpm: row.wpm as number,
        accuracy: Number(row.accuracy),
        max_combo: (row.max_combo as number | null) ?? undefined,
        grade: (row.grade as string | null) ?? undefined,
        created_at: row.created_at as string | undefined,
      })),
    );

    if (data.length < PAGE) break;
    from += PAGE;
  }

  setCachedQuery(QUERY_CACHE_KEYS.sessionSummaries, userId, rows);
  return rows;
}

export interface LessonMasteryRow {
  lesson_id: string;
  mastery_xp: number;
  best_wpm: number;
  best_accuracy: number;
  highest_grade: string | null;
  highest_score: number;
  best_test_wpm: number;
  best_test_accuracy: number;
  best_test_grade: string | null;
  test_attempts: number;
}

/** Per-lesson mastery XP stored in Supabase (source of truth when signed in). */
export async function fetchUserLessonMastery(): Promise<LessonMasteryRow[]> {
  const userId = await resolveUserId();
  if (!userId) return [];

  const cached = getCachedQuery<LessonMasteryRow[]>(QUERY_CACHE_KEYS.lessonMastery, userId);
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('user_lesson_mastery')
      .select(
        'lesson_id, mastery_xp, best_wpm, best_accuracy, highest_grade, highest_score, best_test_wpm, best_test_accuracy, best_test_grade, test_attempts',
      )
      .eq('user_id', userId);

    if (error) {
      console.warn('[supabase] fetch lesson mastery failed:', error.message);
      return [];
    }

    const rows = (data ?? []).map((row) => ({
      lesson_id: row.lesson_id as string,
      mastery_xp: row.mastery_xp as number,
      best_wpm: (row.best_wpm as number) ?? 0,
      best_accuracy: Number(row.best_accuracy ?? 0),
      highest_grade: (row.highest_grade as string | null) ?? null,
      highest_score: (row.highest_score as number) ?? 0,
      best_test_wpm: (row.best_test_wpm as number) ?? 0,
      best_test_accuracy: Number(row.best_test_accuracy ?? 0),
      best_test_grade: (row.best_test_grade as string | null) ?? null,
      test_attempts: (row.test_attempts as number) ?? 0,
    }));
    setCachedQuery(QUERY_CACHE_KEYS.lessonMastery, userId, rows);
    return rows;
  } catch (error) {
    console.warn('[supabase] fetch lesson mastery failed:', error);
    return [];
  }
}

/** Per-user achievement progress stored in Supabase (source of truth when signed in). */
export async function fetchUserAchievements(userId?: string): Promise<UserAchievementProgress[]> {
  const resolvedUserId = userId ?? (await resolveUserId());
  if (!resolvedUserId) return [];

  const cacheKey = QUERY_CACHE_KEYS.achievements;
  const cached = getCachedQuery<UserAchievementProgress[]>(cacheKey, resolvedUserId);
  if (cached) return cached;

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id, current_progress, unlocked_at')
    .eq('user_id', resolvedUserId);

  if (error) {
    console.warn('[supabase] fetch user achievements failed:', error.message);
    return [];
  }

  const rows = (data ?? []).map((row) => {
    const achievementId = row.achievement_id as number;
    const catalog = ACHIEVEMENT_CATALOG.find((item) => item.id === achievementId);
    return {
      achievementId,
      slug: catalog?.slug ?? String(achievementId),
      currentProgress: row.current_progress as number,
      unlockedAt: (row.unlocked_at as string | null) ?? null,
    };
  });

  setCachedQuery(cacheKey, resolvedUserId, rows);
  return rows;
}

/** Seeds query caches after a full cloud hydration pass (fetch once, read anywhere). */
export function primeUserProgressCaches(
  userId: string,
  payload: {
    profile: UserProfileRow | null;
    sessions: Awaited<ReturnType<typeof fetchUserSessions>>;
    keyErrors: Awaited<ReturnType<typeof fetchUserKeyErrors>>;
    timestamps: string[];
    masteryRows: LessonMasteryRow[];
    achievementRows: UserAchievementProgress[];
    sessionsLimit?: number;
  },
): void {
  if (payload.profile) {
    primeUserProfileCache(userId, payload.profile);
  }
  setCachedQuery(QUERY_CACHE_KEYS.sessions(payload.sessionsLimit ?? 100), userId, payload.sessions);
  setCachedQuery(QUERY_CACHE_KEYS.keyErrors, userId, payload.keyErrors);
  setCachedQuery(QUERY_CACHE_KEYS.sessionTimestamps, userId, payload.timestamps);
  setCachedQuery(QUERY_CACHE_KEYS.lessonMastery, userId, payload.masteryRows);
  setCachedQuery(QUERY_CACHE_KEYS.achievements, userId, payload.achievementRows);
}

/** Seeds the profile cache after a full cloud load (avoids duplicate select on restore). */
export function primeUserProfileCache(userId: string, profile: UserProfileRow): void {
  setCachedQuery(QUERY_CACHE_KEYS.profile, userId, profile);
}
