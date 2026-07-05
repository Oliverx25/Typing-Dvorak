import { useApp } from '@/contexts/AppProvider';
import { RoomAwareLink } from '@/components/multiplayer/lobby/RoomAwareLink';

export function SiteLogoIcon({ className = 'text-[var(--color-highlight)]' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-6 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
    </svg>
  );
}

export default function SiteLogo({ className = '' }: { className?: string }) {
  const { t } = useApp();

  return (
    <RoomAwareLink
      href="/"
      className={`flex min-w-0 items-center gap-2 text-lg font-semibold text-[var(--color-text)] no-underline hover:text-[var(--color-highlight)] ${className}`}
    >
      <SiteLogoIcon />
      <span className="truncate">{t.siteName}</span>
    </RoomAwareLink>
  );
}
