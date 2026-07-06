import { describe, expect, it } from 'vitest';
import { buildLyricTimelineFromLrc, wordStartIndices } from '@/utils/lyrics/buildLyricTimeline';
import { isNonVocalLrcLine, parseLrc } from '@/utils/lyrics/parseLrc';
import {
  calculateTypingDifficulty,
  computeTrackWpm,
  countLyricWords,
  PEAK_WPM_HARD_THRESHOLD,
} from '@/utils/lyrics/typingDifficulty';

describe('parseLrc', () => {
  it('extracts timestamps and lyric text', () => {
    const synced = `[00:12.50] First line
[01:02.00] Second line
[02:30.10] Third line`;

    expect(parseLrc(synced)).toEqual([
      { timeSeconds: 12.5, text: 'First line' },
      { timeSeconds: 62, text: 'Second line' },
      { timeSeconds: 150.1, text: 'Third line' },
    ]);
  });

  it('ignores metadata lines without timestamps', () => {
    expect(parseLrc('[ar:Artist]\n[00:05.00] Sing')).toEqual([
      { timeSeconds: 5, text: 'Sing' },
    ]);
  });
});

describe('isNonVocalLrcLine', () => {
  it('flags instrumental and empty lines', () => {
    expect(isNonVocalLrcLine('')).toBe(true);
    expect(isNonVocalLrcLine('(Instrumental)')).toBe(true);
    expect(isNonVocalLrcLine('hello world')).toBe(false);
  });
});

describe('buildLyricTimelineFromLrc', () => {
  it('builds word-level char indices and active WPM profile', () => {
    const lrc = parseLrc(`[00:00.00] one two
[00:02.00] three four
[00:10.00] (Instrumental)
[00:20.00] five six`);

    const plainLyrics = 'one two\nthree four\nfive six';
    const built = buildLyricTimelineFromLrc(lrc, plainLyrics, 25000);

    expect(built).not.toBeNull();
    expect(built!.timeline).toHaveLength(6);
    expect(built!.timeline[0]).toEqual({ timeMs: 0, charIndex: 0 });
    expect(built!.timeline[1]!.charIndex).toBe(4);
    expect(built!.timeline[5]!.charIndex).toBe(wordStartIndices(plainLyrics)[5]);
    expect(built!.wpmProfile.activeWpm).toBeGreaterThan(0);
    expect(built!.wpmProfile.peakWpm).toBeGreaterThan(0);
  });

  it('holds hare position during long instrumental gaps', async () => {
    const { timelineCursorIndex } = await import('../typing/pacingCursor');
    const lrc = parseLrc(`[00:00.00] one two
[00:02.00] three four
[00:20.00] five six`);

    const plainLyrics = 'one two\nthree four\nfive six';
    const built = buildLyricTimelineFromLrc(lrc, plainLyrics, 30000)!;
    const duringSolo = timelineCursorIndex(10000, built.timeline, plainLyrics.length);
    const lastWordBeforeSolo = built.timeline[3]!.charIndex;

    expect(duringSolo).toBe(lastWordBeforeSolo);
  });
});

describe('calculateTypingDifficulty', () => {
  it('rates simple text lower than complex punctuation', () => {
    const simple = calculateTypingDifficulty('hola mundo hola mundo hola mundo hola mundo');
    const complex = calculateTypingDifficulty("Don't stop! (Never) — it's fine... ok?");
    expect(simple.score).toBeLessThan(complex.score);
    expect(simple.tier).not.toBe('expert');
  });

  it('forces hard tier when peak vocal WPM exceeds threshold', () => {
    const easyText = 'a b c d e f g h i j k l m n o p q r s t';
    const base = calculateTypingDifficulty(easyText);
    expect(base.tier).toBe('easy');

    const boosted = calculateTypingDifficulty(easyText, {
      activeWpm: 70,
      peakWpm: PEAK_WPM_HARD_THRESHOLD + 5,
    });
    expect(boosted.tier).toBe('hard');
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

describe('sanitizeLyrics', () => {
  it('removes bracket and parenthesis tags', async () => {
    const { sanitizeLyrics } = await import('./sanitizeLyrics');
    const raw = '[Verse 1]\nHello (world)\n[Chorus]\nAgain';
    expect(sanitizeLyrics(raw)).toContain('Hello');
    expect(sanitizeLyrics(raw)).toContain('Again');
    expect(sanitizeLyrics(raw)).not.toMatch(/\[|]/);
  });

  it('truncates to max words', async () => {
    const { sanitizeLyrics } = await import('./sanitizeLyrics');
    const raw = Array.from({ length: 250 }, (_, i) => `word${i}`).join(' ');
    const cleaned = sanitizeLyrics(raw, 200);
    expect(cleaned.split(/\s+/)).toHaveLength(200);
  });
});

describe('sanitizeLyrics newline handling', () => {
  it('preserves internal line breaks', async () => {
    const { sanitizeLyrics } = await import('./sanitizeLyrics');
    const raw = 'first verse\nsecond verse\nthird verse';
    expect(sanitizeLyrics(raw)).toBe('first verse\nsecond verse\nthird verse');
  });

  it('keeps full lyrics when no cap is given', async () => {
    const { sanitizeLyrics } = await import('./sanitizeLyrics');
    const raw = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    expect(sanitizeLyrics(raw).split(/\s+/)).toHaveLength(300);
  });
});

describe('isTypableLatinLyrics', () => {
  it('accepts English and accented Latin text', async () => {
    const { isTypableLatinLyrics } = await import('./latinScript');
    expect(isTypableLatinLyrics('hello world this is fine')).toBe(true);
    expect(isTypableLatinLyrics('café résumé naïve')).toBe(true);
  });

  it('rejects mostly non-Latin scripts', async () => {
    const { isTypableLatinLyrics, nonLatinCharRatio } = await import('./latinScript');
    expect(isTypableLatinLyrics('君のせいで 僕は')).toBe(false);
    expect(isTypableLatinLyrics('안녕하세요 세계')).toBe(false);
    expect(isTypableLatinLyrics('Привет мир')).toBe(false);
    expect(nonLatinCharRatio('abcdef')).toBe(0);
    expect(nonLatinCharRatio('你好世界')).toBeGreaterThan(0.5);
  });
});

describe('lyricsToTypableRomaji', () => {
  it('converts Japanese lyrics to typable romaji', async () => {
    const { lyricsToTypableRomaji } = await import('./toRomajiLyrics');
    const { isTypableLatinLyrics } = await import('./latinScript');
    const raw = 'うっせぇわ\n'.repeat(5);
    const romaji = await lyricsToTypableRomaji(raw);
    expect(romaji).toBeTruthy();
    expect(isTypableLatinLyrics(romaji!)).toBe(true);
    expect(romaji).not.toMatch(/[\u3040-\u30ff\u4e00-\u9fff]/);
  }, 15000);
});
