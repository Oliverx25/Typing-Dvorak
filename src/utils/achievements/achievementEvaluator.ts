import type { RaceModifier } from '@/utils/multiplayer/roomConfig.types';
import { gradeRank } from '@/utils/grading';
import { getProgress, getSessionHistory, type SessionRecord } from '@/utils/progress/storage';
import { getKeyStats } from '@/utils/stats/keyStats';
import type { RaceTextSource } from '@/utils/stats/sessionTypes';
import {
  ACHIEVEMENT_CATALOG,
  CATALOG_BY_ID,
  type CatalogEntry,
} from '@/utils/achievements/catalogData';
import type { AchievementMetric, EvaluationResult, UserAchievementProgress } from '@/utils/achievements/catalogTypes';
import { getMultiplayerStats } from '@/utils/achievements/multiplayerStats';
import {
  getLocalAchievementProgress,
  saveLocalAchievementProgress,
} from '@/utils/achievements/progressStorage';
import { validateAchievementDelta } from '@/utils/achievements/achievementDiff';

const HIGH_GRADES = new Set(['S', 'S+', 'SS', 'SS+']);
const SS_GRADES = new Set(['SS', 'SS+']);
const ASCENDED_GRADES = new Set(['S+', 'SS+']);

export interface LastSessionSnapshot {
  wpm: number;
  accuracy: number;
  maxCombo: number;
  grade?: string;
  elapsedSeconds?: number;
  lessonId?: string;
  multiplayerSource?: RaceTextSource;
  raceModifiers?: RaceModifier[];
  isMultiplayerWin?: boolean;
  mpSecondPlaceWpmGap?: number;
  mpWinMarginSeconds?: number;
  vampireHpPercentEnd?: number;
  earlyBurstWpm?: number;
  avgWpm?: number;
  errorRecoveryCombo?: number;
  songArtist?: string;
  playerCount?: number;
  halfProgressRank?: number;
  finalRank?: number;
  rhythmLockBroken?: boolean;
  /** Used to isolate per-session deltas from session history. */
  completedAt?: string;
}

export interface AggregatedAchievementMetrics {
  highestWpmEver: number;
  totalPerfectSessions: number;
  maxComboEver: number;
  dayStreak: number;
  totalSessions: number;
  mpWins: number;
  mpWinStreak: number;
  consecutiveHighAccuracySessions: number;
  gradeSOrBetterCount: number;
  hasGradeA: boolean;
  hasGradeS: boolean;
  hasGradeSs: boolean;
  hasAscendedGrade: boolean;
  totalCorrectKeystrokes: number;
  activeTypingMinutes: number;
  maxSameArtistSongPlays: number;
  distinctSongLanguages: number;
  sessionFlags: Set<string>;
}

function hasModifier(modifiers: RaceModifier[] | undefined, mod: RaceModifier): boolean {
  return modifiers?.includes(mod) ?? false;
}

function hasAllModifiers(modifiers: RaceModifier[] | undefined, mods: RaceModifier[]): boolean {
  return mods.every((mod) => hasModifier(modifiers, mod));
}

function gradeAtLeast(grade: string | undefined, min: string): boolean {
  if (!grade) return false;
  return gradeRank(grade) >= gradeRank(min);
}

