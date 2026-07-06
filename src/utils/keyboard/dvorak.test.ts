import { describe, expect, it } from 'vitest';
import { charToKeyCode } from '@/utils/keyboard/dvorak';

describe('dvorak', () => {
  it('maps characters to key codes', () => {
    expect(charToKeyCode('a')).toBe('KeyA');
    expect(charToKeyCode(' ')).toBe('Space');
    expect(charToKeyCode('U')).toBe('KeyU');
  });

  it('maps whitespace control characters to key codes', () => {
    expect(charToKeyCode('\n')).toBe('Enter');
    expect(charToKeyCode('\t')).toBe('Tab');
  });

  it('returns undefined for unmapped chars', () => {
    expect(charToKeyCode('')).toBeUndefined();
  });
});
