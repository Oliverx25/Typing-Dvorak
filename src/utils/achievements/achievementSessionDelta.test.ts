import { describe, expect, it } from 'vitest';
import { evaluateSessionAchievementDelta } from '@/utils/achievements/achievementEvaluator';
import { CATALOG_BY_SLUG } from '@/utils/achievements/catalogData';
import type { UserAchievementProgress } from '@/utils/achievements/catalogTypes';

describe('evaluateSessionAchievementDelta', () => {
  it('returns only achievements progressed by the session', () => {
    const entry = CATALOG_BY_SLUG.get('speed_wpm_30')!;
    const baseline: Record<string, UserAchievementProgress> = {
      [String(entry.id)]: {
        achievementId: entry.id,
        slug: entry.slug,
        currentProgress: 0,
        unlockedAt: null,
      },
    };

    const delta = evaluateSessionAchievementDelta(
      { wpm: 30, accuracy: 95, maxCombo: 10, completedAt: '2026-07-08T12:00:00.000Z' },
      baseline,
    );

    const speedDelta = delta.find((row) => row.achievementId === entry.id);
    expect(speedDelta).toBeDefined();
    expect(speedDelta!.currentProgress).toBe(30);
    expect(speedDelta!.unlockedAt).not.toBeNull();
    expect(delta.every((row) => row.currentProgress >= (baseline[String(row.achievementId)]?.currentProgress ?? 0))).toBe(true);
  });

  it('rejects a forged regression even if client baseline was tampered down', () => {
    const entry = CATALOG_BY_SLUG.get('speed_wpm_30')!;
    const serverBaseline: Record<string, UserAchievementProgress> = {
      [String(entry.id)]: {
        achievementId: entry.id,
        slug: entry.slug,
        currentProgress: 30,
        unlockedAt: '2026-01-01T00:00:00.000Z',
      },
    };

    const delta = evaluateSessionAchievementDelta(
      { wpm: 10, accuracy: 80, maxCombo: 2 },
      serverBaseline,
    );

    expect(delta.find((row) => row.achievementId === entry.id)).toBeUndefined();
  });

  it('does not emit rows when session does not advance server progress', () => {
    const entry = CATALOG_BY_SLUG.get('combo_max_500')!;
    const serverBaseline: Record<string, UserAchievementProgress> = {
      [String(entry.id)]: {
        achievementId: entry.id,
        slug: entry.slug,
        currentProgress: 400,
        unlockedAt: null,
      },
    };

    const delta = evaluateSessionAchievementDelta(
      { wpm: 40, accuracy: 98, maxCombo: 50 },
      serverBaseline,
    );

    const comboDelta = delta.find((row) => row.achievementId === entry.id);
    expect(comboDelta).toBeUndefined();
  });
});
