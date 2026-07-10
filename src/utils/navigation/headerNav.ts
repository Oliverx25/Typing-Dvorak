export type AppNavSection = 'lessons' | 'practice' | 'stats' | 'multiplayer';

export interface HeaderNavItem {
  href: string;
  labelKey: AppNavSection;
}

export function resolveNavSection(pathname: string): AppNavSection {
  if (/^\/stats\/?$/.test(pathname)) return 'stats';
  if (/^\/multiplayer(\/|$)/.test(pathname)) return 'multiplayer';
  if (/^\/practice(\/|$)/.test(pathname)) return 'practice';
  return 'lessons';
}

/** Nav links for the header — excludes the current section. */
export function getHeaderNavItems(
  section: AppNavSection,
  showMultiplayer: boolean,
): HeaderNavItem[] {
  const items: HeaderNavItem[] = [
    { href: '/lessons', labelKey: 'lessons' },
    { href: '/practice', labelKey: 'practice' },
    { href: '/stats', labelKey: 'stats' },
    { href: '/multiplayer', labelKey: 'multiplayer' },
  ];

  return items.filter((item) => {
    if (item.labelKey === section) return false;
    if (item.labelKey === 'multiplayer' && !showMultiplayer) return false;
    return true;
  });
}
