import { getSupabaseClient } from '../../lib/supabaseClient';
import {
  flattenProfileQueryRow,
  PROFILE_WITH_RELATIONS_SELECT,
  type ProfileQueryRow,
  type UserProfileRow,
} from './profileRow';

export async function fetchUserSessions(limit = 50) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('typing_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[supabase] fetch sessions failed:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchUserKeyErrors() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('key_errors')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.warn('[supabase] fetch key_errors failed:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchUserProfile(): Promise<UserProfileRow | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_WITH_RELATIONS_SELECT)
    .eq('id', user.id)
    .single();

  if (error) {
    console.warn('[supabase] fetch profile failed:', error.message);
    return null;
  }
  return flattenProfileQueryRow(data as ProfileQueryRow);
}

/** All session timestamps for streak calculation (source of truth). Paginates past the default row cap. */
export async function fetchUserSessionTimestamps(): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const PAGE = 1000;
  const timestamps: string[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('typing_sessions')
      .select('created_at')
      .eq('user_id', user.id)
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

  return timestamps;
}

export interface SessionSummaryRow {
  lesson_id: string;
  wpm: number;
  accuracy: number;
  max_combo?: number;
  created_at?: string;
}

/** All sessions (paginated) for badge evaluation. */
export async function fetchAllUserSessionSummaries(): Promise<SessionSummaryRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const PAGE = 1000;
  const rows: SessionSummaryRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('typing_sessions')
      .select('lesson_id, wpm, accuracy, max_combo, created_at')
      .eq('user_id', user.id)
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
        created_at: row.created_at as string | undefined,
      })),
    );

    if (data.length < PAGE) break;
    from += PAGE;
  }

  return rows;
}
