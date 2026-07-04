import { describe, expect, it } from 'vitest';
import { calculateStars } from './stars';

describe('stars', () => {
  it('returns 1 star for low accuracy', () => {
    expect(calculateStars(75)).toBe(1);
  });

  it('returns 2 stars for 90%+ accuracy', () => {
    expect(calculateStars(90)).toBe(2);
    expect(calculateStars(97)).toBe(2);
  });

  it('returns 3 stars for 98%+ accuracy', () => {
    expect(calculateStars(98)).toBe(3);
    expect(calculateStars(100)).toBe(3);
  });
});
