import { LESSON_ORDER } from '../curriculum/curriculum';
import { UNLOCK_ACCURACY } from '../curriculum/constants';
import type { BadgeProgressState } from './badges';

export type AchievementFamily =
  | 'speed'
  | 'accuracy'
  | 'streak'
  | 'endurance'
  | 'combo'
  | 'multiplayer'
  | 'special';

export type AchievementTier = 1 | 2 | 3 | 4;

const MASTER_ACCURACY = 98;

export interface UserAchievementStats {
  totalSessionsPlayed: number;
  totalPerfectSessions: number;
  highestWpmEver: number;
  highestComboEver: number;
  currentDayStreak: number;
  totalMultiplayerMatches: number;
  totalMultiplayerWins: number;
  masteredLessonCount: number;
  masterLessonCount: number;
  totalCurriculumLessons: number;
  sessionTimestamps: string[];
}

export interface AchievementDefinition {
  id: string;
  family: AchievementFamily;
  tier?: AchievementTier;
  titleKey: string;
  descKey: string;
  condition: (stats: UserAchievementStats) => boolean;
  progress: (stats: UserAchievementStats) => BadgeProgressState;
}

export const ACHIEVEMENT_FAMILY_ICONS: Record<AchievementFamily, string> = {
  speed: '/badges/speed.svg',
  accuracy: '/badges/accuracy.svg',
  streak: '/badges/streak.svg',
  endurance: '/badges/endurance.svg',
  combo: '/badges/combo.svg',
  multiplayer: '/badges/multiplayer.svg',
  special: '/badges/special.svg',
};

export const ACHIEVEMENT_FAMILIES: AchievementFamily[] = [
  'speed',
  'accuracy',
  'streak',
  'endurance',
  'combo',
  'multiplayer',
  'special',
];

export const FAMILY_TITLE_KEYS: Record<AchievementFamily, string> = {
  speed: 'familySpeed',
  accuracy: 'familyAccuracy',
  streak: 'familyStreak',
  endurance: 'familyEndurance',
  combo: 'familyCombo',
  multiplayer: 'familyMultiplayer',
  special: 'familySpecial',
};

function threshold(current: number, target: number): BadgeProgressState {
  return { current: Math.min(current, target), target };
}

function playedBetweenHours(timestamps: string[], startHour: number, endHour: number): boolean {
  return timestamps.some((ts) => {
    const hour = new Date(ts).getHours();
    return hour >= startHour && hour < endHour;
  });
}

