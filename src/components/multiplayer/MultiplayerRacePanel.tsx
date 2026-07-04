import { useCallback, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useMultiplayerRace } from '@/hooks/useMultiplayerRace';
import TypingTest from '@/components/typing/TypingTest';
import MultiplayerRaceTrack from '@/components/multiplayer/MultiplayerRaceTrack';
import { LESSONS } from '@/utils/curriculum/lessons';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { LobbyPlayerPresence } from '@/types/multiplayer';
import type { RefObject } from 'react';

interface MultiplayerRacePanelProps {
  channel: RealtimeChannel | null;
  progressHandlerRef: RefObject<((payload: unknown) => void) | null>;
  currentUserId: string | null;
  players: LobbyPlayerPresence[];
}

export default function MultiplayerRacePanel({
  channel,
  progressHandlerRef,
  currentUserId,
  players,
}: MultiplayerRacePanelProps) {
  const { t } = useApp();
  const [localProgress, setLocalProgress] = useState({ wpm: 0, percentage: 0 });
  const lesson = LESSONS.find((item) => item.id === 'all-rows') ?? LESSONS[0]!;

  const { opponents, broadcastProgress } = useMultiplayerRace({
    channel,
    progressHandlerRef,
    currentUserId,
    players,
    enabled: Boolean(channel && currentUserId),
  });

  const localPlayer = useMemo(
    () => players.find((player) => player.userId === currentUserId) ?? null,
    [players, currentUserId],
  );

  const handleProgressChange = useCallback(
    (wpm: number, percentage: number, force = false) => {
      setLocalProgress({ wpm, percentage });
      void broadcastProgress(wpm, percentage, force);
    },
    [broadcastProgress],
  );

  return (
    <div className="space-y-6">
      <MultiplayerRaceTrack
        localProgress={{
          player: localPlayer,
          wpm: localProgress.wpm,
          percentage: localProgress.percentage,
        }}
        opponents={opponents}
        title={t.multiplayer.raceProgress}
        emptyLabel={t.multiplayer.waitingForOpponentProgress}
      />
      <TypingTest
        lessonId={lesson.id}
        lesson={lesson}
        customText={lesson.texts[0]}
        onProgressChange={handleProgressChange}
      />
    </div>
  );
}
