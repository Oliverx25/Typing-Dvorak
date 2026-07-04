import UserAvatar from '@/components/auth/UserAvatar';
import LeaveRoomButton from '@/components/multiplayer/LeaveRoomControls';
import { formatRaceScore } from '@/utils/multiplayer/raceScoring';
import type { WinCondition } from '@/utils/multiplayer/roomConfig';
import type { RaceParticipantProgress } from '@/types/multiplayer';

interface RaceLeaderboardProps {
  entries: RaceParticipantProgress[];
  currentUserId: string | null;
  primaryVictory: WinCondition;
  title: string;
  youLabel: string;
  finishedLabel: string;
  scoreLabel: string;
  comboLabel: string;
  leaveLabel: string;
}

function rankStyle(index: number): string {
  if (index === 0) return 'border-[var(--color-correct)]/40 bg-[var(--color-correct)]/10';
  if (index === 1) return 'border-[var(--color-highlight)]/30 bg-[var(--color-highlight)]/5';
  return 'border-[var(--color-border)] bg-[var(--color-surface)]';
}

export default function RaceLeaderboard({
  entries,
  currentUserId,
  primaryVictory,
  title,
  youLabel,
  finishedLabel,
  scoreLabel,
  comboLabel,
  leaveLabel,
}: RaceLeaderboardProps) {
  const showScore = primaryVictory === 'max_score';

  return (
    <aside className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {title}
        </h2>
      </div>

      <ol className="flex-1 space-y-2 overflow-y-auto p-3">
        {entries.map((entry, index) => {
          const isSelf = entry.userId === currentUserId;
          const pct = entry.finished ? 100 : Math.round(entry.percentage);

          return (
            <li
              key={entry.userId}
              className={[
                'rounded-xl border px-3 py-2.5 transition',
                rankStyle(index),
                isSelf ? 'ring-1 ring-[var(--color-highlight)]/30' : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 shrink-0 text-center font-mono text-xs font-bold text-[var(--color-text-muted)]">
                  {index + 1}
                </span>
                <UserAvatar
                  avatarUrl={entry.avatarUrl}
                  initials={entry.initials}
                  avatarSource={entry.avatarSource}
                  size={32}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[var(--color-text)]">
                      {entry.name}
                      {isSelf ? (
                        <span className="ml-1 text-[11px] font-normal text-[var(--color-text-muted)]">
                          ({youLabel})
                        </span>
                      ) : null}
                    </p>
                    <span className="shrink-0 font-mono text-[11px] text-[var(--color-text-muted)]">
                      {showScore
                        ? `${formatRaceScore(entry.score)} ${scoreLabel}`
                        : `${Math.round(entry.wpm)} WPM`}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-border)]/60">
                    <div
                      className={[
                        'h-full rounded-full transition-[width] duration-300 ease-out',
                        entry.finished ? 'bg-[var(--color-correct)]' : 'bg-[var(--color-highlight)]',
                      ].join(' ')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-[var(--color-text-muted)]">
                    <span>
                      {entry.finished
                        ? finishedLabel
                        : `${Math.round(entry.wpm)} WPM · ${Math.round(entry.accuracy)}%`}
                    </span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {entry.combo} {comboLabel}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex justify-end">
          <LeaveRoomButton variant="ghost" size="sm">
            {leaveLabel}
          </LeaveRoomButton>
        </div>
      </div>
    </aside>
  );
}
