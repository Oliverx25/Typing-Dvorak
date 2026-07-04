import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import BackLink from '@/components/layout/BackLink';
import { useApp } from '@/contexts/AppProvider';
import CreateRoomSettings, {
  isCustomTextValid,
  type CreateRoomSettingsValue,
} from '@/components/multiplayer/CreateRoomSettings';
import { Button, Card, Tabs } from '@/components/ui';
import { DEFAULT_RACE_LESSON_ID } from '@/utils/multiplayer/roomConfig';
import { generateRoomCode, normalizeRoomCode, roomUrl } from '@/utils/multiplayer/roomCode';
import { saveCreateRoomConfig } from '@/utils/multiplayer/roomStorage';

type MultiplayerTab = 'create' | 'join';

function MultiplayerIndexContent() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<MultiplayerTab>('create');
  const [joinCode, setJoinCode] = useState('');
  const [roomSettings, setRoomSettings] = useState<CreateRoomSettingsValue>({
    textSource: 'lesson',
    lessonId: DEFAULT_RACE_LESSON_ID,
    customText: '',
    blindMode: false,
    winCondition: 'first_finish',
  });

  const canCreateRoom =
    roomSettings.textSource === 'lesson' || isCustomTextValid(roomSettings.customText);

  const handleCreateRoom = () => {
    if (!canCreateRoom) return;

    const code = generateRoomCode();
    saveCreateRoomConfig(code, {
      lessonId: roomSettings.lessonId,
      customText:
        roomSettings.textSource === 'custom' ? roomSettings.customText.trim() : '',
      blindMode: roomSettings.blindMode,
      winCondition: roomSettings.winCondition,
      textSource: roomSettings.textSource,
    });
    window.location.href = roomUrl(code);
  };

  const handleJoinRoom = () => {
    const code = normalizeRoomCode(joinCode);
    if (code.length < 4) return;
    window.location.href = roomUrl(code);
  };

  const kicked =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('kicked') === '1';

  const joinCodeValid = normalizeRoomCode(joinCode).length >= 4;

  const createPanel = (
    <div className="space-y-5">
      <CreateRoomSettings
        value={roomSettings}
        onChange={(partial) => setRoomSettings((prev) => ({ ...prev, ...partial }))}
      />

      <Button onClick={handleCreateRoom} disabled={!canCreateRoom} fullWidth>
        {t.multiplayer.createRoomAction}
      </Button>
    </div>
  );

  const joinPanel = (
    <div className="mx-auto max-w-sm space-y-5">
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        {t.multiplayer.joinRoomDesc}
      </p>
      <input
        type="text"
        value={joinCode}
        onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))}
        placeholder={t.multiplayer.roomCodePlaceholder}
        aria-label={t.multiplayer.roomCode}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-center font-mono text-xl tracking-[0.25em] text-[var(--color-text)] uppercase outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        maxLength={8}
        autoComplete="off"
        spellCheck={false}
      />
      <Button onClick={handleJoinRoom} disabled={!joinCodeValid} fullWidth>
        {t.multiplayer.joinRoomAction}
      </Button>
    </div>
  );

  return (
    <>
      <BackLink href="/lessons" />
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          {t.multiplayer.title}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-lg text-[var(--color-text-muted)]">
          {t.multiplayer.subtitle}
        </p>
      </header>

      {kicked ? (
        <p className="mx-auto mb-6 max-w-md rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-4 py-3 text-center text-sm text-[var(--color-incorrect)]">
          {t.multiplayer.kickedFromRoom}
        </p>
      ) : null}

      <div className="mx-auto w-full max-w-lg px-1">
        <Card padding="lg" variant="elevated">
          <Tabs
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as MultiplayerTab)}
            tabs={[
              { id: 'create', label: t.multiplayer.createRoom, panel: createPanel },
              { id: 'join', label: t.multiplayer.joinRoom, panel: joinPanel },
            ]}
          />
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
