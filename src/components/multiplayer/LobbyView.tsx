import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { useMultiplayerLobby } from '@/hooks/useMultiplayerLobby';
import { Button, Card } from '@/components/ui';
import LobbyPlayerList from '@/components/multiplayer/LobbyPlayerList';
import MultiplayerRacePanel from '@/components/multiplayer/MultiplayerRacePanel';
import RoomConfigPanel from '@/components/multiplayer/RoomConfigPanel';
import { roomUrl } from '@/utils/multiplayer/roomCode';

interface LobbyViewProps {
  roomId: string;
}

export default function LobbyView({ roomId }: LobbyViewProps) {
  const { t } = useApp();
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [connectAttempt, setConnectAttempt] = useState(0);

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
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card title={t.multiplayer.title} padding="lg">
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">{t.multiplayer.signInRequired}</p>
        <a
          href={`/login?next=${encodeURIComponent(roomUrl(roomId))}`}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/20 transition hover:bg-[var(--color-accent-hover)]"
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
      <Card padding="lg" bleed>
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
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
          <div className="mx-6 mt-4 space-y-3">
            <p className="rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-4 py-3 text-sm text-[var(--color-incorrect)]">
              {errorMessage}
            </p>
            <Button variant="secondary" size="sm" onClick={() => setConnectAttempt((n) => n + 1)}>
              {t.multiplayer.retryConnection}
            </Button>
          </div>
        ) : null}

        {status === 'reconnecting' ? (
          <p className="mx-6 mt-4 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-4 py-3 text-sm text-[var(--color-text-muted)]">
            {t.multiplayer.reconnectingHint}
          </p>
        ) : null}

        {showLobbyDetails && roomState ? (
          <div className="mx-6 mt-4">
            <RoomConfigPanel
              roomState={roomState}
              isOwner={isOwner}
              disabled={inRace}
              onChange={(partial) => void updateRoomConfig(partial)}
            />
          </div>
        ) : null}

        {showLobbyDetails ? (
          <div className="mt-6">
            <LobbyPlayerList
              players={players}
              currentUserId={currentUserId}
              ownerId={roomState?.ownerId ?? null}
              isOwner={isOwner}
              readyLabel={t.multiplayer.ready}
              waitingLabel={t.multiplayer.notReady}
              youLabel={t.multiplayer.you}
              ownerLabel={t.multiplayer.roomOwner}
              kickLabel={t.multiplayer.kickPlayer}
              finishedLabel={t.multiplayer.raceFinished}
              onKick={(userId) => void kickPlayer(userId)}
              compact={inRace}
            />
          </div>
        ) : null}
      </Card>

      {!inRace ? (
        <div className="flex flex-wrap gap-3">
          <Button
            variant={isReady ? 'secondary' : 'success'}
            onClick={() => void toggleReadyStatus()}
            disabled={!isConnected}
          >
            {isReady ? t.multiplayer.unready : t.multiplayer.markReady}
          </Button>

          {isOwner ? (
            <Button
              variant="primary"
              onClick={() => void startRace()}
              disabled={!isConnected || !allReady}
            >
              {t.multiplayer.startRace}
            </Button>
          ) : allReady ? (
            <p className="self-center text-sm text-[var(--color-text-muted)]">
              {t.multiplayer.waitingForHost}
            </p>
          ) : null}

          <Button variant="ghost" onClick={() => void handleLeave()}>
            {t.multiplayer.leaveRoom}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={() => void handleLeave()}>
            {t.multiplayer.leaveRoom}
          </Button>
        </div>
      )}

      {inRace && roomState ? (
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
      ) : null}
    </div>
  );
}
