import { useCallback, useEffect, useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppProvider';
import { useLyricsSearch } from '@/hooks/useLyricsSearch';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import Icon from '@/components/ui/icons/Icon';
import SongCard, { SongCardSkeleton, difficultyTierLabel } from '@/components/multiplayer/setup/SongCard';
import type { LyricSongResult } from '@/utils/lyrics/types';
import { focusRingClassName, focusRingInsetClassName } from '@/utils/a11y/focusRing';
import { sanitizeSearchQuery } from '@/utils/security/sanitizeText';
import { NetworkEmptyState } from '@/components/ui';

const SKELETON_COUNT = 6;

export interface LyricsSearchPanelProps {
  onSelect: (song: LyricSongResult) => void;
  selectedSongId?: number | null;
  enabled?: boolean;
  /** Modal uses larger chrome; inline fits the Zen practice layout. */
  variant?: 'inline' | 'modal';
  autoFocus?: boolean;
  inputId?: string;
  className?: string;
}

export default function LyricsSearchPanel({
  onSelect,
  selectedSongId = null,
  enabled = true,
  variant = 'inline',
  autoFocus = false,
  inputId,
  className = '',
}: LyricsSearchPanelProps) {
  const { t } = useApp();
  const generatedId = useId();
  const searchInputId = inputId ?? `lyrics-search-${generatedId}`;
  const listRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    results,
    isSearching,
    error,
    hasQuery,
    showEmpty,
    isPendingSearch,
    showResultsArea,
    handleRetrySearch,
  } = useLyricsSearch({ enabled });

  const handleSelect = useCallback(
    (song: LyricSongResult) => {
      onSelect(song);
    },
    [onSelect],
  );

  const handleActivate = useCallback(
    (index: number) => {
      const song = results[index];
      if (song) handleSelect(song);
    },
    [handleSelect, results],
  );

  const listNavEnabled = enabled && results.length > 0 && !isSearching && !error;
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

  const isModal = variant === 'modal';
  const needsScroll = isSearching || isPendingSearch || results.length > 6;

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.3, ease: 'easeOut' } }}
      className={[
        isModal
          ? 'flex w-[90vw] max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
          : 'mx-auto w-full max-w-4xl',
        needsScroll && isModal ? 'max-h-[min(90vh,52rem)] overflow-hidden' : '',
        className,
      ].join(' ')}
      onKeyDown={onKeyDown}
    >
      <div
        className={[
          isModal ? 'shrink-0 px-4' : 'px-0',
          showResultsArea
            ? isModal
              ? 'border-b border-slate-200 py-4 dark:border-slate-800'
              : 'pb-4'
            : isModal
              ? 'py-3'
              : '',
        ].join(' ')}
      >
        <label htmlFor={searchInputId} className="sr-only">
          {t.multiplayer.lyricsSearchPlaceholder}
        </label>
        <div className="relative">
          <input
            id={searchInputId}
            type="text"
            role="searchbox"
            inputMode="search"
            enterKeyHint="search"
            autoFocus={autoFocus}
            value={query}
            onChange={(event) => setQuery(sanitizeSearchQuery(event.target.value))}
            placeholder={t.multiplayer.lyricsSearchPlaceholder}
            aria-controls={`${searchInputId}-results`}
            aria-activedescendant={
              listNavEnabled && activeIndex >= 0 ? `song-result-${activeIndex}` : undefined
            }
            className={[
              'w-full rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-50 dark:placeholder:text-slate-500',
              focusRingClassName,
              isModal ? 'py-4 text-lg sm:text-xl' : 'py-3 text-base',
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
                  'rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100',
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
          <p className="mt-2 text-xs text-slate-500" id={`${searchInputId}-hint`}>
            {t.multiplayer.lyricsSearchKeyboardHint}
          </p>
        ) : null}
      </div>

      {showResultsArea ? (
        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: 'easeOut' } }}
          id={`${searchInputId}-results`}
          ref={listRef}
          role="listbox"
          aria-label={t.multiplayer.lyricsSearchResults}
          className={[
            isModal ? 'rounded-b-2xl bg-slate-50 dark:bg-slate-900/80' : '',
            needsScroll
              ? isModal
                ? 'max-h-[min(calc(90vh-5rem),46rem)] overflow-y-auto'
                : 'max-h-[min(50vh,28rem)] overflow-y-auto'
              : '',
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
            <p className="px-2 py-6 text-center text-sm text-slate-500">
              {t.multiplayer.lyricsSearchEmpty}
            </p>
          ) : isSearching || isPendingSearch ? (
            <div
              className={[
                'grid grid-cols-1 gap-4',
                isModal ? 'p-4 md:grid-cols-2' : 'gap-3 md:grid-cols-2',
              ].join(' ')}
              aria-busy="true"
            >
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <SongCardSkeleton key={`sk-${index}`} />
              ))}
            </div>
          ) : (
            <div
              className={[
                'grid grid-cols-1 gap-4',
                isModal ? 'p-4 md:grid-cols-2' : 'gap-3 md:grid-cols-2',
              ].join(' ')}
            >
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
        </motion.div>
      ) : null}
    </motion.div>
  );
}
