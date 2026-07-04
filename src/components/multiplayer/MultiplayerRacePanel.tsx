import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { useMultiplayerRace, type LocalRaceProgress } from '@/hooks/useMultiplayerRace';
import TypingTest from '@/components/typing/TypingTest';
import RaceLeaderboard from '@/components/multiplayer/RaceLeaderboard';
import RaceResultsPanel from '@/components/multiplayer/RaceResultsPanel';
import { getLessonById } from '@/utils/curriculum/lessons';
import { resolveRaceText } from '@/utils/multiplayer/roomConfig';
import { mergePeakRaceProgress } from '@/utils/multiplayer/raceScoring';
import { countPendingPlayers } from '@/utils/multiplayer/raceCompletion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { LobbyPlayerPresence, RoomBroadcastState, RoomPhase } from '@/types/multiplayer';
import type { RefObject } from 'react';
import type { TypingProgressUpdate } from '@/components/typing/TypingTest';

interface MultiplayerRacePanelProps {
  channel: RealtimeChannel | null;
  progressHandlerRef: RefObject<((payload: unknown) => void) | null>;
  currentUserId: string | null;
  players: LobbyPlayerPresence[];
  roomState: RoomBroadcastState;
  phase: RoomPhase;
  raceActive: boolean;
  countdownSeconds: number | null;
  isOwner: boolean;
  onRaceFinish: () => void;
  onReturnToLobby: () => void;
  onLeave: () => void;
}

const EMPTY_PROGRESS: LocalRaceProgress = {
  wpm: 0,
  percentage: 0,
  accuracy: 100,
  maxCombo: 0,
  combo: 0,
  score: 0,
  finished: false,
};

export default function MultiplayerRacePanel({
  channel,
  progressHandlerRef,
  currentUserId,
  players,
  roomState,
  phase,
  raceActive,
  countdownSeconds,
  isOwner,
  onRaceFinish,
  onReturnToLobby,
  onLeave,
}: MultiplayerRacePanelProps) {
  const { t, locale } = useApp();
  const [localProgress, setLocalProgress] = useState<LocalRaceProgress>(EMPTY_PROGRESS);
  const [hasReportedFinish, setHasReportedFinish] = useState(false);
  const peakProgressRef = useRef({ wpm: 0, score: 0 });

  const lesson = getLessonById(roomState.lessonId) ?? getLessonById('common-words')!;
  const raceText = useMemo(
    () => resolveRaceText(roomState, locale),
    [roomState, locale],
  );

  const raceSessionActive = phase === 'racing' || phase === 'results';

  const { leaderboard, broadcastProgress, primaryVictory } = useMultiplayerRace({
    channel,
    progressHandlerRef,
    currentUserId,
    players,
    localProgress,
    winConditions: roomState.winConditions,
    enabled: Boolean(channel && currentUserId && raceSessionActive),
  });

  useEffect(() => {
    if (phase !== 'racing' || !roomState.raceStartedAt) return;
    setLocalProgress(EMPTY_PROGRESS);
    setHasReportedFinish(false);
    peakProgressRef.current = { wpm: 0, score: 0 };
  }, [phase, roomState.raceStartedAt]);

  const handleProgressChange = useCallback(
    (update: TypingProgressUpdate, force = false) => {
      const finished = update.percentage >= 100 || force;
      const peaks = mergePeakRaceProgress(peakProgressRef.current, {
        wpm: update.wpm,
        score: update.score,
      });
      peakProgressRef.current = peaks;

      const next: LocalRaceProgress = {
        wpm: peaks.wpm,
        percentage: update.percentage,
        accuracy: update.accuracy,
        maxCombo: update.maxCombo,
        combo: update.combo,
        score: peaks.score,
        finished,
      };
      setLocalProgress(next);

      if (!raceActive) return;
      void broadcastProgress(
        peaks.wpm,
        update.percentage,
        update.accuracy,
        update.maxCombo,
        update.combo,
        peaks.score,
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

  const pendingOpponents = useMemo(
    () => countPendingPlayers(players, currentUserId),
    [players, currentUserId],
  );

  const waitingDetail =
    pendingOpponents > 0
      ? t.multiplayer.waitingForOthersDetail.replace('{count}', String(pendingOpponents))
      : t.multiplayer.waitingForOthersSync;

  if (phase === 'results') {
    return (
      <RaceResultsPanel
        entries={leaderboard}
        currentUserId={currentUserId}
        primaryVictory={primaryVictory}
        isOwner={isOwner}
        title={t.multiplayer.raceResultsTitle}
        subtitle={t.multiplayer.raceResultsSwipe}
        youLabel={t.multiplayer.you}
        winnerLabel={t.multiplayer.raceWinner}
        wpmLabel={t.stats.wpm}
        accuracyLabel={t.stats.accuracy}
        comboLabel={t.multiplayer.raceCombo}
        scoreLabel={t.multiplayer.raceScore}
        finishedLabel={t.multiplayer.raceFinished}
        returnToLobbyLabel={t.multiplayer.returnToWaitingRoom}
        waitingForHostLabel={t.multiplayer.waitingForHostReturn}
        swipeHint={t.multiplayer.raceResultsSwipe}
        onReturnToLobby={onReturnToLobby}
      />
    );
  }

  if (countdownSeconds !== null && countdownSeconds > 0) {
    return (
      <div className="flex min-h-[min(60vh,420px)] flex-col items-center justify-center rounded-2xl border border-[var(--color-highlight)]/30 bg-[var(--color-highlight)]/5 py-16">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          {t.multiplayer.raceStarting}
        </p>
        <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-[var(--color-highlight)]">
          {countdownSeconds}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      <div className={`relative ${raceActive ? '' : 'pointer-events-none opacity-50'}`}>
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
          <div
            className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-[var(--color-surface)]/92 backdrop-blur-md"
            role="status"
            aria-live="polite"
          >
            <div className="mx-4 max-w-sm text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-correct)]" />
              <p className="mt-4 text-lg font-semibold text-[var(--color-text)]">
                {t.multiplayer.waitingForOthersFinish}
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{waitingDetail}</p>
            </div>
          </div>
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
          scoreLabel={t.multiplayer.raceScore}
          comboLabel={t.multiplayer.raceCombo}
          leaveLabel={t.multiplayer.leaveRoom}
          onLeave={onLeave}
        />
      </div>
    </div>
  );
}
