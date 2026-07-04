import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Button } from '@/components/ui';
import { normalizeRoomCode } from '@/utils/multiplayer/roomCode';

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

export default function JoinRoomModal({ open, onClose, onJoin }: JoinRoomModalProps) {
  const { t } = useApp();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState('');
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      setCode('');
      setShaking(false);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const isValid = normalizeRoomCode(code).length >= 4;

  const triggerShake = () => {
    setShaking(false);
    requestAnimationFrame(() => setShaking(true));
  };

  const handleJoin = () => {
    if (!isValid) {
      triggerShake();
      return;
    }
    onJoin(normalizeRoomCode(code));
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="join-room-title"
      className="modal-enter m-auto w-[min(100%-2rem,26rem)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0 text-[var(--color-text)] shadow-2xl backdrop:bg-black/60"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-4">
        <div>
          <h2 id="join-room-title" className="text-base font-semibold text-[var(--color-text)]">
            {t.multiplayer.joinRoom}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{t.multiplayer.joinRoomDesc}</p>
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

      <form
        method="dialog"
        className="space-y-5 px-6 py-5"
        onSubmit={(event) => {
          event.preventDefault();
          handleJoin();
        }}
      >
        <input
          type="text"
          value={code}
          autoFocus
          onChange={(event) => {
            setCode(normalizeRoomCode(event.target.value));
            if (shaking) setShaking(false);
          }}
          onAnimationEnd={() => setShaking(false)}
          placeholder={t.multiplayer.roomCodePlaceholder}
          aria-label={t.multiplayer.roomCode}
          aria-invalid={shaking}
          className={[
            'w-full rounded-xl border bg-[var(--color-surface)] px-4 py-3.5 text-center font-mono text-xl tracking-[0.25em] text-[var(--color-text)] uppercase outline-none transition-all duration-300 focus:ring-2',
            shaking
              ? 'shake border-[var(--color-incorrect)] focus:border-[var(--color-incorrect)] focus:ring-[var(--color-incorrect)]/20'
              : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]/20',
          ].join(' ')}
          maxLength={8}
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="submit" disabled={!isValid} fullWidth>
          {t.multiplayer.joinRoomAction}
        </Button>
      </form>
    </dialog>
  );
}