function weekStartKey(date: Date): string {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

function playedWeekendBothDays(timestamps: string[]): boolean {
  const weeks = new Map<string, { sat: boolean; sun: boolean }>();

  for (const ts of timestamps) {
    const date = new Date(ts);
    const day = date.getDay();
    if (day !== 0 && day !== 6) continue;

    const key = weekStartKey(date);
    const entry = weeks.get(key) ?? { sat: false, sun: false };
    if (day === 6) entry.sat = true;
    if (day === 0) entry.sun = true;
    weeks.set(key, entry);
  }

  return [...weeks.values()].some((week) => week.sat && week.sun);
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ── Velocidad (WPM en una sesión) ─────────────────────────────────────────
  {
    id: 'speed_1',
    family: 'speed',
    tier: 1,
    titleKey: 'speed1',
    descKey: 'speed1Desc',
    condition: (s) => s.highestWpmEver >= 30,
    progress: (s) => threshold(s.highestWpmEver, 30),
  },
  {
    id: 'speed_2',
    family: 'speed',
    tier: 2,
    titleKey: 'speed2',
    descKey: 'speed2Desc',
    condition: (s) => s.highestWpmEver >= 60,
    progress: (s) => threshold(s.highestWpmEver, 60),
  },
  {
    id: 'speed_3',
    family: 'speed',
    tier: 3,
    titleKey: 'speed3',
    descKey: 'speed3Desc',
    condition: (s) => s.highestWpmEver >= 90,
    progress: (s) => threshold(s.highestWpmEver, 90),
  },
  {
    id: 'speed_4',
    family: 'speed',
    tier: 4,
    titleKey: 'speed4',
    descKey: 'speed4Desc',
    condition: (s) => s.highestWpmEver >= 120,
    progress: (s) => threshold(s.highestWpmEver, 120),
  },

  // ── Precisión (sesiones con 100%) ─────────────────────────────────────────
  {
    id: 'acc_1',
    family: 'accuracy',
    tier: 1,
    titleKey: 'acc1',
    descKey: 'acc1Desc',
    condition: (s) => s.totalPerfectSessions >= 1,
    progress: (s) => threshold(s.totalPerfectSessions, 1),
  },
  {
    id: 'acc_2',
    family: 'accuracy',
    tier: 2,
    titleKey: 'acc2',
    descKey: 'acc2Desc',
    condition: (s) => s.totalPerfectSessions >= 10,
    progress: (s) => threshold(s.totalPerfectSessions, 10),
  },
  {
    id: 'acc_3',
    family: 'accuracy',
    tier: 3,
    titleKey: 'acc3',
    descKey: 'acc3Desc',
    condition: (s) => s.totalPerfectSessions >= 50,
    progress: (s) => threshold(s.totalPerfectSessions, 50),
  },
  {
    id: 'acc_4',
    family: 'accuracy',
    tier: 4,
    titleKey: 'acc4',
    descKey: 'acc4Desc',
    condition: (s) => s.totalPerfectSessions >= 100,
    progress: (s) => threshold(s.totalPerfectSessions, 100),
  },

  // ── Constancia (racha de días) ────────────────────────────────────────────
  {
    id: 'streak_1',
    family: 'streak',
    tier: 1,
    titleKey: 'streak1',
    descKey: 'streak1Desc',
    condition: (s) => s.currentDayStreak >= 3,
    progress: (s) => threshold(s.currentDayStreak, 3),
  },
  {
    id: 'streak_2',
    family: 'streak',
    tier: 2,
    titleKey: 'streak2',
    descKey: 'streak2Desc',
    condition: (s) => s.currentDayStreak >= 7,
    progress: (s) => threshold(s.currentDayStreak, 7),
  },
  {
    id: 'streak_3',
    family: 'streak',
    tier: 3,
    titleKey: 'streak3',
    descKey: 'streak3Desc',
    condition: (s) => s.currentDayStreak >= 30,
    progress: (s) => threshold(s.currentDayStreak, 30),
  },
  {
    id: 'streak_4',
    family: 'streak',
    tier: 4,
    titleKey: 'streak4',
    descKey: 'streak4Desc',
    condition: (s) => s.currentDayStreak >= 100,
    progress: (s) => threshold(s.currentDayStreak, 100),
  },

  // ── Resistencia (total de sesiones) ───────────────────────────────────────
  {
    id: 'endurance_1',
    family: 'endurance',
    tier: 1,
    titleKey: 'endurance1',
    descKey: 'endurance1Desc',
    condition: (s) => s.totalSessionsPlayed >= 10,
    progress: (s) => threshold(s.totalSessionsPlayed, 10),
  },
  {
    id: 'endurance_2',
    family: 'endurance',
    tier: 2,
    titleKey: 'endurance2',
    descKey: 'endurance2Desc',
    condition: (s) => s.totalSessionsPlayed >= 100,
    progress: (s) => threshold(s.totalSessionsPlayed, 100),
  },
  {
    id: 'endurance_3',
    family: 'endurance',
    tier: 3,
    titleKey: 'endurance3',
    descKey: 'endurance3Desc',
    condition: (s) => s.totalSessionsPlayed >= 500,
    progress: (s) => threshold(s.totalSessionsPlayed, 500),
  },
  {
    id: 'endurance_4',
    family: 'endurance',
    tier: 4,
    titleKey: 'endurance4',
    descKey: 'endurance4Desc',
    condition: (s) => s.totalSessionsPlayed >= 1000,
    progress: (s) => threshold(s.totalSessionsPlayed, 1000),
  },

  // ── Flujo (combo máximo) ──────────────────────────────────────────────────
  {
    id: 'combo_1',
    family: 'combo',
    tier: 1,
    titleKey: 'combo1',
    descKey: 'combo1Desc',
    condition: (s) => s.highestComboEver >= 50,
    progress: (s) => threshold(s.highestComboEver, 50),
  },
  {
    id: 'combo_2',
    family: 'combo',
    tier: 2,
    titleKey: 'combo2',
    descKey: 'combo2Desc',
    condition: (s) => s.highestComboEver >= 150,
    progress: (s) => threshold(s.highestComboEver, 150),
  },
  {
    id: 'combo_3',
    family: 'combo',
    tier: 3,
    titleKey: 'combo3',
    descKey: 'combo3Desc',
    condition: (s) => s.highestComboEver >= 300,
    progress: (s) => threshold(s.highestComboEver, 300),
  },
  {
    id: 'combo_4',
    family: 'combo',
    tier: 4,
    titleKey: 'combo4',
    descKey: 'combo4Desc',
    condition: (s) => s.highestComboEver >= 500,
    progress: (s) => threshold(s.highestComboEver, 500),
  },

  // ── Multijugador (victorias) ──────────────────────────────────────────────
  {
    id: 'mp_win_1',
    family: 'multiplayer',
    tier: 1,
    titleKey: 'mpWin1',
    descKey: 'mpWin1Desc',
    condition: (s) => s.totalMultiplayerWins >= 1,
    progress: (s) => threshold(s.totalMultiplayerWins, 1),
  },
  {
    id: 'mp_win_2',
    family: 'multiplayer',
    tier: 2,
    titleKey: 'mpWin2',
    descKey: 'mpWin2Desc',
    condition: (s) => s.totalMultiplayerWins >= 10,
    progress: (s) => threshold(s.totalMultiplayerWins, 10),
  },
  {
    id: 'mp_win_3',
    family: 'multiplayer',
    tier: 3,
    titleKey: 'mpWin3',
    descKey: 'mpWin3Desc',
    condition: (s) => s.totalMultiplayerWins >= 50,
    progress: (s) => threshold(s.totalMultiplayerWins, 50),
  },
  {
    id: 'mp_win_4',
    family: 'multiplayer',
    tier: 4,
    titleKey: 'mpWin4',
    descKey: 'mpWin4Desc',
    condition: (s) => s.totalMultiplayerWins >= 100,
    progress: (s) => threshold(s.totalMultiplayerWins, 100),
  },

  // ── Especiales ────────────────────────────────────────────────────────────
  {
    id: 'curriculum_base',
    family: 'special',
    titleKey: 'curriculumBase',
    descKey: 'curriculumBaseDesc',
    condition: (s) =>
      s.totalCurriculumLessons > 0 &&
      s.masteredLessonCount >= s.totalCurriculumLessons,
    progress: (s) =>
      threshold(s.masteredLessonCount, s.totalCurriculumLessons || LESSON_ORDER.length),
  },
  {
    id: 'curriculum_master',
    family: 'special',
    titleKey: 'curriculumMaster',
    descKey: 'curriculumMasterDesc',
    condition: (s) =>
      s.totalCurriculumLessons > 0 &&
      s.masterLessonCount >= s.totalCurriculumLessons,
    progress: (s) =>
      threshold(s.masterLessonCount, s.totalCurriculumLessons || LESSON_ORDER.length),
  },
  {
    id: 'night_owl',
    family: 'special',
    titleKey: 'nightOwl',
    descKey: 'nightOwlDesc',
    condition: (s) => playedBetweenHours(s.sessionTimestamps, 0, 4),
    progress: (s) => ({
      current: playedBetweenHours(s.sessionTimestamps, 0, 4) ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'early_bird',
    family: 'special',
    titleKey: 'earlyBird',
    descKey: 'earlyBirdDesc',
    condition: (s) => playedBetweenHours(s.sessionTimestamps, 5, 8),
    progress: (s) => ({
      current: playedBetweenHours(s.sessionTimestamps, 5, 8) ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: 'weekend_warrior',
    family: 'special',
    titleKey: 'weekendWarrior',
    descKey: 'weekendWarriorDesc',
    condition: (s) => playedWeekendBothDays(s.sessionTimestamps),
    progress: (s) => ({
      current: playedWeekendBothDays(s.sessionTimestamps) ? 1 : 0,
      target: 1,
    }),
  },
];

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

export function getAchievementsByFamily(family: AchievementFamily): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.family === family);
}

export function countMasteredLessons(
  lessonBests: Record<string, { bestAccuracy: number }>,
  minAccuracy: number = UNLOCK_ACCURACY,
): number {
  return LESSON_ORDER.filter(
    (id) => (lessonBests[id]?.bestAccuracy ?? 0) >= minAccuracy,
  ).length;
}

export { MASTER_ACCURACY };
