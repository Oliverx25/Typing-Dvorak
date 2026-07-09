import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAnimatedModalDialog } from '@/hooks/useAnimatedModalDialog';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import Icon from '@/components/ui/icons/Icon';
import SongCard, { SongCardSkeleton, difficultyTierLabel } from '@/components/multiplayer/setup/SongCard';
import type { LyricSongResult } from '@/utils/lyrics/types';
import { mergeSongProgress } from '@/utils/progress/songProgress';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';
import { getCachedLyricsSearch, setCachedLyricsSearch } from '@/utils/lyrics/lyricsSearchCache';
import { focusRingClassName, focusRingInsetClassName } from '@/utils/a11y/focusRing';
import { sanitizeSearchQuery } from '@/utils/security/sanitizeText';
import { NetworkEmptyState } from '@/components/ui';

interface SongSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (song: LyricSongResult) => void;
  selectedSongId?: number | null;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

const SKELETON_COUNT = 6;
const DEBOUNCE_MS = 400;

export default function SongSearchModal({
  open,
  onClose,
  onSelect,
  selectedSongId = null,
  returnFocusRef,
}: SongSearchModalProps) {
  const { t } = useApp();
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LyricSongResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchAttempt, setSearchAttempt] = useState(0);

  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const hasQuery = query.length > 0;

  const { dialogRef, handleDialogClose, handleCancel, requestClose, panelClassName, dialogClassName, closing } =
    useAnimatedModalDialog({
      open,
      onClose,
      returnFocusRef,
    });

  useLockBodyScroll(open || closing);

  const handleSelect = useCallback(
    (song: LyricSongResult) => {
      onSelect(song);
      requestClose();
    },
    [onSelect, requestClose],
  );

  const handleActivate = useCallback(
    (index: number) => {
      const song = results[index];
      if (song) handleSelect(song);
    },
    [handleSelect, results],
  );

  const listNavEnabled = open && results.length > 0 && !isSearching && !error;
  const { activeIndex, onKeyDown, setActiveIndex } = useListKeyboardNav({
    itemCount: results.length,
    enabled: listNavEnabled,
    onActivate: handleActivate,
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [results, setActiveIndex]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const item = listRef.current?.querySelector<HTMLElement>(`[data-result-index="${activeIndex}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  useEffect(() => {
    setSearchAttempt(0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!open) return;

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
  }, [debouncedQuery, open, searchAttempt, t.multiplayer.lyricsSearchError]);

  const handleRetrySearch = () => {
    setError(null);
    setSearchAttempt((attempt) => attempt + 1);
  };

  useEffect(() => {
    if (!open) return;
    const refresh = () => setResults((prev) => mergeSongProgress(prev));
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, [open]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (!open || closing) return;
    if (event.target === dialogRef.current) {
      event.preventDefault();
      requestClose();
    }
  };

  const showEmpty =
    !isSearching && !error && debouncedQuery.length >= 2 && results.length === 0;
  const isPendingSearch = query.trim().length >= 2 && debouncedQuery.length < 2;
  const showResultsArea = query.trim().length >= 2 || isSearching;
  const needsScroll =
    isSearching || isPendingSearch || results.length > 6;

  if (!open && !closing) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="song-search-title"
      aria-modal="true"
      className={[
        dialogClassName,
        'fixed inset-0 z-[200] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-black/70',
      ].join(' ')}
    >
      <div
        role="document"
        className={[
          panelClassName,
          'flex w-[min(100%,56rem)] flex-col rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl',
          needsScroll ? 'max-h-[min(90vh,52rem)] overflow-hidden' : '',
        ].join(' ')}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div
          className={[
            'shrink-0 px-4',
            showResultsArea ? 'border-b border-slate-800 py-4' : 'py-3',
          ].join(' ')}
        >
          <label id="song-search-title" htmlFor="song-search-input" className="sr-only">
            {t.multiplayer.lyricsSearchPlaceholder}
          </label>
          <div className="relative">
            <input
              id="song-search-input"
              type="text"
              role="searchbox"
              inputMode="search"
              enterKeyHint="search"
              autoFocus
              value={query}
              onChange={(event) => setQuery(sanitizeSearchQuery(event.target.value))}
              placeholder={t.multiplayer.lyricsSearchPlaceholder}
              aria-controls="song-search-results"
              aria-activedescendant={
                listNavEnabled && activeIndex >= 0 ? `song-result-${activeIndex}` : undefined
              }
              className={[
                'w-full rounded-xl bg-slate-800 py-4 text-lg text-slate-50 placeholder:text-slate-500 sm:text-xl',
                focusRingClassName,
                hasQuery ? 'pl-5 pr-24' : 'px-5 pr-14',
              ].join(' ')}
              autoComplete="off"
              spellCheck={false}
            />

            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
              {hasQuery ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label={t.multiplayer.lyricsClearSearch}
                  className={[
                    'rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100',
                    focusRingInsetClassName,
                  ].join(' ')}
                >
                  <Icon name="x" size={18} />
                </button>
              ) : null}

              {isSearching ? (
                <span
                  className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-[var(--color-highlight)]"
                  aria-hidden="true"
                />
              ) : (
                <Icon name="search" size={20} className="text-slate-500" />
              )}
            </div>
          </div>
          {listNavEnabled ? (
            <p className="mt-2 text-xs text-slate-500" id="song-search-hint">
              {t.multiplayer.lyricsSearchKeyboardHint}
            </p>
          ) : null}
        </div>

        {showResultsArea ? (
          <div
            id="song-search-results"
            ref={listRef}
            role="listbox"
            aria-label={t.multiplayer.lyricsSearchResults}
            className={[
              'rounded-b-2xl bg-slate-900/80',
              needsScroll ? 'max-h-[min(calc(90vh-5rem),46rem)] overflow-y-auto' : '',
            ].join(' ')}
          >
            {error ? (
              <NetworkEmptyState
                compact
                title={t.network.searchFailedTitle}
                description={error || t.network.searchFailedDesc}
                actionLabel={t.network.retry}
                onAction={handleRetrySearch}
              />
            ) : showEmpty ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                {t.multiplayer.lyricsSearchEmpty}
              </p>
            ) : isSearching || isPendingSearch ? (
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2" aria-busy="true">
                {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <SongCardSkeleton key={`sk-${index}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                {results.map((song, index) => (
                  <SongCard
                    key={song.id}
                    id={`song-result-${index}`}
                    resultIndex={index}
                    song={song}
                    tierLabel={difficultyTierLabel(song.difficulty.tier, t)}
                    isSelected={selectedSongId !== null && song.id === selectedSongId}
                    isKeyboardActive={index === activeIndex}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
