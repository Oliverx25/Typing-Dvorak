import { describe, expect, it } from 'vitest';
import { generateRoomCode, normalizeRoomCode } from './roomCode';

describe('roomCode', () => {
  it('generates uppercase codes without ambiguous characters', () => {
    const code = generateRoomCode(6);
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });

  it('normalizes join input', () => {
    expect(normalizeRoomCode(' ab-12 ')).toBe('AB12');
    expect(normalizeRoomCode('abc123xyz')).toBe('ABC123XY');
  });
});
