import { useEffect, useState, type RefObject } from 'react';
import { useApp } from '@/contexts/AppProvider';
import CreateRoomSettings, {
  isRoomContentReady,
  type CreateRoomSettingsValue,
} from '@/components/multiplayer/setup/CreateRoomSettings';
import { Button } from '@/components/ui';
import Icon from '@/components/ui/icons/Icon';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useAnimatedModalDialog } from '@/hooks/useAnimatedModalDialog';
import { focusRingInsetClassName } from '@/utils/a11y/focusRing';
import {
  normalizeModifiers,
  normalizeWinCondition,
  stripSongOnlyModifiers,
} from '@/utils/multiplayer/roomConfig';
import type { RoomBroadcastState } from '@/types/multiplayer';

interface RoomSetupModalProps {
  open: boolean;
  roomState: RoomBroadcastState;
  onClose: () => void;
  onSave: (
    partial: Pick<
      RoomBroadcastState,
      'lessonId' | 'customText' | 'textSource' | 'songMeta' | 'winCondition' | 'modifiers'
    >,
  ) => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

function toSettingsValue(roomState: RoomBroadcastState): CreateRoomSettingsValue {
  return {
    textSource: roomState.textSource ?? (roomState.customText.trim() ? 'custom' : 'lesson'),
    lessonId: roomState.lessonId,
    customText: roomState.customText,
    songMeta: roomState.songMeta ?? null,
    winCondition: normalizeWinCondition(roomState.winCondition),
    modifiers: normalizeModifiers(roomState.modifiers),
  };
}

export default function RoomSetupModal({
  open,
  roomState,
  onClose,
  onSave,
  returnFocusRef,
}: RoomSetupModalProps) {
  const { t } = useApp();
  const [draft, setDraft] = useState<CreateRoomSettingsValue>(() => toSettingsValue(roomState));

  const { dialogRef, handleDialogClose, handleCancel, requestClose, panelClassName, dialogClassName } =
    useAnimatedModalDialog({
      open,
      onClose,
      returnFocusRef,
    });

  useLockBodyScroll(open);

  useEffect(() => {
    if (open) {
      setDraft(toSettingsValue(roomState));
    }
  }, [open, roomState]);

  const canSave = isRoomContentReady(draft);

  const handleSave = () => {
    if (!canSave) return;
    const modifiers =
      draft.textSource === 'song'
        ? draft.modifiers
        : stripSongOnlyModifiers(draft.modifiers);

    onSave({
      lessonId: draft.lessonId,
      textSource: draft.textSource,
      customText:
        draft.textSource === 'lesson'
          ? ''
          : draft.textSource === 'song'
            ? draft.customText
            : draft.customText.trim(),
      songMeta: draft.textSource === 'song' ? draft.songMeta : null,
      winCondition: draft.winCondition,
      modifiers,
    });
    requestClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      onCancel={handleCancel}
      aria-labelledby="room-setup-title"
      aria-modal="true"
      className={[
        dialogClassName,
        panelClassName,
        'm-auto w-[min(100%-1.5rem,56rem)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0 text-[var(--color-text)] shadow-2xl backdrop:bg-black/60',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-4">
        <div>
          <h2 id="room-setup-title" className="text-base font-semibold text-[var(--color-text)]">
            {t.multiplayer.matchSetup}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {t.multiplayer.matchSetupDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={requestClose}
          aria-label={t.multiplayer.close}
          className={[
            'rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
            focusRingInsetClassName,
          ].join(' ')}
        >
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="grid max-h-[min(70vh,640px)] grid-cols-1 gap-8 overflow-visible px-6 py-5 lg:grid-cols-3 lg:gap-10">
          <section className="min-h-0 overflow-y-auto lg:col-span-2">
            <CreateRoomSettings
              value={draft}
              variant="content"
              onChange={(partial) => setDraft((prev) => ({ ...prev, ...partial }))}
            />
          </section>
          <aside className="overflow-visible lg:col-span-1 lg:min-h-[20rem]">
            <CreateRoomSettings
              value={draft}
              variant="settings"
              onChange={(partial) => setDraft((prev) => ({ ...prev, ...partial }))}
            />
          </aside>
        </div>

      <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
        <Button variant="ghost" onClick={requestClose}>
          {t.multiplayer.close}
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          {t.multiplayer.saveSettings}
        </Button>
      </div>
    </dialog>
  );
}
