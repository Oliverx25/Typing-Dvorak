import { useEffect, useState } from 'react';
import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { formFieldClassName } from '@/components/ui/formFieldClasses';
import { RACE_LESSONS } from '@/utils/multiplayer/roomConfig';
import type { RoomBroadcastState } from '@/types/multiplayer';

interface RoomConfigPanelProps {
  roomState: RoomBroadcastState;
  isOwner: boolean;
  disabled?: boolean;
  onChange: (partial: Pick<RoomBroadcastState, 'lessonId' | 'customText' | 'blindMode'>) => void;
}

export default function RoomConfigPanel({
  roomState,
  isOwner,
  disabled = false,
  onChange,
}: RoomConfigPanelProps) {
  const { t } = useApp();
  const [customText, setCustomText] = useState(roomState.customText);

  useEffect(() => {
    setCustomText(roomState.customText);
  }, [roomState.customText, roomState.version]);

  useEffect(() => {
    if (!isOwner || disabled) return;
    if (customText === roomState.customText) return;

    const timer = window.setTimeout(() => {
      onChange({ customText });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [customText, disabled, isOwner, onChange, roomState.customText]);

  const content = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="race-lesson" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
          {t.multiplayer.raceLesson}
        </label>
        <select
          id="race-lesson"
          value={roomState.lessonId}
          disabled={!isOwner || disabled}
          onChange={(event) => onChange({ lessonId: event.target.value })}
          className={formFieldClassName}
        >
          {RACE_LESSONS.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {getLessonTitle(t, lesson.titleKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={roomState.blindMode}
            disabled={!isOwner || disabled}
            onChange={(event) => onChange({ blindMode: event.target.checked })}
            className="accent-[var(--color-accent)]"
          />
          {t.multiplayer.blindModeRace}
        </label>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="race-custom-text" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
          {t.multiplayer.customRaceText}
        </label>
        <textarea
          id="race-custom-text"
          value={customText}
          disabled={!isOwner || disabled}
          onChange={(event) => setCustomText(event.target.value)}
          placeholder={t.multiplayer.customRaceTextPlaceholder}
          rows={2}
          className={`${formFieldClassName} resize-y min-h-[4.5rem]`}
        />
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t.multiplayer.customRaceTextHint}</p>
      </div>
    </div>
  );

  if (!isOwner) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
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
