import { describe, it, expect } from 'vitest';
import { getWeakestKeys, getKeyErrorRate, getKeyAccuracy, getKeySampleConfidence } from '@/utils/stats/keyStats';

describe('keyStats', () => {
  it('ranks keys by misses and error rate', () => {
    const stats = {
      hits: { KeyA: 50, KeyE: 30 },
      misses: { KeyA: 10, KeyE: 5, KeyQ: 8 },
    };
    const weak = getWeakestKeys(3, stats);
    expect(weak.length).toBe(3);
    expect(weak[0].code).toBe('KeyQ');
  });

  it('returns zero error rate for unpracticed keys', () => {
    expect(getKeyErrorRate('KeyZ', { hits: {}, misses: {} })).toBe(0);
  });

  it('computes accuracy from hits and misses', () => {
    const stats = { hits: { KeyA: 90 }, misses: { KeyA: 10 } };
    expect(getKeyErrorRate('KeyA', stats)).toBeCloseTo(0.1);
    expect(getKeyAccuracy('KeyA', stats)).toBeCloseTo(0.9);
    expect(getKeySampleConfidence('KeyA', stats)).toBe(1);
  });
});