function buildAggregatedMetrics(
  lastSession?: LastSessionSnapshot,
  options?: { excludeCompletedAt?: string },
): AggregatedAchievementMetrics {
  const history = getSessionHistory().filter(
    (session) => session.completedAt !== options?.excludeCompletedAt,
  );
  const progress = getProgress();
  const mp = getMultiplayerStats();
  const keyStats = getKeyStats();

  let totalPerfectSessions = 0;
  let highestWpmEver = 0;
  let maxComboEver = 0;
  let gradeSOrBetterCount = 0;
  let hasGradeA = false;
  let hasGradeS = false;
  let hasGradeSs = false;
  let hasAscendedGrade = false;
  let consecutiveHighAccuracySessions = 0;
  let streakRunning = true;
  const artistCounts = new Map<string, number>();
  const languages = new Set<string>();
  const sessionFlags = new Set<string>();
  let activeTypingMinutes = 0;

  for (const session of history) {
    if (session.accuracy === 100) totalPerfectSessions += 1;
    highestWpmEver = Math.max(highestWpmEver, session.wpm);
    maxComboEver = Math.max(maxComboEver, session.maxCombo ?? 0);

    const grade = session.grade;
    if (grade && HIGH_GRADES.has(grade)) gradeSOrBetterCount += 1;
    if (grade && gradeRank(grade) >= gradeRank('A')) hasGradeA = true;
    if (grade && HIGH_GRADES.has(grade)) hasGradeS = true;
    if (grade && SS_GRADES.has(grade)) hasGradeSs = true;
    if (
      grade &&
      ASCENDED_GRADES.has(grade) &&
      (session.raceModifiers?.length ?? 0) > 0
    ) {
      hasAscendedGrade = true;
    }

    if (streakRunning && session.accuracy >= 98) {
      consecutiveHighAccuracySessions += 1;
    } else {
      streakRunning = false;
    }

    activeTypingMinutes += Math.round((session.elapsedSeconds ?? 0) / 60);

    if (session.multiplayerSource === 'song' && session.songTitle) {
      const artist = session.songTitle.split(' - ')[0]?.trim();
      if (artist) artistCounts.set(artist, (artistCounts.get(artist) ?? 0) + 1);
    }
  }

  if (lastSession) {
    if (lastSession.accuracy === 100) totalPerfectSessions += 1;
    highestWpmEver = Math.max(highestWpmEver, lastSession.wpm);
    maxComboEver = Math.max(maxComboEver, lastSession.maxCombo);

    if (
      lastSession.isMultiplayerWin &&
      hasModifier(lastSession.raceModifiers, 'sudden_death')
    ) {
      sessionFlags.add('mod_sudden_death_win');
    }
    if (
      hasModifier(lastSession.raceModifiers, 'blind_mode') &&
      lastSession.accuracy >= 95
    ) {
      sessionFlags.add('mod_blind_95');
    }
    if (
      hasModifier(lastSession.raceModifiers, 'strict') &&
      gradeAtLeast(lastSession.grade, 'S')
    ) {
      sessionFlags.add('mod_strict_grade_s');
    }
    if (hasModifier(lastSession.raceModifiers, 'flashlight')) {
      sessionFlags.add('mod_flashlight_complete');
    }
    if (
      lastSession.isMultiplayerWin &&
      hasModifier(lastSession.raceModifiers, 'vampire') &&
      (lastSession.vampireHpPercentEnd ?? 100) <= 10
    ) {
      sessionFlags.add('mod_vampire_survive');
    }
    if (
      hasModifier(lastSession.raceModifiers, 'double_time') &&
      gradeAtLeast(lastSession.grade, 'A')
    ) {
      sessionFlags.add('mod_double_time_grade_a');
    }
    if (
      hasModifier(lastSession.raceModifiers, 'rhythm_lock') &&
      !lastSession.rhythmLockBroken
    ) {
      sessionFlags.add('mod_rhythm_lock_perfect');
    }
    if (
      hasAllModifiers(lastSession.raceModifiers, [
        'sudden_death',
        'blind_mode',
        'flashlight',
      ])
    ) {
      sessionFlags.add('mod_masocore');
    }
    if (
      lastSession.isMultiplayerWin &&
      (lastSession.mpWinMarginSeconds ?? Infinity) < 1
    ) {
      sessionFlags.add('mp_clutch_win');
    }
    if (
      lastSession.isMultiplayerWin &&
      (lastSession.mpSecondPlaceWpmGap ?? 0) > 30
    ) {
      sessionFlags.add('mp_dominant_win');
    }
    if (
      lastSession.isMultiplayerWin &&
      lastSession.grade &&
      SS_GRADES.has(lastSession.grade)
    ) {
      sessionFlags.add('mp_grade_ss_win');
    }
    if (
      lastSession.isMultiplayerWin &&
      lastSession.halfProgressRank != null &&
      lastSession.finalRank === 1 &&
      lastSession.halfProgressRank > 1
    ) {
      sessionFlags.add('mp_comeback_win');
    }
    if (
      lastSession.multiplayerSource === 'song' &&
      (lastSession.playerCount ?? 0) >= 4
    ) {
      sessionFlags.add('music_full_lobby');
    }
    if (
      lastSession.isMultiplayerWin &&
      (lastSession.playerCount ?? 0) >= 4
    ) {
      sessionFlags.add('mp_win_full_lobby');
    }
    if (
      lastSession.isMultiplayerWin &&
      (lastSession.mpWinMarginSeconds ?? Infinity) < 0.5
    ) {
      sessionFlags.add('mp_photo_finish_win');
    }
  }

  let totalCorrectKeystrokes = 0;
  for (const count of Object.values(keyStats.hits)) {
    totalCorrectKeystrokes += count;
  }

  const totalSessions = history.length + (lastSession ? 1 : 0);

  return {
    highestWpmEver,
    totalPerfectSessions,
    maxComboEver,
    dayStreak: progress.streak,
    totalSessions,
    mpWins: mp.wins,
    mpWinStreak: mp.winStreak ?? 0,
    consecutiveHighAccuracySessions,
    gradeSOrBetterCount,
    hasGradeA,
    hasGradeS,
    hasGradeSs,
    hasAscendedGrade,
    totalCorrectKeystrokes,
    activeTypingMinutes,
    maxSameArtistSongPlays: artistCounts.size ? Math.max(...artistCounts.values()) : 0,
    distinctSongLanguages: languages.size,
    sessionFlags,
  };
}

