import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import BackLink from '@/components/layout/BackLink';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { Accordion, Button, Card, CustomSelect, Tabs } from '@/components/ui';
import { formFieldClassName } from '@/components/ui/formFieldClasses';
import { DEFAULT_RACE_LESSON_ID, RACE_LESSONS } from '@/utils/multiplayer/roomConfig';
import { generateRoomCode, normalizeRoomCode, roomUrl } from '@/utils/multiplayer/roomCode';
import { saveCreateRoomConfig } from '@/utils/multiplayer/roomStorage';

type MultiplayerTab = 'create' | 'join';

function MultiplayerIndexContent() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<MultiplayerTab>('create');
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

  const kicked =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('kicked') === '1';

  const joinCodeValid = normalizeRoomCode(joinCode).length >= 4;

  const lessonOptions = RACE_LESSONS.map((lesson) => ({
    value: lesson.id,
    label: getLessonTitle(t, lesson.titleKey),
  }));

  const createPanel = (
    <div className="space-y-5">
      <div>
        <label htmlFor="create-lesson" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
          {t.multiplayer.raceLesson}
        </label>
        <CustomSelect
          id="create-lesson"
          value={lessonId}
          onChange={setLessonId}
          options={lessonOptions}
          aria-label={t.multiplayer.raceLesson}
        />
      </div>

      <Accordion
        items={[
          {
            id: 'advanced',
            title: t.multiplayer.advancedOptions,
            subtitle: t.multiplayer.advancedOptionsHint,
            children: (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="create-custom-text"
                    className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
                  >
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
              </div>
            ),
          },
        ]}
      />

      <Button onClick={handleCreateRoom} fullWidth>
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

      <div className="mx-auto w-full max-w-md px-1">
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
