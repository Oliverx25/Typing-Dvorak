import AppChrome from '@/components/layout/shell/AppChrome';
import MultiplayerLobbyPage from '@/components/pages/multiplayer/MultiplayerLobbyPage';

export default function MultiplayerLobbyAppRoot() {
  return (
    <AppChrome>
      <MultiplayerLobbyPage />
    </AppChrome>
  );
}
