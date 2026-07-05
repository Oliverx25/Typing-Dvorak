import { createRequire } from 'node:module';
import { join } from 'node:path';
import Kuroshiro from 'kuroshiro-enhance';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { sanitizeLyrics } from './sanitizeLyrics';
import { isTypableLatinLyrics } from './latinScript';
import { stripMacrons } from './stripMacrons';

const require = createRequire(import.meta.url);

/** Resolve kuromoji dict path for local dev and Vercel (/var/task). */
function resolveKuromojiDictPath(): string {
  const fromCwd = join(process.cwd(), 'node_modules/kuromoji/dict');
  try {
    const pkgPath = require.resolve('kuromoji/package.json');
    return join(pkgPath, '..', 'dict');
  } catch {
    return fromCwd;
  }
}

let initPromise: Promise<Kuroshiro> | null = null;

async function getKuroshiro(): Promise<Kuroshiro> {
  if (!initPromise) {
    initPromise = (async () => {
      const kuroshiro = new Kuroshiro();
      await kuroshiro.init(
        new KuromojiAnalyzer({ dictPath: resolveKuromojiDictPath() }),
      );
      return kuroshiro;
    })();
  }
  return initPromise;
}

/**
 * Converts Japanese lyrics to romaji and returns sanitized text when typable
 * on a Western keyboard. Returns null when conversion fails or output is unusable.
 */
export async function lyricsToTypableRomaji(raw: string): Promise<string | null> {
  if (!raw?.trim()) return null;

  const kuroshiro = await getKuroshiro();
  const romaji = await kuroshiro.convert(raw, { to: 'romaji', mode: 'normal' });
  const plainLyrics = sanitizeLyrics(stripMacrons(romaji));

  if (plainLyrics.length < 20) return null;
  if (!isTypableLatinLyrics(plainLyrics)) return null;

  return plainLyrics;
}
