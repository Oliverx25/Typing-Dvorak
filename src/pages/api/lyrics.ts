import type { APIRoute } from 'astro';
import { sanitizeLyrics } from '@/utils/lyrics/sanitizeLyrics';
import { isTypableLatinLyrics } from '@/utils/lyrics/latinScript';
import {
  calculateTypingDifficulty,
  computeTrackWpm,
  countLyricWords,
} from '@/utils/lyrics/typingDifficulty';
import { fetchItunesMetadata } from '@/utils/lyrics/itunesMetadata';
import type { LyricSongResult } from '@/utils/lyrics/types';

const LRCLIB_SEARCH = 'https://lrclib.net/api/search';
const USER_AGENT = 'TypingDvorak/2.0 (lyrics-practice; +https://typing-dvorak.vercel.app)';
const MAX_RESULTS = 24;

interface LrcLibHit {
  id: number;
  name?: string;
  artistName?: string;
  albumName?: string;
  plainLyrics?: string | null;
  instrumental?: boolean;
  duration?: number;
}

function trackKey(title: string, artist: string): string {
  return `${title.toLowerCase().trim()}|${artist.toLowerCase().trim()}`;
}

async function fetchLrcLibHits(query: string): Promise<LrcLibHit[]> {
  const response = await fetch(`${LRCLIB_SEARCH}?q=${encodeURIComponent(query)}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) return [];
  return (await response.json()) as LrcLibHit[];
}

function resolveTypableLyrics(hit: LrcLibHit, fallbackPool: LrcLibHit[]): string | null {
  const candidates: LrcLibHit[] = [hit];

  const key = trackKey(hit.name?.trim() ?? '', hit.artistName?.trim() ?? '');
  for (const alt of fallbackPool) {
    if (alt.id === hit.id) {
      candidates.push(alt);
      continue;
    }
    const altKey = trackKey(alt.name?.trim() ?? '', alt.artistName?.trim() ?? '');
    if (altKey === key) candidates.push(alt);
  }

  for (const candidate of candidates) {
    if (!candidate.plainLyrics?.trim() || candidate.instrumental) continue;
    const plainLyrics = sanitizeLyrics(candidate.plainLyrics);
    if (plainLyrics.length < 20) continue;
    if (isTypableLatinLyrics(plainLyrics)) return plainLyrics;
  }

  return null;
}

function hitNeedsFallback(hit: LrcLibHit): boolean {
  if (!hit.plainLyrics?.trim() || hit.instrumental) return false;
  const plainLyrics = sanitizeLyrics(hit.plainLyrics);
  return plainLyrics.length >= 20 && !isTypableLatinLyrics(plainLyrics);
}

async function enrichWithCoverArt(results: LyricSongResult[]): Promise<LyricSongResult[]> {
  return Promise.all(
    results.map(async (item) => {
      const itunes = await fetchItunesMetadata(item.title, item.artist);
      const durationMs = itunes.durationMs ?? item.durationMs;
      return {
        ...item,
        coverArt: itunes.coverArt,
        durationMs,
        trackWpm: computeTrackWpm(countLyricWords(item.plainLyrics), durationMs),
      };
    }),
  );
}

function buildResults(hits: LrcLibHit[], fallbackPool: LrcLibHit[]): LyricSongResult[] {
  const seen = new Set<number>();
  const results: LyricSongResult[] = [];

  for (const hit of hits) {
    if (!hit.id || seen.has(hit.id)) continue;

    const plainLyrics = resolveTypableLyrics(hit, fallbackPool);
    if (!plainLyrics) continue;

    seen.add(hit.id);
    const durationMs =
      typeof hit.duration === 'number' && hit.duration > 0
        ? Math.round(hit.duration * 1000)
        : null;

    results.push({
      id: hit.id,
      title: hit.name?.trim() || 'Unknown track',
      artist: hit.artistName?.trim() || 'Unknown artist',
      album: hit.albumName?.trim() || null,
      plainLyrics,
      difficulty: calculateTypingDifficulty(plainLyrics),
      coverArt: null,
      durationMs,
      trackWpm: computeTrackWpm(countLyricWords(plainLyrics), durationMs),
    });

    if (results.length >= MAX_RESULTS) break;
  }

  return results;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim() ?? '';

  if (query.length < 2) {
    return Response.json({ results: [] satisfies LyricSongResult[] });
  }

  try {
    const primaryHits = await fetchLrcLibHits(query);

    const needsFallback = primaryHits.some(hitNeedsFallback);
    let fallbackPool: LrcLibHit[] = [];

    if (needsFallback) {
      const [romajiHits, englishHits] = await Promise.all([
        fetchLrcLibHits(`${query} romaji`),
        fetchLrcLibHits(`${query} english`),
      ]);
      fallbackPool = [...romajiHits, ...englishHits];
    }

    const results = buildResults(primaryHits, fallbackPool);
    const enriched = await enrichWithCoverArt(results);

    return Response.json({ results: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: 'search_failed', message }, { status: 500 });
  }
};
