import UserAvatar from '@/components/auth/UserAvatar';
import type { LobbyPlayerPresence, RaceOpponentProgress } from '@/types/multiplayer';

interface LocalRaceProgress {
  player: LobbyPlayerPresence | null;
  wpm: number;
  percentage: number;
}

interface MultiplayerRaceTrackProps {
  localProgress: LocalRaceProgress;
  opponents: RaceOpponentProgress[];
  title: string;
  emptyLabel: string;
}

function RaceRow({
  name,
  avatarUrl,
  initials,
  avatarSource,
  wpm,
  percentage,
}: {
  name: string;
  avatarUrl: string | null;
  initials: string;
  avatarSource: LobbyPlayerPresence['avatarSource'];
  wpm: number;
  percentage: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar
        avatarUrl={avatarUrl}
        initials={initials}
        avatarSource={avatarSource}
        size={34}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-3 text-sm">
          <span className="truncate font-medium text-[var(--color-text)]">{name}</span>
          <span className="shrink-0 font-mono text-xs text-[var(--color-text-muted)]">
            {Math.round(wpm)} WPM
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--color-surface)]">
          <div
            className="h-full rounded-full bg-[var(--color-highlight)] transition-[width] duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="w-10 text-right font-mono text-xs text-[var(--color-text-muted)]">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

export default function MultiplayerRaceTrack({
  localProgress,
  opponents,
  title,
  emptyLabel,
}: MultiplayerRaceTrackProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {title}
      </h2>
      <div className="space-y-4">
        {localProgress.player ? (
          <RaceRow
            name={localProgress.player.name}
            avatarUrl={localProgress.player.avatarUrl}
            initials={localProgress.player.initials}
            avatarSource={localProgress.player.avatarSource}
            wpm={localProgress.wpm}
            percentage={localProgress.percentage}
          />
        ) : null}

        {opponents.length > 0 ? (
          opponents.map((opponent) => (
            <RaceRow
              key={opponent.userId}
              name={opponent.name}
              avatarUrl={opponent.avatarUrl}
              initials={opponent.initials}
              avatarSource={opponent.avatarSource}
              wpm={opponent.wpm}
              percentage={opponent.percentage}
            />
          ))
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">{emptyLabel}</p>
        )}
      </div>
    </section>
  );
}
