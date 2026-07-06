/** Static achievement tier labels stored in DB catalog. */
export type CatalogTier = 'bronce' | 'plata' | 'oro' | 'diamante' | 'especial';

export type CatalogCategory =
  | 'velocidad'
  | 'precision'
  | 'multijugador'
  | 'riesgo'
  | 'tecnica'
  | 'resistencia'
  | 'musica'
  | 'rangos';

/** Metric resolver key — maps catalog slug to evaluation logic. */
export type AchievementMetric =
  | 'session_max_wpm'
  | 'session_avg_wpm'
  | 'early_burst_wpm'
  | 'perfect_session_count'
  | 'max_combo'
  | 'consecutive_high_accuracy_sessions'
  | 'error_recovery_combo'
  | 'mp_wins'
  | 'mp_win_clutch'
  | 'mp_win_dominant'
  | 'mp_win_perfect_grade'
  | 'mp_win_streak'
  | 'mp_comeback_win'
  | 'mp_race_player_count'
  | 'mp_win_full_lobby'
  | 'mp_photo_finish_win'
  | 'modifier_sudden_death_win'
  | 'modifier_blind_high_accuracy'
  | 'modifier_strict_high_grade'
  | 'modifier_flashlight_complete'
  | 'modifier_vampire_survive'
  | 'modifier_double_time_grade'
  | 'modifier_rhythm_lock_perfect'
  | 'modifier_masocore'
  | 'left_hand_perfect'
  | 'right_hand_perfect'
  | 'dev_symbols_grade'
  | 'custom_code_grade'
  | 'day_streak'
  | 'total_sessions'
  | 'active_typing_minutes'
  | 'total_correct_keystrokes'
  | 'same_artist_song_plays'
  | 'song_languages_count'
  | 'full_lobby_song_race'
  | 'first_grade_a'
  | 'first_grade_s'
  | 'first_grade_ss'
  | 'first_grade_ascended'
  | 'grade_s_or_better_count'
  | 'boolean_flag';

export interface CatalogEntry {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: CatalogCategory;
  subcategory: string;
  tier: CatalogTier;
  targetValue: number;
  metric: AchievementMetric;
  sortOrder: number;
}

export interface UserAchievementProgress {
  achievementId: number;
  slug: string;
  currentProgress: number;
  unlockedAt: string | null;
}

export interface EvaluationResult {
  slug: string;
  achievementId: number;
  previousProgress: number;
  currentProgress: number;
  targetValue: number;
  newlyUnlocked: boolean;
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  'velocidad',
  'precision',
  'multijugador',
  'riesgo',
  'tecnica',
  'resistencia',
  'musica',
  'rangos',
];

export const CATEGORY_LABEL_KEYS: Record<CatalogCategory, string> = {
  velocidad: 'categorySpeed',
  precision: 'categoryPrecision',
  multijugador: 'categoryMultiplayer',
  riesgo: 'categoryRisk',
  tecnica: 'categoryTechnique',
  resistencia: 'categoryEndurance',
  musica: 'categoryMusic',
  rangos: 'categoryRanks',
};

export const TIER_LABEL_KEYS: Record<CatalogTier, string> = {
  bronce: 'tierBronze',
  plata: 'tierSilver',
  oro: 'tierGold',
  diamante: 'tierDiamond',
  especial: 'tierSpecial',
};