function metricValue(
  metric: AchievementMetric,
  entry: CatalogEntry,
  aggregate: AggregatedAchievementMetrics,
  lastSession?: LastSessionSnapshot,
): number {
  switch (metric) {
    case 'session_max_wpm':
      return Math.max(aggregate.highestWpmEver, lastSession?.wpm ?? 0);
    case 'session_avg_wpm': {
      const historyMax = getSessionHistory().reduce(
        (max, session) => Math.max(max, session.wpm),
        0,
      );
      const sessionWpm = lastSession?.avgWpm ?? lastSession?.wpm ?? 0;
      return Math.max(historyMax, sessionWpm);
    }
    case 'early_burst_wpm':
      return lastSession?.earlyBurstWpm ?? 0;
    case 'perfect_session_count':
      return aggregate.totalPerfectSessions;
    case 'max_combo':
      return Math.max(aggregate.maxComboEver, lastSession?.maxCombo ?? 0);
    case 'consecutive_high_accuracy_sessions':
      return aggregate.consecutiveHighAccuracySessions;
    case 'error_recovery_combo':
      return lastSession?.errorRecoveryCombo ?? 0;
    case 'mp_wins':
      return aggregate.mpWins;
    case 'mp_win_clutch':
      return aggregate.sessionFlags.has('mp_clutch_win') ? 1 : 0;
    case 'mp_win_dominant':
      return aggregate.sessionFlags.has('mp_dominant_win') ? 1 : 0;
    case 'mp_win_perfect_grade':
      return aggregate.sessionFlags.has('mp_grade_ss_win') ? 1 : 0;
    case 'mp_win_streak':
      return aggregate.mpWinStreak;
    case 'mp_comeback_win':
      return aggregate.sessionFlags.has('mp_comeback_win') ? 1 : 0;
    case 'mp_race_player_count':
      return lastSession?.playerCount ?? 0;
    case 'mp_win_full_lobby':
      return aggregate.sessionFlags.has('mp_win_full_lobby') ? 1 : 0;
    case 'mp_photo_finish_win':
      return aggregate.sessionFlags.has('mp_photo_finish_win') ? 1 : 0;
    case 'modifier_sudden_death_win':
      return aggregate.sessionFlags.has('mod_sudden_death_win') ? 1 : 0;
    case 'modifier_blind_high_accuracy':
      return aggregate.sessionFlags.has('mod_blind_95') ? lastSession?.accuracy ?? 0 : 0;
    case 'modifier_strict_high_grade':
      return aggregate.sessionFlags.has('mod_strict_grade_s') ? 1 : 0;
    case 'modifier_flashlight_complete':
      return aggregate.sessionFlags.has('mod_flashlight_complete') ? 1 : 0;
    case 'modifier_vampire_survive':
      return aggregate.sessionFlags.has('mod_vampire_survive') ? 1 : 0;
    case 'modifier_double_time_grade':
      return aggregate.sessionFlags.has('mod_double_time_grade_a') ? 1 : 0;
    case 'modifier_rhythm_lock_perfect':
      return aggregate.sessionFlags.has('mod_rhythm_lock_perfect') ? 1 : 0;
    case 'modifier_masocore':
      return aggregate.sessionFlags.has('mod_masocore') ? 1 : 0;
    case 'left_hand_perfect':
    case 'right_hand_perfect':
    case 'dev_symbols_grade':
    case 'custom_code_grade':
    case 'boolean_flag':
      return aggregate.sessionFlags.has(entry.slug) ? 1 : 0;
    case 'day_streak':
      return aggregate.dayStreak;
    case 'total_sessions':
      return aggregate.totalSessions;
    case 'active_typing_minutes':
      return aggregate.activeTypingMinutes;
    case 'total_correct_keystrokes':
      return aggregate.totalCorrectKeystrokes;
    case 'same_artist_song_plays':
      return aggregate.maxSameArtistSongPlays;
    case 'song_languages_count':
      return aggregate.distinctSongLanguages;
    case 'full_lobby_song_race':
      return aggregate.sessionFlags.has('music_full_lobby') ? 1 : 0;
    case 'first_grade_a':
      return aggregate.hasGradeA ? 1 : 0;
    case 'first_grade_s':
      return aggregate.hasGradeS ? 1 : 0;
    case 'first_grade_ss':
      return aggregate.hasGradeSs ? 1 : 0;
    case 'first_grade_ascended':
      return aggregate.hasAscendedGrade ? 1 : 0;
    case 'grade_s_or_better_count':
      return aggregate.gradeSOrBetterCount;
    default:
      return 0;
  }
}

