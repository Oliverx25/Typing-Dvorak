import type { AchievementMetric, CatalogCategory, CatalogEntry, CatalogTier } from '@/utils/achievements/catalogTypes';

let nextId = 1;

const METRIC_SUBCATEGORY: Partial<Record<AchievementMetric, string>> = {
  session_max_wpm: 'Speed Peaks',
  session_avg_wpm: 'Sustained Speed',
  early_burst_wpm: 'Explosive Start',
  perfect_session_count: 'Perfect Sessions',
  max_combo: 'Combos',
  consecutive_high_accuracy_sessions: 'Consistency',
  error_recovery_combo: 'Recovery',
  mp_wins: 'Victories',
  mp_win_clutch: 'Race Feats',
  mp_win_dominant: 'Race Feats',
  mp_win_perfect_grade: 'Race Feats',
  mp_win_streak: 'Win Streaks',
  mp_comeback_win: 'Race Feats',
  mp_race_player_count: 'Multiplayer Lobbies',
  mp_win_full_lobby: 'Multiplayer Lobbies',
  mp_photo_finish_win: 'Race Feats',
  modifier_sudden_death_win: 'Modifiers',
  modifier_blind_high_accuracy: 'Modifiers',
  modifier_strict_high_grade: 'Modifiers',
  modifier_flashlight_complete: 'Modifiers',
  modifier_vampire_survive: 'Modifiers',
  modifier_double_time_grade: 'Modifiers',
  modifier_rhythm_lock_perfect: 'Modifiers',
  modifier_masocore: 'Modifiers',
  left_hand_perfect: 'Hand Mastery',
  right_hand_perfect: 'Hand Mastery',
  dev_symbols_grade: 'Code',
  custom_code_grade: 'Code',
  day_streak: 'Daily Streaks',
  total_sessions: 'Volume',
  active_typing_minutes: 'Marathon',
  total_correct_keystrokes: 'Keystroke Volume',
  same_artist_song_plays: 'Artists',
  song_languages_count: 'Languages',
  full_lobby_song_race: 'Music Lobbies',
  first_grade_a: 'First Ranks',
  first_grade_s: 'First Ranks',
  first_grade_ss: 'First Ranks',
  first_grade_ascended: 'First Ranks',
  grade_s_or_better_count: 'Rank Collection',
};

function resolveSubcategory(slug: string, metric: AchievementMetric): string {
  if (slug.startsWith('speed_cruise_')) return 'Sustained Speed';
  if (slug.startsWith('speed_wpm_')) return 'Speed Peaks';
  if (slug.startsWith('speed_')) return 'Speed Challenges';
  if (slug.startsWith('mp_')) return METRIC_SUBCATEGORY[metric] ?? 'Multiplayer';
  if (slug.startsWith('mod_')) return 'Modifiers';
  if (slug.startsWith('rank_')) return METRIC_SUBCATEGORY[metric] ?? 'Ranks';
  if (slug.startsWith('music_')) return METRIC_SUBCATEGORY[metric] ?? 'Music';
  if (slug.startsWith('tech_')) return 'Technique';
  if (slug.startsWith('endurance_')) return METRIC_SUBCATEGORY[metric] ?? 'Endurance';
  if (slug.startsWith('precision_')) return METRIC_SUBCATEGORY[metric] ?? 'Precision';
  if (slug.startsWith('perfect_') || slug.startsWith('combo_')) return METRIC_SUBCATEGORY[metric] ?? 'Precision';
  return METRIC_SUBCATEGORY[metric] ?? 'General';
}

function entry(
  slug: string,
  title: string,
  description: string,
  category: CatalogCategory,
  tier: CatalogTier,
  targetValue: number,
  metric: AchievementMetric,
  sortOrder?: number,
  subcategory?: string,
): CatalogEntry {
  const id = nextId++;
  return {
    id,
    slug,
    title,
    description,
    category,
    subcategory: subcategory ?? resolveSubcategory(slug, metric),
    tier,
    targetValue,
    metric,
    sortOrder: sortOrder ?? id,
  };
}

function speedSession(wpm: number, tier: CatalogTier, title: string): CatalogEntry {
  return entry(
    `speed_wpm_${wpm}`,
    title,
    `Reach ${wpm} WPM in a single session.`,
    'velocidad',
    tier,
    wpm,
    'session_max_wpm',
  );
}

