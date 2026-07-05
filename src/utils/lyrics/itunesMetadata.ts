export interface ItunesTrackMetadata {
  coverArt: string | null;
  durationMs: number | null;
}

const ITUNES_SEARCH = 'https://itunes.apple.com/search';

/** Fetches album artwork and track duration from the public iTunes Search API. */
export async function fetchItunesMetadata(
  title: string,
  artist: string,
): Promise<ItunesTrackMetadata> {
  try {
    const term = encodeURIComponent(`${title} ${artist}`.trim());
    const response = await fetch(`${ITUNES_SEARCH}?term=${term}&entity=song&limit=1`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return { coverArt: null, durationMs: null };
    }

    const data = (await response.json()) as {
      results?: Array<{ artworkUrl100?: string; trackTimeMillis?: number }>;
    };

    const track = data.results?.[0];
    if (!track) {
      return { coverArt: null, durationMs: null };
    }

    const coverArt = track.artworkUrl100
      ? track.artworkUrl100.replace('100x100bb', '300x300bb').replace('100x100', '300x300')
      : null;

    const durationMs =
      typeof track.trackTimeMillis === 'number' && track.trackTimeMillis > 0
        ? track.trackTimeMillis
        : null;

    return { coverArt, durationMs };
  } catch {
    return { coverArt: null, durationMs: null };
  }
}

/** Formats milliseconds as m:ss for list display. */
export function formatDurationMs(ms: number | null | undefined): string | null {
  if (!ms || ms <= 0) return null;
  const totalSec = Math.round(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
