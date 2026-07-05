import { describe, it, expect } from 'vitest';
import { sanitizeLyrics } from './sanitizeLyrics';
import { isTypableLatinLyrics, nonLatinCharRatio } from './latinScript';
import { calculateTypingDifficulty, computeTrackWpm, countLyricWords } from './typingDifficulty';

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

describe('countLyricWords', () => {
  it('counts whitespace-separated tokens', () => {
    expect(countLyricWords('hello world')).toBe(2);
    expect(countLyricWords('  one   two  three  ')).toBe(3);
    expect(countLyricWords('')).toBe(0);
  });
});

describe('computeTrackWpm', () => {
  it('derives WPM from word count and duration', () => {
    expect(computeTrackWpm(120, 60000)).toBe(120);
    expect(computeTrackWpm(90, 180000)).toBe(30);
  });

  it('returns null for invalid inputs', () => {
    expect(computeTrackWpm(0, 60000)).toBeNull();
    expect(computeTrackWpm(100, null)).toBeNull();
    expect(computeTrackWpm(100, 0)).toBeNull();
  });
});

describe('sanitizeLyrics newline handling', () => {
  it('preserves internal line breaks', () => {
    const raw = 'first verse\nsecond verse\nthird verse';
    expect(sanitizeLyrics(raw)).toBe('first verse\nsecond verse\nthird verse');
  });

  it('keeps full lyrics when no cap is given', () => {
    const raw = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    expect(sanitizeLyrics(raw).split(/\s+/)).toHaveLength(300);
  });
});

describe('isTypableLatinLyrics', () => {
  it('accepts English and accented Latin text', () => {
    expect(isTypableLatinLyrics('hello world this is fine')).toBe(true);
    expect(isTypableLatinLyrics('café résumé naïve')).toBe(true);
  });

  it('rejects mostly non-Latin scripts', () => {
    expect(isTypableLatinLyrics('君のせいで 僕は')).toBe(false);
    expect(isTypableLatinLyrics('안녕하세요 세계')).toBe(false);
    expect(isTypableLatinLyrics('Привет мир')).toBe(false);
  });

  it('reports non-Latin ratio', () => {
    expect(nonLatinCharRatio('abcdef')).toBe(0);
    expect(nonLatinCharRatio('你好世界')).toBeGreaterThan(0.5);
  });
});
