import type { TranslationKey } from '@/i18n';
import type { LyricSongResult } from '@/utils/lyrics/types';
import { DIFFICULTY_BADGE_CLASSES } from '@/utils/lyrics/typingDifficulty';

interface SongCardProps {
  song: LyricSongResult;
  tierLabel: string;
  onSelect: (song: LyricSongResult) => void;
}

/** osu!lazer-inspired song pick card for lyric search results. */
export default function SongCard({ song, tierLabel, onSelect }: SongCardProps) {
  const badgeClass = DIFFICULTY_BADGE_CLASSES[song.difficulty.color];

  return (
    <button
      type="button"
      onClick={() => onSelect(song)}
      className="group flex h-full min-h-[7.5rem] flex-col rounded-xl border border-slate-700/80 bg-slate-800/90 p-4 text-left transition-colors hover:border-slate-600 hover:bg-slate-700/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-slate-50 group-hover:text-white">
          {song.title}
        </p>
        <p className="mt-1 truncate text-sm text-slate-400">{song.artist}</p>
        {song.album ? (
          <p className="mt-0.5 truncate text-xs text-slate-500">{song.album}</p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={[
            'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
            badgeClass,
          ].join(' ')}
        >
          {tierLabel}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-slate-500">
          {song.difficulty.score}
        </span>
      </div>
    </button>
  );
}

export function SongCardSkeleton() {
  return (
    <div
      className="min-h-[7.5rem] animate-pulse rounded-xl border border-slate-800 bg-slate-800/60 p-4"
      aria-hidden="true"
    >
      <div className="h-4 w-3/4 rounded bg-slate-700/80" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-700/60" />
      <div className="mt-auto pt-6">
        <div className="h-5 w-16 rounded-full bg-slate-700/70" />
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
