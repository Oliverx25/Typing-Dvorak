import type { AchievementMetric, CatalogCategory, CatalogEntry, CatalogTier } from '@/utils/achievements/catalogTypes';

let nextId = 1;

const METRIC_SUBCATEGORY: Partial<Record<AchievementMetric, string>> = {
  session_max_wpm: 'Picos de velocidad',
  session_avg_wpm: 'Velocidad sostenida',
  early_burst_wpm: 'Arranque explosivo',
  perfect_session_count: 'Sesiones perfectas',
  max_combo: 'Combos',
  consecutive_high_accuracy_sessions: 'Consistencia',
  error_recovery_combo: 'Recuperación',
  mp_wins: 'Victorias',
  mp_win_clutch: 'Hazañas de carrera',
  mp_win_dominant: 'Hazañas de carrera',
  mp_win_perfect_grade: 'Hazañas de carrera',
  mp_win_streak: 'Rachas de victoria',
  mp_comeback_win: 'Hazañas de carrera',
  mp_race_player_count: 'Salas multijugador',
  mp_win_full_lobby: 'Salas multijugador',
  mp_photo_finish_win: 'Hazañas de carrera',
  modifier_sudden_death_win: 'Modificadores',
  modifier_blind_high_accuracy: 'Modificadores',
  modifier_strict_high_grade: 'Modificadores',
  modifier_flashlight_complete: 'Modificadores',
  modifier_vampire_survive: 'Modificadores',
  modifier_double_time_grade: 'Modificadores',
  modifier_rhythm_lock_perfect: 'Modificadores',
  modifier_masocore: 'Modificadores',
  left_hand_perfect: 'Dominio por mano',
  right_hand_perfect: 'Dominio por mano',
  dev_symbols_grade: 'Código',
  custom_code_grade: 'Código',
  day_streak: 'Rachas diarias',
  total_sessions: 'Volumen',
  active_typing_minutes: 'Maratón',
  total_correct_keystrokes: 'Volumen de teclas',
  same_artist_song_plays: 'Artistas',
  song_languages_count: 'Idiomas',
  full_lobby_song_race: 'Salas musicales',
  first_grade_a: 'Primeros rangos',
  first_grade_s: 'Primeros rangos',
  first_grade_ss: 'Primeros rangos',
  first_grade_ascended: 'Primeros rangos',
  grade_s_or_better_count: 'Colección de rangos',
};

