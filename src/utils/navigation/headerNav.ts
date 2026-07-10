export type AppNavSection = 'lessons' | 'practice' | 'stats' | 'multiplayer';

export interface HeaderNavItem {
  href: string;
  labelKey: AppNavSection;
}

const NAV_ITEMS: HeaderNavItem[] = [
  { href: '/lessons', labelKey: 'lessons' },
  { href: '/practice', labelKey: 'practice' },
  { href: '/stats', labelKey: 'stats' },
  { href: '/multiplayer', labelKey: 'multiplayer' },
];

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/$/, '');
  return trimmed || '/';
}

/** Returns true when the nav item should be hidden for the current route. */
export function isNavItemHidden(pathname: string, href: string): boolean {
  const path = normalizePathname(pathname);

  if (href === '/lessons') {
    return path.startsWith('/lessons') || path.startsWith('/lesson/');
  }

  return path.startsWith(href);
}

export function resolveNavSection(pathname: string): AppNavSection {
  const path = normalizePathname(pathname);
  if (/^\/stats/.test(path)) return 'stats';
  if (/^\/multiplayer/.test(path)) return 'multiplayer';
  if (/^\/practice/.test(path)) return 'practice';
  return 'lessons';
}

/** Nav links for the header — hides the active route only. */
export function getHeaderNavItems(pathname: string, showMultiplayer: boolean): HeaderNavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (isNavItemHidden(pathname, item.href)) return false;
    if (item.labelKey === 'multiplayer' && !showMultiplayer) return false;
    return true;
  });
}
