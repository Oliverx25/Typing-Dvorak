import { describe, expect, it } from 'vitest';
import { evaluateUnlockedBadges, getBadgeProgressState } from './badges';
import type { UserAchievementStats } from './achievements.config';

const baseStats: UserAchievementStats = {
  totalSessionsPlayed: 0,
  totalPerfectSessions: 0,
  highestWpmEver: 0,
  highestComboEver: 0,
  currentDayStreak: 0,
  totalMultiplayerMatches: 0,
  totalMultiplayerWins: 0,
  masteredLessonCount: 0,
  masterLessonCount: 0,
  totalCurriculumLessons: 12,
  sessionTimestamps: [],
};

describe('badges', () => {
  it('unlocks speed tiers by highest WPM', () => {
    expect(evaluateUnlockedBadges({ ...baseStats, highestWpmEver: 30 })).toContain('speed_1');
    expect(evaluateUnlockedBadges({ ...baseStats, highestWpmEver: 60 })).toContain('speed_2');
    expect(evaluateUnlockedBadges({ ...baseStats, highestWpmEver: 120 })).toContain('speed_4');
  });

  it('unlocks accuracy tiers by perfect session count', () => {
    expect(evaluateUnlockedBadges({ ...baseStats, totalPerfectSessions: 1 })).toContain('acc_1');
    expect(evaluateUnlockedBadges({ ...baseStats, totalPerfectSessions: 10 })).toContain('acc_2');
  });

  it('unlocks streak badge at 7 days', () => {
    expect(evaluateUnlockedBadges({ ...baseStats, currentDayStreak: 7 })).toContain('streak_2');
  });

  it('tracks curriculum progress toward graduate badge', () => {
    const progress = getBadgeProgressState('curriculum_base', {
      ...baseStats,
      masteredLessonCount: 6,
    });
    expect(progress).toEqual({ current: 6, target: 12 });
  });

  it('unlocks night owl when playing between midnight and 4 AM', () => {
    const localNight = new Date();
    localNight.setHours(2, 30, 0, 0);
    const timestamps = [localNight.toISOString()];
    expect(evaluateUnlockedBadges({ ...baseStats, sessionTimestamps: timestamps })).toContain(
      'night_owl',
    );
  });

  it('unlocks multiplayer win tiers', () => {
    expect(evaluateUnlockedBadges({ ...baseStats, totalMultiplayerWins: 1 })).toContain('mp_win_1');
    expect(evaluateUnlockedBadges({ ...baseStats, totalMultiplayerWins: 50 })).toContain('mp_win_3');
  });
});
