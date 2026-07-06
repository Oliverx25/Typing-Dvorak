import { describe, expect, it } from 'vitest';
import {
  sanitizeSearchQuery,
  sanitizeTypableText,
  sanitizeUserText,
  stripHtmlTags,
} from '@/utils/security/sanitizeText';

describe('stripHtmlTags', () => {
  it('removes script blocks and tags', () => {
    const raw = 'Hello<script>alert("xss")</script> world <b>bold</b>';
    expect(stripHtmlTags(raw)).toBe('Hello world bold');
  });

  it('removes iframe and style blocks', () => {
    const raw = '<style>body{color:red}</style>safe<iframe src="evil"></iframe>text';
    expect(stripHtmlTags(raw)).toBe('safetext');
  });
});

describe('sanitizeTypableText', () => {
  it('strips HTML and control characters while keeping newlines', () => {
    const raw = '<img onerror="alert(1)">line one\nline\u0000 two';
    expect(sanitizeTypableText(raw)).toBe('line one\nline two');
  });

  it('removes zero-width and bidi override characters', () => {
    const raw = 'hello\u200B\u202Eworld';
    expect(sanitizeTypableText(raw)).toBe('helloworld');
  });

  it('respects max length', () => {
    expect(sanitizeTypableText('abcdef', 4)).toBe('abcd');
  });
});

describe('sanitizeUserText', () => {
  it('collapses whitespace and strips markup', () => {
    expect(sanitizeUserText('  <b>Oli</b>\nver  ')).toBe('Oliver');
  });

  it('removes control characters from display names', () => {
    expect(sanitizeUserText('Ana\u0007López')).toBe('AnaLópez');
  });
});

describe('sanitizeSearchQuery', () => {
  it('strips tags from search input', () => {
    expect(sanitizeSearchQuery('<script>x</script>beatles')).toBe('beatles');
  });
});