function perfectSessions(count: number, tier: CatalogTier, title: string): CatalogEntry {
  return entry(
    `perfect_sessions_${count}`,
    title,
    `Complete ${count} session${count === 1 ? '' : 's'} with 100% accuracy.`,
    'precision',
    tier,
    count,
    'perfect_session_count',
  );
}

function comboTarget(combo: number, tier: CatalogTier, title: string): CatalogEntry {
  return entry(
    `combo_max_${combo}`,
    title,
    `Reach a ${combo}-keystroke correct combo.`,
    'precision',
    tier,
    combo,
    'max_combo',
  );
}

function mpWins(count: number, tier: CatalogTier, title: string): CatalogEntry {
  return entry(
    `mp_wins_${count}`,
    title,
    `Win ${count} multiplayer race${count === 1 ? '' : 's'}.`,
    'multijugador',
    tier,
    count,
    'mp_wins',
  );
}

function streakDays(days: number, tier: CatalogTier, title: string): CatalogEntry {
  return entry(
    `streak_days_${days}`,
    title,
    `Practice ${days} days in a row.`,
    'resistencia',
    tier,
    days,
    'day_streak',
  );
}

function totalSessions(count: number, tier: CatalogTier, title: string): CatalogEntry {
  return entry(
    `total_sessions_${count}`,
    title,
    `Complete ${count.toLocaleString('en')} total sessions.`,
    'resistencia',
    tier,
    count,
    'total_sessions',
  );
}

function cruiseSpeed(avg: number, level: number): CatalogEntry {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][level - 1] ?? String(level);
  return entry(
    `speed_cruise_${avg}`,
    `Cruise Speed ${roman}`,
    `Maintain an average WPM above ${avg} in a full lesson or song.`,
    'velocidad',
    level <= 2 ? 'plata' : level <= 4 ? 'oro' : 'diamante',
    avg,
    'session_avg_wpm',
  );
}

