import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import BackLink from '@/components/layout/BackLink';
import { useApp } from '@/contexts/AppProvider';
import { Button, Card } from '@/components/ui';
import { generateRoomCode, normalizeRoomCode, roomUrl } from '@/utils/multiplayer/roomCode';

function MultiplayerIndexContent() {
  const { t } = useApp();
  const [joinCode, setJoinCode] = useState('');

  const handleCreateRoom = () => {
    window.location.href = roomUrl(generateRoomCode());
  };

  const handleJoinRoom = () => {
    const code = normalizeRoomCode(joinCode);
    if (code.length < 4) return;
    window.location.href = roomUrl(code);
  };

  return (
    <>
      <BackLink href="/lessons" />
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          {t.multiplayer.title}
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">{t.multiplayer.subtitle}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title={t.multiplayer.createRoom} description={t.multiplayer.createRoomDesc} padding="lg">
          <Button onClick={handleCreateRoom} fullWidth>
            {t.multiplayer.createRoomAction}
          </Button>
        </Card>

        <Card title={t.multiplayer.joinRoom} description={t.multiplayer.joinRoomDesc} padding="lg">
          <div className="space-y-4">
            <input
              type="text"
              value={joinCode}
              onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))}
              placeholder={t.multiplayer.roomCodePlaceholder}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-mono text-lg tracking-widest text-[var(--color-text)] uppercase outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
              maxLength={8}
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              variant="secondary"
              onClick={handleJoinRoom}
              disabled={normalizeRoomCode(joinCode).length < 4}
              fullWidth
            >
              {t.multiplayer.joinRoomAction}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default function MultiplayerIndexPage() {
  return (
    <AppShell>
      <MultiplayerIndexContent />
    </AppShell>
  );
}
