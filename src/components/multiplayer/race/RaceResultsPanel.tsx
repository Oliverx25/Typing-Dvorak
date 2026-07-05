import { useEffect, useState } from 'react';
import UserAvatar from '@/components/auth/profile/UserAvatar';
import LeaveRoomButton from '@/components/multiplayer/lobby/LeaveRoomControls';
import { Button } from '@/components/ui';
import {
  formatRaceScore,
} from '@/utils/multiplayer/raceScoring';
import { calculateGrade, gradeRingClass } from '@/utils/grading';
import type { VictoryCondition } from '@/utils/multiplayer/roomConfig';
import type { RaceParticipantProgress } from '@/types/multiplayer';

interface RaceResultsPanelProps {
  entries: RaceParticipantProgress[];
  currentUserId: string | null;
  primaryVictory: VictoryCondition;
  title: string;
  youLabel: string;
  winnerLabel: string;
  wpmLabel: string;
  accuracyLabel: string;
  comboLabel: string;
  scoreLabel: string;
  maxComboLabel: string;
  finishedLabel: string;
  returnToLobbyLabel: string;
  swipeHint: string;
  leaveLabel: string;
  totalMultiplier?: number;
  onReturnToLobby: () => void;
}

function useAnimatedScore(score: number, activeKey: string | number): number {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1500;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    setDisplayScore(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, activeKey]);

  return displayScore;
}

export default function RaceResultsPanel({
  entries,
  currentUserId,
  title,
  youLabel,
  winnerLabel,
  wpmLabel,
  accuracyLabel,
  comboLabel,
  scoreLabel,
  maxComboLabel,
  finishedLabel,
  returnToLobbyLabel,
  swipeHint,
  leaveLabel,
  totalMultiplier = 1,
  onReturnToLobby,
}: RaceResultsPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const entry = entries[activeIndex] ?? entries[0];
  const grade = entry ? calculateGrade(entry.accuracy, totalMultiplier) : 'D';
  const animatedScore = useAnimatedScore(entry?.score ?? 0, `${activeIndex}-${entry?.userId ?? ''}`);

  if (!entry) {
    return null;
  }

  const isSelf = entry.userId === currentUserId;
  const isWinner = activeIndex === 0;

  return (
    <div className="relative mx-auto max-w-lg">
      <div
        className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-[2rem] bg-[var(--color-highlight)]/10 blur-3xl"
        aria-hidden
      />

      <div
        className={[
          'overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/95 backdrop-blur-md',
          'scale-100 opacity-100 shadow-2xl shadow-black/30 transition-all duration-500 ease-out',
        ].join(' ')}
      >
        <div className="border-b border-[var(--color-border)] px-5 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-highlight)]">
            {isWinner ? winnerLabel : `#${activeIndex + 1}`}
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <UserAvatar
              avatarUrl={entry.avatarUrl}
              initials={entry.initials}
              avatarSource={entry.avatarSource}
              size={40}
            />
            <div className="min-w-0 text-left">
              <p className="truncate font-semibold text-[var(--color-text)]">
                {entry.name}
                {isSelf ? (
                  <span className="ml-1 text-xs font-normal text-[var(--color-text-muted)]">
                    ({youLabel})
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">{title}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center px-6 py-8">
          <div
            className={[
              'relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br p-[3px]',
              gradeRingClass(grade),
            ].join(' ')}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-surface)]">
              <span
                className={[
                  'text-5xl font-black tracking-tight text-transparent bg-gradient-to-br bg-clip-text',
                  gradeRingClass(grade),
                ].join(' ')}
              >
                {grade}
              </span>
            </div>
          </div>

          <p className="mt-6 font-mono text-4xl font-bold tabular-nums tracking-tight text-[var(--color-text)]">
            {formatRaceScore(animatedScore)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {scoreLabel}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-px border-t border-[var(--color-border)] bg-[var(--color-border)]">
          <div className="bg-[var(--color-surface-elevated)] px-3 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {accuracyLabel}
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-[var(--color-text)]">
              {Math.round(entry.accuracy)}%
            </p>
          </div>
          <div className="bg-[var(--color-surface-elevated)] px-3 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {maxComboLabel}
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-[var(--color-text)]">
              {entry.maxCombo}
            </p>
          </div>
          <div className="bg-[var(--color-surface-elevated)] px-3 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {wpmLabel}
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-[var(--color-text)]">
              {Math.round(entry.wpm)}
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] px-5 py-3 text-center text-xs text-[var(--color-text-muted)]">
          {entry.finished ? finishedLabel : `${Math.round(entry.percentage)}%`} ·{' '}
          {entry.combo} {comboLabel}
        </div>
      </div>

      {entries.length > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={activeIndex <= 0}
            onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
            aria-label={swipeHint}
          >
            ←
          </Button>
          <div className="flex gap-1.5">
            {entries.map((item, index) => (
              <button
                key={item.userId}
                type="button"
                aria-label={`#${index + 1} ${item.name}`}
                onClick={() => setActiveIndex(index)}
                className={[
                  'h-2 rounded-full transition-all',
                  index === activeIndex
                    ? 'w-6 bg-[var(--color-highlight)]'
                    : 'w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]',
                ].join(' ')}
              />
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={activeIndex >= entries.length - 1}
            onClick={() =>
              setActiveIndex((index) => Math.min(entries.length - 1, index + 1))
            }
            aria-label={swipeHint}
          >
            →
          </Button>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        <div className="flex justify-center">
          <Button size="lg" onClick={onReturnToLobby}>
            {returnToLobbyLabel}
          </Button>
        </div>
        <div className="flex justify-end">
          <LeaveRoomButton variant="ghost" size="sm">
            {leaveLabel}
          </LeaveRoomButton>
        </div>
      </div>
    </div>
  );
}
