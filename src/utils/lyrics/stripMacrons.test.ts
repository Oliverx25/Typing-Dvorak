import { describe, expect, it } from 'vitest';
import { stripMacrons } from './stripMacrons';

describe('stripMacrons', () => {
  it('replaces long-vowel macrons with plain ASCII', () => {
    expect(stripMacrons('yūtōsei')).toBe('yutosei');
    expect(stripMacrons('chūmon')).toBe('chumon');
    expect(stripMacrons('yōni')).toBe('yoni');
    expect(stripMacrons('ātsumaranē')).toBe('atsumarane');
  });

  it('leaves plain ASCII unchanged', () => {
    expect(stripMacrons('hello world')).toBe('hello world');
  });
});
