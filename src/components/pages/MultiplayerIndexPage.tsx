import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import BackLink from '@/components/layout/BackLink';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import CreateRoomSettings, {
  isCustomTextValid,
  type CreateRoomSettingsValue,
} from '@/components/multiplayer/CreateRoomSettings';
import JoinRoomModal from '@/components/multiplayer/JoinRoomModal';
import { Button, Card, SvgIcon } from '@/components/ui';
import { createRoom } from '@/services/supabase/rooms';
import { DEFAULT_RACE_LESSON_ID } from '@/utils/multiplayer/roomConfig';
import { generateRoomCode, roomUrl } from '@/utils/multiplayer/roomCode';
import { saveCreateRoomConfig } from '@/utils/multiplayer/roomStorage';

function MultiplayerIndexContent() {
  const { t } = useApp();
  const { user } = useAuth();
  const [joinOpen, setJoinOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [roomSettings, setRoomSettings] = useState<CreateRoomSettingsValue>({
    textSource: 'lesson',
    lessonId: DEFAULT_RACE_LESSON_ID,
    customText: '',
    blindMode: false,
    winConditions: ['max_score'],
  });

  const canCreateRoom =
    roomSettings.textSource === 'lesson'
      ? Boolean(roomSettings.lessonId)
      : isCustomTextValid(roomSettings.customText);

  const handleCreateRoom = async () => {
    if (!canCreateRoom || creating) return;

    setCreating(true);
    try {
      let code = generateRoomCode();
      if (user?.id) {
        let attempts = 0;
        while (attempts < 5) {
          const { error } = await createRoom(code, user.id);
          if (!error) break;
          code = generateRoomCode();
          attempts += 1;
        }
      }

      saveCreateRoomConfig(code, {
        lessonId: roomSettings.lessonId,
        customText:
          roomSettings.textSource === 'custom' ? roomSettings.customText.trim() : '',
        blindMode: roomSettings.blindMode,
        winConditions: roomSettings.winConditions,
        textSource: roomSettings.textSource,
      });
      window.location.href = roomUrl(code);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = (code: string) => {
    window.location.href = roomUrl(code);
  };

  const kicked =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('kicked') === '1';

  return (
    <>
      <BackLink href="/lessons" />
      <div className="mx-auto mt-8 w-full max-w-6xl px-4 lg:px-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              {t.multiplayer.title}
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-[var(--color-text-muted)]">
              {t.multiplayer.subtitle}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setJoinOpen(true)}>
            <SvgIcon
              src="/icons/join.svg"
              size={16}
              className="text-[var(--color-highlight)]"
            />
            {t.multiplayer.joinWithCode}
          </Button>
        </header>

        {kicked ? (
          <p className="mb-6 max-w-md rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-4 py-3 text-sm text-[var(--color-incorrect)]">
            {t.multiplayer.kickedFromRoom}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <section className="lg:col-span-2">
            <CreateRoomSettings
              value={roomSettings}
              variant="content"
              onChange={(partial) => setRoomSettings((prev) => ({ ...prev, ...partial }))}
            />
          </section>

          <aside className="lg:col-span-1">
            <Card padding="lg" variant="elevated" className="lg:sticky lg:top-8">
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
                <Button
                  onClick={() => void handleCreateRoom()}
                  disabled={!canCreateRoom || creating}
                  fullWidth
                  className={!canCreateRoom ? 'opacity-50' : ''}
                >
                  {creating ? t.multiplayer.creatingRoom : t.multiplayer.createRoomAction}
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} onJoin={handleJoinRoom} />
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
