import { describe, expect, it } from 'vitest';
import { charsPerMsFromWpm, pacingCursorIndex } from './pacingCursor';

describe('pacingCursor', () => {
  it('converts WPM to chars per millisecond', () => {
    expect(charsPerMsFromWpm(60)).toBeCloseTo(0.005);
    expect(charsPerMsFromWpm(0)).toBe(0);
  });

  it('advances one char every 200ms at 60 WPM', () => {
    expect(pacingCursorIndex(0, 60, 100)).toBe(0);
    expect(pacingCursorIndex(199, 60, 100)).toBe(0);
    expect(pacingCursorIndex(200, 60, 100)).toBe(1);
    expect(pacingCursorIndex(400, 60, 100)).toBe(2);
  });

  it('clamps to totalChars', () => {
    expect(pacingCursorIndex(999999, 60, 10)).toBe(10);
  });

  it('returns 0 when WPM is invalid', () => {
    expect(pacingCursorIndex(1000, 0, 50)).toBe(0);
  });
});
