import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { useMultiplayerRace } from '@/hooks/useMultiplayerRace';
import TypingTest from '@/components/typing/TypingTest';
import RaceLeaderboard from '@/components/multiplayer/RaceLeaderboard';
import { getLessonById } from '@/utils/curriculum/lessons';
import { resolveRaceText } from '@/utils/multiplayer/roomConfig';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { LobbyPlayerPresence, RoomBroadcastState } from '@/types/multiplayer';
import type { RefObject } from 'react';

interface MultiplayerRacePanelProps {
  channel: RealtimeChannel | null;
  progressHandlerRef: RefObject<((payload: unknown) => void) | null>;
  currentUserId: string | null;
  players: LobbyPlayerPresence[];
  roomState: RoomBroadcastState;
  raceActive: boolean;
  countdownSeconds: number | null;
  onRaceFinish: () => void;
}

export default function MultiplayerRacePanel({
  channel,
  progressHandlerRef,
  currentUserId,
  players,
  roomState,
  raceActive,
  countdownSeconds,
  onRaceFinish,
}: MultiplayerRacePanelProps) {
  const { t, locale } = useApp();
  const [localProgress, setLocalProgress] = useState({ wpm: 0, percentage: 0, finished: false });
  const [hasReportedFinish, setHasReportedFinish] = useState(false);

  const lesson = getLessonById(roomState.lessonId) ?? getLessonById('common-words')!;
  const raceText = useMemo(
    () => resolveRaceText(roomState, locale),
    [roomState, locale],
  );

  const { leaderboard, broadcastProgress } = useMultiplayerRace({
    channel,
    progressHandlerRef,
    currentUserId,
    players,
    localProgress,
    enabled: Boolean(channel && currentUserId && raceActive),
  });

  useEffect(() => {
    setLocalProgress({ wpm: 0, percentage: 0, finished: false });
    setHasReportedFinish(false);
  }, [roomState.raceStartedAt, roomState.version]);

  const handleProgressChange = useCallback(
    (wpm: number, percentage: number, force = false) => {
      const finished = percentage >= 100 || force;
      setLocalProgress({ wpm, percentage, finished });

      if (!raceActive) return;
      void broadcastProgress(wpm, percentage, finished, force);

      if (finished && !hasReportedFinish) {
        setHasReportedFinish(true);
        onRaceFinish();
      }
    },
    [broadcastProgress, hasReportedFinish, onRaceFinish, raceActive],
  );

  const lessonTitle = getLessonTitle(t, lesson.titleKey);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          {t.multiplayer.raceTextPreview}
        </p>
        <p className="mt-1 font-mono text-sm leading-relaxed text-[var(--color-text)]">{raceText}</p>
        {roomState.blindMode ? (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">👁 {t.multiplayer.blindModeActive}</p>
        ) : null}
      </div>

      {countdownSeconds !== null && countdownSeconds > 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 py-16">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">{t.multiplayer.raceStarting}</p>
          <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-[var(--color-accent)]">
            {countdownSeconds}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div className={raceActive ? '' : 'pointer-events-none opacity-50'}>
            <TypingTest
              key={`${roomState.version}-${roomState.raceStartedAt}`}
              lessonId={lesson.id}
              lesson={lesson}
              customText={raceText}
              practiceMode="practice"
              blindModeOverride={roomState.blindMode}
              hideModeToggle
              hideCompletionPanel
              onProgressChange={handleProgressChange}
              ariaLabel={lessonTitle}
            />
            {localProgress.finished ? (
              <p className="mt-4 rounded-lg border border-[var(--color-correct)]/30 bg-[var(--color-correct)]/10 px-4 py-3 text-sm text-[var(--color-correct)]">
                {t.multiplayer.waitingForOthersFinish}
              </p>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-24">
            <RaceLeaderboard
              entries={leaderboard}
              currentUserId={currentUserId}
              title={t.multiplayer.leaderboard}
              youLabel={t.multiplayer.you}
              finishedLabel={t.multiplayer.raceFinished}
              waitingLabel={t.multiplayer.waitingForOpponentProgress}
            />
          </div>
        </div>
      )}
    </div>
  );
}
