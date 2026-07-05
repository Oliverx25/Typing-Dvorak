import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import Icon from '@/components/ui/icons/Icon';
import SongCard, { SongCardSkeleton, difficultyTierLabel } from '@/components/multiplayer/setup/SongCard';
import type { LyricSongResult } from '@/utils/lyrics/types';

interface SongSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (song: LyricSongResult) => void;
}

const SKELETON_COUNT = 6;
const DEBOUNCE_MS = 400;

export default function SongSearchModal({ open, onClose, onSelect }: SongSearchModalProps) {
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
      setQuery('');
      setResults([]);
      setError(null);
      setIsSearching(false);
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
        if (!cancelled) setResults(next);
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

  const handleSelect = useCallback(
    (song: LyricSongResult) => {
      onSelect(song);
      onClose();
    },
    [onClose, onSelect],
  );

  const showEmpty =
    !isSearching && !error && debouncedQuery.length >= 2 && results.length === 0;
  const showHint = debouncedQuery.length < 2 && !isSearching;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      onClick={handleBackdropClick}
      aria-labelledby="song-search-title"
      className="modal-enter fixed inset-0 m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-black/70"
    >
      <div
        role="document"
        className="flex h-[min(90vh,52rem)] w-[min(100%,56rem)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-slate-800 px-4 py-4">
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

        <div className="min-h-0 flex-1 overflow-y-auto rounded-b-2xl bg-slate-900/80">
          {error ? (
            <p className="p-4 py-12 text-center text-sm text-red-400">{error}</p>
          ) : showHint ? (
            <p className="p-4 py-12 text-center text-sm text-slate-500">
              {t.multiplayer.lyricsSearchHint}
            </p>
          ) : showEmpty ? (
            <p className="p-4 py-12 text-center text-sm text-slate-500">
              {t.multiplayer.lyricsSearchEmpty}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              {isSearching
                ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <SongCardSkeleton key={`sk-${index}`} />
                  ))
                : results.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      tierLabel={difficultyTierLabel(song.difficulty.tier, t)}
                      onSelect={handleSelect}
                    />
                  ))}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
