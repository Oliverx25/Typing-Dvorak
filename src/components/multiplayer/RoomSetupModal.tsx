import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import CreateRoomSettings, {
  isCustomTextValid,
  type CreateRoomSettingsValue,
} from '@/components/multiplayer/CreateRoomSettings';
import { Button } from '@/components/ui';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { normalizeWinConditions } from '@/utils/multiplayer/roomConfig';
import type { RoomBroadcastState } from '@/types/multiplayer';

interface RoomSetupModalProps {
  open: boolean;
  roomState: RoomBroadcastState;
  onClose: () => void;
  onSave: (
    partial: Pick<
      RoomBroadcastState,
      'lessonId' | 'customText' | 'textSource' | 'blindMode' | 'winConditions'
    >,
  ) => void;
}

function toSettingsValue(roomState: RoomBroadcastState): CreateRoomSettingsValue {
  return {
    textSource: roomState.textSource ?? (roomState.customText.trim() ? 'custom' : 'lesson'),
    lessonId: roomState.lessonId,
    customText: roomState.customText,
    blindMode: roomState.blindMode,
    winConditions: normalizeWinConditions(roomState.winConditions),
  };
}

export default function RoomSetupModal({
  open,
  roomState,
  onClose,
  onSave,
}: RoomSetupModalProps) {
  const { t } = useApp();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<CreateRoomSettingsValue>(() => toSettingsValue(roomState));

  useLockBodyScroll(open);

  useEffect(() => {
    if (open) {
      setDraft(toSettingsValue(roomState));
    }
  }, [open, roomState]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const canSave =
    draft.textSource === 'lesson'
      ? Boolean(draft.lessonId)
      : isCustomTextValid(draft.customText);

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      lessonId: draft.lessonId,
      textSource: draft.textSource,
      customText: draft.textSource === 'custom' ? draft.customText.trim() : '',
      blindMode: draft.blindMode,
      winConditions: draft.winConditions,
    });
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="room-setup-title"
      className="modal-enter m-auto w-[min(100%-1.5rem,56rem)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0 text-[var(--color-text)] shadow-2xl backdrop:bg-black/60"
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
          onClick={onClose}
          aria-label={t.multiplayer.close}
          className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-[min(70vh,640px)] overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          <section className="lg:col-span-2">
            <CreateRoomSettings
              value={draft}
              variant="content"
              onChange={(partial) => setDraft((prev) => ({ ...prev, ...partial }))}
            />
          </section>
          <aside className="flex lg:col-span-1 lg:min-h-[20rem]">
            <CreateRoomSettings
              value={draft}
              variant="settings"
              onChange={(partial) => setDraft((prev) => ({ ...prev, ...partial }))}
            />
          </aside>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
        <Button variant="ghost" onClick={onClose}>
          {t.multiplayer.close}
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          {t.multiplayer.saveSettings}
        </Button>
      </div>
    </dialog>
  );
}
