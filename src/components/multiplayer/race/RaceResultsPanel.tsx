import { useCallback, useEffect, useRef, useState } from 'react';
import LeaveRoomButton from '@/components/multiplayer/lobby/LeaveRoomControls';
import RaceResultCard from '@/components/multiplayer/race/RaceResultCard';
import { Button } from '@/components/ui';
import type { VictoryCondition } from '@/utils/multiplayer/roomConfig';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig';
import type { RaceParticipantProgress } from '@/types/multiplayer';
import type { TypingDifficulty } from '@/utils/lyrics/types';

interface RaceResultsPanelProps {
  entries: RaceParticipantProgress[];
  currentUserId: string | null;
  primaryVictory: VictoryCondition;
  title: string;
  youLabel: string;
  winnerLabel: string;
  wpmLabel: string;
  accuracyLabel: string;
  comboLabel: string;
  scoreLabel: string;
  maxComboLabel: string;
  finishedLabel: string;
  returnToLobbyLabel: string;
  swipeHint: string;
  leaveLabel: string;
  correctLabel: string;
  correctedLabel: string;
  errorsLabel: string;
  rankLabel: string;
  totalMultiplier?: number;
  raceCharCount?: number;
  modifiers?: RaceModifier[];
  trackTitle?: string | null;
  trackArtist?: string | null;
  trackCoverUrl?: string | null;
  songDifficulty?: TypingDifficulty | null;
  raceStartedAt?: number | null;
  onReturnToLobby: () => void;
}

function resolveDefaultActiveId(
  entries: RaceParticipantProgress[],
  currentUserId: string | null,
): string | null {
  if (entries.length === 0) return null;
  if (currentUserId && entries.some((entry) => entry.userId === currentUserId)) {
    return currentUserId;
  }
  return entries[0].userId;
}

export default function RaceResultsPanel({
  entries,
  currentUserId,
  title,
  youLabel,
  winnerLabel,
  wpmLabel,
  accuracyLabel,
  comboLabel,
  scoreLabel,
  maxComboLabel,
  finishedLabel,
  returnToLobbyLabel,
  swipeHint,
  leaveLabel,
  correctLabel,
  correctedLabel,
  errorsLabel,
  rankLabel,
  totalMultiplier = 1,
  raceCharCount = 0,
  modifiers = [],
  trackTitle = null,
  trackArtist = null,
  trackCoverUrl = null,
  songDifficulty = null,
  raceStartedAt = null,
  onReturnToLobby,
}: RaceResultsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const didInitialScrollRef = useRef(false);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(() =>
    resolveDefaultActiveId(entries, currentUserId),
  );

  useEffect(() => {
    setActivePlayerId(resolveDefaultActiveId(entries, currentUserId));
    didInitialScrollRef.current = false;
  }, [entries, currentUserId]);

  useEffect(() => {
    if (!activePlayerId || didInitialScrollRef.current) return;
    const card = cardRefs.current.get(activePlayerId);
    if (!card) return;

    card.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
    didInitialScrollRef.current = true;
  }, [activePlayerId, entries.length]);

  const handleActivate = useCallback((userId: string) => {
    setActivePlayerId(userId);
    cardRefs.current.get(userId)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, []);

  const setCardRef = useCallback(
    (userId: string) => (element: HTMLDivElement | null) => {
      if (element) {
        cardRefs.current.set(userId, element);
      } else {
        cardRefs.current.delete(userId);
      }
    },
    [],
  );

  if (entries.length === 0) {
    return null;
  }

  const cardLabels = {
    title,
    youLabel,
    winnerLabel,
    wpmLabel,
    accuracyLabel,
    comboLabel,
    scoreLabel,
    maxComboLabel,
    finishedLabel,
    correctLabel,
    correctedLabel,
    errorsLabel,
    rankLabel,
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-64 -translate-y-1/2 bg-[var(--color-highlight)]/8 blur-3xl"
        aria-hidden
      />

      {entries.length > 1 ? (
        <p className="mb-3 text-center text-xs text-[var(--color-text-muted)]">{swipeHint}</p>
      ) : null}

      <div
        ref={scrollRef}
        className={[
          'flex flex-row items-center gap-8 overflow-x-auto py-8',
          'px-[max(1rem,50vw)]',
          '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        ].join(' ')}
      >
        {entries.map((entry, index) => (
          <div
            key={entry.userId}
            ref={setCardRef(entry.userId)}
            className="w-[min(92vw,400px)] shrink-0 md:w-[500px]"
          >
            <RaceResultCard
              entry={entry}
              rank={index + 1}
              isActive={entry.userId === activePlayerId}
              isSelf={entry.userId === currentUserId}
              labels={cardLabels}
              totalMultiplier={totalMultiplier}
              raceCharCount={raceCharCount}
              modifiers={modifiers}
              trackTitle={trackTitle}
              trackArtist={trackArtist}
              trackCoverUrl={trackCoverUrl}
              songDifficulty={songDifficulty}
              raceStartedAt={raceStartedAt}
              onActivate={() => handleActivate(entry.userId)}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4 px-4">
        <div className="flex justify-center">
          <Button size="lg" onClick={onReturnToLobby}>
            {returnToLobbyLabel}
          </Button>
        </div>
        <div className="flex justify-end">
          <LeaveRoomButton variant="ghost" size="sm">
            {leaveLabel}
          </LeaveRoomButton>
        </div>
      </div>
    </div>
  );
}
