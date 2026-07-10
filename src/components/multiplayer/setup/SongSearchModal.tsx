import { useCallback, type RefObject } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useAnimatedModalDialog } from '@/hooks/useAnimatedModalDialog';
import LyricsSearchPanel from '@/components/lyrics/LyricsSearchPanel';
import type { LyricSongResult } from '@/utils/lyrics/types';

interface SongSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (song: LyricSongResult) => void;
  selectedSongId?: number | null;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export default function SongSearchModal({
  open,
  onClose,
  onSelect,
  selectedSongId = null,
  returnFocusRef,
}: SongSearchModalProps) {
  const { t } = useApp();

  const { dialogRef, handleDialogClose, handleCancel, requestClose, panelClassName, dialogClassName, closing } =
    useAnimatedModalDialog({
      open,
      onClose,
      returnFocusRef,
    });

  useLockBodyScroll(open || closing);

  const handleSelect = useCallback(
    (song: LyricSongResult) => {
      onSelect(song);
      requestClose();
    },
    [onSelect, requestClose],
  );

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (!open || closing) return;
    if (event.target === dialogRef.current) {
      event.preventDefault();
      requestClose();
    }
  };

  if (!open && !closing) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="song-search-title"
      aria-modal="true"
      className={[
        dialogClassName,
        'fixed inset-0 z-[200] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-black/70',
      ].join(' ')}
    >
      <span id="song-search-title" className="sr-only">
        {t.multiplayer.lyricsSearchPlaceholder}
      </span>
      <div
        role="document"
        className={panelClassName}
        onClick={(event) => event.stopPropagation()}
      >
        <LyricsSearchPanel
          variant="modal"
          autoFocus
          enabled={open}
          inputId="song-search-input"
          selectedSongId={selectedSongId}
          onSelect={handleSelect}
        />
      </div>
    </dialog>
  );
}
