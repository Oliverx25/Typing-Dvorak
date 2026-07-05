import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Accordion, SegmentedControl, Button } from '@/components/ui';
import Icon from '@/components/ui/icons/Icon';
import { formFieldClassName } from '@/components/ui/formFieldClasses';
import LessonGrid from '@/components/multiplayer/setup/LessonGrid';
import MatchRulesPanel from '@/components/multiplayer/setup/MatchRulesPanel';
import SongSearchModal from '@/components/multiplayer/setup/SongSearchModal';
import {
  CUSTOM_RACE_TEXT_MAX,
  CUSTOM_RACE_TEXT_MIN,
  RACE_LESSONS,
  type WinCondition,
} from '@/utils/multiplayer/roomConfig';
import type { TextSource } from '@/utils/multiplayer/roomStorage';

export interface CreateRoomSettingsValue {
  textSource: TextSource;
  lessonId: string;
  customText: string;
  blindMode: boolean;
  winConditions: WinCondition[];
}

interface CreateRoomSettingsProps {
  value: CreateRoomSettingsValue;
  onChange: (partial: Partial<CreateRoomSettingsValue>) => void;
  disabled?: boolean;
  variant?: 'full' | 'content' | 'settings';
}

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
  const [songSearchOpen, setSongSearchOpen] = useState(false);

  useEffect(() => {
    setCustomText(value.customText);
  }, [value.customText, value.textSource]);

  const customLength = customText.length;
  const customInvalid =
    value.textSource !== 'lesson' &&
    customText.trim().length > 0 &&
    !isCustomTextValid(customText);

  const handleCustomTextChange = (next: string) => {
    const clipped = next.slice(0, CUSTOM_RACE_TEXT_MAX);
    setCustomText(clipped);
    onChange({
      customText: clipped,
      textSource: value.textSource === 'song' ? 'custom' : value.textSource,
    });
  };

  const handleSongSelect = (lyrics: string) => {
    const clipped = lyrics.slice(0, CUSTOM_RACE_TEXT_MAX);
    setCustomText(clipped);
    onChange({ customText: clipped, textSource: 'song' });
  };

  const contentSection = (
    <div className="space-y-5">
      <SegmentedControl
        value={value.textSource === 'lesson' ? 'lesson' : 'custom'}
        disabled={disabled}
        onChange={(textSource) => {
          onChange({
            textSource: textSource as TextSource,
            ...(textSource === 'lesson' ? { customText: '' } : {}),
          });
          if (textSource === 'lesson') setCustomText('');
        }}
        options={[
          { value: 'lesson', label: t.multiplayer.systemLesson },
          { value: 'custom', label: t.multiplayer.customTextMode },
        ]}
      />

      <div
        key={value.textSource === 'lesson' ? 'lesson' : 'custom'}
        className="mp-fade-in transition-opacity duration-300 ease-in-out"
      >
        {value.textSource === 'lesson' ? (
          <LessonGrid
            lessons={RACE_LESSONS}
            selectedId={value.lessonId}
            disabled={disabled}
            onSelect={(lessonId) => onChange({ lessonId })}
            t={t}
          />
        ) : (
          <div className="space-y-3">
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => setSongSearchOpen(true)}
              className="w-full justify-center gap-2 border-slate-700 bg-slate-800/80 text-slate-100 hover:border-cyan-500/40 hover:bg-slate-700/90"
            >
              <Icon name="music-note" size={18} className="text-cyan-400" />
              {t.multiplayer.searchSongLyrics}
            </Button>

            {value.textSource === 'song' && customText.trim() ? (
              <p className="text-xs text-cyan-400/90">{t.multiplayer.lyricsLoadedHint}</p>
            ) : null}

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
                rows={6}
                className={`${formFieldClassName} min-h-[10rem] resize-y pb-8`}
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
          </div>
        )}
      </div>
    </div>
  );

  const settingsFields = (
    <MatchRulesPanel
      winConditions={value.winConditions}
      blindMode={value.blindMode}
      disabled={disabled}
      onChange={(partial) => onChange(partial)}
    />
  );

  const songSearchModal = (
    <SongSearchModal
      open={songSearchOpen}
      onClose={() => setSongSearchOpen(false)}
      onSelect={handleSongSelect}
    />
  );

  if (variant === 'content') {
    return (
      <>
        {contentSection}
        {songSearchModal}
      </>
    );
  }
  if (variant === 'settings') return settingsFields;

  return (
    <div className="space-y-5">
      {contentSection}
      {songSearchModal}

      <Accordion
        items={[
          {
            id: 'game-settings',
            title: t.multiplayer.gameSettings,
            children: settingsFields,
          },
        ]}
      />
    </div>
  );
}
