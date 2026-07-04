import UserAvatar from '@/components/auth/UserAvatar';
import { Button } from '@/components/ui';
import type { LobbyPlayerPresence } from '@/types/multiplayer';

interface LobbyPlayerGridProps {
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
}

export default function LobbyPlayerGrid({
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
}: LobbyPlayerGridProps) {
  if (players.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--color-text-muted)]">{waitingLabel}</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => {
        const isSelf = player.userId === currentUserId;
        const isRoomOwner = player.userId === ownerId;
        const isReady = player.isReady && !player.hasFinished;
        const isFinished = player.hasFinished;

        const statusLabel = isFinished ? finishedLabel : isReady ? readyLabel : waitingLabel;

        return (
          <article
            key={player.userId}
            className={[
              'relative flex flex-col items-center rounded-2xl border-2 px-4 py-6 text-center transition-all duration-300',
              isFinished
                ? 'border-[var(--color-correct)]/50 bg-[var(--color-correct)]/5'
                : isReady
                  ? 'border-[var(--color-correct)] bg-[var(--color-correct)]/8 shadow-lg shadow-[var(--color-correct)]/10'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)]',
            ].join(' ')}
          >
            {isOwner && !isSelf && onKick ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-7 px-2 text-[10px] text-[var(--color-incorrect)] hover:bg-[var(--color-incorrect)]/10"
                onClick={() => onKick(player.userId)}
              >
                {kickLabel}
              </Button>
            ) : null}

            <UserAvatar
              avatarUrl={player.avatarUrl}
              initials={player.initials}
              avatarSource={player.avatarSource}
              size={56}
            />

            <p className="mt-3 max-w-full truncate text-base font-semibold text-[var(--color-text)]">
              {player.name}
              {isSelf ? (
                <span className="ml-1 text-sm font-normal text-[var(--color-text-muted)]">
                  ({youLabel})
                </span>
              ) : null}
            </p>

            {isRoomOwner ? (
              <span className="mt-1 rounded-md bg-[var(--color-highlight)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-highlight)]">
                {ownerLabel}
              </span>
            ) : null}

            <span
              className={[
                'mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                isFinished
                  ? 'bg-[var(--color-correct)]/20 text-[var(--color-correct)]'
                  : isReady
                    ? 'bg-[var(--color-correct)]/20 text-[var(--color-correct)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
              ].join(' ')}
            >
              {isReady || isFinished ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
              )}
              {statusLabel}
            </span>
          </article>
        );
      })}
    </div>
  );
}
