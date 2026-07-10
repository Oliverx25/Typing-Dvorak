import type { SandboxConfig, SandboxContent } from '@/utils/practice/sandboxConfig';
import { generateSandboxStream, generateSandboxWords } from '@/utils/practice/sandboxText';
import { fetchGitHubCodeSnippet } from '@/utils/practice/githubCodeFetcher';
import { translateToSpanish } from '@/utils/practice/libreTranslate';

export type PracticeLoadingSource = 'generic' | 'github' | 'translate';

const SPANISH_QUOTES = [
  'La vida es lo que pasa mientras estás ocupado haciendo otros planes.',
  'No hay caminos para la paz, la paz es el camino.',
  'El que lee mucho y anda mucho, ve mucho y sabe mucho.',
  'Pueden cortar todas las flores, pero no podrán detener la primavera.',
  'La educación es la vacuna contra la violencia.',
  'Solo sé que no sé nada, y eso me hace más sabio que creer que lo sé todo.',
  'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',
  'Caminante, no hay camino, se hace camino al andar.',
];

const PROSE_PARAGRAPHS = [
  'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families that he is considered the rightful property of some one or other of their daughters.',
  'All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys house. The wife had discovered that the husband was carrying on an intrigue with a French girl and had announced to him that she could not go on living in the same house with him.',
  'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since. Whenever you feel like criticizing any one, he told me, just remember that all the people in this world have not had the advantages that you have had.',
  'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
];

const CODE_SNIPPETS = [
  'const result = await fetch(url, { method: "GET" })',
  'interface UserProfile { id: string; username: string }',
  'export function calculateWpm(chars: number, seconds: number) { return Math.round((chars / 5) / (seconds / 60)) }',
  'SELECT id, username, created_at FROM profiles WHERE active = true ORDER BY created_at DESC',
  'type PracticeMode = "practice" | "test"',
  'const [isDirty, setIsDirty] = useState(true)',
  'return items.filter((item) => item.score >= threshold).map((item) => item.id)',
  'INSERT INTO typing_sessions (user_id, wpm, accuracy) VALUES ($1, $2, $3)',
  'useEffect(() => { const controller = new AbortController(); return () => controller.abort() }, [])',
  'className={cn("rounded-xl border", isActive && "border-blue-500")}',
];

export function resolvePracticeLoadingSource(content: SandboxContent): PracticeLoadingSource {
  if (content === 'code') return 'github';
  if (content === 'es') return 'translate';
  return 'generic';
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Truncates text to an exact word count (words mode). */
export function truncateToWordCount(text: string, wordCount: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, wordCount).join(' ');
}

function buildSpanishFallback(minWords: number): string {
  const parts: string[] = [];
  let words = 0;
  while (words < minWords) {
    const quote = pick(SPANISH_QUOTES);
    parts.push(quote);
    words += countWords(quote);
  }
  return parts.join(' ');
}

function buildProseFallback(minWords: number): string {
  const parts: string[] = [];
  let words = 0;
  while (words < minWords) {
    const paragraph = pick(PROSE_PARAGRAPHS);
    parts.push(paragraph);
    words += countWords(paragraph);
  }
  return parts.join(' ');
}

function buildStaticCodeFallback(minWords: number): string {
  const parts: string[] = [];
  let words = 0;
  while (words < minWords) {
    const snippet = pick(CODE_SNIPPETS);
    parts.push(snippet);
    words += countWords(snippet);
  }
  return parts.join('\n');
}

async function fetchEnglishQuote(signal?: AbortSignal): Promise<string | null> {
  try {
    const quotable = await fetch('https://api.quotable.io/random?maxLength=240', { signal });
    if (quotable.ok) {
      const data = (await quotable.json()) as { content?: string };
      if (data.content?.trim()) return data.content.trim();
    }
  } catch (error) {
    if (signal?.aborted) throw error;
  }

  try {
    const response = await fetch('https://dummyjson.com/quotes/random', { signal });
    if (!response.ok) return null;
    const data = (await response.json()) as { quote?: string };
    return data.quote?.trim() || null;
  } catch (error) {
    if (signal?.aborted) throw error;
    return null;
  }
}

async function fetchProseText(signal?: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch('https://dummyjson.com/posts/random', { signal });
    if (!response.ok) return null;
    const data = (await response.json()) as { body?: string };
    return data.body?.trim() || null;
  } catch (error) {
    if (signal?.aborted) throw error;
    return null;
  }
}

async function fetchEnglishText(minWords: number, signal?: AbortSignal): Promise<string> {
  const parts: string[] = [];
  let words = 0;

  for (let attempt = 0; attempt < 6 && words < minWords; attempt++) {
    const quote = await fetchEnglishQuote(signal);
    if (!quote) break;
    parts.push(quote);
    words += countWords(quote);
  }

  if (words >= minWords) return parts.join(' ');

  const fallback = generateSandboxStream(
    {
      mode: 'time',
      timeSeconds: 60,
      wordCount: 25,
      content: 'en',
      includeCaps: true,
      includeNumbers: false,
      includePunctuation: true,
    },
    minWords,
  );
  return parts.length > 0 ? `${parts.join(' ')} ${fallback}` : fallback;
}

