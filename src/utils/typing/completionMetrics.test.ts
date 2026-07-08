import { describe, it, expect } from 'vitest';
import type { KeystrokeLogEntry } from '@/utils/typing/keystrokeTelemetry';
import {
  calculateConsistencyScore,
  calculateRawWpm,
  getTroubleKeyBadges,
} from '@/utils/typing/completionMetrics';

function logEntry(partial: Partial<KeystrokeLogEntry> & Pick<KeystrokeLogEntry, 'index'>): KeystrokeLogEntry {
  return {
    expectedChar: 'a',
    typedChar: 'a',
    isCorrect: true,
    timestamp: partial.index * 100,
    timeSinceLastKey: partial.timeSinceLastKey ?? 100,
    ...partial,
  };
}

describe('completionMetrics', () => {
  it('calculates raw WPM from all keystrokes', () => {
    expect(calculateRawWpm(50, 10, 60_000)).toBe(12);
  });

  it('scores high consistency for stable deltas', () => {
    const log = [1, 2, 3, 4].map((index) => logEntry({ index, timeSinceLastKey: 100 }));
    expect(calculateConsistencyScore(log)).toBeGreaterThan(90);
  });

  it('prioritizes weak keys in trouble badges', () => {
    const badges = getTroubleKeyBadges([], ['y', 'q']);
    expect(badges.map((badge) => badge.key)).toEqual(['y', 'q']);
    expect(badges.every((badge) => badge.tone === 'error')).toBe(true);
  });
});
