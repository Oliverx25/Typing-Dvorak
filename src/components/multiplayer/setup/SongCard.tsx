import { useState } from 'react';
import type { TranslationKey } from '@/i18n';
import Icon from '@/components/ui/icons/Icon';
import type { LyricSongResult } from '@/utils/lyrics/types';
import { formatDurationMs } from '@/utils/lyrics/itunesMetadata';
import { DIFFICULTY_BADGE_CLASSES } from '@/utils/lyrics/typingDifficulty';

interface SongCardProps {
  song: LyricSongResult;
  tierLabel: string;
  onSelect: (song: LyricSongResult) => void;
}

function CoverArt({ src, title }: { src: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-900">
      {showImage ? (
        <img
          src={src!}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-600">
          <Icon name="music-note" size={28} />
        </div>
      )}
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      >
        <Icon name="check" size={22} className="text-cyan-300" />
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

/** Horizontal list-row song card for lyric search results. */
export default function SongCard({ song, tierLabel, onSelect }: SongCardProps) {
  const badgeClass = DIFFICULTY_BADGE_CLASSES[song.difficulty.color];
  const duration = formatDurationMs(song.durationMs);

  return (
    <button
      type="button"
      onClick={() => onSelect(song)}
      className="group flex w-full items-center gap-4 rounded-xl border border-transparent bg-slate-800/40 p-3 text-left transition-all hover:border-slate-600 hover:bg-slate-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
    >
      <CoverArt src={song.coverArt} title={song.title} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-200 group-hover:text-white">{song.title}</p>
        <p className="truncate text-sm text-slate-400">{song.artist}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={[
            'inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            badgeClass,
          ].join(' ')}
        >
          {tierLabel}
        </span>
        {duration ? (
          <span className="font-mono text-xs tabular-nums text-slate-500">{duration}</span>
        ) : null}
      </div>
    </button>
  );
}

export function SongCardSkeleton() {
  return (
    <div
      className="flex animate-pulse items-center gap-4 rounded-xl bg-slate-800/40 p-3"
      aria-hidden="true"
    >
      <div className="h-16 w-16 shrink-0 rounded-md bg-slate-700/80" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/5 rounded bg-slate-700/80" />
        <div className="h-3 w-2/5 rounded bg-slate-700/60" />
      </div>
      <div className="h-6 w-16 shrink-0 rounded-full bg-slate-700/70" />
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
