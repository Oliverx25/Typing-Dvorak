import { useEffect, useState } from 'react';

export function usePathname(): string {
  // Keep the first render identical on server and client; sync from window after mount.
  const [pathname, setPathname] = useState('/');

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return pathname;
}