function isBooleanMetric(metric: AchievementMetric): boolean {
  return [
    'mp_win_clutch',
    'mp_win_dominant',
    'mp_win_perfect_grade',
    'mp_comeback_win',
    'mp_win_full_lobby',
    'mp_photo_finish_win',
    'modifier_sudden_death_win',
    'modifier_strict_high_grade',
    'modifier_flashlight_complete',
    'modifier_vampire_survive',
    'modifier_double_time_grade',
    'modifier_rhythm_lock_perfect',
    'modifier_masocore',
    'left_hand_perfect',
    'right_hand_perfect',
    'dev_symbols_grade',
    'custom_code_grade',
    'boolean_flag',
    'full_lobby_song_race',
    'first_grade_a',
    'first_grade_s',
    'first_grade_ss',
    'first_grade_ascended',
  ].includes(metric);
}

function computeProgressForEntry(
  entry: CatalogEntry,
  aggregate: AggregatedAchievementMetrics,
  lastSession: LastSessionSnapshot | undefined,
  previous: UserAchievementProgress | undefined,
): UserAchievementProgress {
  const raw = metricValue(entry.metric, entry, aggregate, lastSession);
  const previousProgress = previous?.currentProgress ?? 0;
  const wasUnlocked = previous?.unlockedAt != null;
  const now = new Date().toISOString();

  let currentProgress: number;
  if (isBooleanMetric(entry.metric)) {
    currentProgress =
      raw >= entry.targetValue ? entry.targetValue : Math.max(previousProgress, raw);
  } else {
    currentProgress = Math.max(previousProgress, raw);
    if (currentProgress >= entry.targetValue) currentProgress = entry.targetValue;
  }

  const unlocked = wasUnlocked || currentProgress >= entry.targetValue;
  if (unlocked && currentProgress < entry.targetValue) {
    currentProgress = entry.targetValue;
  }

  const newlyUnlocked = !wasUnlocked && unlocked;

  return {
    achievementId: entry.id,
    slug: entry.slug,
    currentProgress,
    unlockedAt: unlocked ? (previous?.unlockedAt ?? (newlyUnlocked ? now : null)) : null,
  };
}

