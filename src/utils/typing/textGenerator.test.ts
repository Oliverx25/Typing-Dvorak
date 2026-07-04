import { describe, expect, it } from 'vitest';
import { generateDrillText } from './textGenerator';

describe('textGenerator', () => {
  it('generates text from a character set', () => {
    const text = generateDrillText('home', 30);
    expect(text.length).toBeGreaterThan(0);
    expect(text).toMatch(/^[aoeuidhtns ]+$/);
  });

  it('never includes space inside generated words', () => {
    const text = generateDrillText('punctuation', 60);
    expect(text).not.toMatch(/ {2}/);
    expect(text.split(' ').every((w) => !w.includes(' '))).toBe(true);
  });
});
