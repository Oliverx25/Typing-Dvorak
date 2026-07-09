import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { useMultiplayerRace, type LocalRaceProgress } from '@/hooks/useMultiplayerRace';
import TypingTest from '@/components/typing/session/TypingTest';
import RaceLeaderboard from '@/components/multiplayer/race/RaceLeaderboard';
import RaceResultsPanel from '@/components/multiplayer/race/RaceResultsPanel';
import { getLessonById } from '@/utils/curriculum/lessons';
import {
  resolveRaceText,
  isBlindModeActive,
  isVampireModeActive,
  isSuddenDeathActive,
  totalModifierMultiplier,
} from '@/utils/multiplayer/roomConfig';
import { resolveRaceTextSource, MULTIPLAYER_LESSON_ID } from '@/utils/stats/sessionDisplay';
import { mergePeakRaceProgress } from '@/utils/multiplayer/raceScoring';
import { rankParticipant } from '@/utils/multiplayer/raceRanking';
import { countPendingPlayers } from '@/utils/multiplayer/raceCompletion';
import { finalizeMultiplayerAchievements } from '@/utils/achievements/badges';
import { buildMultiplayerAchievementExtras } from '@/utils/achievements/multiplayerSnapshot';
import { consumeRaceSessionExtras, clearRaceSessionExtras } from '@/utils/achievements/raceSessionExtras';
import { getSessionHistory } from '@/utils/progress/storage';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { LobbyPlayerPresence, RoomBroadcastState, RoomPhase, LobbyConnectionStatus } from '@/types/multiplayer';
import type { RefObject } from 'react';
import type { TypingProgressUpdate } from '@/components/typing/session/TypingTest';
import RealtimeReconnectBanner from '@/components/multiplayer/RealtimeReconnectBanner';
import { AppErrorBoundary } from '@/components/ui';

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
  connectionStatus: LobbyConnectionStatus;
  onRaceFinish: () => void;
  onReturnToLobby: () => void;
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
  isOwner: _isOwner,
  connectionStatus,
  onRaceFinish,
  onReturnToLobby,
}: MultiplayerRacePanelProps) {
  const { t, locale } = useApp();
  const [localProgress, setLocalProgress] = useState<LocalRaceProgress>(EMPTY_PROGRESS);
  const [hasReportedFinish, setHasReportedFinish] = useState(false);
  const peakProgressRef = useRef({ wpm: 0, score: 0, percentage: 0, maxCombo: 0, accuracy: 100 });
  const halfProgressRankRef = useRef<number | null>(null);
  const raceSessionIdRef = useRef<number | null>(null);

  const lesson = getLessonById(roomState.lessonId) ?? getLessonById('common-words')!;
  const raceText = useMemo(
    () => resolveRaceText(roomState, locale),
    [roomState, locale],
  );

  const raceTextSource = useMemo(
    () => resolveRaceTextSource(roomState),
    [roomState],
  );

  const musicPacerWpm =
    roomState.textSource === 'song' && roomState.modifiers.includes('rhythm_lock')
      ? (roomState.songMeta?.avgWpm ?? roomState.songMeta?.trackWpm ?? null)
      : null;
  const musicTimeline =
    roomState.textSource === 'song' && roomState.modifiers.includes('rhythm_lock')
      ? (roomState.songMeta?.lyricTimeline ?? null)
      : null;
  const musicPacerEnabled = roomState.modifiers.includes('rhythm_lock');
  const totalMultiplier = totalModifierMultiplier(roomState.modifiers);

  const sessionPersist = useMemo(
    () => ({
      lessonId: MULTIPLAYER_LESSON_ID,
      lessonTitle: MULTIPLAYER_LESSON_ID,
      multiplayerSource: raceTextSource,
      songId:
        raceTextSource === 'song' && roomState.songMeta?.id != null
          ? roomState.songMeta.id
          : undefined,
      songTitle:
        raceTextSource === 'song' ? roomState.songMeta?.title ?? undefined : undefined,
      songCoverUrl:
        raceTextSource === 'song' ? roomState.songMeta?.coverArt ?? undefined : undefined,
      raceModifiers: roomState.modifiers.length > 0 ? roomState.modifiers : undefined,
      totalMultiplier,
    }),
    [raceTextSource, roomState.songMeta?.id, roomState.songMeta?.title, roomState.songMeta?.coverArt, roomState.modifiers, totalMultiplier],
  );

  const raceSessionActive = phase === 'racing' || phase === 'results';

  const { leaderboard, broadcastProgress, primaryVictory } = useMultiplayerRace({
    channel,
    progressHandlerRef,
    currentUserId,
    players,
    localProgress,
    winCondition: roomState.winCondition,
    enabled: Boolean(channel && currentUserId && raceSessionActive),
  });

  const leaderboardRef = useRef(leaderboard);
  leaderboardRef.current = leaderboard;

  useEffect(() => {
    if (phase !== 'racing' || !roomState.raceStartedAt) return;
    if (raceSessionIdRef.current === roomState.raceStartedAt) return;

    raceSessionIdRef.current = roomState.raceStartedAt;
    setLocalProgress(EMPTY_PROGRESS);
    setHasReportedFinish(false);
    peakProgressRef.current = { wpm: 0, score: 0, percentage: 0, maxCombo: 0, accuracy: 100 };
    halfProgressRankRef.current = null;
    clearRaceSessionExtras();
  }, [phase, roomState.raceStartedAt]);

  const handleProgressChange = useCallback(
    (update: TypingProgressUpdate, force = false) => {
      const finished = update.percentage >= 100 || force;
      const peaks = mergePeakRaceProgress(peakProgressRef.current, {
        wpm: update.wpm,
        score: update.score,
        percentage: update.percentage,
        maxCombo: update.maxCombo,
        accuracy: update.accuracy,
      });
      peakProgressRef.current = peaks;

      const next: LocalRaceProgress = {
        wpm: peaks.wpm,
        percentage: peaks.percentage,
        accuracy: peaks.accuracy,
        maxCombo: peaks.maxCombo,
        combo: update.combo,
        score: peaks.score,
        finished,
      };
      setLocalProgress(next);

      if (
        currentUserId &&
        halfProgressRankRef.current == null &&
        update.percentage >= 50
      ) {
        halfProgressRankRef.current = rankParticipant(
          leaderboardRef.current,
          currentUserId,
          {
            wpm: peaks.wpm,
            percentage: update.percentage,
            accuracy: update.accuracy,
            maxCombo: update.maxCombo,
            combo: update.combo,
            score: peaks.score,
            finished: false,
          },
          roomState.winCondition,
        );
      }

      if (!raceActive) return;
      void broadcastProgress(
        peaks.wpm,
        peaks.percentage,
        peaks.accuracy,
        peaks.maxCombo,
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
    [broadcastProgress, currentUserId, hasReportedFinish, onRaceFinish, raceActive, roomState.winCondition],
  );

  const lessonTitle = getLessonTitle(t, lesson.titleKey);

  const pendingOpponents = useMemo(() => {
    const participants = roomState.raceParticipantIds;
    if (participants.length > 0) {
      const finishedIds = new Set(
        players.filter((player) => player.hasFinished).map((player) => player.userId),
      );
      return participants.filter(
        (participantId) => participantId !== currentUserId && !finishedIds.has(participantId),
      ).length;
    }
    return countPendingPlayers(players, currentUserId);
  }, [players, currentUserId, roomState.raceParticipantIds]);

  const recordedResultsRef = useRef<string | null>(null);

  useEffect(() => {
    if (phase !== 'results' || !currentUserId || !roomState.raceStartedAt) return;
    const resultKey = `${roomState.raceStartedAt}-${roomState.version}`;
    if (recordedResultsRef.current === resultKey) return;
    recordedResultsRef.current = resultKey;

    const won = leaderboard[0]?.userId === currentUserId;
    const sessionRecord = getSessionHistory().find(
      (record) =>
        record.lessonId === MULTIPLAYER_LESSON_ID &&
        new Date(record.completedAt).getTime() >= (roomState.raceStartedAt ?? 0),
    );
    if (!sessionRecord) return;

    const pendingExtras = consumeRaceSessionExtras();
    const extras = buildMultiplayerAchievementExtras({
      leaderboard,
      currentUserId,
      players,
      roomState,
      halfProgressRank: halfProgressRankRef.current,
      pendingExtras,
    });

    finalizeMultiplayerAchievements(sessionRecord, extras, won);
  }, [
    phase,
    currentUserId,
    leaderboard,
    players,
    roomState,
  ]);

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
        title={t.multiplayer.raceResultsTitle}
        youLabel={t.multiplayer.you}
        winnerLabel={t.multiplayer.raceWinner}
        wpmLabel={t.stats.wpm}
        accuracyLabel={t.stats.accuracy}
        comboLabel={t.multiplayer.raceCombo}
        scoreLabel={t.multiplayer.raceScore}
        maxComboLabel={t.multiplayer.maxComboLabel}
        finishedLabel={t.multiplayer.raceFinished}
        returnToLobbyLabel={t.multiplayer.returnToWaitingRoom}
        swipeHint={t.multiplayer.raceResultsSwipe}
        leaveLabel={t.multiplayer.leaveRoom}
        correctLabel={t.completion.keystrokesCorrect}
        correctedLabel={t.completion.keystrokesCorrected}
        errorsLabel={t.completion.keystrokesErrors}
        rankLabel={t.multiplayer.raceResultsRank}
        totalMultiplier={totalMultiplier}
        raceCharCount={raceText.length}
        modifiers={roomState.modifiers}
        trackTitle={roomState.textSource === 'song' ? roomState.songMeta?.title : null}
        trackArtist={roomState.textSource === 'song' ? roomState.songMeta?.artist : null}
        trackCoverUrl={roomState.textSource === 'song' ? roomState.songMeta?.coverArt : null}
        songDifficulty={roomState.textSource === 'song' ? roomState.songMeta?.difficulty : null}
        raceStartedAt={roomState.raceStartedAt}
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
        <RealtimeReconnectBanner
          status={connectionStatus}
          visible={phase === 'racing'}
        />
        <AppErrorBoundary section="typing">
          <TypingTest
          key={`race-${roomState.raceStartedAt ?? roomState.version}`}
          lessonId={lesson.id}
          lesson={lesson}
          customText={raceText}
          practiceMode="practice"
          blindModeOverride={isBlindModeActive(roomState.modifiers)}
          hideModeToggle
          hideCompletionPanel
          raceMode
          musicPacerWpm={musicPacerWpm}
          musicTimeline={musicTimeline}
          musicPacerEnabled={musicPacerEnabled}
          scoreMultiplier={totalMultiplier}
          vampireMode={isVampireModeActive(roomState.modifiers)}
          suddenDeathMode={isSuddenDeathActive(roomState.modifiers)}
          sessionPersist={sessionPersist}
          onProgressChange={handleProgressChange}
          ariaLabel={lessonTitle}
        />
        </AppErrorBoundary>
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
        />
      </div>
    </div>
  );
}
