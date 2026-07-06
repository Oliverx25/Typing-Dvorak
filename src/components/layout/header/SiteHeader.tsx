import SiteLogo from '@/components/layout/shell/SiteLogo';
import HeaderActions from '@/components/layout/header/HeaderActions';

interface SiteHeaderProps {
  variant?: 'app' | 'landing';
}

export default function SiteHeader({ variant = 'app' }: SiteHeaderProps) {
  const isLanding = variant === 'landing';

  return (
    <header
      data-zen-fade={!isLanding ? '' : undefined}
      className={[
        'w-full border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]',
        isLanding ? 'sticky top-0 z-40' : '',
      ].join(' ')}
    >
      <div
        className={[
          'grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8',
          !isLanding ? 'mx-auto max-w-5xl py-4' : '',
        ].join(' ')}
      >
        <SiteLogo />
        <HeaderActions variant={variant} />
      </div>
    </header>
  );
}
