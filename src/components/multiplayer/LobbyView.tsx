import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { useMultiplayerLobby } from '@/hooks/useMultiplayerLobby';
import { Button, Card } from '@/components/ui';
import LobbyPlayerGrid from '@/components/multiplayer/LobbyPlayerGrid';
import LobbyPlayerList from '@/components/multiplayer/LobbyPlayerList';
import MatchInfoCard from '@/components/multiplayer/MatchInfoCard';
import MultiplayerRacePanel from '@/components/multiplayer/MultiplayerRacePanel';
import RoomSetupModal from '@/components/multiplayer/RoomSetupModal';
import { roomUrl } from '@/utils/multiplayer/roomCode';

interface LobbyViewProps {
  roomId: string;
}

export default function LobbyView({ roomId }: LobbyViewProps) {
  const { t } = useApp();
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [connectAttempt, setConnectAttempt] = useState(0);
  const [setupOpen, setSetupOpen] = useState(false);
  const [readyLoading, setReadyLoading] = useState(false);

  const {
    players,
    status,
    error,
    isReady,
    isConnected,
    isOwner,
    allReady,
    roomState,
    raceActive,
    countdownSeconds,
    toggleReadyStatus,
    updateRoomConfig,
    startRace,
    markRaceFinished,
    kickPlayer,
    leaveLobby,
    currentUserId,
    channel,
    progressHandlerRef,
    roomEventHandlerRef,
  } = useMultiplayerLobby({ roomId, minPlayers: 2, connectAttempt });

  useEffect(() => {
    roomEventHandlerRef.current = (event) => {
      if (event === 'kicked') {
        void leaveLobby().then(() => {
          window.location.href = '/multiplayer?kicked=1';
        });
      }
    };
    return () => {
      roomEventHandlerRef.current = null;
    };
  }, [leaveLobby, roomEventHandlerRef]);

  const handleLeave = async () => {
    await leaveLobby();
    window.location.href = '/multiplayer';
  };

  const handleToggleReady = async () => {
    if (!isConnected || readyLoading) return;
    setReadyLoading(true);
    try {
      await toggleReadyStatus();
    } finally {
      setReadyLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <Card title={t.multiplayer.title} padding="lg">
        <p className="text-sm text-[var(--color-text-muted)]">{t.multiplayer.notConfigured}</p>
      </Card>
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-highlight)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card title={t.multiplayer.title} padding="lg">
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">{t.multiplayer.signInRequired}</p>
        <a
          href={`/login?next=${encodeURIComponent(roomUrl(roomId))}`}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--color-highlight)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-highlight)]/20 transition hover:bg-[var(--color-highlight-hover)]"
        >
          {t.auth.signIn}
        </a>
      </Card>
    );
  }

  const statusLabel =
    status === 'connecting'
      ? t.multiplayer.connecting
      : status === 'reconnecting'
        ? t.multiplayer.reconnecting
        : status === 'connected'
          ? t.multiplayer.connected
          : status === 'error'
            ? t.multiplayer.connectionError
            : t.multiplayer.waiting;

  const readyCount = players.filter((player) => player.isReady).length;
  const inRace = roomState?.phase === 'racing';
  const showLobbyDetails = !inRace || countdownSeconds !== null;

  const errorMessage =
    error === 'supabase_not_configured'
      ? t.multiplayer.notConfigured
      : error === 'channel_error'
        ? t.multiplayer.connectionError
        : error === 'timed_out'
          ? t.multiplayer.timedOut
          : error;

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              {t.multiplayer.roomCode}
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-[var(--color-text)]">
              {roomId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--color-text-muted)]">{statusLabel}</p>
            <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
              {t.multiplayer.playersReady
                .replace('{ready}', String(readyCount))
                .replace('{total}', String(players.length))}
            </p>
          </div>
        </div>

        {error && status === 'error' ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-4 py-3 text-sm text-[var(--color-incorrect)]">
              {errorMessage}
            </p>
            <Button variant="secondary" size="sm" onClick={() => setConnectAttempt((n) => n + 1)}>
              {t.multiplayer.retryConnection}
            </Button>
          </div>
        ) : null}

        {status === 'reconnecting' ? (
          <p className="mt-4 rounded-lg border border-[var(--color-highlight)]/30 bg-[var(--color-highlight)]/10 px-4 py-3 text-sm text-[var(--color-text-muted)]">
            {t.multiplayer.reconnectingHint}
          </p>
        ) : null}
      </Card>

      {showLobbyDetails && roomState ? (
        <>
          <MatchInfoCard
            roomState={roomState}
            isOwner={isOwner}
            onEditSettings={isOwner ? () => setSetupOpen(true) : undefined}
          />

          <section className="min-h-[280px]">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t.multiplayer.playersInRoom}
            </p>
            <LobbyPlayerGrid
              players={players}
              currentUserId={currentUserId}
              ownerId={roomState.ownerId}
              isOwner={isOwner}
              readyLabel={t.multiplayer.ready}
              waitingLabel={t.multiplayer.notReady}
              youLabel={t.multiplayer.you}
              ownerLabel={t.multiplayer.roomOwner}
              kickLabel={t.multiplayer.kickPlayer}
              finishedLabel={t.multiplayer.raceFinished}
              onKick={(userId) => void kickPlayer(userId)}
            />
          </section>

          <RoomSetupModal
            open={setupOpen}
            roomState={roomState}
            onClose={() => setSetupOpen(false)}
            onSave={(partial) => void updateRoomConfig(partial)}
          />
        </>
      ) : null}

      {!inRace ? (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-4 backdrop-blur-sm sm:-mx-0 sm:rounded-2xl sm:border sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => void handleLeave()}>
              {t.multiplayer.leaveRoom}
            </Button>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
              {isOwner && allReady ? (
                <Button
                  size="lg"
                  onClick={() => void startRace()}
                  disabled={!isConnected}
                  className="min-w-[12rem] px-8 py-4 text-lg"
                >
                  {t.multiplayer.startRace}
                </Button>
              ) : isOwner ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  {readyCount < players.length
                    ? t.multiplayer.playersReady
                        .replace('{ready}', String(readyCount))
                        .replace('{total}', String(players.length))
                    : t.multiplayer.allReady}
                </p>
              ) : allReady ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  {t.multiplayer.waitingForHost}
                </p>
              ) : null}

              <Button
                variant={isReady ? 'secondary' : 'primary'}
                size="lg"
                onClick={() => void handleToggleReady()}
                disabled={!isConnected || readyLoading}
                className="min-w-[14rem] px-10 py-4 text-lg font-bold tracking-wide"
              >
                {isReady ? t.multiplayer.unready : t.multiplayer.markReady}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => void handleLeave()}>
            {t.multiplayer.leaveRoom}
          </Button>
        </div>
      )}

      {inRace && roomState ? (
        <>
          <LobbyPlayerList
            players={players}
            currentUserId={currentUserId}
            ownerId={roomState.ownerId}
            isOwner={isOwner}
            readyLabel={t.multiplayer.ready}
            waitingLabel={t.multiplayer.notReady}
            youLabel={t.multiplayer.you}
            ownerLabel={t.multiplayer.roomOwner}
            kickLabel={t.multiplayer.kickPlayer}
            finishedLabel={t.multiplayer.raceFinished}
            onKick={(userId) => void kickPlayer(userId)}
            compact
          />
          <MultiplayerRacePanel
            channel={channel}
            progressHandlerRef={progressHandlerRef}
            currentUserId={currentUserId}
            players={players}
            roomState={roomState}
            raceActive={raceActive}
            countdownSeconds={countdownSeconds}
            onRaceFinish={() => void markRaceFinished()}
          />
        </>
      ) : null}
    </div>
  );
}
