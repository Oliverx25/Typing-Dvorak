import type { LyricSongResult } from '@/utils/lyrics/types';

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 40;

const cache = new Map<string, { results: LyricSongResult[]; expiresAt: number }>();

function normalizeKey(query: string): string {
  return query.trim().toLowerCase();
}

export function getCachedLyricsSearch(query: string): LyricSongResult[] | null {
  const key = normalizeKey(query);
  const hit = cache.get(key);
  if (!hit) return null;

  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }

  return hit.results;
}

export function setCachedLyricsSearch(query: string, results: LyricSongResult[]): void {
  const key = normalizeKey(query);
  if (!key) return;

  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }

  cache.set(key, { results, expiresAt: Date.now() + CACHE_TTL_MS });
}
