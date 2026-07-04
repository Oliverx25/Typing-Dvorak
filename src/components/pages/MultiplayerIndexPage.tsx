import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import BackLink from '@/components/layout/BackLink';
import { useApp } from '@/contexts/AppProvider';
import CreateRoomSettings, {
  isCustomTextValid,
  type CreateRoomSettingsValue,
} from '@/components/multiplayer/CreateRoomSettings';
import { Button, Card } from '@/components/ui';
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

  const joinPanel = (
    <Card padding="lg" variant="elevated" className="mx-auto mt-12 max-w-md">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{t.multiplayer.joinRoom}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {t.multiplayer.joinRoomDesc}
          </p>
        </div>
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
    </Card>
  );

  const createPanel = (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
      <section className="lg:col-span-2">
        <CreateRoomSettings
          value={roomSettings}
          variant="content"
          onChange={(partial) => setRoomSettings((prev) => ({ ...prev, ...partial }))}
        />
      </section>

      <aside className="lg:col-span-1">
        <Card padding="lg" variant="elevated" className="lg:sticky lg:top-24">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                {t.multiplayer.gameSettings}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {t.multiplayer.gameSettingsHint}
              </p>
            </div>
            <CreateRoomSettings
              value={roomSettings}
              variant="settings"
              onChange={(partial) => setRoomSettings((prev) => ({ ...prev, ...partial }))}
            />
            <Button onClick={handleCreateRoom} disabled={!canCreateRoom} fullWidth>
              {t.multiplayer.createRoomAction}
            </Button>
          </div>
        </Card>
      </aside>
    </div>
  );

  const tabButtonClassName = (tab: MultiplayerTab) =>
    [
      'border-b-2 px-1 pb-2 text-xl font-semibold transition',
      activeTab === tab
        ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
        : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
    ].join(' ');

  return (
    <>
      <BackLink href="/lessons" />
      <div className="mx-auto mt-8 w-full max-w-6xl px-4 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            {t.multiplayer.title}
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-[var(--color-text-muted)]">
            {t.multiplayer.subtitle}
          </p>
        </header>

        {kicked ? (
          <p className="mb-6 max-w-md rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-4 py-3 text-sm text-[var(--color-incorrect)]">
            {t.multiplayer.kickedFromRoom}
          </p>
        ) : null}

        <div className="flex gap-8" role="tablist" aria-label={t.multiplayer.title}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'create'}
            className={tabButtonClassName('create')}
            onClick={() => setActiveTab('create')}
          >
            {t.multiplayer.createRoom}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'join'}
            className={tabButtonClassName('join')}
            onClick={() => setActiveTab('join')}
          >
            {t.multiplayer.joinRoom}
          </button>
        </div>

        {activeTab === 'create' ? createPanel : joinPanel}
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
