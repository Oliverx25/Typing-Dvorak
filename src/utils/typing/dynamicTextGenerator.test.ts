import { describe, expect, it } from 'vitest';
import {
  filterDictionaryWords,
  generateDynamicLessonText,
  wordUsesOnlyAllowedChars,
} from '@/utils/typing/dynamicTextGenerator';
import type { LessonCatalogMeta } from '@/utils/curriculum/catalogTypes';

describe('dynamicTextGenerator', () => {
  it('generates random char drills from allowed_chars', () => {
    const catalog: LessonCatalogMeta = {
      generationType: 'random_chars',
      allowedChars: 'aoeui',
      staticText: null,
    };
    const text = generateDynamicLessonText(catalog);
    expect(text.length).toBeGreaterThan(0);
    expect(wordUsesOnlyAllowedChars(text.replace(/\s/g, ''), 'aoeui')).toBe(true);
  });

  it('picks static text variants', () => {
    const catalog: LessonCatalogMeta = {
      generationType: 'static',
      allowedChars: 'abc',
      staticText: 'first variant\n---\nsecond variant',
    };
    const text = generateDynamicLessonText(catalog);
    expect(['first variant', 'second variant']).toContain(text);
  });

  it('filters dictionary words by allowed chars', () => {
    const filtered = filterDictionaryWords(['the', 'and', 'aoeu', 'xyz'], 'aoeuidhtns');
    expect(filtered).toContain('the');
    expect(filtered).toContain('and');
    expect(filtered).not.toContain('xyz');
  });

  it('generates dictionary drills with real words only', () => {
    const catalog: LessonCatalogMeta = {
      generationType: 'dictionary_words',
      allowedChars: 'aoeuidhtns',
      staticText: null,
    };
    const text = generateDynamicLessonText(catalog, { wordCount: 8 });
    const words = text.split(' ');
    expect(words.length).toBeGreaterThan(0);
    for (const word of words) {
      expect(wordUsesOnlyAllowedChars(word, 'aoeuidhtns')).toBe(true);
    }
  });
});
