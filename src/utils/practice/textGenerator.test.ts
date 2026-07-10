import { describe, expect, it } from 'vitest';
import {
  formatPracticeText,
  resolvePracticeLoadingSource,
  resolveTimeModeChunkWords,
  resolveTimeModeMinWords,
  truncateToWordCount,
} from '@/utils/practice/textGenerator';
import { resolveSessionType, isRoadmapSession } from '@/utils/stats/sessionClassification';

describe('formatPracticeText', () => {
  it('lowercases when caps modifier is off', () => {
    const result = formatPracticeText('Hello WORLD!', {
      includeCaps: false,
      includeNumbers: true,
      includePunctuation: true,
    });
    expect(result).toBe('hello world!');
  });

  it('strips punctuation when modifier is off', () => {
    const result = formatPracticeText('Hello, world!', {
      includeCaps: true,
      includeNumbers: true,
      includePunctuation: false,
    });
    expect(result).toBe('Hello world');
  });

  it('strips accents when punctuation modifier is off', () => {
    const result = formatPracticeText('el éxito es la suma día tras día', {
      includeCaps: false,
      includeNumbers: true,
      includePunctuation: false,
    });
    expect(result).toBe('el exito es la suma dia tras dia');
  });

  it('preserves accents when punctuation modifier is on', () => {
    const result = formatPracticeText('el éxito', {
      includeCaps: false,
      includeNumbers: true,
      includePunctuation: true,
    });
    expect(result).toBe('el éxito');
  });

  it('preserves code line breaks', () => {
    const result = formatPracticeText('const x = 1;\nreturn x;', {
      includeCaps: true,
      includeNumbers: true,
      includePunctuation: true,
    }, 'code');
    expect(result).toBe('const x = 1;\nreturn x;');
  });

  it('preserves lyrics line breaks', () => {
    const result = formatPracticeText('Verse ONE\nVerse TWO', {
      includeCaps: false,
      includeNumbers: true,
      includePunctuation: true,
    }, 'lyrics');
    expect(result).toBe('verse one\nverse two');
  });
});

describe('truncateToWordCount', () => {
  it('truncates to an exact word count', () => {
    expect(truncateToWordCount('one two three four five six', 3)).toBe('one two three');
    expect(truncateToWordCount('  alpha   beta  gamma delta  ', 2)).toBe('alpha beta');
  });
});

describe('resolveTimeModeMinWords', () => {
  it('scales initial text length with session duration', () => {
    expect(resolveTimeModeMinWords(15)).toBe(80);
    expect(resolveTimeModeMinWords(30)).toBe(105);
    expect(resolveTimeModeMinWords(60)).toBe(210);
  });
});

describe('resolveTimeModeChunkWords', () => {
  it('scales buffer chunks with session duration', () => {
    expect(resolveTimeModeChunkWords(15)).toBe(50);
    expect(resolveTimeModeChunkWords(30)).toBe(50);
    expect(resolveTimeModeChunkWords(60)).toBe(75);
  });
});

describe('resolvePracticeLoadingSource', () => {
  it('maps content types to loading sources', () => {
    expect(resolvePracticeLoadingSource('code')).toBe('github');
    expect(resolvePracticeLoadingSource('es')).toBe('translate');
    expect(resolvePracticeLoadingSource('en')).toBe('generic');
    expect(resolvePracticeLoadingSource('prose')).toBe('generic');
  });
});

describe('sessionClassification', () => {
  it('resolves practice and multiplayer session types', () => {
    expect(resolveSessionType('free-practice')).toBe('practice');
    expect(resolveSessionType('multiplayer')).toBe('multiplayer');
    expect(resolveSessionType('base_vowels')).toBe('lesson');
    expect(isRoadmapSession('lesson')).toBe(true);
    expect(isRoadmapSession('practice')).toBe(false);
  });
});
