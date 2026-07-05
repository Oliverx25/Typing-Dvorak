import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import Icon from '@/components/ui/Icon';
import SongCard, { SongCardSkeleton, difficultyTierLabel } from '@/components/multiplayer/SongCard';
import type { LyricSongResult } from '@/utils/lyrics/types';

interface SongSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (lyrics: string) => void;
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
      onSelect(song.plainLyrics);
      onClose();
    },
    [onClose, onSelect],
  );

  const showEmpty =
    !isSearching && !error && debouncedQuery.length >= 2 && results.length === 0;
  const showHint = debouncedQuery.length < 2 && !isSearching;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="song-search-title"
      className="modal-enter m-auto w-[min(100%-1.5rem,56rem)] max-h-[min(90vh,52rem)] rounded-2xl border border-slate-700 bg-slate-900 p-0 text-slate-100 shadow-2xl backdrop:bg-black/70"
    >
      <div className="flex max-h-[min(90vh,52rem)] flex-col">
        <div className="relative border-b border-slate-800">
          <label htmlFor="song-search-input" className="sr-only">
            {t.multiplayer.lyricsSearchPlaceholder}
          </label>
          <input
            id="song-search-input"
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.multiplayer.lyricsSearchPlaceholder}
            className="w-full rounded-t-2xl bg-slate-800 py-6 pr-14 pl-6 text-xl text-slate-50 placeholder:text-slate-500 outline-none sm:text-2xl"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-slate-500">
            {isSearching ? (
              <span
                className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400"
                aria-hidden="true"
              />
            ) : (
              <Icon name="search" size={22} className="text-slate-500" />
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.multiplayer.close}
            className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-700 hover:text-slate-200 sm:hidden"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2">
          <h2 id="song-search-title" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t.multiplayer.lyricsSearchTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.multiplayer.close}
            className="hidden rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200 sm:inline-flex"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-b-2xl bg-slate-900 p-4">
          {error ? (
            <p className="py-12 text-center text-sm text-red-400">{error}</p>
          ) : showHint ? (
            <p className="py-12 text-center text-sm text-slate-500">{t.multiplayer.lyricsSearchHint}</p>
          ) : showEmpty ? (
            <p className="py-12 text-center text-sm text-slate-500">{t.multiplayer.lyricsSearchEmpty}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
