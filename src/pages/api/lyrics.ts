import type { APIRoute } from 'astro';
import { buildLyricTimelineFromLrc } from '@/utils/lyrics/buildLyricTimeline';
import { parseLrc } from '@/utils/lyrics/parseLrc';
import { sanitizeLyrics } from '@/utils/lyrics/sanitizeLyrics';
import { isTypableLatinLyrics } from '@/utils/lyrics/latinScript';
import { stripMacrons } from '@/utils/lyrics/stripMacrons';
import { lyricsToTypableRomaji } from '@/utils/lyrics/toRomajiLyrics';
import {
  calculateTypingDifficulty,
  computeTrackWpm,
  countLyricWords,
} from '@/utils/lyrics/typingDifficulty';
import { fetchItunesMetadata } from '@/utils/lyrics/itunesMetadata';
import type { LyricSongResult } from '@/utils/lyrics/types';
import { sanitizeSearchQuery, sanitizeTypableText, sanitizeUserText } from '@/utils/security/sanitizeText';

const LRCLIB_SEARCH = 'https://lrclib.net/api/search';
const USER_AGENT = 'TypingDvorak/2.0 (lyrics-practice; +https://typing-dvorak.vercel.app)';
const MAX_RESULTS = 24;

interface LrcLibHit {
  id: number;
  name?: string;
  artistName?: string;
  albumName?: string;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
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
  const plainLyrics = sanitizeLyrics(stripMacrons(raw));
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

async function resolveTypableLyrics(
  hit: LrcLibHit,
  fallbackPool: LrcLibHit[],
): Promise<string | null> {
  const direct = extractTypableLyrics(hit.plainLyrics);
  if (direct) return direct;

  const fallback = findSameTrackFallback(hit, fallbackPool);
  if (fallback) return fallback;

  if (!hit.plainLyrics?.trim() || hit.instrumental) return null;
  const sanitized = sanitizeLyrics(stripMacrons(hit.plainLyrics));
  if (sanitized.length < 20 || isTypableLatinLyrics(sanitized)) return null;

  return lyricsToTypableRomaji(hit.plainLyrics);
}

function hitNeedsFallback(hit: LrcLibHit): boolean {
  if (!hit.plainLyrics?.trim() || hit.instrumental) return false;
  const plainLyrics = sanitizeLyrics(stripMacrons(hit.plainLyrics));
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

function resolveDurationMs(hit: LrcLibHit, durationMs: number | null): number | null {
  if (durationMs && durationMs > 0) return durationMs;
  if (typeof hit.duration === 'number' && hit.duration > 0) {
    return Math.round(hit.duration * 1000);
  }
  return null;
}

function resolveSyncedLyrics(hit: LrcLibHit, fallbackPool: LrcLibHit[]): string | null {
  if (hit.syncedLyrics?.trim()) return hit.syncedLyrics;
  const key = trackKey(hit.name?.trim() ?? '', hit.artistName?.trim() ?? '');
  for (const alt of fallbackPool) {
    if (trackKey(alt.name?.trim() ?? '', alt.artistName?.trim() ?? '') !== key) continue;
    if (alt.syncedLyrics?.trim()) return alt.syncedLyrics;
  }
  return null;
}

function enrichSongMetrics(
  hit: LrcLibHit,
  plainLyrics: string,
  durationMs: number | null,
  fallbackPool: LrcLibHit[],
): Pick<
  LyricSongResult,
  'avgWpm' | 'maxWpm' | 'trackWpm' | 'difficulty' | 'lyricTimeline'
> {
  const resolvedDuration = resolveDurationMs(hit, durationMs);
  const synced = resolveSyncedLyrics(hit, fallbackPool);
  const lrcLines = synced ? parseLrc(synced) : [];
  const built =
    lrcLines.length > 0
      ? buildLyricTimelineFromLrc(lrcLines, plainLyrics, resolvedDuration)
      : null;

  const fallbackWpm = computeTrackWpm(countLyricWords(plainLyrics), resolvedDuration);
  const wpmStats = resolveSongWpmStats(built?.wpmProfile, fallbackWpm);

  return {
    ...wpmStats,
    difficulty: calculateTypingDifficulty(plainLyrics, built?.wpmProfile ?? null),
    lyricTimeline: built?.timeline ?? [],
  };
}

async function enrichWithCoverArt(
  results: LyricSongResult[],
  fallbackPool: LrcLibHit[],
  hitById: Map<number, LrcLibHit>,
): Promise<LyricSongResult[]> {
  return Promise.all(
    results.map(async (item) => {
      const hit = hitById.get(item.id);
      const itunes = await fetchItunesMetadata(item.title, item.artist);
      const durationMs = itunes.durationMs ?? item.durationMs;
      const metrics = hit
        ? enrichSongMetrics(hit, item.plainLyrics, durationMs, fallbackPool)
        : (() => {
            const fallbackWpm = computeTrackWpm(countLyricWords(item.plainLyrics), durationMs);
            const wpmStats = resolveSongWpmStats(null, fallbackWpm);
            return {
              ...wpmStats,
              difficulty: item.difficulty,
              lyricTimeline: item.lyricTimeline,
            };
          })();

      return {
        ...item,
        coverArt: itunes.coverArt,
        durationMs,
        ...metrics,
      };
    }),
  );
}

function toResult(
  hit: LrcLibHit,
  plainLyrics: string,
  fallbackPool: LrcLibHit[],
): LyricSongResult {
  const durationMs = resolveDurationMs(hit, null);
  const metrics = enrichSongMetrics(hit, plainLyrics, durationMs, fallbackPool);

  return {
    id: hit.id,
    title: sanitizeUserText(hit.name?.trim() || 'Unknown track', 200),
    artist: sanitizeUserText(hit.artistName?.trim() || 'Unknown artist', 200),
    album: hit.albumName?.trim() ? sanitizeUserText(hit.albumName.trim(), 200) : null,
    plainLyrics: sanitizeTypableText(plainLyrics),
    coverArt: null,
    durationMs,
    ...metrics,
  };
}

async function buildResults(
  primaryHits: LrcLibHit[],
  fallbackPool: LrcLibHit[],
  query: string,
): Promise<{ results: LyricSongResult[]; hitById: Map<number, LrcLibHit> }> {
  const seen = new Set<number>();
  const results: LyricSongResult[] = [];
  const hitById = new Map<number, LrcLibHit>();

  const pushHit = (hit: LrcLibHit, plainLyrics: string) => {
    if (!hit.id || seen.has(hit.id) || results.length >= MAX_RESULTS) return;
    seen.add(hit.id);
    hitById.set(hit.id, hit);
    results.push(toResult(hit, plainLyrics, fallbackPool));
  };

  await Promise.all(
    primaryHits.map(async (hit) => {
      const plainLyrics = await resolveTypableLyrics(hit, fallbackPool);
      return plainLyrics ? { hit, plainLyrics } : null;
    }),
  ).then((resolved) => {
    for (const item of resolved) {
      if (!item) continue;
      pushHit(item.hit, item.plainLyrics);
    }
  });

  for (const hit of fallbackPool) {
    if (seen.has(hit.id)) continue;
    const plainLyrics = extractTypableLyrics(hit.plainLyrics);
    if (!plainLyrics) continue;
    if (!isRelevantToQuery(hit, query)) continue;
    pushHit(hit, plainLyrics);
  }

  return { results, hitById };
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = sanitizeSearchQuery(url.searchParams.get('q') ?? '');

  if (query.length < 2) {
    return Response.json({ results: [] satisfies LyricSongResult[] });
  }

  try {
    const primaryHits = await fetchLrcLibHits(query);

    const needsFallback = primaryHits.some(hitNeedsFallback);
    const fallbackPool = needsFallback ? await fetchFallbackPool(query) : [];

    const { results, hitById } = await buildResults(primaryHits, fallbackPool, query);
    const enriched = await enrichWithCoverArt(results, fallbackPool, hitById);

    return Response.json({ results: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: 'search_failed', message }, { status: 500 });
  }
};
