import { useRef } from 'react';
import UserAvatar from '@/components/auth/UserAvatar';
import { Button } from '@/components/ui';
import { formatRaceScore } from '@/utils/multiplayer/raceScoring';
import type { WinCondition } from '@/utils/multiplayer/roomConfig';
import type { RaceParticipantProgress } from '@/types/multiplayer';

interface RaceResultsPanelProps {
  entries: RaceParticipantProgress[];
  currentUserId: string | null;
  primaryVictory: WinCondition;
  isOwner: boolean;
  title: string;
  subtitle: string;
  youLabel: string;
  winnerLabel: string;
  wpmLabel: string;
  accuracyLabel: string;
  comboLabel: string;
  scoreLabel: string;
  finishedLabel: string;
  returnToLobbyLabel: string;
  waitingForHostLabel: string;
  swipeHint: string;
  onReturnToLobby: () => void;
}

function rankAccent(index: number): string {
  if (index === 0) return 'border-[var(--color-correct)]/50 bg-[var(--color-correct)]/10 shadow-lg shadow-[var(--color-correct)]/10';
  if (index === 1) return 'border-[var(--color-highlight)]/40 bg-[var(--color-highlight)]/8';
  if (index === 2) return 'border-amber-500/30 bg-amber-500/5';
  return 'border-[var(--color-border)] bg-[var(--color-surface)]';
}

function rankBadge(index: number): string {
  if (index === 0) return 'bg-[var(--color-correct)] text-white';
  if (index === 1) return 'bg-[var(--color-highlight)] text-white';
  if (index === 2) return 'bg-amber-500 text-white';
  return 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]';
}

export default function RaceResultsPanel({
  entries,
  currentUserId,
  primaryVictory,
  isOwner,
  title,
  subtitle,
  youLabel,
  winnerLabel,
  wpmLabel,
  accuracyLabel,
  comboLabel,
  scoreLabel,
  finishedLabel,
  returnToLobbyLabel,
  waitingForHostLabel,
  swipeHint,
  onReturnToLobby,
}: RaceResultsPanelProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const showScore = primaryVictory === 'max_score';
  const winner = entries[0];

  return (
    <div className="space-y-6">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-highlight)]">
          {winnerLabel}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
        {winner ? (
          <p className="mt-3 text-lg font-semibold text-[var(--color-text)]">
            {winner.name}
            {winner.userId === currentUserId ? (
              <span className="ml-1 text-sm font-normal text-[var(--color-text-muted)]">
                ({youLabel})
              </span>
            ) : null}
          </p>
        ) : null}
      </header>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {entries.map((entry, index) => {
          const isSelf = entry.userId === currentUserId;
          const isWinner = index === 0;

          return (
            <article
              key={entry.userId}
              className={[
                'flex w-[min(85vw,280px)] shrink-0 snap-center flex-col rounded-2xl border p-5 transition',
                rankAccent(index),
                isWinner ? 'scale-[1.02]' : '',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={[
                    'inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-bold',
                    rankBadge(index),
                  ].join(' ')}
                >
                  #{index + 1}
                </span>
                {showScore ? (
                  <span className="font-mono text-sm font-semibold text-[var(--color-text)]">
                    {formatRaceScore(entry.score)} {scoreLabel}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <UserAvatar
                  avatarUrl={entry.avatarUrl}
                  initials={entry.initials}
                  avatarSource={entry.avatarSource}
                  size={48}
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--color-text)]">
                    {entry.name}
                    {isSelf ? (
                      <span className="ml-1 text-xs font-normal text-[var(--color-text-muted)]">
                        ({youLabel})
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {entry.finished ? finishedLabel : `${Math.round(entry.percentage)}%`}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-[var(--color-surface)]/80 px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                    {wpmLabel}
                  </dt>
                  <dd className="mt-0.5 font-mono font-semibold text-[var(--color-text)]">
                    {Math.round(entry.wpm)}
                  </dd>
                </div>
                <div className="rounded-lg bg-[var(--color-surface)]/80 px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                    {accuracyLabel}
                  </dt>
                  <dd className="mt-0.5 font-mono font-semibold text-[var(--color-text)]">
                    {Math.round(entry.accuracy)}%
                  </dd>
                </div>
                <div className="rounded-lg bg-[var(--color-surface)]/80 px-3 py-2">
                  <dt className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                    {comboLabel}
                  </dt>
                  <dd className="mt-0.5 font-mono font-semibold text-[var(--color-text)]">
                    {entry.maxCombo} · {entry.combo}
                  </dd>
                </div>
                {!showScore ? (
                  <div className="rounded-lg bg-[var(--color-surface)]/80 px-3 py-2">
                    <dt className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                      {scoreLabel}
                    </dt>
                    <dd className="mt-0.5 font-mono font-semibold text-[var(--color-text)]">
                      {formatRaceScore(entry.score)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </article>
          );
        })}
      </div>

      {entries.length > 1 ? (
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          ← {swipeHint} →
        </p>
      ) : null}

      <div className="flex justify-center pt-2">
        {isOwner ? (
          <Button size="lg" onClick={onReturnToLobby}>
            {returnToLobbyLabel}
          </Button>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">{waitingForHostLabel}</p>
        )}
      </div>
    </div>
  );
}
