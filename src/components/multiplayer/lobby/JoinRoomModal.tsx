import { useEffect, useState, type RefObject } from 'react';
import { useApp } from '@/contexts/AppProvider';
import { Button } from '@/components/ui';
import Icon from '@/components/ui/icons/Icon';
import { useAnimatedModalDialog } from '@/hooks/useAnimatedModalDialog';
import { focusRingClassName, focusRingInsetClassName } from '@/utils/a11y/focusRing';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { fetchRoomByCode, isRoomJoinable } from '@/services/supabase/rooms';
import { normalizeRoomCode } from '@/utils/multiplayer/roomCode';

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export default function JoinRoomModal({ open, onClose, onJoin, returnFocusRef }: JoinRoomModalProps) {
  const { t } = useApp();
  const [code, setCode] = useState('');
  const [shaking, setShaking] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const { dialogRef, handleDialogClose, handleCancel, requestClose, panelClassName, dialogClassName } =
    useAnimatedModalDialog({
      open,
      onClose,
      returnFocusRef,
    });

  useEffect(() => {
    if (open) {
      setCode('');
      setShaking(false);
      setJoinError(null);
    }
  }, [open]);

  const isValid = normalizeRoomCode(code).length >= 4;

  const triggerShake = () => {
    setShaking(false);
    requestAnimationFrame(() => setShaking(true));
  };

  const handleJoin = async () => {
    if (!isValid) {
      triggerShake();
      return;
    }

    const normalized = normalizeRoomCode(code);
    setJoinError(null);

    if (isSupabaseConfigured()) {
      setValidating(true);
      try {
        const room = await fetchRoomByCode(normalized);
        if (!isRoomJoinable(room)) {
          setJoinError(t.multiplayer.invalidRoomCode);
          triggerShake();
          return;
        }
      } finally {
        setValidating(false);
      }
    }

    onJoin(normalized);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      onCancel={handleCancel}
      aria-labelledby="join-room-title"
      aria-modal="true"
      className={[
        dialogClassName,
        panelClassName,
        'm-auto w-[min(100%-2rem,26rem)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0 text-[var(--color-text)] shadow-2xl backdrop:bg-black/60',
      ].join(' ')}
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

      <form
        method="dialog"
        className="space-y-5 px-6 py-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleJoin();
        }}
      >
        <div>
          <input
            type="text"
            value={code}
            autoFocus
            onChange={(event) => {
              setCode(normalizeRoomCode(event.target.value));
              if (shaking) setShaking(false);
              if (joinError) setJoinError(null);
            }}
            onAnimationEnd={() => setShaking(false)}
            placeholder={t.multiplayer.roomCodePlaceholder}
            aria-label={t.multiplayer.roomCode}
            aria-invalid={Boolean(joinError) || shaking}
            aria-describedby={joinError ? 'join-room-error' : undefined}
            className={[
              'w-full rounded-xl border bg-[var(--color-surface)] px-4 py-3.5 text-center font-mono text-xl tracking-[0.25em] text-[var(--color-text)] uppercase transition-all duration-300',
              focusRingClassName,
              shaking || joinError
                ? 'shake border-[var(--color-incorrect)] focus:border-[var(--color-incorrect)]'
                : 'border-[var(--color-border)] focus:border-[var(--color-accent)]',
            ].join(' ')}
            maxLength={8}
            autoComplete="off"
            spellCheck={false}
          />
          {joinError ? (
            <p id="join-room-error" className="mt-2 text-center text-xs text-[var(--color-incorrect)]">
              {joinError}
            </p>
          ) : null}
        </div>
        <Button type="submit" disabled={!isValid || validating} fullWidth>
          {validating ? t.multiplayer.validatingRoom : t.multiplayer.joinRoomAction}
        </Button>
      </form>
    </dialog>
  );
}
