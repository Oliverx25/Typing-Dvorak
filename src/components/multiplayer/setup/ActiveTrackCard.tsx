import { useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { GradeBadge } from '@/components/ui';
import Icon from '@/components/ui/icons/Icon';
import { difficultyTierLabel } from '@/components/multiplayer/setup/SongCard';
import SongWpmDisplay from '@/components/multiplayer/setup/SongWpmDisplay';
import { DIFFICULTY_BADGE_CLASSES } from '@/utils/lyrics/typingDifficulty';
import { formatDurationMs } from '@/utils/lyrics/itunesMetadata';
import type { SelectedSongMeta } from '@/utils/lyrics/types';
import { getSongProgress } from '@/utils/progress/songProgress';

interface ActiveTrackCardProps {
  song: SelectedSongMeta;
  disabled?: boolean;
  /** Hide the change-track button (lobby guests). */
  readonly?: boolean;
  onChangeTrack?: () => void;
}

/** Beatmap-style card shown once a song is selected for the race. */
export default function ActiveTrackCard({
  song,
  disabled = false,
  readonly = false,
  onChangeTrack,
}: ActiveTrackCardProps) {
  const { t } = useApp();
  const [coverFailed, setCoverFailed] = useState(false);
  const stored = getSongProgress(song.id);
  const displayGrade = song.highestGrade ?? stored?.highestGrade ?? null;
  const coverSrc = song.coverArt && !coverFailed ? song.coverArt : null;
  const badgeClass = DIFFICULTY_BADGE_CLASSES[song.difficulty.color];
  const tierLabel = difficultyTierLabel(song.difficulty.tier, t);
  const duration = formatDurationMs(song.durationMs);

  return (
    <div className="relative flex h-32 items-center gap-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-4">
      {song.coverArt && !coverFailed ? (
        <img
          src={song.coverArt}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          onError={() => setCoverFailed(true)}
        />
      ) : null}

      {coverSrc ? (
        <img
          src={coverSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-sm"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-slate-700/60 to-slate-900 opacity-80"
        />
      )}

      <div className="relative z-10 h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-900 shadow-lg">
        {coverSrc ? (
          <img src={coverSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            <Icon name="music-note" size={40} />
          </div>
        )}
      </div>

      <div className="relative z-10 flex min-w-0 flex-grow flex-col gap-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-lg font-bold text-slate-100">{song.title}</p>
          <GradeBadge grade={displayGrade} />
        </div>
        <p className="truncate text-sm text-slate-400">{song.artist}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              badgeClass,
            ].join(' ')}
          >
            {tierLabel}
          </span>
          {duration ? (
            <span className="font-mono text-xs text-slate-500">{duration}</span>
          ) : null}
          <SongWpmDisplay
            avgWpm={song.avgWpm ?? song.trackWpm}
            maxWpm={song.maxWpm}
            wpmUnit={t.multiplayer.lyricsWpmUnit}
          />
        </div>
      </div>

      {!readonly && onChangeTrack ? (
        <button
          type="button"
          onClick={onChangeTrack}
          disabled={disabled}
          aria-label={t.multiplayer.lyricsChangeTrack}
          title={t.multiplayer.lyricsChangeTrack}
          className="relative z-10 shrink-0 self-start rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-slate-300 transition hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="refresh" size={18} />
        </button>
      ) : null}
    </div>
  );
}