async function fetchSpanishText(minWords: number, signal?: AbortSignal): Promise<string> {
  try {
    const english = await fetchEnglishQuote(signal);
    if (english) {
      const translated = await translateToSpanish(english, signal);
      if (countWords(translated) >= Math.min(minWords, 10)) {
        return padSpanishText(translated, minWords);
      }
    }
  } catch (error) {
    if (signal?.aborted) throw error;
  }

  return buildSpanishFallback(minWords);
}

async function fetchBooksText(minWords: number, signal?: AbortSignal): Promise<string> {
  const parts: string[] = [];
  let words = 0;

  for (let attempt = 0; attempt < 4 && words < minWords; attempt++) {
    const body = await fetchProseText(signal);
    if (!body) break;
    parts.push(body);
    words += countWords(body);
  }

  if (words >= minWords) return parts.join(' ');

  const fallback = buildProseFallback(minWords);
  return parts.length > 0 ? `${parts.join(' ')} ${fallback}` : fallback;
}

function padSpanishText(seed: string, minWords: number): string {
  const parts = [seed];
  let words = countWords(seed);
  while (words < minWords) {
    parts.push(pick(SPANISH_QUOTES));
    words += countWords(parts[parts.length - 1]);
  }
  return parts.join(' ');
}

async function fetchCodeText(minWords: number, signal?: AbortSignal): Promise<string> {
  const blocks: string[] = [];
  let words = 0;

  for (let attempt = 0; attempt < 4 && words < minWords; attempt++) {
    try {
      const snippet = await fetchGitHubCodeSnippet(signal);
      if (!snippet) continue;
      blocks.push(snippet);
      words += countWords(snippet.replace(/\n/g, ' '));
    } catch (error) {
      if (signal?.aborted) throw error;
      break;
    }
  }

  if (blocks.length > 0) return blocks.join('\n\n');
  return buildStaticCodeFallback(minWords);
}

function formatProseText(
  rawText: string,
  modifiers: Pick<SandboxConfig, 'includeCaps' | 'includeNumbers' | 'includePunctuation'>,
): string {
  let text = rawText.replace(/\s+/g, ' ').trim();

  if (!modifiers.includePunctuation) {
    text = text.replace(/[.,!?;:'"—–()[\]{}/\\@#$%^&*+=<>~`|]/g, '');
    text = text.replace(/\s+/g, ' ').trim();
  }

  if (!modifiers.includeNumbers) {
    text = text.replace(/\d/g, '');
    text = text.replace(/\s+/g, ' ').trim();
  }

  if (!modifiers.includeCaps) {
    text = text.toLowerCase();
  }

  return text;
}

function formatCodeText(
  rawText: string,
  modifiers: Pick<SandboxConfig, 'includeCaps' | 'includeNumbers' | 'includePunctuation'>,
): string {
  let lines = rawText.replace(/\r\n/g, '\n').split('\n').map((line) => line.trimEnd());

  if (!modifiers.includeNumbers) {
    lines = lines.map((line) => line.replace(/\d/g, ''));
  }

  if (!modifiers.includePunctuation) {
    lines = lines.map((line) => line.replace(/[.,!?;:'"—–]/g, ''));
  }

  if (!modifiers.includeCaps) {
    lines = lines.map((line) => line.toLowerCase());
  }

  return lines.join('\n').trim();
}

/** Applies modifier toggles to raw generated text. */
export function formatPracticeText(
  rawText: string,
  modifiers: Pick<SandboxConfig, 'includeCaps' | 'includeNumbers' | 'includePunctuation'>,
  content: SandboxContent = 'en',
): string {
  if (content === 'code' || content === 'lyrics') {
    return formatCodeText(rawText, modifiers);
  }
  return formatProseText(rawText, modifiers);
}

function finalizePracticeText(raw: string, config: SandboxConfig): string {
  const formatted = formatPracticeText(raw, config, config.content);
  if (config.mode === 'words') {
    return truncateToWordCount(formatted, config.wordCount);
  }
  return formatted.length >= 10 ? formatted : formatted;
}

/** Generates practice text from config. Supports AbortSignal for in-flight cancellation. */
export async function generatePracticeText(config: SandboxConfig, signal?: AbortSignal): Promise<string> {
  const minWords = config.mode === 'words' ? config.wordCount : 120;

  let raw: string;
  switch (config.content) {
    case 'en':
      raw = await fetchEnglishText(Math.max(minWords, 15), signal);
      break;
    case 'es':
      raw = await fetchSpanishText(minWords, signal);
      break;
    case 'prose':
      raw = await fetchBooksText(minWords, signal);
      break;
    case 'code':
      raw = await fetchCodeText(minWords, signal);
      break;
    default:
      raw = generateSandboxWords(config);
  }

  const result = finalizePracticeText(raw, config);
  if (result.length >= 10) return result;

  const padded = config.mode === 'words' ? generateSandboxWords(config) : generateSandboxStream(config, minWords);
  return finalizePracticeText(padded, config);
}
