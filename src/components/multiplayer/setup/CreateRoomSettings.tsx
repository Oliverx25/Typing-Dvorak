import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Accordion, SegmentedControl } from '@/components/ui';
import Icon from '@/components/ui/icons/Icon';
import { formFieldClassName } from '@/components/ui/formFieldClasses';
import { focusRingCardClassName } from '@/utils/a11y/focusRing';
import LessonGrid from '@/components/multiplayer/setup/LessonGrid';
import MatchRulesPanel from '@/components/multiplayer/setup/MatchRulesPanel';
import SongSearchModal from '@/components/multiplayer/setup/SongSearchModal';
import ActiveTrackCard from '@/components/multiplayer/setup/ActiveTrackCard';
import {
  CUSTOM_RACE_TEXT_MAX,
  CUSTOM_RACE_TEXT_MIN,
  RACE_LESSONS,
  stripSongOnlyModifiers,
  type RaceModifier,
  type VictoryCondition,
} from '@/utils/multiplayer/roomConfig';
import { sanitizeTypableText } from '@/utils/security/sanitizeText';
import type { TextSource } from '@/utils/multiplayer/roomStorage';
import type { LyricSongResult, SelectedSongMeta } from '@/utils/lyrics/types';
import { getSongProgress } from '@/utils/progress/songProgress';

export interface CreateRoomSettingsValue {
  textSource: TextSource;
  lessonId: string;
  customText: string;
  songMeta: SelectedSongMeta | null;
  winCondition: VictoryCondition;
  modifiers: RaceModifier[];
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

/** True when the current source has a usable text/song selection. */
export function isRoomContentReady(value: CreateRoomSettingsValue): boolean {
  if (value.textSource === 'lesson') return Boolean(value.lessonId);
  if (value.textSource === 'song') {
    return Boolean(value.songMeta) && value.customText.trim().length >= CUSTOM_RACE_TEXT_MIN;
  }
  return isCustomTextValid(value.customText);
}

function toSongMeta(song: LyricSongResult): SelectedSongMeta {
  const stored = getSongProgress(song.id);
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    coverArt: song.coverArt,
    difficulty: song.difficulty,
    durationMs: song.durationMs,
    avgWpm: song.avgWpm,
    maxWpm: song.maxWpm,
    trackWpm: song.trackWpm,
    lyricTimeline: song.lyricTimeline,
    highestGrade: song.highestGrade ?? stored?.highestGrade ?? null,
    highestScore: song.highestScore ?? stored?.highestScore ?? null,
  };
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
  const songSearchReturnRef = useRef<HTMLElement | null>(null);
  const songSearchTriggerRef = useRef<HTMLButtonElement>(null);
  const changeTrackRef = useRef<HTMLButtonElement>(null);

  const openSongSearch = (trigger: HTMLElement | null) => {
    songSearchReturnRef.current = trigger;
    setSongSearchOpen(true);
  };

  useEffect(() => {
    if (value.textSource === 'custom') {
      setCustomText(value.customText);
    }
  }, [value.customText, value.textSource]);

  const customLength = customText.length;
  const customInvalid = customText.trim().length > 0 && !isCustomTextValid(customText);

  const handleTabChange = (nextSource: TextSource) => {
    if (nextSource === value.textSource) return;
    onChange({
      textSource: nextSource,
      modifiers:
        nextSource !== 'song'
          ? stripSongOnlyModifiers(value.modifiers)
          : value.modifiers,
    });
  };

  const handleCustomTextChange = (next: string) => {
    const cleaned = sanitizeTypableText(next, CUSTOM_RACE_TEXT_MAX);
    setCustomText(cleaned);
    onChange({ customText: cleaned, textSource: 'custom', songMeta: null });
  };

  const handleSongSelect = (song: LyricSongResult) => {
    onChange({
      textSource: 'song',
      customText: sanitizeTypableText(song.plainLyrics, CUSTOM_RACE_TEXT_MAX),
      songMeta: toSongMeta(song),
    });
  };

  const handleChangeTrack = () => {
    openSongSearch(changeTrackRef.current);
  };

  const contentSection = (
    <div className="space-y-5">
      <SegmentedControl
        value={value.textSource}
        disabled={disabled}
        onChange={(next) => handleTabChange(next as TextSource)}
        options={[
          { value: 'lesson', label: t.multiplayer.systemLesson },
          { value: 'custom', label: t.multiplayer.customTextMode },
          { value: 'song', label: t.multiplayer.songMode },
        ]}
      />

      <div key={value.textSource} className="mp-fade-in transition-opacity duration-300 ease-in-out">
        {value.textSource === 'lesson' ? (
          <LessonGrid
            lessons={RACE_LESSONS}
            selectedId={value.lessonId}
            disabled={disabled}
            onSelect={(lessonId) => onChange({ lessonId })}
            t={t}
          />
        ) : value.textSource === 'song' ? (
          <div className="space-y-3">
            {value.songMeta ? (
              <ActiveTrackCard
                song={value.songMeta}
                disabled={disabled}
                changeTrackRef={changeTrackRef}
                onChangeTrack={handleChangeTrack}
              />
            ) : (
              <button
                ref={songSearchTriggerRef}
                type="button"
                disabled={disabled}
                onClick={() => openSongSearch(songSearchTriggerRef.current)}
                className={[
                  'group flex h-32 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/40 text-slate-300 transition hover:border-[var(--color-highlight)] hover:bg-slate-700/50 hover:text-[var(--color-highlight)] disabled:cursor-not-allowed disabled:opacity-50',
                  focusRingCardClassName,
                ].join(' ')}
              >
                <Icon name="music-note" size={32} className="text-[var(--color-highlight)]" />
                <span className="text-base font-semibold">{t.multiplayer.searchSongLyrics}</span>
                <span className="text-xs text-slate-500">{t.multiplayer.songModeHint}</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            <label
              htmlFor="create-custom-text"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
            >
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
        )}
      </div>
    </div>
  );

  const settingsFields = (
    <MatchRulesPanel
      winCondition={value.winCondition}
      modifiers={value.modifiers}
      textSource={value.textSource}
      disabled={disabled}
      onChange={(partial) => onChange(partial)}
    />
  );

  const songSearchModal = (
    <SongSearchModal
      open={songSearchOpen}
      selectedSongId={value.songMeta?.id ?? null}
      onClose={() => setSongSearchOpen(false)}
      onSelect={handleSongSelect}
      returnFocusRef={songSearchReturnRef}
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
