import type { SandboxConfig, SandboxContent, SandboxTimeLength } from '@/utils/practice/sandboxConfig';
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

const SPANISH_PROSE_PARAGRAPHS = [
  'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivi un hidalgo de los de lanza en astillero, adarga antigua, rocin flaco y galgo corredor. Una olla de algo mas vaca que carnero, salpicon las mas noches, duelos y quebrantos los sabados, lentejas los viernes, algun palomino de anadidura los domingos, consumian las tres partes de su hacienda.',
  'Muchos anos despues, frente al peloton de fusilamiento, el coronel Aureliano Buendia habia de recordar aquella tarde remota en que su padre lo llevo a conocer el hielo. Macondo era entonces una aldea de veinte casas de barro y cana brava construidas a la orilla de un rio de aguas diáfanas que se precipitaban por un lecho de piedras pulidas, blancas y enormes como huevos prehistoricos.',
  'El dia en que lo iban a matar, el coronel Aureliano Buendia se despertó a las cuatro de la mañana, a una cuadra de la mar, encadenado al mismo roble y con la garganta reseca por la lluvia de la noche anterior. Asi lo habia soñado su madre la noche anterior, en el ultimo momento de su vida, y el mismo presentimiento se lo habia repetido a el sin darse cuenta en el fragor de la guerra.',
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

/** Word target for timed practice — sized for fast typists so text does not loop mid-session. */
export function resolveTimeModeMinWords(timeSeconds: SandboxTimeLength | number): number {
  return Math.max(80, Math.ceil(timeSeconds * 3.5));
}

/** Chunk size when appending more text during a timed session. */
export function resolveTimeModeChunkWords(timeSeconds: SandboxTimeLength | number): number {
  return Math.max(50, Math.ceil(timeSeconds * 1.25));
}

function requiredFetchAttempts(minWords: number, wordsPerFetch: number): number {
  return Math.min(12, Math.max(4, Math.ceil(minWords / wordsPerFetch)));
}

function appendUniqueParts(parts: string[], next: string): number {
  const trimmed = next.trim();
  if (!trimmed || parts.includes(trimmed)) return 0;
  parts.push(trimmed);
  return countWords(trimmed);
}

function buildFromPool(minWords: number, pool: string[]): string {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const parts: string[] = [];
  let words = 0;
  for (let i = 0; words < minWords; i += 1) {
    const chunk = shuffled[i % shuffled.length];
    words += appendUniqueParts(parts, chunk);
  }
  return parts.join(' ');
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Removes combining marks (á→a, é→e, ñ→n, etc.) for practice without punctuation. */
export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

/** Truncates text to an exact word count (words mode). */
export function truncateToWordCount(text: string, wordCount: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, wordCount).join(' ');
}

function buildSpanishFallback(minWords: number): string {
  return buildFromPool(minWords, [...SPANISH_QUOTES, ...SPANISH_PROSE_PARAGRAPHS]);
}

function buildProseFallback(minWords: number): string {
  return buildFromPool(minWords, PROSE_PARAGRAPHS);
}

function buildStaticCodeFallback(minWords: number): string {
  return buildFromPool(minWords, CODE_SNIPPETS);
}

async function fetchEnglishQuote(signal?: AbortSignal, maxLength = 500): Promise<string | null> {
  try {
    const quotable = await fetch(`https://api.quotable.io/random?maxLength=${maxLength}`, { signal });
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
  const attempts = requiredFetchAttempts(minWords, 45);

  for (let attempt = 0; attempt < attempts && words < minWords; attempt += 1) {
    const preferProse = minWords >= 100 && attempt % 2 === 0;
    const chunk = preferProse ? await fetchProseText(signal) : await fetchEnglishQuote(signal, 500);
    if (!chunk) continue;
    words += appendUniqueParts(parts, chunk);
  }

  if (words >= minWords) return parts.join(' ');

  const fallback = generateSandboxStream(
    {
      mode: 'time',
      timeSeconds: 60,
      wordCount: 100,
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
  const parts: string[] = [];
  let words = 0;
  const attempts = requiredFetchAttempts(minWords, 35);

  for (let attempt = 0; attempt < attempts && words < minWords; attempt += 1) {
    try {
      const preferProse = minWords >= 100 && attempt % 3 === 0;
      const english = preferProse ? await fetchProseText(signal) : await fetchEnglishQuote(signal, 500);
      if (!english) continue;
      const translated = await translateToSpanish(english, signal);
      words += appendUniqueParts(parts, translated);
    } catch (error) {
      if (signal?.aborted) throw error;
    }
  }

  if (words >= minWords) return parts.join(' ');

  return buildSpanishFallback(minWords);
}

async function fetchBooksText(minWords: number, signal?: AbortSignal): Promise<string> {
  const parts: string[] = [];
  let words = 0;
  const attempts = requiredFetchAttempts(minWords, 90);

  for (let attempt = 0; attempt < attempts && words < minWords; attempt += 1) {
    const body = await fetchProseText(signal);
    if (!body) continue;
    words += appendUniqueParts(parts, body);
  }

  if (words >= minWords) return parts.join(' ');

  const fallback = buildProseFallback(minWords);
  return parts.length > 0 ? `${parts.join(' ')} ${fallback}` : fallback;
}

async function fetchCodeText(minWords: number, signal?: AbortSignal): Promise<string> {
  const blocks: string[] = [];
  let words = 0;
  const attempts = requiredFetchAttempts(minWords, 50);

  for (let attempt = 0; attempt < attempts && words < minWords; attempt += 1) {
    try {
      const snippet = await fetchGitHubCodeSnippet(signal);
      if (!snippet) continue;
      const added = appendUniqueParts(blocks, snippet);
      if (added > 0) {
        words += countWords(snippet.replace(/\n/g, ' '));
      }
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
    text = stripDiacritics(text);
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
    lines = lines.map((line) => {
      const stripped = line.replace(/[.,!?;:'"—–]/g, '');
      return stripDiacritics(stripped);
    });
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
export async function generatePracticeText(
  config: SandboxConfig,
  signal?: AbortSignal,
  options?: { minWords?: number },
): Promise<string> {
  const minWords =
    options?.minWords ??
    (config.mode === 'words' ? config.wordCount : resolveTimeModeMinWords(config.timeSeconds));

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
      raw =
        config.mode === 'time'
          ? generateSandboxStream(config, minWords)
          : generateSandboxWords(config);
  }

  const result = finalizePracticeText(raw, config);
  if (result.length >= 10) return result;

  const padded =
    config.mode === 'words' ? generateSandboxWords(config) : generateSandboxStream(config, minWords);
  return finalizePracticeText(padded, config);
}
