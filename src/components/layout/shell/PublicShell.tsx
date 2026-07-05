import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/AppProvider';
import SiteFooter from './SiteFooter';

/** Static pages (auth, callback) — footer + i18n without full app auth shell. */
export default function PublicShell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <div className="flex min-h-full flex-1 flex-col">
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </div>
    </AppProvider>
  );
}
