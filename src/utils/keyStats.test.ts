import { describe, it, expect } from 'vitest';
import { getWeakestKeys, getKeyErrorRate } from './keyStats';

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
});
