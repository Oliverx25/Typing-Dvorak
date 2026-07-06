import { useEffect, useState } from 'react';
import BackLink from '@/components/layout/shell/BackLink';
import LobbyView from '@/components/multiplayer/lobby/LobbyView';
import { useApp } from '@/contexts/AppProvider';
import { Card } from '@/components/ui';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { fetchRoomByCode, isRoomJoinable } from '@/services/supabase/rooms';
import { readRoomCodeFromSearch } from '@/utils/multiplayer/roomCode';

function LobbyContent({ roomId }: { roomId: string }) {
  return <LobbyView roomId={roomId} />;
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
          className="inline-flex items-center justify-center rounded-xl bg-[var(--color-highlight)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-highlight)]/20 transition hover:bg-[var(--color-highlight-hover)]"
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
  const [roomValid, setRoomValid] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      const code = readRoomCodeFromSearch(window.location.search);
      if (code.length < 4) {
        if (!cancelled) {
          setRoomId(null);
          setRoomValid(false);
          setReady(true);
        }
        return;
      }

      if (isSupabaseConfigured()) {
        const room = await fetchRoomByCode(code);
        if (!isRoomJoinable(room)) {
          if (!cancelled) {
            setRoomValid(false);
            setReady(true);
            window.location.replace('/multiplayer');
          }
          return;
        }
      }

      if (!cancelled) {
        setRoomId(code);
        setRoomValid(true);
        setReady(true);
      }
    };

    void validate();
    return () => {
      cancelled = true;
    };
  }, []);

  return !ready ? (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-highlight)]" />
    </div>
  ) : roomId && roomValid ? (
    <LobbyContent roomId={roomId} />
  ) : (
    <InvalidRoomContent />
  );
}
