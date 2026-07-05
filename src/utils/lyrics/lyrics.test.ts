import { describe, it, expect } from 'vitest';
import { sanitizeLyrics } from './sanitizeLyrics';
import { calculateTypingDifficulty } from './typingDifficulty';
import { formatDurationMs } from './itunesMetadata';

describe('sanitizeLyrics', () => {
  it('removes bracket and parenthesis tags', () => {
    const raw = '[Verse 1]\nHello (world)\n[Chorus]\nAgain';
    expect(sanitizeLyrics(raw)).toContain('Hello');
    expect(sanitizeLyrics(raw)).toContain('Again');
    expect(sanitizeLyrics(raw)).not.toMatch(/\[|]/);
  });

  it('truncates to max words', () => {
    const raw = Array.from({ length: 250 }, (_, i) => `word${i}`).join(' ');
    const cleaned = sanitizeLyrics(raw, 200);
    expect(cleaned.split(/\s+/)).toHaveLength(200);
  });
});

describe('calculateTypingDifficulty', () => {
  it('rates simple text lower than complex punctuation', () => {
    const simple = calculateTypingDifficulty('hola mundo hola mundo hola mundo hola mundo');
    const complex = calculateTypingDifficulty("Don't stop! (Never) — it's fine... ok?");
    expect(simple.score).toBeLessThan(complex.score);
    expect(simple.tier).not.toBe('expert');
  });
});

describe('formatDurationMs', () => {
  it('formats milliseconds as m:ss', () => {
    expect(formatDurationMs(215000)).toBe('3:35');
    expect(formatDurationMs(null)).toBeNull();
  });
});
