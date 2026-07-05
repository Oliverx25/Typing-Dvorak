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

function normalizeToken(value: string): string {
  return value.toLowerCase().trim();
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

function extractTypableLyrics(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const plainLyrics = sanitizeLyrics(raw);
  if (plainLyrics.length < 20) return null;
  if (!isTypableLatinLyrics(plainLyrics)) return null;
  return plainLyrics;
}

/** True when the hit plausibly matches the user's search term. */
function isRelevantToQuery(hit: LrcLibHit, query: string): boolean {
  const q = normalizeToken(query);
  if (!q) return false;

  const title = normalizeToken(hit.name ?? '');
  const artist = normalizeToken(hit.artistName ?? '');

  if (title.includes(q) || artist.includes(q)) return true;

  const queryTokens = q.split(/\s+/).filter((token) => token.length >= 2);
  return queryTokens.some(
    (token) => title.includes(token) || artist.includes(token),
  );
}

function findSameTrackFallback(hit: LrcLibHit, fallbackPool: LrcLibHit[]): string | null {
  const key = trackKey(hit.name?.trim() ?? '', hit.artistName?.trim() ?? '');

  for (const alt of fallbackPool) {
    const altKey = trackKey(alt.name?.trim() ?? '', alt.artistName?.trim() ?? '');
    if (altKey !== key) continue;
    const lyrics = extractTypableLyrics(alt.plainLyrics);
    if (lyrics) return lyrics;
  }

  return null;
}

function resolveTypableLyrics(hit: LrcLibHit, fallbackPool: LrcLibHit[]): string | null {
  const direct = extractTypableLyrics(hit.plainLyrics);
  if (direct) return direct;
  return findSameTrackFallback(hit, fallbackPool);
}

function hitNeedsFallback(hit: LrcLibHit): boolean {
  if (!hit.plainLyrics?.trim() || hit.instrumental) return false;
  const plainLyrics = sanitizeLyrics(hit.plainLyrics);
  return plainLyrics.length >= 20 && !isTypableLatinLyrics(plainLyrics);
}

async function fetchFallbackPool(query: string): Promise<LrcLibHit[]> {
  const suffixes = ['romaji', 'english', 'english lyrics'];
  const searches = await Promise.all(
    suffixes.map((suffix) => fetchLrcLibHits(`${query} ${suffix}`)),
  );

  const seen = new Set<number>();
  const merged: LrcLibHit[] = [];

  for (const hits of searches) {
    for (const hit of hits) {
      if (!hit.id || seen.has(hit.id)) continue;
      seen.add(hit.id);
      merged.push(hit);
    }
  }

  return merged;
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

function toResult(hit: LrcLibHit, plainLyrics: string): LyricSongResult {
  const durationMs =
    typeof hit.duration === 'number' && hit.duration > 0
      ? Math.round(hit.duration * 1000)
      : null;

  return {
    id: hit.id,
    title: hit.name?.trim() || 'Unknown track',
    artist: hit.artistName?.trim() || 'Unknown artist',
    album: hit.albumName?.trim() || null,
    plainLyrics,
    difficulty: calculateTypingDifficulty(plainLyrics),
    coverArt: null,
    durationMs,
    trackWpm: computeTrackWpm(countLyricWords(plainLyrics), durationMs),
  };
}

function buildResults(
  primaryHits: LrcLibHit[],
  fallbackPool: LrcLibHit[],
  query: string,
): LyricSongResult[] {
  const seen = new Set<number>();
  const results: LyricSongResult[] = [];

  const pushHit = (hit: LrcLibHit, plainLyrics: string) => {
    if (!hit.id || seen.has(hit.id) || results.length >= MAX_RESULTS) return;
    seen.add(hit.id);
    results.push(toResult(hit, plainLyrics));
  };

  for (const hit of primaryHits) {
    const plainLyrics = resolveTypableLyrics(hit, fallbackPool);
    if (plainLyrics) pushHit(hit, plainLyrics);
  }

  for (const hit of fallbackPool) {
    if (seen.has(hit.id)) continue;
    const plainLyrics = extractTypableLyrics(hit.plainLyrics);
    if (!plainLyrics) continue;
    if (!isRelevantToQuery(hit, query)) continue;
    pushHit(hit, plainLyrics);
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
    const fallbackPool = needsFallback ? await fetchFallbackPool(query) : [];

    const results = buildResults(primaryHits, fallbackPool, query);
    const enriched = await enrichWithCoverArt(results);

    return Response.json({ results: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: 'search_failed', message }, { status: 500 });
  }
};
