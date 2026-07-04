import { useApp, getLessonTitle } from '@/contexts/AppProvider';
import { Button, SvgIcon } from '@/components/ui';
import { getLessonById } from '@/utils/curriculum/lessons';
import {
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
  'winConditionFirstFinish' | 'winConditionHighestWpm' | 'winConditionSuddenDeath'
> = {
  first_finish: 'winConditionFirstFinish',
  highest_wpm: 'winConditionHighestWpm',
  sudden_death: 'winConditionSuddenDeath',
};

export default function MatchInfoCard({
  roomState,
  isOwner,
  onEditSettings,
}: MatchInfoCardProps) {
  const { t } = useApp();
  const winConditions = normalizeWinConditions(roomState.winConditions);
  const isCustom = roomState.customText.trim().length > 0;
  const lesson = !isCustom ? getLessonById(roomState.lessonId) : undefined;

  const title = isCustom
    ? t.multiplayer.customTextMode
    : lesson
      ? getLessonTitle(t, lesson.titleKey)
      : roomState.lessonId;

  const difficulty = lesson ? t.difficulty[lesson.difficulty] : null;
  const category = lesson ? t.categories[lesson.category] : null;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {t.multiplayer.currentMatch}
      </p>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">{title}</h2>
          {isCustom ? (
            <p className="mt-2 line-clamp-2 font-mono text-sm text-[var(--color-text-muted)]">
              {roomState.customText.trim()}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {category ? (
              <span className="rounded-md bg-[var(--color-highlight)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-highlight)]">
                {category}
              </span>
            ) : null}
            {difficulty ? (
              <span className="rounded-md bg-[var(--color-surface-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                {difficulty}
              </span>
            ) : null}
            {roomState.blindMode ? (
              <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                {t.multiplayer.blindModeOn}
              </span>
            ) : null}
          </div>
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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--color-text-muted)]">{t.multiplayer.winCondition}:</span>
        {winConditions.map((condition) => (
          <span
            key={condition}
            title={t.multiplayer[winLabelKeys[condition]]}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-highlight)]/30 bg-[var(--color-highlight)]/10 px-2 py-1 text-[11px] font-medium text-[var(--color-highlight)]"
          >
            <SvgIcon src={WIN_CONDITION_ICONS[condition]} size={14} />
            {t.multiplayer[winLabelKeys[condition]]}
          </span>
        ))}
      </div>
    </div>
  );
}
