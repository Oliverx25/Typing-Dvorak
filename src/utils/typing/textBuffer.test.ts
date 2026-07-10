import { describe, expect, it } from 'vitest';
import { countRemainingWords } from '@/utils/typing/textBuffer';

describe('countRemainingWords', () => {
  it('counts words after the cursor', () => {
    const text = 'one two three four';
    expect(countRemainingWords(text, 0)).toBe(4);
    expect(countRemainingWords(text, 4)).toBe(3);
    expect(countRemainingWords(text, text.length)).toBe(0);
  });
});
