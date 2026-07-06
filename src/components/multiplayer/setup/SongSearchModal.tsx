import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import Icon from '@/components/ui/icons/Icon';
import SongCard, { SongCardSkeleton, difficultyTierLabel } from '@/components/multiplayer/setup/SongCard';
import type { LyricSongResult } from '@/utils/lyrics/types';
import { mergeSongProgress } from '@/utils/progress/songProgress';
import { SESSION_COMPLETE_EVENT } from '@/utils/app/events';
import { getCachedLyricsSearch, setCachedLyricsSearch } from '@/utils/lyrics/lyricsSearchCache';

interface SongSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (song: LyricSongResult) => void;
  /** Highlights the currently selected track in the results grid. */
  selectedSongId?: number | null;
}

const SKELETON_COUNT = 6;
const DEBOUNCE_MS = 400;

export default function SongSearchModal({
  open,
  onClose,
  onSelect,
  selectedSongId = null,
}: SongSearchModalProps) {
  const { t } = useApp();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LyricSongResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const hasQuery = query.length > 0;

  useLockBodyScroll(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (debouncedQuery.length < 2) {
      setResults([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    const cached = getCachedLyricsSearch(debouncedQuery);
    if (cached) {
      setResults(mergeSongProgress(cached));
      setError(null);
      setIsSearching(false);
      return;
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
  }, [debouncedQuery, open, t.multiplayer.lyricsSearchError]);

  useEffect(() => {
    if (!open) return;
    const refresh = () => setResults((prev) => mergeSongProgress(prev));
    window.addEventListener(SESSION_COMPLETE_EVENT, refresh);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, refresh);
  }, [open]);

  const handleSelect = useCallback(
    (song: LyricSongResult) => {
      onSelect(song);
      onClose();
    },
    [onClose, onSelect],
  );

  const handleDialogClose = () => {
    onClose();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (!open) return;
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  const showEmpty =
    !isSearching && !error && debouncedQuery.length >= 2 && results.length === 0;
  const isPendingSearch = query.trim().length >= 2 && debouncedQuery.length < 2;
  const showResultsArea = query.trim().length >= 2 || isSearching;
  const needsScroll =
    isSearching || isPendingSearch || results.length > 6;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      onCancel={handleDialogClose}
      onClick={handleBackdropClick}
      aria-labelledby="song-search-title"
      aria-hidden={!open}
      className={[
        'modal-enter fixed inset-0 z-[200] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-black/70',
        open ? '' : 'pointer-events-none invisible',
      ].join(' ')}
    >
      <div
        role="document"
        className={[
          'flex w-[min(100%,56rem)] flex-col rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl',
          needsScroll ? 'max-h-[min(90vh,52rem)] overflow-hidden' : '',
        ].join(' ')}
        onClick={(event) => event.stopPropagation()}
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
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.multiplayer.lyricsSearchPlaceholder}
              className={[
                'w-full rounded-xl bg-slate-800 py-4 text-lg text-slate-50 placeholder:text-slate-500 outline-none sm:text-xl',
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
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
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
        </div>

        {showResultsArea ? (
          <div
            className={[
              'rounded-b-2xl bg-slate-900/80',
              needsScroll ? 'max-h-[min(calc(90vh-5rem),46rem)] overflow-y-auto' : '',
            ].join(' ')}
          >
            {error ? (
              <p className="px-4 py-6 text-center text-sm text-red-400">{error}</p>
            ) : showEmpty ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                {t.multiplayer.lyricsSearchEmpty}
              </p>
            ) : isSearching || isPendingSearch ? (
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <SongCardSkeleton key={`sk-${index}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                {results.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    tierLabel={difficultyTierLabel(song.difficulty.tier, t)}
                    isSelected={selectedSongId !== null && song.id === selectedSongId}
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