function resolveSubcategory(slug: string, metric: AchievementMetric): string {
  if (slug.startsWith('speed_cruise_')) return 'Velocidad sostenida';
  if (slug.startsWith('speed_wpm_')) return 'Picos de velocidad';
  if (slug.startsWith('speed_')) return 'Retos de velocidad';
  if (slug.startsWith('mp_')) return METRIC_SUBCATEGORY[metric] ?? 'Multijugador';
  if (slug.startsWith('mod_')) return 'Modificadores';
  if (slug.startsWith('rank_')) return METRIC_SUBCATEGORY[metric] ?? 'Rangos';
  if (slug.startsWith('music_')) return METRIC_SUBCATEGORY[metric] ?? 'Música';
  if (slug.startsWith('tech_')) return 'Técnica';
  if (slug.startsWith('endurance_')) return METRIC_SUBCATEGORY[metric] ?? 'Resistencia';
  if (slug.startsWith('precision_')) return METRIC_SUBCATEGORY[metric] ?? 'Precisión';
  if (slug.startsWith('perfect_') || slug.startsWith('combo_')) return METRIC_SUBCATEGORY[metric] ?? 'Precisión';
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
    speedSession(30, 'bronce', 'Paseante'),
    speedSession(45, 'bronce', 'Trotador'),
    speedSession(60, 'plata', 'Corredor'),
    speedSession(75, 'plata', 'Veloz'),
    speedSession(90, 'oro', 'Velocista'),
    speedSession(105, 'oro', 'Impulso'),
    speedSession(120, 'diamante', 'Relámpago'),
    speedSession(135, 'diamante', 'Hipervelocidad'),
    speedSession(150, 'diamante', 'Supersónico'),
    speedSession(165, 'diamante', 'Fotón'),
    speedSession(180, 'diamante', 'Taquión'),
    speedSession(200, 'especial', 'Singularidad Rítmica'),
  );

  for (let i = 0; i < 7; i += 1) {
    items.push(cruiseSpeed(60 + i * 10, i + 1));
  }

  items.push(
    entry(
      'speed_early_burst_100',
      'Arranque Explosivo',
      'Llega a 100 WPM en los primeros 5 segundos de una partida.',
      'velocidad',
      'oro',
      100,
      'early_burst_wpm',
    ),
    entry(
      'speed_sustain_80_300s',
      'Motor Constante',
      'Mantén 80+ WPM durante 5 minutos continuos en una sesión.',
      'velocidad',
      'plata',
      80,
      'session_avg_wpm',
    ),
    entry(
      'speed_peak_220',
      'Horizonte de Eventos',
      'Alcanza 220 WPM en una sesión (modo test).',
      'velocidad',
      'especial',
      220,
      'session_max_wpm',
    ),
  );

  items.push(
    perfectSessions(1, 'bronce', 'Tiro Limpio'),
    perfectSessions(5, 'bronce', 'Ojo de Águila'),
    perfectSessions(10, 'plata', 'Cirujano'),
    perfectSessions(25, 'plata', 'Precisión Quirúrgica'),
    perfectSessions(50, 'oro', 'Máquina'),
    perfectSessions(75, 'oro', 'Automata'),
    perfectSessions(100, 'diamante', 'Perfección Absoluta'),
    perfectSessions(250, 'especial', 'Entidad Perfecta'),
  );

  items.push(
    comboTarget(50, 'bronce', 'Concentración'),
    comboTarget(100, 'bronce', 'Cadena Sólida'),
    comboTarget(150, 'plata', 'Flujo'),
    comboTarget(200, 'plata', 'Corriente'),
    comboTarget(300, 'oro', 'Trance'),
    comboTarget(400, 'oro', 'Estado Zen'),
    comboTarget(500, 'diamante', 'Imparable'),
    comboTarget(750, 'diamante', 'Titán del Combo'),
    comboTarget(1000, 'especial', 'Divino'),
  );

  items.push(
    entry(
      'precision_steady_hand_5',
      'Mano Firme',
      'Juega 5 partidas consecutivas sin bajar del 98% de precisión.',
      'precision',
      'plata',
      5,
      'consecutive_high_accuracy_sessions',
    ),
    entry(
      'precision_steady_hand_10',
      'Pulso de Acero',
      'Juega 10 partidas consecutivas sin bajar del 98% de precisión.',
      'precision',
      'oro',
      10,
      'consecutive_high_accuracy_sessions',
    ),
    entry(
      'precision_recovery_100',
      'Recuperación Rápida',
      'Comete un error y levanta un combo de 100 teclas en la misma partida.',
      'precision',
      'oro',
      100,
      'error_recovery_combo',
    ),
    entry(
      'precision_recovery_200',
      'Fénix del Combo',
      'Comete un error y levanta un combo de 200 teclas en la misma partida.',
      'precision',
      'diamante',
      200,
      'error_recovery_combo',
    ),
  );

  items.push(
    mpWins(1, 'bronce', 'Contendiente'),
    mpWins(5, 'bronce', 'Rival'),
    mpWins(10, 'plata', 'Gladiador'),
    mpWins(25, 'plata', 'Veterano de Arena'),
    mpWins(50, 'oro', 'Campeón'),
    mpWins(100, 'diamante', 'Dominador'),
    mpWins(250, 'diamante', 'Conquistador'),
    mpWins(500, 'especial', 'Leyenda'),
    entry(
      'mp_clutch_win',
      'Clutch',
      'Gana una carrera multijugador por una diferencia menor a 1 segundo.',
      'multijugador',
      'oro',
      1,
      'mp_win_clutch',
    ),
    entry(
      'mp_dominant_win',
      'Top Fragger',
      'Gana una carrera superando al segundo lugar por más de 30 WPM.',
      'multijugador',
      'oro',
      1,
      'mp_win_dominant',
    ),
    entry(
      'mp_grade_ss_win',
      'Dominio Absoluto',
      'Gana una carrera multijugador obteniendo rango SS o SS+.',
      'multijugador',
      'diamante',
      1,
      'mp_win_perfect_grade',
    ),
    entry(
      'mp_win_streak_5',
      'Invicto',
      'Gana 5 carreras multijugador consecutivas.',
      'multijugador',
      'diamante',
      5,
      'mp_win_streak',
    ),
    entry(
      'mp_win_streak_10',
      'Imparable en Red',
      'Gana 10 carreras multijugador consecutivas.',
      'multijugador',
      'especial',
      10,
      'mp_win_streak',
    ),
    entry(
      'mp_comeback_win',
      'Remontada Épica',
      'Pasa del último lugar en la primera mitad al primer lugar al terminar.',
      'multijugador',
      'especial',
      1,
      'mp_comeback_win',
    ),
    entry(
      'mp_players_4',
      'Sala Populosa',
      'Completa una carrera multijugador con 4 o más jugadores.',
      'multijugador',
      'plata',
      4,
      'mp_race_player_count',
    ),
    entry(
      'mp_players_8',
      'Multitud',
      'Completa una carrera multijugador con 8 jugadores.',
      'multijugador',
      'diamante',
      8,
      'mp_race_player_count',
    ),
    entry(
      'mp_win_full_lobby',
      'Rey de la Arena',
      'Gana una carrera multijugador con 4 o más jugadores en la sala.',
      'multijugador',
      'oro',
      1,
      'mp_win_full_lobby',
    ),
    entry(
      'mp_photo_finish',
      'Foto Finish',
      'Gana una carrera multijugador por menos de 0.5 segundos de diferencia.',
      'multijugador',
      'diamante',
      1,
      'mp_photo_finish_win',
    ),
  );

  items.push(
    entry(
      'mod_sudden_death_win',
      'Viviendo al Límite',
      'Gana una partida con Sudden Death activado.',
      'riesgo',
      'oro',
      1,
      'modifier_sudden_death_win',
    ),
    entry(
      'mod_blind_95',
      'Memoria Muscular Pura',
      'Termina una partida en Blind Mode con más del 95% de precisión.',
      'riesgo',
      'oro',
      95,
      'modifier_blind_high_accuracy',
    ),
    entry(
      'mod_strict_grade_s',
      'Teclado Inmisericorde',
      'Completa una sesión con Strict (sin backspace) con rango S o superior.',
      'riesgo',
      'diamante',
      1,
      'modifier_strict_high_grade',
    ),
    entry(
      'mod_flashlight_complete',
      'Visión de Túnel',
      'Supera una carrera con el modificador Flashlight activado.',
      'riesgo',
      'plata',
      1,
      'modifier_flashlight_complete',
    ),
    entry(
      'mod_vampire_survive',
      'Sobreviviente',
      'Gana una partida en Vampire terminando con menos del 10% de vida.',
      'riesgo',
      'diamante',
      1,
      'modifier_vampire_survive',
    ),
    entry(
      'mod_double_time_grade_a',
      'Adrenalina',
      'Completa una canción con Double Time con rango A o superior.',
      'riesgo',
      'oro',
      1,
      'modifier_double_time_grade',
    ),
    entry(
      'mod_rhythm_lock_perfect',
      'Metrónomo Humano',
      'Completa una canción con Rhythm Lock sin romper el combo por desfase.',
      'riesgo',
      'diamante',
      1,
      'modifier_rhythm_lock_perfect',
    ),
    entry(
      'mod_masocore',
      'Masocore',
      'Termina una partida con Sudden Death, Blind Mode y Flashlight activos simultáneamente.',
      'riesgo',
      'especial',
      1,
      'modifier_masocore',
    ),
  );

  items.push(
    entry(
      'tech_left_hand_perfect',
      'Vocales Dominadas',
      '100% de precisión en las teclas de la mano izquierda (A, O, E, U, I) en una sesión completa.',
      'tecnica',
      'oro',
      1,
      'left_hand_perfect',
    ),
    entry(
      'tech_right_hand_perfect',
      'Consonantes Letales',
      '100% de precisión en las teclas de la mano derecha en una sesión completa.',
      'tecnica',
      'oro',
      1,
      'right_hand_perfect',
    ),
    entry(
      'tech_dev_symbols_ss',
      'Código Limpio',
      'Completa la lección de símbolos de desarrollo con rango SS.',
      'tecnica',
      'diamante',
      1,
      'dev_symbols_grade',
    ),
    entry(
      'tech_custom_code_s',
      'SysAdmin',
      'Termina una sesión de texto personalizado con código fuente real con rango S o superior.',
      'tecnica',
      'oro',
      1,
      'custom_code_grade',
    ),
  );

  items.push(
    streakDays(3, 'bronce', 'Hábito'),
    streakDays(7, 'plata', 'Disciplina'),
    streakDays(14, 'plata', 'Ritual'),
    streakDays(30, 'oro', 'Estilo de Vida'),
    streakDays(60, 'oro', 'Devoción'),
    streakDays(100, 'diamante', 'Inquebrantable'),
    streakDays(180, 'diamante', 'Monolito'),
    streakDays(365, 'especial', 'Constancia Ancestral'),
    totalSessions(10, 'bronce', 'Estudiante'),
    totalSessions(50, 'bronce', 'Aprendiz'),
    totalSessions(100, 'plata', 'Practicante'),
    totalSessions(250, 'plata', 'Dedicado'),
    totalSessions(500, 'oro', 'Veterano'),
    totalSessions(1000, 'diamante', 'Gran Maestro'),
    totalSessions(2500, 'diamante', 'Inmortal del Teclado'),
    totalSessions(5000, 'especial', 'Deidad'),
    entry(
      'endurance_typing_60min',
      'Maratonista',
      'Acumula 1 hora de tecleo activo continuo (pausas menores a 30s).',
      'resistencia',
      'oro',
      60,
      'active_typing_minutes',
    ),
    entry(
      'endurance_keys_1m',
      'Millonario de Teclas',
      'Alcanza 1,000,000 de pulsaciones correctas totales acumuladas.',
      'resistencia',
      'especial',
      1_000_000,
      'total_correct_keystrokes',
    ),
    entry(
      'endurance_keys_100k',
      'Centena de Miles',
      'Alcanza 100,000 pulsaciones correctas totales.',
      'resistencia',
      'oro',
      100_000,
      'total_correct_keystrokes',
    ),
    entry(
      'endurance_keys_10k',
      'Diez Mil Toques',
      'Alcanza 10,000 pulsaciones correctas totales.',
      'resistencia',
      'bronce',
      10_000,
      'total_correct_keystrokes',
    ),
  );

  items.push(
    entry(
      'music_same_artist_10',
      'Fanático',
      'Juega canciones del mismo artista 10 veces.',
      'musica',
      'plata',
      10,
      'same_artist_song_plays',
    ),
    entry(
      'music_same_artist_25',
      'Superfan',
      'Juega canciones del mismo artista 25 veces.',
      'musica',
      'oro',
      25,
      'same_artist_song_plays',
    ),
    entry(
      'music_languages_3',
      'Políglota',
      'Completa canciones en 3 idiomas diferentes.',
      'musica',
      'oro',
      3,
      'song_languages_count',
    ),
    entry(
      'music_languages_5',
      'Embajador Global',
      'Completa canciones en 5 idiomas diferentes.',
      'musica',
      'diamante',
      5,
      'song_languages_count',
    ),
    entry(
      'music_full_lobby',
      'Estadio Lleno',
      'Completa una carrera multijugador en modo canción en una sala llena.',
      'musica',
      'diamante',
      1,
      'full_lobby_song_race',
    ),
  );

  items.push(
    entry(
      'rank_first_a',
      'Buscando la Perfección',
      'Obtén tu primer rango A global.',
      'rangos',
      'bronce',
      1,
      'first_grade_a',
    ),
    entry(
      'rank_first_s',
      'Élite',
      'Obtén tu primer rango S global.',
      'rangos',
      'plata',
      1,
      'first_grade_s',
    ),
    entry(
      'rank_first_ss',
      'Maestro Dvorak',
      'Obtén tu primer rango SS global.',
      'rangos',
      'oro',
      1,
      'first_grade_ss',
    ),
    entry(
      'rank_ascended',
      'Ascendido',
      'Obtén tu primer rango S+ o SS+ usando modificadores difíciles.',
      'rangos',
      'diamante',
      1,
      'first_grade_ascended',
    ),
    entry(
      'rank_gold_collector_50',
      'Coleccionista de Oro',
      'Acumula 50 rangos S o superiores en tu historial general.',
      'rangos',
      'diamante',
      50,
      'grade_s_or_better_count',
    ),
    entry(
      'rank_gold_collector_100',
      'Curador de Excelencia',
      'Acumula 100 rangos S o superiores en tu historial general.',
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
