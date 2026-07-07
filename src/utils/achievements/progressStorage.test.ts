import { describe, expect, it, beforeEach } from 'vitest';
import { CATALOG_BY_SLUG } from '@/utils/achievements/catalogData';
import {
  getLocalAchievementProgress,
  mergeLocalAchievementProgress,
  replaceLocalAchievementProgress,
} from '@/utils/achievements/progressStorage';

function mockBrowserStorage() {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  Object.defineProperty(globalThis, 'window', { value: globalThis, configurable: true });
}

describe('mergeLocalAchievementProgress', () => {
  beforeEach(() => {
    mockBrowserStorage();
    replaceLocalAchievementProgress([]);
  });

  it('keeps the higher progress value when merging cloud rows', () => {
    const entry = CATALOG_BY_SLUG.get('speed_peak_220')!;

    replaceLocalAchievementProgress([
      {
        achievementId: entry.id,
        slug: entry.slug,
        currentProgress: 68,
        unlockedAt: null,
      },
    ]);

    mergeLocalAchievementProgress([
      {
        achievementId: entry.id,
        slug: entry.slug,
        currentProgress: 40,
        unlockedAt: null,
      },
    ]);

    expect(getLocalAchievementProgress()[String(entry.id)].currentProgress).toBe(68);
  });

  it('preserves unlock timestamps from either source', () => {
    const entry = CATALOG_BY_SLUG.get('speed_early_burst_100')!;

    replaceLocalAchievementProgress([
      {
        achievementId: entry.id,
        slug: entry.slug,
        currentProgress: 100,
        unlockedAt: '2026-07-06T00:00:00.000Z',
      },
    ]);

    mergeLocalAchievementProgress([
      {
        achievementId: entry.id,
        slug: entry.slug,
        currentProgress: 0,
        unlockedAt: null,
      },
    ]);

    const row = getLocalAchievementProgress()[String(entry.id)];
    expect(row.unlockedAt).toBe('2026-07-06T00:00:00.000Z');
    expect(row.currentProgress).toBe(100);
  });
});
