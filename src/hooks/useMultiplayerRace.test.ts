import { describe, expect, it } from 'vitest';
import { mergePeakRaceProgress } from '@/utils/multiplayer/raceScoring';

describe('useMultiplayerRace progress merge', () => {
  it('keeps finished flag and peak percentage across out-of-order broadcasts', () => {
    const first = {
      userId: 'opponent',
      wpm: 40,
      score: 300,
      percentage: 55,
      accuracy: 96,
      maxCombo: 12,
      combo: 3,
      updatedAt: 1,
      finished: false,
    };

    const peaksAfterFirst = mergePeakRaceProgress(undefined, first);
    const storedAfterFirst = {
      ...first,
      ...peaksAfterFirst,
      finished: Boolean(first.finished),
    };

    const regression = {
      ...first,
      wpm: 0,
      score: 0,
      percentage: 0,
      combo: 0,
      updatedAt: 2,
      finished: false,
    };

    const peaksAfterRegression = mergePeakRaceProgress(storedAfterFirst, regression);
    const storedAfterRegression = {
      ...regression,
      ...peaksAfterRegression,
      finished: Boolean(storedAfterFirst.finished || regression.finished),
    };

    expect(storedAfterRegression.percentage).toBe(55);
    expect(storedAfterRegression.wpm).toBe(40);
    expect(storedAfterRegression.finished).toBe(false);

    const finishUpdate = {
      ...regression,
      percentage: 100,
      finished: true,
      updatedAt: 3,
    };

    const peaksAfterFinish = mergePeakRaceProgress(storedAfterRegression, finishUpdate);
    const storedAfterFinish = {
      ...finishUpdate,
      ...peaksAfterFinish,
      finished: Boolean(storedAfterRegression.finished || finishUpdate.finished),
    };

    expect(storedAfterFinish.finished).toBe(true);
    expect(storedAfterFinish.percentage).toBe(100);
  });
});
