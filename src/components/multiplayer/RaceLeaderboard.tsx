import UserAvatar from '@/components/auth/UserAvatar';
import type { RaceParticipantProgress } from '@/types/multiplayer';

interface RaceLeaderboardProps {
  entries: RaceParticipantProgress[];
  currentUserId: string | null;
  title: string;
  youLabel: string;
  finishedLabel: string;
  waitingLabel: string;
}

function rankStyle(index: number): string {
  if (index === 0) return 'border-[var(--color-correct)]/40 bg-[var(--color-correct)]/10';
  if (index === 1) return 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5';
  return 'border-[var(--color-border)] bg-[var(--color-surface)]';
}

export default function RaceLeaderboard({
  entries,
  currentUserId,
  title,
  youLabel,
  finishedLabel,
  waitingLabel,
}: RaceLeaderboardProps) {
  return (
    <aside className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {title}
        </h2>
      </div>

      <ol className="flex-1 space-y-2 overflow-y-auto p-3">
        {entries.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-[var(--color-text-muted)]">
            {waitingLabel}
          </li>
        ) : (
          entries.map((entry, index) => {
            const isSelf = entry.userId === currentUserId;
            const pct = entry.finished ? 100 : Math.round(entry.percentage);

            return (
              <li
                key={entry.userId}
                className={[
                  'rounded-xl border px-3 py-2.5 transition',
                  rankStyle(index),
                  isSelf ? 'ring-1 ring-[var(--color-accent)]/30' : '',
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
                        {Math.round(entry.wpm)} WPM
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-border)]/60">
                      <div
                        className={[
                          'h-full rounded-full transition-[width] duration-300 ease-out',
                          entry.finished ? 'bg-[var(--color-correct)]' : 'bg-[var(--color-accent)]',
                        ].join(' ')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                      {entry.finished ? finishedLabel : `${pct}%`}
                    </p>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ol>
    </aside>
  );
}
