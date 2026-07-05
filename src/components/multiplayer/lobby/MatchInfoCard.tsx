import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { Button } from '@/components/ui';
import ModBadge from '@/components/multiplayer/setup/ModBadge';
import ModifierIcon from '@/components/multiplayer/setup/ModifierIcon';
import Icon from '@/components/ui/icons/Icon';
import ActiveTrackCard from '@/components/multiplayer/setup/ActiveTrackCard';
import { getLessonById } from '@/utils/curriculum/lessons';
import {
  VICTORY_CONDITION_ICONS,
  normalizeModifiers,
  normalizeWinCondition,
  type VictoryCondition,
} from '@/utils/multiplayer/roomConfig';
import type { RoomBroadcastState } from '@/types/multiplayer';

interface MatchInfoCardProps {
  roomState: RoomBroadcastState;
  isOwner: boolean;
  onEditSettings?: () => void;
  onChangeTrack?: () => void;
}

const winLabelKeys: Record<
  VictoryCondition,
  'winConditionFirstFinish' | 'winConditionHighestWpm' | 'winConditionMaxScore'
> = {
  first_finish: 'winConditionFirstFinish',
  highest_wpm: 'winConditionHighestWpm',
  max_score: 'winConditionMaxScore',
};

export default function MatchInfoCard({
  roomState,
  isOwner,
  onEditSettings,
  onChangeTrack,
}: MatchInfoCardProps) {
  const { t } = useApp();
  const winCondition = normalizeWinCondition(roomState.winCondition);
  const modifiers = normalizeModifiers(roomState.modifiers);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {t.multiplayer.currentMatch}
        </p>

        {isOwner && onEditSettings ? (
          <Button variant="secondary" size="sm" onClick={onEditSettings}>
            <Icon name="settings" size={14} className="text-[var(--color-highlight)]" />
            {t.multiplayer.changeMatchSettings}
          </Button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-grow flex-col gap-2">
          {isSong && roomState.songMeta ? (
            <ActiveTrackCard
              song={roomState.songMeta}
              readonly={!isOwner}
              onChangeTrack={isOwner && onChangeTrack ? () => onChangeTrack() : undefined}
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

        <div className="flex w-full shrink-0 flex-col gap-4 md:w-72">
          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t.multiplayer.winCondition}
            </p>
            <div className="w-full">
              <ModBadge
                variant="chip"
                readOnly
                tone="victory"
                isActive
                icon={VICTORY_CONDITION_ICONS[winCondition]}
                title={t.multiplayer[winLabelKeys[winCondition]]}
              />
            </div>
          </section>

          {modifiers.length > 0 ? (
            <section>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {t.multiplayer.modifiers}
              </p>
              <div className="flex flex-wrap gap-2">
                {modifiers.map((modifier) => (
                  <ModifierIcon
                    key={modifier}
                    modifier={modifier}
                    isActive
                    readOnly
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
