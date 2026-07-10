import { describe, expect, it } from 'vitest';
import { formatPracticeText, resolvePracticeLoadingSource } from '@/utils/practice/textGenerator';
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

  it('preserves code line breaks', () => {
    const result = formatPracticeText('const x = 1;\nreturn x;', {
      includeCaps: true,
      includeNumbers: true,
      includePunctuation: true,
    }, 'code');
    expect(result).toBe('const x = 1;\nreturn x;');
  });
});

describe('resolvePracticeLoadingSource', () => {
  it('maps content types to loading sources', () => {
    expect(resolvePracticeLoadingSource('code')).toBe('github');
    expect(resolvePracticeLoadingSource('es')).toBe('translate');
    expect(resolvePracticeLoadingSource('en')).toBe('generic');
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
