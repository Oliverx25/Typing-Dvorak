import type { APIRoute } from 'astro';
import { sanitizeLyrics } from '@/utils/lyrics/sanitizeLyrics';
import { calculateTypingDifficulty } from '@/utils/lyrics/typingDifficulty';
import { fetchItunesMetadata } from '@/utils/lyrics/itunesMetadata';
import type { LyricSongResult } from '@/utils/lyrics/types';

const LRCLIB_SEARCH = 'https://lrclib.net/api/search';
const USER_AGENT = 'TypingDvorak/2.0 (lyrics-practice; +https://typing-dvorak.vercel.app)';

interface LrcLibHit {
  id: number;
  name?: string;
  artistName?: string;
  albumName?: string;
  plainLyrics?: string | null;
  instrumental?: boolean;
  duration?: number;
}

async function enrichWithCoverArt(results: LyricSongResult[]): Promise<LyricSongResult[]> {
  return Promise.all(
    results.map(async (item) => {
      const itunes = await fetchItunesMetadata(item.title, item.artist);
      return {
        ...item,
        coverArt: itunes.coverArt,
        durationMs: itunes.durationMs ?? item.durationMs,
      };
    }),
  );
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim() ?? '';

  if (query.length < 2) {
    return Response.json({ results: [] satisfies LyricSongResult[] });
  }

  try {
    const response = await fetch(`${LRCLIB_SEARCH}?q=${encodeURIComponent(query)}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'search_failed', message: `LRCLIB responded with ${response.status}` },
        { status: 502 },
      );
    }

    const hits = (await response.json()) as LrcLibHit[];
    const seen = new Set<number>();

    const results: LyricSongResult[] = [];

    for (const hit of hits) {
      if (!hit.id || seen.has(hit.id)) continue;
      if (hit.instrumental || !hit.plainLyrics?.trim()) continue;

      const plainLyrics = sanitizeLyrics(hit.plainLyrics);
      if (plainLyrics.length < 20) continue;

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
      });

      if (results.length >= 24) break;
    }

    const enriched = await enrichWithCoverArt(results);

    return Response.json({ results: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: 'search_failed', message }, { status: 500 });
  }
};
