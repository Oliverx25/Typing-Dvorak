import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { Button } from '@/components/ui';
import ModBadge from '@/components/multiplayer/setup/ModBadge';
import ActiveTrackCard from '@/components/multiplayer/setup/ActiveTrackCard';
import { getLessonById } from '@/utils/curriculum/lessons';
import {
  BLIND_MODE_ICON,
  MODIFIER_WIN_CONDITIONS,
  VICTORY_CONDITIONS,
  WIN_CONDITION_ICONS,
  normalizeWinConditions,
  type WinCondition,
} from '@/utils/multiplayer/roomConfig';
import type { RoomBroadcastState } from '@/types/multiplayer';

interface MatchInfoCardProps {
  roomState: RoomBroadcastState;
  isOwner: boolean;
  onEditSettings?: () => void;
}

const winLabelKeys: Record<
  WinCondition,
  | 'winConditionFirstFinish'
  | 'winConditionHighestWpm'
  | 'winConditionMaxScore'
  | 'winConditionSuddenDeath'
> = {
  first_finish: 'winConditionFirstFinish',
  highest_wpm: 'winConditionHighestWpm',
  max_score: 'winConditionMaxScore',
  sudden_death: 'winConditionSuddenDeath',
};

export default function MatchInfoCard({
  roomState,
  isOwner,
  onEditSettings,
}: MatchInfoCardProps) {
  const { t } = useApp();
  const winConditions = normalizeWinConditions(roomState.winConditions);
  const victoryConditions = winConditions.filter((c) => VICTORY_CONDITIONS.includes(c));
  const modifierConditions = winConditions.filter((c) => MODIFIER_WIN_CONDITIONS.includes(c));
  const isSong = roomState.textSource === 'song' && Boolean(roomState.songMeta);
  const isCustom = !isSong && roomState.customText.trim().length > 0;
  const lesson = !isCustom && !isSong ? getLessonById(roomState.lessonId) : undefined;

  const title = isSong
    ? (roomState.songMeta?.title ?? t.multiplayer.songMode)
    : isCustom
      ? t.multiplayer.customTextMode
      : lesson
        ? getLessonTitle(t, lesson.titleKey)
        : roomState.lessonId;

  const difficulty = lesson ? t.difficulty[lesson.difficulty] : null;
  const category = lesson ? t.categories[lesson.category] : null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {t.multiplayer.currentMatch}
          </p>

          {isSong && roomState.songMeta ? (
            <ActiveTrackCard
              song={roomState.songMeta}
              readonly={!isOwner}
              onChangeTrack={isOwner && onEditSettings ? () => onEditSettings() : undefined}
            />
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">{title}</h2>
              {isCustom ? (
                <p className="line-clamp-2 font-mono text-sm text-[var(--color-text-muted)]">
                  {roomState.customText.trim()}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {category ? (
                  <span className="rounded-md bg-[var(--color-highlight)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-highlight)]">
                    {category}
                  </span>
                ) : null}
                {difficulty ? (
                  <span className="rounded-md bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                    {difficulty}
                  </span>
                ) : null}
              </div>
            </>
          )}
        </div>

        {isOwner && onEditSettings ? (
          <Button variant="secondary" size="sm" onClick={onEditSettings}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-highlight)]"
              aria-hidden="true"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {t.multiplayer.changeMatchSettings}
          </Button>
        ) : null}
      </div>

      <div className="mt-6 space-y-4 border-t border-[var(--color-border)] pt-5">
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {t.multiplayer.winCondition}
          </p>
          <div className="flex flex-wrap gap-2">
            {victoryConditions.map((condition) => (
              <ModBadge
                key={condition}
                compact
                readOnly
                isActive
                icon={WIN_CONDITION_ICONS[condition]}
                title={t.multiplayer[winLabelKeys[condition]]}
              />
            ))}
          </div>
        </section>

        {modifierConditions.length > 0 || roomState.blindMode ? (
          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t.multiplayer.modifiers}
            </p>
            <div className="flex flex-wrap gap-2">
              {modifierConditions.map((condition) => (
                <ModBadge
                  key={condition}
                  compact
                  readOnly
                  isActive
                  icon={WIN_CONDITION_ICONS[condition]}
                  title={t.multiplayer[winLabelKeys[condition]]}
                />
              ))}
              {roomState.blindMode ? (
                <ModBadge
                  compact
                  readOnly
                  isActive
                  icon={BLIND_MODE_ICON}
                  title={t.multiplayer.blindModeMod}
                />
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
