import UserAvatar from '@/components/auth/UserAvatar';
import { Button } from '@/components/ui';
import type { LobbyPlayerPresence } from '@/types/multiplayer';

interface LobbyPlayerListProps {
  players: LobbyPlayerPresence[];
  currentUserId: string | null;
  ownerId: string | null;
  isOwner: boolean;
  readyLabel: string;
  waitingLabel: string;
  youLabel: string;
  ownerLabel: string;
  kickLabel: string;
  finishedLabel: string;
  onKick?: (userId: string) => void;
  compact?: boolean;
}

export default function LobbyPlayerList({
  players,
  currentUserId,
  ownerId,
  isOwner,
  readyLabel,
  waitingLabel,
  youLabel,
  ownerLabel,
  kickLabel,
  finishedLabel,
  onKick,
  compact = false,
}: LobbyPlayerListProps) {
  if (players.length === 0) {
    return (
      <p className={`text-center text-sm text-[var(--color-text-muted)] ${compact ? 'py-4' : 'py-8'}`}>
        {waitingLabel}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {players.map((player) => {
        const isSelf = player.userId === currentUserId;
        const isRoomOwner = player.userId === ownerId;
        const statusLabel = player.hasFinished
          ? finishedLabel
          : player.isReady
            ? readyLabel
            : waitingLabel;

        return (
          <li
            key={player.userId}
            className={`flex items-center gap-3 ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}
          >
            <UserAvatar
              avatarUrl={player.avatarUrl}
              initials={player.initials}
              avatarSource={player.avatarSource}
              size={compact ? 34 : 40}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[var(--color-text)]">
                {player.name}
                {isSelf ? (
                  <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">
                    ({youLabel})
                  </span>
                ) : null}
                {isRoomOwner ? (
                  <span className="ml-2 rounded-md bg-[var(--color-accent)]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                    {ownerLabel}
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">{statusLabel}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {isOwner && !isSelf && onKick ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-[var(--color-incorrect)] hover:bg-[var(--color-incorrect)]/10"
                  aria-label={kickLabel}
                  onClick={() => onKick(player.userId)}
                >
                  {kickLabel}
                </Button>
              ) : null}
              <span
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full border',
                  player.hasFinished
                    ? 'border-[var(--color-correct)] bg-[var(--color-correct)]/15 text-[var(--color-correct)]'
                    : player.isReady
                      ? 'border-[var(--color-correct)] bg-[var(--color-correct)]/15 text-[var(--color-correct)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]',
                ].join(' ')}
                aria-label={statusLabel}
              >
                {player.isReady || player.hasFinished ? (
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}
