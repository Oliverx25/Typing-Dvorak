import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWeakestKeys,
  getKeyErrorRate,
  getKeyAccuracy,
  getKeySampleConfidence,
  getKeyStats,
  recordHeatmapKeystroke,
} from '@/utils/stats/keyStats';
import { writeJson } from '@/utils/progress/localStorage';
import { STORAGE_KEYS } from '@/utils/progress/keys';

function mockBrowserStorage() {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  Object.defineProperty(globalThis, 'window', {
    value: {
      ...globalThis,
      dispatchEvent: () => true,
    },
    configurable: true,
  });
  globalThis.CustomEvent = class CustomEvent extends Event {
    detail: unknown;
    constructor(type: string, params?: { detail?: unknown }) {
      super(type);
      this.detail = params?.detail;
    }
  } as typeof CustomEvent;
}

describe('keyStats', () => {
  beforeEach(() => {
    mockBrowserStorage();
    writeJson(STORAGE_KEYS.keyStats, { hits: {}, misses: {} });
  });
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

  it('records a hit on correct keystrokes', () => {
    recordHeatmapKeystroke('a', 'a', true);
    const stats = getKeyStats();
    expect(stats.hits.KeyA).toBe(1);
    expect(stats.misses.KeyA).toBeUndefined();
  });

  it('records misses on both pressed and expected keys when incorrect', () => {
    recordHeatmapKeystroke('a', 's', false);
    const stats = getKeyStats();
    expect(stats.misses.KeyA).toBe(1);
    expect(stats.misses.KeyS).toBe(1);
  });

  it('records a hit when a corrected character is typed correctly', () => {
    recordHeatmapKeystroke('a', 's', false);
    recordHeatmapKeystroke('a', 'a', true);
    const stats = getKeyStats();
    expect(stats.hits.KeyA).toBe(1);
    expect(stats.misses.KeyS).toBe(1);
    expect(stats.misses.KeyA).toBe(1);
  });
});
