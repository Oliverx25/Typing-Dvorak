import { useEffect } from 'react';
import LeaveRoomButton from '@/components/multiplayer/lobby/LeaveRoomControls';
import RaceResultCard from '@/components/multiplayer/race/RaceResultCard';
import { Button } from '@/components/ui';
import { useScrollSnapCenter } from '@/hooks/useScrollSnapCenter';
import type { VictoryCondition } from '@/utils/multiplayer/roomConfig';
import type { RaceModifier } from '@/utils/multiplayer/roomConfig';
import type { RaceParticipantProgress } from '@/types/multiplayer';

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
  errorsLabel: string;
  rankLabel: string;
  totalMultiplier?: number;
  raceCharCount?: number;
  modifiers?: RaceModifier[];
  trackTitle?: string | null;
  trackArtist?: string | null;
  onReturnToLobby: () => void;
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
  errorsLabel,
  rankLabel,
  totalMultiplier = 1,
  raceCharCount = 0,
  modifiers = [],
  trackTitle = null,
  trackArtist = null,
  onReturnToLobby,
}: RaceResultsPanelProps) {
  const { scrollRef, setItemRef, activeIndex, scrollToIndex } = useScrollSnapCenter(
    entries.length,
  );

  useEffect(() => {
    if (entries.length <= 1) return;
    scrollToIndex(0);
  }, [entries.length, scrollToIndex]);

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
          'flex flex-row items-stretch gap-6 overflow-x-auto px-8 py-4',
          'snap-x snap-mandatory',
          '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        ].join(' ')}
        style={{
          paddingLeft: 'max(2rem, calc(50% - 250px))',
          paddingRight: 'max(2rem, calc(50% - 250px))',
        }}
      >
        {entries.map((entry, index) => (
          <div
            key={entry.userId}
            ref={setItemRef(index)}
            data-snap-index={index}
            className="snap-center shrink-0"
          >
            <RaceResultCard
              entry={entry}
              rank={index + 1}
              isActive={index === activeIndex}
              isSelf={entry.userId === currentUserId}
              labels={cardLabels}
              totalMultiplier={totalMultiplier}
              raceCharCount={raceCharCount}
              modifiers={modifiers}
              trackTitle={trackTitle}
              trackArtist={trackArtist}
              onFocus={() => scrollToIndex(index)}
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
