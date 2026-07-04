import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import BackLink from '@/components/layout/BackLink';
import LobbyView from '@/components/multiplayer/LobbyView';
import { useApp } from '@/contexts/AppProvider';
import { Card } from '@/components/ui';
import { readRoomCodeFromSearch } from '@/utils/multiplayer/roomCode';

function LobbyContent({ roomId }: { roomId: string }) {
  const { t } = useApp();

  return (
    <>
      <BackLink href="/multiplayer" label={t.multiplayer.backToLobby} />
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          {t.multiplayer.lobbyTitle}
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">{t.multiplayer.lobbySubtitle}</p>
      </header>
      <LobbyView roomId={roomId} />
    </>
  );
}

function InvalidRoomContent() {
  const { t } = useApp();

  return (
    <>
      <BackLink href="/multiplayer" label={t.multiplayer.backToLobby} />
      <Card title={t.multiplayer.lobbyTitle} padding="lg">
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">{t.multiplayer.invalidRoomCode}</p>
        <a
          href="/multiplayer"
          className="inline-flex items-center justify-center rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/20 transition hover:bg-[var(--color-accent-hover)]"
        >
          {t.multiplayer.backToLobby}
        </a>
      </Card>
    </>
  );
}

export default function MultiplayerLobbyPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const code = readRoomCodeFromSearch(window.location.search);
    setRoomId(code.length >= 4 ? code : null);
    setReady(true);
  }, []);

  return (
    <AppShell>
      {!ready ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
        </div>
      ) : roomId ? (
        <LobbyContent roomId={roomId} />
      ) : (
        <InvalidRoomContent />
      )}
    </AppShell>
  );
}