/**
 * Session-isolated delta for cloud writes. Compares metrics derived from the
 * completed session against a **server-trusted** baseline — never localStorage
 * fingerprints or a client-mutable diff cache.
 */
export function evaluateSessionAchievementDelta(
  lastSession: LastSessionSnapshot,
  serverBaseline: Record<string, UserAchievementProgress>,
): UserAchievementProgress[] {
  const excludeCompletedAt = lastSession.completedAt;
  const aggregateBefore = buildAggregatedMetrics(undefined, { excludeCompletedAt });
  const aggregateAfter = buildAggregatedMetrics(lastSession, { excludeCompletedAt });
  const delta: UserAchievementProgress[] = [];
  const catalogTargets = new Map(ACHIEVEMENT_CATALOG.map((entry) => [entry.id, entry.targetValue]));

  for (const entry of ACHIEVEMENT_CATALOG) {
    const previous = serverBaseline[String(entry.id)];
    const previousProgress = previous?.currentProgress ?? 0;
    const wasUnlocked = previous?.unlockedAt != null;

    const before = computeProgressForEntry(entry, aggregateBefore, undefined, previous);
    const after = computeProgressForEntry(entry, aggregateAfter, lastSession, previous);

    const sessionProgressed =
      after.currentProgress > before.currentProgress ||
      (!before.unlockedAt && after.unlockedAt != null);
    const serverProgressed =
      after.currentProgress > previousProgress || (!wasUnlocked && after.unlockedAt != null);

    if (sessionProgressed && serverProgressed) {
      delta.push(after);
    }
  }

  return validateAchievementDelta(serverBaseline, delta, catalogTargets);
}

/** Local/guest evaluation — updates localStorage only, never used for Supabase writes. */
export function evaluateAchievementProgress(
  lastSession?: LastSessionSnapshot,
): EvaluationResult[] {
  const aggregate = buildAggregatedMetrics(lastSession);
  const stored = getLocalAchievementProgress();
  const results: EvaluationResult[] = [];

  for (const entry of ACHIEVEMENT_CATALOG) {
    const previous = stored[String(entry.id)];
    const previousProgress = previous?.currentProgress ?? 0;
    const wasUnlocked = previous?.unlockedAt != null;
    const next = computeProgressForEntry(entry, aggregate, lastSession, previous);

    stored[String(entry.id)] = next;

    if ((!wasUnlocked && next.unlockedAt != null) || next.currentProgress !== previousProgress) {
      results.push({
        slug: entry.slug,
        achievementId: entry.id,
        previousProgress,
        currentProgress: next.currentProgress,
        targetValue: entry.targetValue,
        newlyUnlocked: !wasUnlocked && next.unlockedAt != null,
      });
    }
  }

  saveLocalAchievementProgress(stored);
  return results;
}

export function snapshotFromSessionRecord(
  record: SessionRecord,
  extras?: Partial<LastSessionSnapshot>,
): LastSessionSnapshot {
  return {
    wpm: record.wpm,
    accuracy: record.accuracy,
    maxCombo: record.maxCombo ?? 0,
    grade: record.grade,
    elapsedSeconds: record.elapsedSeconds,
    lessonId: record.lessonId,
    multiplayerSource: record.multiplayerSource,
    raceModifiers: record.raceModifiers,
    completedAt: record.completedAt,
    ...extras,
  };
}

export function getNewlyUnlockedSlugs(results: EvaluationResult[]): string[] {
  return results.filter((r) => r.newlyUnlocked).map((r) => r.slug);
}

export function getCatalogEntry(id: number) {
  return CATALOG_BY_ID.get(id);
}
