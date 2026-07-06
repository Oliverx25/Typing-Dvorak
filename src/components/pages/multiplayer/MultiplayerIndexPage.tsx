import { useRef, useState } from 'react';
import BackLink from '@/components/layout/shell/BackLink';
import { useApp } from '@/contexts/AppProvider';
import { useAuth } from '@/contexts/AuthProvider';
import CreateRoomSettings, {
  isRoomContentReady,
  type CreateRoomSettingsValue,
} from '@/components/multiplayer/setup/CreateRoomSettings';
import JoinRoomModal from '@/components/multiplayer/lobby/JoinRoomModal';
import { Button, Card } from '@/components/ui';
import Icon from '@/components/ui/icons/Icon';
import { createRoom } from '@/services/supabase/rooms';
import { DEFAULT_RACE_LESSON_ID, DEFAULT_WIN_CONDITION } from '@/utils/multiplayer/roomConfig';
import { generateRoomCode, roomUrl } from '@/utils/multiplayer/roomCode';
import { saveCreateRoomConfig } from '@/utils/multiplayer/roomStorage';

interface MultiplayerIndexPageProps {
  kicked?: boolean;
  roomClosed?: boolean;
}

function MultiplayerIndexContent({ kicked = false, roomClosed = false }: MultiplayerIndexPageProps) {
  const { t } = useApp();
  const { user } = useAuth();
  const [joinOpen, setJoinOpen] = useState(false);
  const joinTriggerRef = useRef<HTMLButtonElement>(null);
  const [creating, setCreating] = useState(false);
  const [roomSettings, setRoomSettings] = useState<CreateRoomSettingsValue>({
    textSource: 'lesson',
    lessonId: DEFAULT_RACE_LESSON_ID,
    customText: '',
    songMeta: null,
    winCondition: DEFAULT_WIN_CONDITION,
    modifiers: [],
  });

  const canCreateRoom = isRoomContentReady(roomSettings);

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
          roomSettings.textSource === 'lesson'
            ? ''
            : roomSettings.textSource === 'song'
              ? roomSettings.customText
              : roomSettings.customText.trim(),
        winCondition: roomSettings.winCondition,
        modifiers: roomSettings.modifiers,
        textSource: roomSettings.textSource,
        songMeta: roomSettings.textSource === 'song' ? roomSettings.songMeta : null,
      });
      window.location.href = roomUrl(code);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = (code: string) => {
    window.location.href = roomUrl(code);
  };


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
          <Button ref={joinTriggerRef} variant="secondary" onClick={() => setJoinOpen(true)}>
            <Icon name="join" size={16} className="text-[var(--color-highlight)]" />
            {t.multiplayer.joinWithCode}
          </Button>
        </header>

        {kicked ? (
          <p className="mb-6 max-w-md rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-4 py-3 text-sm text-[var(--color-incorrect)]">
            {t.multiplayer.kickedFromRoom}
          </p>
        ) : null}

        {roomClosed ? (
          <p className="mb-6 max-w-md rounded-lg border border-[var(--color-highlight)]/30 bg-[var(--color-highlight)]/10 px-4 py-3 text-sm text-[var(--color-text-muted)]">
            {t.multiplayer.roomClosedByHost}
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
            <Card padding="lg" variant="elevated" clipContent={false} className="lg:sticky lg:top-8">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    {t.multiplayer.gameSettings}
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

      <JoinRoomModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={handleJoinRoom}
        returnFocusRef={joinTriggerRef}
      />
    </>
  );
}

export default function MultiplayerIndexPage({ kicked, roomClosed }: MultiplayerIndexPageProps) {
  return <MultiplayerIndexContent kicked={kicked} roomClosed={roomClosed} />;
}