export function buildAchievementCatalog(): CatalogEntry[] {
  nextId = 1;
  const items: CatalogEntry[] = [];

  items.push(
    speedSession(30, 'bronce', 'Walker'),
    speedSession(45, 'bronce', 'Trotter'),
    speedSession(60, 'plata', 'Runner'),
    speedSession(75, 'plata', 'Swift'),
    speedSession(90, 'oro', 'Sprinter'),
    speedSession(105, 'oro', 'Surge'),
    speedSession(120, 'diamante', 'Lightning'),
    speedSession(135, 'diamante', 'Hyperspeed'),
    speedSession(150, 'diamante', 'Supersonic'),
    speedSession(165, 'diamante', 'Photon'),
    speedSession(180, 'diamante', 'Tachyon'),
    speedSession(200, 'especial', 'Rhythmic Singularity'),
  );

  for (let i = 0; i < 7; i += 1) {
    items.push(cruiseSpeed(60 + i * 10, i + 1));
  }

  items.push(
    entry(
      'speed_early_burst_100',
      'Explosive Start',
      'Reach 100 WPM within the first 5 seconds of a race.',
      'velocidad',
      'oro',
      100,
      'early_burst_wpm',
    ),
    entry(
      'speed_sustain_80_300s',
      'Steady Engine',
      'Maintain 80+ WPM for 5 continuous minutes in a session.',
      'velocidad',
      'plata',
      80,
      'session_avg_wpm',
    ),
    entry(
      'speed_peak_220',
      'Event Horizon',
      'Reach 220 WPM in a test-mode session.',
      'velocidad',
      'especial',
      220,
      'session_max_wpm',
    ),
  );

  items.push(
    perfectSessions(1, 'bronce', 'Clean Shot'),
    perfectSessions(5, 'bronce', 'Eagle Eye'),
    perfectSessions(10, 'plata', 'Surgeon'),
    perfectSessions(25, 'plata', 'Surgical Precision'),
    perfectSessions(50, 'oro', 'Machine'),
    perfectSessions(75, 'oro', 'Automaton'),
    perfectSessions(100, 'diamante', 'Absolute Perfection'),
    perfectSessions(250, 'especial', 'Perfect Entity'),
  );

  items.push(
    comboTarget(50, 'bronce', 'Focus'),
    comboTarget(100, 'bronce', 'Solid Chain'),
    comboTarget(150, 'plata', 'Flow'),
    comboTarget(200, 'plata', 'Current'),
    comboTarget(300, 'oro', 'Trance'),
    comboTarget(400, 'oro', 'Zen State'),
    comboTarget(500, 'diamante', 'Unstoppable'),
    comboTarget(750, 'diamante', 'Combo Titan'),
    comboTarget(1000, 'especial', 'Divine'),
  );

  items.push(
    entry(
      'precision_steady_hand_5',
      'Steady Hand',
      'Play 5 consecutive sessions without dropping below 98% accuracy.',
      'precision',
      'plata',
      5,
      'consecutive_high_accuracy_sessions',
    ),
    entry(
      'precision_steady_hand_10',
      'Steel Pulse',
      'Play 10 consecutive sessions without dropping below 98% accuracy.',
      'precision',
      'oro',
      10,
      'consecutive_high_accuracy_sessions',
    ),
    entry(
      'precision_recovery_100',
      'Quick Recovery',
      'Make a mistake and rebuild a 100-keystroke combo in the same session.',
      'precision',
      'oro',
      100,
      'error_recovery_combo',
    ),
    entry(
      'precision_recovery_200',
      'Combo Phoenix',
      'Make a mistake and rebuild a 200-keystroke combo in the same session.',
      'precision',
      'diamante',
      200,
      'error_recovery_combo',
    ),
  );

  items.push(
    mpWins(1, 'bronce', 'Contender'),
    mpWins(5, 'bronce', 'Rival'),
    mpWins(10, 'plata', 'Gladiator'),
    mpWins(25, 'plata', 'Arena Veteran'),
    mpWins(50, 'oro', 'Champion'),
    mpWins(100, 'diamante', 'Dominator'),
    mpWins(250, 'diamante', 'Conqueror'),
    mpWins(500, 'especial', 'Legend'),
    entry(
      'mp_clutch_win',
      'Clutch',
      'Win a multiplayer race by less than 1 second.',
      'multijugador',
      'oro',
      1,
      'mp_win_clutch',
    ),
    entry(
      'mp_dominant_win',
      'Top Fragger',
      'Win a race beating second place by more than 30 WPM.',
      'multijugador',
      'oro',
      1,
      'mp_win_dominant',
    ),
    entry(
      'mp_grade_ss_win',
      'Absolute Dominance',
      'Win a multiplayer race with grade SS or SS+.',
      'multijugador',
      'diamante',
      1,
      'mp_win_perfect_grade',
    ),
    entry(
      'mp_win_streak_5',
      'Undefeated',
      'Win 5 multiplayer races in a row.',
      'multijugador',
      'diamante',
      5,
      'mp_win_streak',
    ),
    entry(
      'mp_win_streak_10',
      'Unstoppable Online',
      'Win 10 multiplayer races in a row.',
      'multijugador',
      'especial',
      10,
      'mp_win_streak',
    ),
    entry(
      'mp_comeback_win',
      'Epic Comeback',
      'Go from last place at the halfway point to first at the finish.',
      'multijugador',
      'especial',
      1,
      'mp_comeback_win',
    ),
    entry(
      'mp_players_4',
      'Crowded Room',
      'Complete a multiplayer race with 4 or more players.',
      'multijugador',
      'plata',
      4,
      'mp_race_player_count',
    ),
    entry(
      'mp_players_8',
      'Crowd',
      'Complete a multiplayer race with 8 players.',
      'multijugador',
      'diamante',
      8,
      'mp_race_player_count',
    ),
    entry(
      'mp_win_full_lobby',
      'King of the Arena',
      'Win a multiplayer race with 4 or more players in the lobby.',
      'multijugador',
      'oro',
      1,
      'mp_win_full_lobby',
    ),
    entry(
      'mp_photo_finish',
      'Photo Finish',
      'Win a multiplayer race by less than 0.5 seconds.',
      'multijugador',
      'diamante',
      1,
      'mp_photo_finish_win',
    ),
  );

  items.push(
    entry(
      'mod_sudden_death_win',
      'Living on the Edge',
      'Win a match with Sudden Death enabled.',
      'riesgo',
      'oro',
      1,
      'modifier_sudden_death_win',
    ),
    entry(
      'mod_blind_95',
      'Pure Muscle Memory',
      'Finish a Blind Mode session with over 95% accuracy.',
      'riesgo',
      'oro',
      95,
      'modifier_blind_high_accuracy',
    ),
    entry(
      'mod_strict_grade_s',
      'Merciless Keyboard',
      'Complete a Strict session (no backspace) with grade S or higher.',
      'riesgo',
      'diamante',
      1,
      'modifier_strict_high_grade',
    ),
    entry(
      'mod_flashlight_complete',
      'Tunnel Vision',
      'Complete a race with the Flashlight modifier enabled.',
      'riesgo',
      'plata',
      1,
      'modifier_flashlight_complete',
    ),
    entry(
      'mod_vampire_survive',
      'Survivor',
      'Win a Vampire match finishing with less than 10% HP.',
      'riesgo',
      'diamante',
      1,
      'modifier_vampire_survive',
    ),
    entry(
      'mod_double_time_grade_a',
      'Adrenaline',
      'Complete a song with Double Time at grade A or higher.',
      'riesgo',
      'oro',
      1,
      'modifier_double_time_grade',
    ),
    entry(
      'mod_rhythm_lock_perfect',
      'Human Metronome',
      'Complete a song with Rhythm Lock without breaking combo from drift.',
      'riesgo',
      'diamante',
      1,
      'modifier_rhythm_lock_perfect',
    ),
    entry(
      'mod_masocore',
      'Masocore',
      'Finish a match with Sudden Death, Blind Mode, and Flashlight active together.',
      'riesgo',
      'especial',
      1,
      'modifier_masocore',
    ),
  );

  items.push(
    entry(
      'tech_left_hand_perfect',
      'Vowels Mastered',
      '100% accuracy on left-hand keys (A, O, E, U, I) in a full session.',
      'tecnica',
      'oro',
      1,
      'left_hand_perfect',
    ),
    entry(
      'tech_right_hand_perfect',
      'Lethal Consonants',
      '100% accuracy on right-hand keys in a full session.',
      'tecnica',
      'oro',
      1,
      'right_hand_perfect',
    ),
    entry(
      'tech_dev_symbols_ss',
      'Clean Code',
      'Complete the developer symbols lesson with grade SS.',
      'tecnica',
      'diamante',
      1,
      'dev_symbols_grade',
    ),
    entry(
      'tech_custom_code_s',
      'SysAdmin',
      'Finish a custom practice session with real source code at grade S or higher.',
      'tecnica',
      'oro',
      1,
      'custom_code_grade',
    ),
  );

  items.push(
    streakDays(3, 'bronce', 'Habit'),
    streakDays(7, 'plata', 'Discipline'),
    streakDays(14, 'plata', 'Ritual'),
    streakDays(30, 'oro', 'Lifestyle'),
    streakDays(60, 'oro', 'Devotion'),
    streakDays(100, 'diamante', 'Unbreakable'),
    streakDays(180, 'diamante', 'Monolith'),
    streakDays(365, 'especial', 'Ancestral Consistency'),
    totalSessions(10, 'bronce', 'Student'),
    totalSessions(50, 'bronce', 'Apprentice'),
    totalSessions(100, 'plata', 'Practitioner'),
    totalSessions(250, 'plata', 'Dedicated'),
    totalSessions(500, 'oro', 'Veteran'),
    totalSessions(1000, 'diamante', 'Grand Master'),
    totalSessions(2500, 'diamante', 'Keyboard Immortal'),
    totalSessions(5000, 'especial', 'Deity'),
    entry(
      'endurance_typing_60min',
      'Marathoner',
      'Accumulate 1 hour of active typing (pauses under 30s).',
      'resistencia',
      'oro',
      60,
      'active_typing_minutes',
    ),
    entry(
      'endurance_keys_1m',
      'Keystroke Millionaire',
      'Reach 1,000,000 total correct keystrokes.',
      'resistencia',
      'especial',
      1_000_000,
      'total_correct_keystrokes',
    ),
    entry(
      'endurance_keys_100k',
      'Hundred Thousand',
      'Reach 100,000 total correct keystrokes.',
      'resistencia',
      'oro',
      100_000,
      'total_correct_keystrokes',
    ),
    entry(
      'endurance_keys_10k',
      'Ten Thousand Touches',
      'Reach 10,000 total correct keystrokes.',
      'resistencia',
      'bronce',
      10_000,
      'total_correct_keystrokes',
    ),
  );

  items.push(
    entry(
      'music_same_artist_10',
      'Fan',
      'Play songs by the same artist 10 times.',
      'musica',
      'plata',
      10,
      'same_artist_song_plays',
    ),
    entry(
      'music_same_artist_25',
      'Superfan',
      'Play songs by the same artist 25 times.',
      'musica',
      'oro',
      25,
      'same_artist_song_plays',
    ),
    entry(
      'music_languages_3',
      'Polyglot',
      'Complete songs in 3 different languages.',
      'musica',
      'oro',
      3,
      'song_languages_count',
    ),
    entry(
      'music_languages_5',
      'Global Ambassador',
      'Complete songs in 5 different languages.',
      'musica',
      'diamante',
      5,
      'song_languages_count',
    ),
    entry(
      'music_full_lobby',
      'Full Stadium',
      'Complete a multiplayer song race in a full lobby.',
      'musica',
      'diamante',
      1,
      'full_lobby_song_race',
    ),
  );

  items.push(
    entry(
      'rank_first_a',
      'Seeking Perfection',
      'Earn your first global A grade.',
      'rangos',
      'bronce',
      1,
      'first_grade_a',
    ),
    entry(
      'rank_first_s',
      'Elite',
      'Earn your first global S grade.',
      'rangos',
      'plata',
      1,
      'first_grade_s',
    ),
    entry(
      'rank_first_ss',
      'Dvorak Master',
      'Earn your first global SS grade.',
      'rangos',
      'oro',
      1,
      'first_grade_ss',
    ),
    entry(
      'rank_ascended',
      'Ascended',
      'Earn your first S+ or SS+ grade using hard modifiers.',
      'rangos',
      'diamante',
      1,
      'first_grade_ascended',
    ),
    entry(
      'rank_gold_collector_50',
      'Gold Collector',
      'Accumulate 50 S-grade or better results in your history.',
      'rangos',
      'diamante',
      50,
      'grade_s_or_better_count',
    ),
    entry(
      'rank_gold_collector_100',
      'Curator of Excellence',
      'Accumulate 100 S-grade or better results in your history.',
      'rangos',
      'especial',
      100,
      'grade_s_or_better_count',
    ),
  );

  return items;
}

