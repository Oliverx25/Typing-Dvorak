import type { Locale } from '@/i18n';
import type { PracticeMode } from '@/utils/app/settings';
import type { MultiplayerPrivacy } from '@/utils/user/multiplayerPrivacy';

/** Identity fields stored on profiles. */
export interface ProfileIdentityRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  avatar_custom: boolean;
  display_name: string | null;
  display_name_custom?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** App preferences — 1:1 with profiles via user_settings.user_id. */
export interface UserSettingsRow {
  user_id: string;
  locale?: Locale | null;
  multiplayer_privacy?: MultiplayerPrivacy;
  zen_mode_enabled?: boolean;
  ghost_mode_enabled?: boolean;
  pacer_enabled?: boolean;
  pacer_target_wpm?: number;
  sound_enabled?: boolean;
  blind_mode_enabled?: boolean;
  finger_colors_enabled?: boolean;
  practice_mode?: PracticeMode | string | null;
  highlight_theme?: string | null;
  theme?: string | null;
  updated_at?: string;
}

/** Aggregated stats + streak cache — user_stats.user_id. */
export interface UserStatsRow {
  user_id: string;
  total_sessions_played?: number;
  total_perfect_sessions?: number;
  highest_wpm_ever?: number;
  highest_combo_ever?: number;
  current_day_streak?: number;
  last_practice_date?: string | null;
  total_multiplayer_matches?: number;
  total_multiplayer_wins?: number;
  updated_at?: string;
}

/** Flat profile shape consumed by UI (identity + settings + streak). */
export interface UserProfileRow extends ProfileIdentityRow {
  locale?: Locale | null;
  multiplayer_privacy?: MultiplayerPrivacy;
  current_streak: number;
  last_practice_date: string | null;
  zen_mode_enabled?: boolean;
  ghost_mode_enabled?: boolean;
  pacer_enabled?: boolean;
  pacer_target_wpm?: number;
  sound_enabled?: boolean;
  blind_mode_enabled?: boolean;
  finger_colors_enabled?: boolean;
  practice_mode?: PracticeMode;
  highlight_theme?: string;
  theme?: 'light' | 'dark';
}

export type ProfileQueryRow = ProfileIdentityRow & {
  user_settings?: UserSettingsRow | UserSettingsRow[] | null;
  user_stats?: UserStatsRow | UserStatsRow[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/** Merge nested Supabase join into the flat UserProfileRow used by the app. */
export function flattenProfileQueryRow(row: ProfileQueryRow): UserProfileRow {
  const settings = firstRelation(row.user_settings);
  const stats = firstRelation(row.user_stats);

  return {
    id: row.id,
    username: row.username,
    avatar_url: row.avatar_url,
    avatar_custom: row.avatar_custom,
    display_name: row.display_name,
    display_name_custom: row.display_name_custom,
    created_at: row.created_at,
    updated_at: row.updated_at,
    locale: settings?.locale ?? null,
    multiplayer_privacy: settings?.multiplayer_privacy,
    zen_mode_enabled: settings?.zen_mode_enabled,
    ghost_mode_enabled: settings?.ghost_mode_enabled,
    pacer_enabled: settings?.pacer_enabled,
    pacer_target_wpm: settings?.pacer_target_wpm,
    sound_enabled: settings?.sound_enabled,
    blind_mode_enabled: settings?.blind_mode_enabled,
    finger_colors_enabled: settings?.finger_colors_enabled,
    practice_mode: settings?.practice_mode as PracticeMode | undefined,
    highlight_theme: settings?.highlight_theme ?? undefined,
    theme: settings?.theme as 'light' | 'dark' | undefined,
    current_streak: stats?.current_day_streak ?? 0,
    last_practice_date: stats?.last_practice_date ?? null,
  };
}

export const PROFILE_WITH_RELATIONS_SELECT =
  '*, user_settings(*), user_stats(*)';
