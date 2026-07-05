import { describe, expect, it } from 'vitest';
import { compactReplay, ghostIndexAt, type ReplayData } from './ghostReplay';

const samples: ReplayData = [
  { i: 1, t: 100 },
  { i: 2, t: 200 },
  { i: 3, t: 400 },
  { i: 4, t: 800 },
];

describe('ghostReplay', () => {
  it('returns first index before the first sample time', () => {
    expect(ghostIndexAt(samples, 0)).toBe(1);
    expect(ghostIndexAt(samples, 50)).toBe(1);
  });

  it('returns the last reached index for a given elapsed time', () => {
    expect(ghostIndexAt(samples, 200)).toBe(2);
    expect(ghostIndexAt(samples, 399)).toBe(2);
    expect(ghostIndexAt(samples, 400)).toBe(3);
  });

  it('clamps to the final index past the end', () => {
    expect(ghostIndexAt(samples, 5000)).toBe(4);
  });

  it('returns 0 for empty replay data', () => {
    expect(ghostIndexAt([], 100)).toBe(0);
  });

  it('keeps short replays untouched and preserves the last sample when compacting', () => {
    expect(compactReplay(samples)).toEqual(samples);
    const large: ReplayData = Array.from({ length: 5000 }, (_, i) => ({ i, t: i }));
    const compacted = compactReplay(large);
    expect(compacted.length).toBeLessThanOrEqual(2001);
    expect(compacted[compacted.length - 1]).toEqual(large[large.length - 1]);
  });
});
