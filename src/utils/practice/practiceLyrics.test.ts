import { describe, expect, it } from 'vitest';
import { formatPracticeLyrics, formatPracticeSongTitle } from '@/utils/practice/practiceLyrics';

describe('formatPracticeSongTitle', () => {
  it('joins artist and title', () => {
    expect(formatPracticeSongTitle({ artist: 'Ado', title: 'Usseewa' })).toBe('Ado - Usseewa');
  });
});

describe('formatPracticeLyrics', () => {
  it('preserves line breaks and applies modifiers', () => {
    const result = formatPracticeLyrics('Hello WORLD\nSecond LINE!', {
      includeCaps: false,
      includeNumbers: true,
      includePunctuation: false,
    });
    expect(result).toBe('hello world\nsecond line');
  });
});
