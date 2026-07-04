import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Accordion, CustomSelect, SegmentedControl, ToggleSwitch } from '@/components/ui';
import { formFieldClassName } from '@/components/ui/formFieldClasses';
import LessonGrid from '@/components/multiplayer/LessonGrid';
import {
  CUSTOM_RACE_TEXT_MAX,
  CUSTOM_RACE_TEXT_MIN,
  RACE_LESSONS,
  WIN_CONDITIONS,
  type WinCondition,
} from '@/utils/multiplayer/roomConfig';
import type { TextSource } from '@/utils/multiplayer/roomStorage';

export interface CreateRoomSettingsValue {
  textSource: TextSource;
  lessonId: string;
  customText: string;
  blindMode: boolean;
  winCondition: WinCondition;
}

interface CreateRoomSettingsProps {
  value: CreateRoomSettingsValue;
  onChange: (partial: Partial<CreateRoomSettingsValue>) => void;
  disabled?: boolean;
  variant?: 'full' | 'content' | 'settings';
}

const winConditionLabelKeys: Record<
  WinCondition,
  'winConditionFirstFinish' | 'winConditionHighestWpm' | 'winConditionSuddenDeath'
> = {
  first_finish: 'winConditionFirstFinish',
  highest_wpm: 'winConditionHighestWpm',
  sudden_death: 'winConditionSuddenDeath',
};

export function isCustomTextValid(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length >= CUSTOM_RACE_TEXT_MIN && trimmed.length <= CUSTOM_RACE_TEXT_MAX;
}

export default function CreateRoomSettings({
  value,
  onChange,
  disabled = false,
  variant = 'full',
}: CreateRoomSettingsProps) {
  const { t } = useApp();
  const [customText, setCustomText] = useState(value.customText);

  useEffect(() => {
    setCustomText(value.customText);
  }, [value.customText, value.textSource]);

  const customLength = customText.length;
  const customInvalid =
    value.textSource === 'custom' &&
    customText.trim().length > 0 &&
    !isCustomTextValid(customText);

  const winConditionOptions = useMemo(
    () =>
      WIN_CONDITIONS.map((condition) => ({
        value: condition,
        label: t.multiplayer[winConditionLabelKeys[condition]],
      })),
    [t],
  );

  const handleCustomTextChange = (next: string) => {
    const clipped = next.slice(0, CUSTOM_RACE_TEXT_MAX);
    setCustomText(clipped);
    onChange({ customText: clipped });
  };

  const contentSection = (
    <div className="space-y-5">
      <SegmentedControl
        value={value.textSource}
        disabled={disabled}
        onChange={(textSource) => {
          onChange({
            textSource,
            ...(textSource === 'lesson' ? { customText: '' } : {}),
          });
          if (textSource === 'lesson') setCustomText('');
        }}
        options={[
          { value: 'lesson', label: t.multiplayer.systemLesson },
          { value: 'custom', label: t.multiplayer.customTextMode },
        ]}
      />

      {value.textSource === 'lesson' ? (
        <LessonGrid
          lessons={RACE_LESSONS}
          selectedId={value.lessonId}
          disabled={disabled}
          onSelect={(lessonId) => onChange({ lessonId })}
          t={t}
        />
      ) : (
        <div>
          <label htmlFor="create-custom-text" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
            {t.multiplayer.customRaceText}
          </label>
          <div className="relative">
            <textarea
              id="create-custom-text"
              value={customText}
              disabled={disabled}
              onChange={(event) => handleCustomTextChange(event.target.value)}
              placeholder={t.multiplayer.customRaceTextPlaceholder}
              maxLength={CUSTOM_RACE_TEXT_MAX}
              rows={4}
              className={`${formFieldClassName} min-h-[6rem] resize-y pb-8`}
            />
            <span
              className={[
                'pointer-events-none absolute right-3 bottom-2 text-[11px] tabular-nums',
                customLength > CUSTOM_RACE_TEXT_MAX * 0.9
                  ? 'text-[var(--color-incorrect)]'
                  : 'text-[var(--color-text-muted)]',
              ].join(' ')}
            >
              {t.multiplayer.charactersCount
                .replace('{current}', String(customLength))
                .replace('{max}', String(CUSTOM_RACE_TEXT_MAX))}
            </span>
          </div>
          {customInvalid ? (
            <p className="mt-1.5 text-xs text-[var(--color-incorrect)]">
              {t.multiplayer.customTextTooShort}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
              {t.multiplayer.customRaceTextHint}
            </p>
          )}
        </div>
      )}
    </div>
  );

  const settingsFields = (
    <div className="space-y-5">
      <div>
        <label htmlFor="win-condition" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
          {t.multiplayer.winCondition}
        </label>
        <CustomSelect
          id="win-condition"
          value={value.winCondition}
          disabled={disabled}
          onChange={(winCondition) =>
            onChange({ winCondition: winCondition as WinCondition })
          }
          options={winConditionOptions}
          aria-label={t.multiplayer.winCondition}
        />
      </div>
      <ToggleSwitch
        label={t.multiplayer.blindModeRace}
        checked={value.blindMode}
        disabled={disabled}
        onChange={(blindMode) => onChange({ blindMode })}
      />
    </div>
  );

  if (variant === 'content') return contentSection;
  if (variant === 'settings') return settingsFields;

  return (
    <div className="space-y-5">
      {contentSection}

      <Accordion
        items={[
          {
            id: 'game-settings',
            title: t.multiplayer.gameSettings,
            subtitle: t.multiplayer.gameSettingsHint,
            children: settingsFields,
          },
        ]}
      />
    </div>
  );
}
