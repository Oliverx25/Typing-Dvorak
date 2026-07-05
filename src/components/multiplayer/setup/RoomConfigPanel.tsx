import CreateRoomSettings, { type CreateRoomSettingsValue } from '@/components/multiplayer/setup/CreateRoomSettings';
import { useApp } from '@/contexts/AppProvider';
import { normalizeWinConditions } from '@/utils/multiplayer/roomConfig';
import type { RoomBroadcastState } from '@/types/multiplayer';

interface RoomConfigPanelProps {
  roomState: RoomBroadcastState;
  isOwner: boolean;
  disabled?: boolean;
  onChange: (
    partial: Pick<
      RoomBroadcastState,
      'lessonId' | 'customText' | 'textSource' | 'songMeta' | 'blindMode' | 'winConditions'
    >,
  ) => void;
}

function toSettingsValue(roomState: RoomBroadcastState): CreateRoomSettingsValue {
  return {
    textSource: roomState.textSource ?? (roomState.customText.trim() ? 'custom' : 'lesson'),
    lessonId: roomState.lessonId,
    customText: roomState.customText,
    songMeta: roomState.songMeta ?? null,
    blindMode: roomState.blindMode,
    winConditions: normalizeWinConditions(roomState.winConditions),
  };
}

export default function RoomConfigPanel({
  roomState,
  isOwner,
  disabled = false,
  onChange,
}: RoomConfigPanelProps) {
  const { t } = useApp();

  const handleChange = (partial: Partial<CreateRoomSettingsValue>) => {
    const next = { ...toSettingsValue(roomState), ...partial };
    onChange({
      lessonId: next.lessonId,
      textSource: next.textSource,
      customText: next.textSource === 'lesson' ? '' : next.customText,
      songMeta: next.textSource === 'song' ? next.songMeta : null,
      blindMode: next.blindMode,
      winConditions: next.winConditions,
    });
  };

  const content = (
    <CreateRoomSettings
      value={toSettingsValue(roomState)}
      onChange={handleChange}
      disabled={!isOwner || disabled}
    />
  );

  if (!isOwner) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          {t.multiplayer.raceSettings}
        </p>
        {content}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {t.multiplayer.raceSettingsOwner}
      </p>
      {content}
    </div>
  );
}
