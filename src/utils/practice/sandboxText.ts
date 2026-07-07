import type { SandboxConfig } from '@/utils/practice/sandboxConfig';

const EN_WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'practice', 'dvorak',
  'layout', 'typing', 'speed', 'accuracy', 'keyboard', 'finger', 'muscle', 'memory', 'focus',
  'daily', 'drill', 'lesson', 'chapter', 'progress', 'master', 'fluid', 'natural', 'rhythm',
];

const ES_WORDS = [
  'el', 'veloz', 'murcielago', 'hindu', 'comia', 'feliz', 'cardillo', 'kiwi', 'practica',
  'dvorak', 'teclado', 'velocidad', 'precision', 'dedos', 'memoria', 'muscular', 'leccion',
  'capitulo', 'progreso', 'maestria', 'fluido', 'natural', 'ritmo', 'escritura', 'diaria',
];

const CODE_TOKENS = [
  'const', 'let', 'fn', 'return', 'import', 'export', 'async', 'await', 'type', 'interface',
  'class', 'extends', 'null', 'true', 'false', 'if', 'else', 'for', 'while', 'switch',
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function applyModifiers(word: string, config: SandboxConfig): string {
  let result = word;
  if (config.includeCaps && Math.random() < 0.35) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  if (config.includeNumbers && Math.random() < 0.2) {
    result += String(Math.floor(Math.random() * 100));
  }
  if (config.includePunctuation && Math.random() < 0.25) {
    result += pick(['.', ',', ';', ':', '!', '?']);
  }
  return result;
}

function wordPool(config: SandboxConfig): string[] {
  if (config.content === 'es') return ES_WORDS;
  if (config.content === 'code') return CODE_TOKENS;
  return EN_WORDS;
}

function generateWord(config: SandboxConfig): string {
  const pool = wordPool(config);
  const base = pick(pool);
  if (config.content === 'code') {
    const symbols = ['()', '{}', '[]', '=>', '===', '!==', '&&', '||'];
    if (config.includePunctuation && Math.random() < 0.4) {
      return pick(symbols);
    }
    return applyModifiers(base, config);
  }
  return applyModifiers(base, config);
}

/** Build sandbox practice text for word-count mode. */
export function generateSandboxWords(config: SandboxConfig): string {
  const words: string[] = [];
  for (let i = 0; i < config.wordCount; i++) {
    words.push(generateWord(config));
  }
  return words.join(' ');
}

/** Build a long stream for timed sandbox mode. */
export function generateSandboxStream(config: SandboxConfig, minWords = 120): string {
  const words: string[] = [];
  for (let i = 0; i < minWords; i++) {
    words.push(generateWord(config));
  }
  return words.join(' ');
}

export function buildSandboxText(config: SandboxConfig): string {
  return config.mode === 'words'
    ? generateSandboxWords(config)
    : generateSandboxStream(config);
}
