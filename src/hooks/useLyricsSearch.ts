import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { LyricSongResult } from '@/utils/lyrics/types';
import { mergeSongProgress } from '@/utils/progress/songProgress';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';
import { getCachedLyricsSearch, setCachedLyricsSearch } from '@/utils/lyrics/lyricsSearchCache';

const DEBOUNCE_MS = 400;

interface UseLyricsSearchOptions {
  /** When false, skips network fetch (e.g. closed modal). */
  enabled?: boolean;
}

export function useLyricsSearch({ enabled = true }: UseLyricsSearchOptions = {}) {
  const { t } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LyricSongResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchAttempt, setSearchAttempt] = useState(0);

  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const hasQuery = query.length > 0;

  const handleRetrySearch = useCallback(() => {
    setError(null);
    setSearchAttempt((attempt) => attempt + 1);
  }, []);

  useEffect(() => {
    setSearchAttempt(0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!enabled) return;

    if (debouncedQuery.length < 2) {
      setResults([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    const bypassCache = searchAttempt > 0;
    if (!bypassCache) {
      const cached = getCachedLyricsSearch(debouncedQuery);
      if (cached) {
        setResults(mergeSongProgress(cached));
        setError(null);
        setIsSearching(false);
        return;
      }
    }

    let cancelled = false;
    setIsSearching(true);
    setError(null);

    fetch(`/api/lyrics?q=${encodeURIComponent(debouncedQuery)}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          results?: LyricSongResult[];
          error?: string;
          message?: string;
        };
        if (!res.ok) {
          throw new Error(data.message ?? t.multiplayer.lyricsSearchError);
        }
        return data.results ?? [];
      })
      .then((next) => {
        if (!cancelled) {
          setCachedLyricsSearch(debouncedQuery, next);
          setResults(mergeSongProgress(next));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResults([]);
          setError(err instanceof Error ? err.message : t.multiplayer.lyricsSearchError);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, enabled, searchAttempt, t.multiplayer.lyricsSearchError]);

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => setResults((prev) => mergeSongProgress(prev));
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, [enabled]);

  const showEmpty =
    !isSearching && !error && debouncedQuery.length >= 2 && results.length === 0;
  const isPendingSearch = query.trim().length >= 2 && debouncedQuery.length < 2;
  const showResultsArea = query.trim().length >= 2 || isSearching;

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    hasQuery,
    debouncedQuery,
    showEmpty,
    isPendingSearch,
    showResultsArea,
    handleRetrySearch,
  };
}
