import Kuroshiro from 'kuroshiro-enhance';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { sanitizeLyrics } from './sanitizeLyrics';
import { isTypableLatinLyrics } from './latinScript';

let initPromise: Promise<Kuroshiro> | null = null;

async function getKuroshiro(): Promise<Kuroshiro> {
  if (!initPromise) {
    initPromise = (async () => {
      const kuroshiro = new Kuroshiro();
      await kuroshiro.init(new KuromojiAnalyzer());
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
  const plainLyrics = sanitizeLyrics(romaji);

  if (plainLyrics.length < 20) return null;
  if (!isTypableLatinLyrics(plainLyrics)) return null;

  return plainLyrics;
}
