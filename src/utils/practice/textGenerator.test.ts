import { describe, expect, it } from 'vitest';
import { formatPracticeText } from '@/utils/practice/textGenerator';
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
