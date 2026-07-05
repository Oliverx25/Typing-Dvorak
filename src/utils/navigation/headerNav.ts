export type AppNavSection = 'lessons' | 'stats' | 'multiplayer';

export interface HeaderNavItem {
  href: string;
  labelKey: AppNavSection;
}

export function resolveNavSection(pathname: string): AppNavSection {
  if (/^\/stats\/?$/.test(pathname)) return 'stats';
  if (/^\/multiplayer(\/|$)/.test(pathname)) return 'multiplayer';
  return 'lessons';
}

/** Nav links for the header — excludes the current section. */
export function getHeaderNavItems(
  section: AppNavSection,
  showMultiplayer: boolean,
): HeaderNavItem[] {
  const items: HeaderNavItem[] = [
    { href: '/lessons', labelKey: 'lessons' },
    { href: '/stats', labelKey: 'stats' },
    { href: '/multiplayer', labelKey: 'multiplayer' },
  ];

  return items.filter((item) => {
    if (item.labelKey === section) return false;
    if (item.labelKey === 'multiplayer' && !showMultiplayer) return false;
    return true;
  });
}