export const ACHIEVEMENT_CATALOG: CatalogEntry[] = buildAchievementCatalog();

export const CATALOG_BY_SLUG = new Map(ACHIEVEMENT_CATALOG.map((item) => [item.slug, item]));

export const CATALOG_BY_ID = new Map(ACHIEVEMENT_CATALOG.map((item) => [item.id, item]));

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function generateCatalogSeedSql(): string {
  const lines = [
    '-- Auto-generated from catalogData.ts',
    'insert into public.achievements_catalog (id, slug, title, description, category, subcategory, tier, target_value, sort_order)',
    'values',
  ];

  const values = ACHIEVEMENT_CATALOG.map(
    (item, index) =>
      `  (${item.id}, ${sqlLiteral(item.slug)}, ${sqlLiteral(item.title)}, ${sqlLiteral(item.description)}, ${sqlLiteral(item.category)}, ${sqlLiteral(item.subcategory)}, ${sqlLiteral(item.tier)}, ${item.targetValue}, ${item.sortOrder})${index < ACHIEVEMENT_CATALOG.length - 1 ? ',' : ''}`,
  );

  lines.push(...values);
  lines.push('on conflict (id) do update set');
  lines.push('  slug = excluded.slug,');
  lines.push('  title = excluded.title,');
  lines.push('  description = excluded.description,');
  lines.push('  category = excluded.category,');
  lines.push('  subcategory = excluded.subcategory,');
  lines.push('  tier = excluded.tier,');
  lines.push('  target_value = excluded.target_value,');
  lines.push('  sort_order = excluded.sort_order;');
  lines.push('');
  lines.push(
    "select setval(pg_get_serial_sequence('public.achievements_catalog', 'id'), (select coalesce(max(id), 1) from public.achievements_catalog));",
  );

  return lines.join('\n');
}
