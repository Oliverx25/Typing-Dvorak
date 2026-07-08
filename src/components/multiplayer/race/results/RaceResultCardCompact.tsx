import { memo } from 'react';
import UserAvatar from '@/components/auth/profile/UserAvatar';
import { GradeBadge } from '@/components/ui';
import GlassCardBackground from '@/components/multiplayer/race/results/GlassCardBackground';
import { focusRingCardClassName } from '@/utils/a11y/focusRing';
import { formatRaceScore } from '@/utils/multiplayer/raceScoring';
import type { Grade } from '@/utils/grading';
import type { RaceParticipantProgress } from '@/types/multiplayer';

interface RaceResultCardCompactProps {
  entry: RaceParticipantProgress;
  rank: number;
  grade: Grade;
  isSelf: boolean;
  rankLabel: string;
  youLabel: string;
  accuracyLabel: string;
  maxComboLabel: string;
  wpmLabel: string;
  scoreLabel: string;
  coverUrl?: string | null;
  onFocus: () => void;
}

function RaceResultCardCompact({
  entry,
  rank,
  grade,
  isSelf,
  rankLabel,
  youLabel,
  accuracyLabel,
  maxComboLabel,
  wpmLabel,
  scoreLabel,
  coverUrl,
  onFocus,
}: RaceResultCardCompactProps) {
  return (
    <article
      className={[
        'relative w-full scale-[0.88] cursor-pointer overflow-visible rounded-2xl opacity-50 shadow-xl transition-all duration-500 ease-out will-change-transform origin-center hover:scale-[0.92] hover:opacity-75',
        focusRingCardClassName,
      ].join(' ')}
      onClick={onFocus}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onFocus();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${rankLabel} ${rank}: ${entry.name}`}
    >
      <GlassCardBackground coverUrl={coverUrl} />

      <div className="relative z-10 px-4 pb-4 pt-8 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          #{rank}
        </p>

        <div className="mx-auto mt-2 w-fit rounded-full border border-slate-700/80">
          <UserAvatar
            avatarUrl={entry.avatarUrl}
            initials={entry.initials}
            avatarSource={entry.avatarSource}
            size={36}
          />
        </div>

        <p className="mt-2 truncate text-sm font-semibold text-white">
          {entry.name}
          {isSelf ? <span className="ml-1 text-xs font-normal text-white/50">({youLabel})</span> : null}
        </p>

        <div className="mt-4 flex flex-col items-center gap-2">
          <GradeBadge grade={grade} className="h-9 min-w-9 text-base" />
          <p className="font-mono text-2xl font-light tabular-nums text-white">
            {formatRaceScore(entry.score)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-white/40">{scoreLabel}</p>
        </div>

        <dl className="mt-4 space-y-1.5 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-white/50">{accuracyLabel}</dt>
            <dd className="font-mono font-semibold text-white">{Math.round(entry.accuracy)}%</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-white/50">{maxComboLabel}</dt>
            <dd className="font-mono font-semibold text-white">{entry.maxCombo}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-white/50">{wpmLabel}</dt>
            <dd className="font-mono font-semibold text-white">{Math.round(entry.wpm)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default memo(RaceResultCardCompact);
