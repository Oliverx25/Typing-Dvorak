import UserAvatar from '@/components/auth/profile/UserAvatar';
import ModifierIcon from '@/components/multiplayer/setup/ModifierIcon';
import { AccuracyDonutChart, GradeBadge } from '@/components/ui';
import { calculateGrade } from '@/utils/grading';
import { focusRingCardClassName } from '@/utils/a11y/focusRing';
import {
  estimateRaceHitBreakdown,
  formatRaceScore,
} from '@/utils/multiplayer/raceScoring';
import type { RaceParticipantProgress } from '@/types/multiplayer';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig';

interface RaceResultCardLabels {
  title: string;
  youLabel: string;
  winnerLabel: string;
  wpmLabel: string;
  accuracyLabel: string;
  comboLabel: string;
  scoreLabel: string;
  maxComboLabel: string;
  finishedLabel: string;
  correctLabel: string;
  errorsLabel: string;
  rankLabel: string;
}

interface RaceResultCardProps {
  entry: RaceParticipantProgress;
  rank: number;
  isActive: boolean;
  isSelf: boolean;
  labels: RaceResultCardLabels;
  totalMultiplier: number;
  raceCharCount: number;
  modifiers: RaceModifier[];
  trackTitle?: string | null;
  trackArtist?: string | null;
  onFocus: () => void;
}

export default function RaceResultCard({
  entry,
  rank,
  isActive,
  isSelf,
  labels,
  totalMultiplier,
  raceCharCount,
  modifiers,
  trackTitle,
  trackArtist,
  onFocus,
}: RaceResultCardProps) {
  const grade = calculateGrade(entry.accuracy, totalMultiplier);
  const isWinner = rank === 1;
  const { correct, errors } = estimateRaceHitBreakdown(
    entry.accuracy,
    entry.percentage,
    raceCharCount,
    entry.finished ?? false,
  );

  const cardShell = [
    'w-full overflow-hidden rounded-[1.75rem] border bg-[var(--color-surface-elevated)]/95 backdrop-blur-md transition-all duration-500 ease-out origin-center will-change-transform',
    focusRingCardClassName,
    isActive
      ? 'scale-100 border-[var(--color-border)] opacity-100 shadow-2xl shadow-black/30'
      : 'scale-[0.88] cursor-pointer border-[var(--color-border)]/60 opacity-50 hover:scale-[0.92] hover:opacity-75',
  ].join(' ');

  if (!isActive) {
    return (
      <article
        className={cardShell}
        onClick={onFocus}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onFocus();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${labels.rankLabel} ${rank}: ${entry.name}`}
      >
        <div className="border-b border-[var(--color-border)] px-4 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            #{rank}
          </p>
          <div className="mt-2 flex flex-col items-center gap-2">
            <UserAvatar
              avatarUrl={entry.avatarUrl}
              initials={entry.initials}
              avatarSource={entry.avatarSource}
              size={36}
            />
            <p className="truncate max-w-full text-sm font-semibold text-[var(--color-text)]">
              {entry.name}
              {isSelf ? (
                <span className="ml-1 text-xs font-normal text-[var(--color-text-muted)]">
                  ({labels.youLabel})
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 px-4 py-5">
          <GradeBadge grade={grade} className="h-9 min-w-9 text-base" />
          <p className="font-mono text-2xl font-bold tabular-nums text-[var(--color-text)]">
            {formatRaceScore(entry.score)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            {labels.scoreLabel}
          </p>
        </div>

        <dl className="space-y-1.5 border-t border-[var(--color-border)] px-4 py-3 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--color-text-muted)]">{labels.accuracyLabel}</dt>
            <dd className="font-mono font-semibold text-[var(--color-text)]">
              {Math.round(entry.accuracy)}%
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--color-text-muted)]">{labels.maxComboLabel}</dt>
            <dd className="font-mono font-semibold text-[var(--color-text)]">{entry.maxCombo}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--color-text-muted)]">{labels.wpmLabel}</dt>
            <dd className="font-mono font-semibold text-[var(--color-text)]">
              {Math.round(entry.wpm)}
            </dd>
          </div>
        </dl>

        {modifiers.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1.5 border-t border-[var(--color-border)] px-3 py-2">
            {modifiers.map((modifier) => (
              <ModifierIcon
                key={modifier}
                modifier={modifier}
                isActive
                readOnly
                size="sm"
              />
            ))}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article className={cardShell} aria-current="true">
      <div className="border-b border-[var(--color-border)] px-5 py-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-highlight)]">
          {isWinner ? labels.winnerLabel : `#${rank}`}
        </p>
        <div className="mt-3 flex flex-col items-center gap-2">
          <UserAvatar
            avatarUrl={entry.avatarUrl}
            initials={entry.initials}
            avatarSource={entry.avatarSource}
            size={48}
          />
          <div className="min-w-0 text-center">
            <p className="truncate font-semibold text-[var(--color-text)]">
              {entry.name}
              {isSelf ? (
                <span className="ml-1 text-xs font-normal text-[var(--color-text-muted)]">
                  ({labels.youLabel})
                </span>
              ) : null}
            </p>
            {trackTitle ? (
              <p className="mt-0.5 truncate text-sm font-medium text-[var(--color-text)]">
                {trackTitle}
              </p>
            ) : null}
            {trackArtist ? (
              <p className="truncate text-xs text-[var(--color-text-muted)]">{trackArtist}</p>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">{labels.title}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center px-6 py-6">
        <AccuracyDonutChart
          accuracy={entry.accuracy}
          grade={grade}
          animateKey={`${rank}-${entry.userId}`}
        />

        <p className="mt-5 font-mono text-4xl font-bold tabular-nums tracking-tight text-[var(--color-text)]">
          {formatRaceScore(entry.score)}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          {labels.scoreLabel}
        </p>

        {modifiers.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {modifiers.map((modifier) => (
              <ModifierIcon
                key={modifier}
                modifier={modifier}
                isActive
                readOnly
                size="sm"
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-[var(--color-border)] bg-[var(--color-border)]">
        <div className="bg-[var(--color-surface-elevated)] px-3 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {labels.accuracyLabel}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-[var(--color-correct)]">
            {entry.accuracy.toFixed(1)}%
          </p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] px-3 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {labels.maxComboLabel}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-[var(--color-text)]">
            {entry.maxCombo}
          </p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] px-3 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {labels.wpmLabel}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-[var(--color-text)]">
            {Math.round(entry.wpm)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-[var(--color-border)] bg-[var(--color-border)]">
        <div className="bg-[var(--color-surface-elevated)] px-3 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-correct)]">
            {labels.correctLabel}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-[var(--color-correct)]">{correct}</p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] px-3 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-incorrect)]">
            {labels.errorsLabel}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-[var(--color-incorrect)]">{errors}</p>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] px-5 py-3 text-center text-xs text-[var(--color-text-muted)]">
        {entry.finished ? labels.finishedLabel : `${Math.round(entry.percentage)}%`} ·{' '}
        {entry.combo} {labels.comboLabel}
      </div>
    </article>
  );
}
