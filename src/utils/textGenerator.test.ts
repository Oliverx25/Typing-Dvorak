import { describe, expect, it } from 'vitest';
import { generateDrillText } from './textGenerator';

describe('textGenerator', () => {
  it('generates text from a character set', () => {
    const text = generateDrillText('home', 30);
    expect(text.length).toBeGreaterThan(0);
    expect(text).toMatch(/^[aoeuidhtns ]+$/);
  });

  it('respects approximate length', () => {
    const text = generateDrillText('top', 40);
    expect(text.length).toBeLessThanOrEqual(40);
  });
});
