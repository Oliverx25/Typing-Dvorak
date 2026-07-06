import { describe, expect, it, beforeEach } from 'vitest';
import { evaluateAchievementProgress } from './achievementEvaluator';
import { getProgressForAchievement, replaceLocalAchievementProgress } from './progressStorage';
import { CATALOG_BY_SLUG } from './catalogData';
import { writeJson } from '../progress/localStorage';
import { STORAGE_KEYS } from '../progress/keys';

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

describe('achievementEvaluator', () => {
  beforeEach(() => {
    mockBrowserStorage();
    replaceLocalAchievementProgress([]);
  });

  it('unlocks speed_wpm_30 when session reaches 30 WPM', () => {
    evaluateAchievementProgress({ wpm: 30, accuracy: 95, maxCombo: 10 });
    const progress = getProgressForAchievement(CATALOG_BY_SLUG.get('speed_wpm_30')!.id);
    expect(progress.unlockedAt).not.toBeNull();
  });

  it('tracks combo progress toward combo_max_500', () => {
    evaluateAchievementProgress({ wpm: 40, accuracy: 98, maxCombo: 350 });
    const progress = getProgressForAchievement(CATALOG_BY_SLUG.get('combo_max_500')!.id);
    expect(progress.currentProgress).toBeGreaterThanOrEqual(350);
  });

  it('unlocks mp_wins_1 when multiplayer wins >= 1', () => {
    writeJson(STORAGE_KEYS.multiplayerStats, { matches: 1, wins: 1, winStreak: 1 });
    evaluateAchievementProgress({ wpm: 50, accuracy: 96, maxCombo: 20 });
    const progress = getProgressForAchievement(CATALOG_BY_SLUG.get('mp_wins_1')!.id);
    expect(progress.unlockedAt).not.toBeNull();
    expect(progress.currentProgress).toBeGreaterThanOrEqual(1);
  });
});
