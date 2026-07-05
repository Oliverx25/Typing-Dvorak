import type { MouseEvent, ReactNode } from 'react';
import { Icon } from '@/components/ui';
import { handleRoomNavigationClick } from '@/utils/multiplayer/roomExit';

interface RoomAwareLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/** Nav link that disconnects from an active multiplayer room before leaving. */
export function RoomAwareLink({ href, className, children }: RoomAwareLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    handleRoomNavigationClick(event, href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

interface RoomBackLinkProps {
  href?: string;
  label: string;
}

export function RoomBackLink({ href = '/multiplayer', label }: RoomBackLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    handleRoomNavigationClick(event, href);
  };

  return (
    <nav className="mb-8">
      <a
        href={href}
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] no-underline transition hover:text-[var(--color-highlight)]"
      >
        <Icon name="chevron-right" size={16} className="rotate-180" />
        {label}
      </a>
    </nav>
  );
}
