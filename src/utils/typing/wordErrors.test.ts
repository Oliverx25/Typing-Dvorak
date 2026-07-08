import { describe, it, expect } from 'vitest';
import type { CharStatus } from '@/utils/typing/typingSessionReducer';
import { wordHasUncorrectedErrors } from '@/utils/typing/wordErrors';

function statuses(...values: CharStatus[]): CharStatus[] {
  return values;
}

describe('wordHasUncorrectedErrors', () => {
  it('detects committed incorrect characters in the current word', () => {
    const input = 'hell';
    const chars = statuses('correct', 'correct', 'correct', 'incorrect');
    expect(wordHasUncorrectedErrors(input, chars)).toBe(true);
  });

  it('allows space when the current word is fully correct', () => {
    const input = 'hello';
    const chars = statuses('correct', 'correct', 'correct', 'correct', 'correct');
    expect(wordHasUncorrectedErrors(input, chars)).toBe(false);
  });

  it('blocks space for stop-on-error attempts on the current character', () => {
    const input = 'hell';
    const chars = statuses('correct', 'correct', 'correct', 'correct');
    const attempts = new Set([4]);
    expect(wordHasUncorrectedErrors(input, chars, attempts)).toBe(true);
  });

  it('allows space after a corrected stop-on-error attempt', () => {
    const input = 'hello';
    const chars = statuses('correct', 'correct', 'correct', 'correct', 'correct');
    const attempts = new Set([4]);
    expect(wordHasUncorrectedErrors(input, chars, attempts)).toBe(false);
  });
});
