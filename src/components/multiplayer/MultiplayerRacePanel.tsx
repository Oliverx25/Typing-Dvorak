import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { useMultiplayerRace, type LocalRaceProgress } from '@/hooks/useMultiplayerRace';
import TypingTest from '@/components/typing/TypingTest';
import RaceLeaderboard from '@/components/multiplayer/RaceLeaderboard';
import { getLessonById } from '@/utils/curriculum/lessons';
import { resolveRaceText } from '@/utils/multiplayer/roomConfig';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { LobbyPlayerPresence, RoomBroadcastState } from '@/types/multiplayer';
import type { RefObject } from 'react';
import type { TypingProgressUpdate } from '@/components/typing/TypingTest';

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

const EMPTY_PROGRESS: LocalRaceProgress = {
  wpm: 0,
  percentage: 0,
  accuracy: 100,
  maxCombo: 0,
  score: 0,
  finished: false,
};

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
  const [localProgress, setLocalProgress] = useState<LocalRaceProgress>(EMPTY_PROGRESS);
  const [hasReportedFinish, setHasReportedFinish] = useState(false);

  const lesson = getLessonById(roomState.lessonId) ?? getLessonById('common-words')!;
  const raceText = useMemo(
    () => resolveRaceText(roomState, locale),
    [roomState, locale],
  );

  const { leaderboard, broadcastProgress, primaryVictory } = useMultiplayerRace({
    channel,
    progressHandlerRef,
    currentUserId,
    players,
    localProgress,
    winConditions: roomState.winConditions,
    enabled: Boolean(channel && currentUserId && raceActive),
  });

  useEffect(() => {
    setLocalProgress(EMPTY_PROGRESS);
    setHasReportedFinish(false);
  }, [roomState.raceStartedAt, roomState.version]);

  const handleProgressChange = useCallback(
    (update: TypingProgressUpdate, force = false) => {
      const finished = update.percentage >= 100 || force;
      const next: LocalRaceProgress = {
        wpm: update.wpm,
        percentage: update.percentage,
        accuracy: update.accuracy,
        maxCombo: update.maxCombo,
        score: update.score,
        finished,
      };
      setLocalProgress(next);

      if (!raceActive) return;
      void broadcastProgress(
        update.wpm,
        update.percentage,
        update.accuracy,
        update.maxCombo,
        update.score,
        finished,
        force,
      );

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
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          {t.multiplayer.raceTextPreview}
        </p>
        <p className="mt-1 font-mono text-sm leading-relaxed text-[var(--color-text)]">{raceText}</p>
        {roomState.blindMode ? (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">{t.multiplayer.blindModeActive}</p>
        ) : null}
      </div>

      {countdownSeconds !== null && countdownSeconds > 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-[var(--color-highlight)]/30 bg-[var(--color-highlight)]/5 py-16">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">{t.multiplayer.raceStarting}</p>
          <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-[var(--color-highlight)]">
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
              primaryVictory={primaryVictory}
              title={t.multiplayer.leaderboard}
              youLabel={t.multiplayer.you}
              finishedLabel={t.multiplayer.raceFinished}
              waitingLabel={t.multiplayer.waitingForOpponentProgress}
              scoreLabel={t.multiplayer.raceScore}
            />
          </div>
        </div>
      )}
    </div>
  );
}
