import type { MouseEvent, ReactNode } from 'react';
import { Button } from '@/components/ui';
import { executeRoomExit, isRoomExitInProgress } from '@/utils/multiplayer/roomExit';
import { useState } from 'react';

interface LeaveRoomButtonProps {
  children: ReactNode;
  redirectTo?: string;
  variant?: 'ghost' | 'secondary' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export default function LeaveRoomButton({
  children,
  redirectTo = '/multiplayer',
  variant = 'ghost',
  size = 'sm',
  className = '',
  fullWidth = false,
}: LeaveRoomButtonProps) {
  const [leaving, setLeaving] = useState(false);
  const busy = leaving || isRoomExitInProgress();

  const handleClick = () => {
    if (busy) return;
    setLeaving(true);
    void executeRoomExit(redirectTo).finally(() => {
      setLeaving(false);
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={[fullWidth ? 'w-full' : '', className].filter(Boolean).join(' ')}
      disabled={busy}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}

interface LeaveRoomLinkProps {
  href?: string;
  label: string;
}

export function LeaveRoomLink({ href = '/multiplayer', label }: LeaveRoomLinkProps) {
  const busy = isRoomExitInProgress();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    void executeRoomExit(href);
  };

  return (
    <a
      href={href}
      aria-disabled={busy}
      onClick={handleClick}
      className={[
        'inline-flex items-center gap-1.5 text-sm no-underline transition',
        busy
          ? 'pointer-events-none opacity-50 text-[var(--color-text-muted)]'
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-highlight)]',
      ].join(' ')}
    >
      {label}
    </a>
  );
}
