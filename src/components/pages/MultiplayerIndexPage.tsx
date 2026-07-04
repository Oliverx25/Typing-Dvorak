import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import BackLink from '@/components/layout/BackLink';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { Button, Card } from '@/components/ui';
import { formFieldClassName } from '@/components/ui/formFieldClasses';
import { DEFAULT_RACE_LESSON_ID, RACE_LESSONS } from '@/utils/multiplayer/roomConfig';
import { generateRoomCode, normalizeRoomCode, roomUrl } from '@/utils/multiplayer/roomCode';
import { saveCreateRoomConfig } from '@/utils/multiplayer/roomStorage';

function MultiplayerIndexContent() {
  const { t } = useApp();
  const [joinCode, setJoinCode] = useState('');
  const [lessonId, setLessonId] = useState(DEFAULT_RACE_LESSON_ID);
  const [customText, setCustomText] = useState('');
  const [blindMode, setBlindMode] = useState(false);

  const handleCreateRoom = () => {
    const code = generateRoomCode();
    saveCreateRoomConfig(code, {
      lessonId,
      customText: customText.trim(),
      blindMode,
    });
    window.location.href = roomUrl(code);
  };

  const handleJoinRoom = () => {
    const code = normalizeRoomCode(joinCode);
    if (code.length < 4) return;
    window.location.href = roomUrl(code);
  };

  const kicked = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('kicked') === '1';

  return (
    <>
      <BackLink href="/lessons" />
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          {t.multiplayer.title}
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">{t.multiplayer.subtitle}</p>
      </header>

      {kicked ? (
        <p className="mb-6 rounded-lg border border-[var(--color-incorrect)]/30 bg-[var(--color-incorrect)]/10 px-4 py-3 text-sm text-[var(--color-incorrect)]">
          {t.multiplayer.kickedFromRoom}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t.multiplayer.createRoom} description={t.multiplayer.createRoomDesc} padding="lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="create-lesson" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                {t.multiplayer.raceLesson}
              </label>
              <select
                id="create-lesson"
                value={lessonId}
                onChange={(event) => setLessonId(event.target.value)}
                className={formFieldClassName}
              >
                {RACE_LESSONS.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {getLessonTitle(t, lesson.titleKey)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="create-custom-text" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                {t.multiplayer.customRaceText}
              </label>
              <textarea
                id="create-custom-text"
                value={customText}
                onChange={(event) => setCustomText(event.target.value)}
                placeholder={t.multiplayer.customRaceTextPlaceholder}
                rows={2}
                className={`${formFieldClassName} min-h-[4.5rem] resize-y`}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={blindMode}
                onChange={(event) => setBlindMode(event.target.checked)}
                className="accent-[var(--color-accent)]"
              />
              {t.multiplayer.blindModeRace}
            </label>

            <Button onClick={handleCreateRoom} fullWidth>
              {t.multiplayer.createRoomAction}
            </Button>
          </div>
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
