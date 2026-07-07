import { describe, expect, it } from 'vitest';
import { buildSandboxText } from '@/utils/practice/sandboxText';
import type { SandboxConfig } from '@/utils/practice/sandboxConfig';

const base: SandboxConfig = {
  mode: 'words',
  timeSeconds: 60,
  wordCount: 10,
  content: 'en',
  includeCaps: false,
  includeNumbers: false,
  includePunctuation: false,
};

describe('sandboxText', () => {
  it('generates word-count text', () => {
    const text = buildSandboxText(base);
    expect(text.split(' ').length).toBe(10);
  });

  it('generates longer stream for timed mode', () => {
    const text = buildSandboxText({ ...base, mode: 'time' });
    expect(text.split(' ').length).toBeGreaterThan(10);
  });
});
