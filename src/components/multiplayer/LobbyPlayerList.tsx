import UserAvatar from '@/components/auth/UserAvatar';
import type { LobbyPlayerPresence } from '@/types/multiplayer';

interface LobbyPlayerListProps {
  players: LobbyPlayerPresence[];
  currentUserId: string | null;
  readyLabel: string;
  waitingLabel: string;
  youLabel: string;
}

export default function LobbyPlayerList({
  players,
  currentUserId,
  readyLabel,
  waitingLabel,
  youLabel,
}: LobbyPlayerListProps) {
  if (players.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">{waitingLabel}</p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {players.map((player) => {
        const isSelf = player.userId === currentUserId;

        return (
          <li
            key={player.userId}
            className="flex items-center gap-3 px-5 py-4"
          >
            <UserAvatar
              avatarUrl={player.avatarUrl}
              initials={player.initials}
              avatarSource={player.avatarSource}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[var(--color-text)]">
                {player.name}
                {isSelf ? (
                  <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">
                    ({youLabel})
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {player.isReady ? readyLabel : waitingLabel}
              </p>
            </div>
            <span
              className={[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                player.isReady
                  ? 'border-[var(--color-correct)] bg-[var(--color-correct)]/15 text-[var(--color-correct)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]',
              ].join(' ')}
              aria-label={player.isReady ? readyLabel : waitingLabel}
            >
              {player.isReady ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <span className="h-2 w-2 rounded-full bg-current opacity-40" />
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
