import { describe, expect, it } from 'vitest';
import { charToKeyCode } from './dvorak';

describe('dvorak', () => {
  it('maps characters to key codes', () => {
    expect(charToKeyCode('a')).toBe('KeyA');
    expect(charToKeyCode(' ')).toBe('Space');
    expect(charToKeyCode('U')).toBe('KeyU');
  });

  it('returns undefined for unmapped chars', () => {
    expect(charToKeyCode('')).toBeUndefined();
  });
});
