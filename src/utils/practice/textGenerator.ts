import type { SandboxConfig } from '@/utils/practice/sandboxConfig';
import { generateSandboxStream, generateSandboxWords } from '@/utils/practice/sandboxText';

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

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function buildSpanishText(minWords: number): string {
  const parts: string[] = [];
  let words = 0;
  while (words < minWords) {
    const quote = pick(SPANISH_QUOTES);
    parts.push(quote);
    words += countWords(quote);
  }
  return parts.join(' ');
}

function buildCodeText(minWords: number): string {
  const parts: string[] = [];
  let words = 0;
  while (words < minWords) {
    const snippet = pick(CODE_SNIPPETS);
    parts.push(snippet);
    words += countWords(snippet);
  }
  return parts.join(' ');
}

async function fetchEnglishQuote(signal?: AbortSignal): Promise<string> {
  const response = await fetch('https://dummyjson.com/quotes/random', { signal });
  if (!response.ok) throw new Error('Quote fetch failed');
  const data = (await response.json()) as { quote?: string };
  if (!data.quote?.trim()) throw new Error('Empty quote');
  return data.quote.trim();
}

async function fetchEnglishText(minWords: number, signal?: AbortSignal): Promise<string> {
  const parts: string[] = [];
  let words = 0;

  for (let attempt = 0; attempt < 6 && words < minWords; attempt++) {
    try {
      const quote = await fetchEnglishQuote(signal);
      parts.push(quote);
      words += countWords(quote);
    } catch (error) {
      if (signal?.aborted) throw error;
      break;
    }
  }

  if (words >= minWords) return parts.join(' ');

  const fallback = generateSandboxStream(
    { mode: 'time', timeSeconds: 60, wordCount: 25, content: 'en', includeCaps: true, includeNumbers: false, includePunctuation: true },
    minWords,
  );
  return parts.length > 0 ? `${parts.join(' ')} ${fallback}` : fallback;
}

/** Applies modifier toggles to raw generated text. */
export function formatPracticeText(
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

/** Generates practice text from config. Supports AbortSignal for in-flight cancellation. */
export async function generatePracticeText(config: SandboxConfig, signal?: AbortSignal): Promise<string> {
  const minWords = config.mode === 'words' ? config.wordCount : 120;

  let raw: string;
  switch (config.content) {
    case 'en':
      raw = config.mode === 'words'
        ? await fetchEnglishText(Math.max(minWords, 15), signal)
        : await fetchEnglishText(minWords, signal);
      break;
    case 'es':
      raw = buildSpanishText(minWords);
      break;
    case 'code':
      raw = buildCodeText(minWords);
      break;
    default:
      raw = generateSandboxWords(config);
  }

  const formatted = formatPracticeText(raw, config);
  if (formatted.length >= 10) return formatted;

  const padded = config.mode === 'words' ? generateSandboxWords(config) : generateSandboxStream(config, minWords);
  return formatPracticeText(padded, config);
}
