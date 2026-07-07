import { readJson, writeJson } from '@/utils/progress/localStorage';

export type SandboxMode = 'time' | 'words';
export type SandboxContent = 'es' | 'en' | 'code';
export type SandboxTimeLength = 15 | 30 | 60;
export type SandboxWordLength = 10 | 25 | 50 | 100;

export interface SandboxConfig {
  mode: SandboxMode;
  timeSeconds: SandboxTimeLength;
  wordCount: SandboxWordLength;
  content: SandboxContent;
  includeCaps: boolean;
  includeNumbers: boolean;
  includePunctuation: boolean;
}

const STORAGE_KEY = 'typing-dvorak-sandbox-config';

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  mode: 'time',
  timeSeconds: 60,
  wordCount: 25,
  content: 'en',
  includeCaps: false,
  includeNumbers: false,
  includePunctuation: false,
};

export function getSandboxConfig(): SandboxConfig {
  const stored = readJson<Partial<SandboxConfig>>(STORAGE_KEY, {});
  return { ...DEFAULT_SANDBOX_CONFIG, ...stored };
}

export function saveSandboxConfig(config: SandboxConfig): void {
  writeJson(STORAGE_KEY, config);
}

export const SANDBOX_TIME_OPTIONS: SandboxTimeLength[] = [15, 30, 60];
export const SANDBOX_WORD_OPTIONS: SandboxWordLength[] = [10, 25, 50, 100];
