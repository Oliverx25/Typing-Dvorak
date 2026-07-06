import { useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import type { TranslationKey } from '@/i18n';
import { BestScoreLabel } from '@/components/ui';
import Icon from '@/components/ui/icons/Icon';
import SongWpmDisplay from '@/components/multiplayer/setup/SongWpmDisplay';
import type { LyricSongResult } from '@/utils/lyrics/types';
import { countLyricWords, DIFFICULTY_BADGE_CLASSES } from '@/utils/lyrics/typingDifficulty';
import { getSongProgress } from '@/utils/progress/songProgress';

interface SongCardProps {
  song: LyricSongResult;
  tierLabel: string;
  isSelected?: boolean;
  onSelect: (song: LyricSongResult) => void;
}

function BlurredBackdrop({ src }: { src: string | null }) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-slate-700/60 to-slate-900 opacity-80"
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-md transition-opacity duration-200 group-hover:opacity-30"
    />
  );
}

function Thumbnail({ src, title }: { src: string | null; title: string }) {
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-900 shadow-lg">
      {src ? (
        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-600">
          <Icon name="music-note" size={28} />
        </div>
      )}
      <span className="sr-only">{title}</span>
    </div>
  );
}

/** Immersive osu-style song card for lyric search results. */
export default function SongCard({ song, tierLabel, isSelected = false, onSelect }: SongCardProps) {
  const { t } = useApp();
  const [coverFailed, setCoverFailed] = useState(false);
  const coverSrc = song.coverArt && !coverFailed ? song.coverArt : null;
  const badgeClass = DIFFICULTY_BADGE_CLASSES[song.difficulty.color];
  const wordCount = countLyricWords(song.plainLyrics);
  const wordLabel = t.multiplayer.lyricsWordCount.replace('{count}', String(wordCount));
  const wpmUnit = t.multiplayer.lyricsWpmUnit;
  const stored = getSongProgress(song.id);
  const displayGrade = song.highestGrade ?? stored?.highestGrade ?? null;
  const displayScore = song.highestScore ?? stored?.highestScore ?? null;

  return (
    <button
      type="button"
      onClick={() => onSelect(song)}
      className={[
        'group relative flex h-24 w-full cursor-pointer overflow-hidden rounded-xl border bg-slate-800 transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-highlight)]/50',
        isSelected
          ? 'border-[var(--color-highlight)] ring-2 ring-[var(--color-highlight)]/30'
          : 'border-slate-700/50 hover:border-[var(--color-highlight)]',
      ].join(' ')}
    >
      {song.coverArt && !coverFailed ? (
        <img
          src={song.coverArt}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          onError={() => setCoverFailed(true)}
        />
      ) : null}
      <BlurredBackdrop src={coverSrc} />
      <div className="absolute right-2 top-2 z-20">
        <BestScoreLabel
          highestGrade={displayGrade}
          highestScore={displayScore}
          scoreUnit={t.multiplayer.raceScore}
        />
      </div>

      <div className="relative z-10 flex h-full w-full items-center gap-4 p-3">
        <Thumbnail src={coverSrc} title={song.title} />

        <div className="flex min-w-0 flex-grow flex-col">
          <p className="truncate text-base font-bold text-slate-100 group-hover:text-white">
            {song.title}
          </p>
          <p className="truncate text-sm text-slate-400">{song.artist}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center gap-1">
          <span
            className={[
              'inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              badgeClass,
            ].join(' ')}
          >
            {tierLabel}
          </span>
          <span className="font-mono text-xs text-slate-500">{wordLabel}</span>
          <SongWpmDisplay
            avgWpm={song.avgWpm ?? song.trackWpm}
            maxWpm={song.maxWpm}
            wpmUnit={wpmUnit}
            className="justify-end"
          />
        </div>
      </div>
    </button>
  );
}

export function SongCardSkeleton() {
  return (
    <div
      className="relative flex h-24 animate-pulse overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800"
      aria-hidden="true"
    >
      <div className="relative z-10 flex h-full w-full items-center gap-4 p-3">
        <div className="h-16 w-16 shrink-0 rounded-md bg-slate-700/80" />
        <div className="min-w-0 flex-grow space-y-2">
          <div className="h-4 w-4/5 rounded bg-slate-700/80" />
          <div className="h-3 w-3/5 rounded bg-slate-700/60" />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="h-5 w-16 rounded-full bg-slate-700/70" />
          <div className="h-3 w-12 rounded bg-slate-700/50" />
        </div>
      </div>
    </div>
  );
}

export function difficultyTierLabel(
  tier: LyricSongResult['difficulty']['tier'],
  t: TranslationKey,
): string {
  const labels: Record<LyricSongResult['difficulty']['tier'], string> = {
    easy: t.multiplayer.lyricsDifficultyEasy,
    normal: t.multiplayer.lyricsDifficultyNormal,
    hard: t.multiplayer.lyricsDifficultyHard,
    expert: t.multiplayer.lyricsDifficultyExpert,
  };
  return labels[tier];
}
