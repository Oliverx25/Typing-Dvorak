import AppShell from '@/components/layout/AppShell';
import BackLink from '@/components/layout/BackLink';
import LobbyView from '@/components/multiplayer/LobbyView';
import { useApp } from '@/contexts/AppProvider';

interface MultiplayerLobbyPageProps {
  roomId: string;
}

function LobbyContent({ roomId }: MultiplayerLobbyPageProps) {
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

export default function MultiplayerLobbyPage({ roomId }: MultiplayerLobbyPageProps) {
  return (
    <AppShell>
      <LobbyContent roomId={roomId} />
    </AppShell>
  );
}
