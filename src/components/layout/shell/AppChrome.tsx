import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/AppProvider';
import { CatalogProvider } from '@/contexts/CatalogProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import AchievementToastHost from '@/components/ui/feedback/AchievementToastHost';
import PageLayout from '@/components/layout/shell/PageLayout';
import SiteFooter from '@/components/layout/shell/SiteFooter';

interface AppChromeProps {
  children: ReactNode;
}

/** Shared app shell — providers, header, footer, achievement toasts. */
export default function AppChrome({ children }: AppChromeProps) {
  return (
    <AuthProvider>
      <CatalogProvider>
        <AppProvider>
        <div className="flex min-h-full flex-1 flex-col">
          <PageLayout>{children}</PageLayout>
          <SiteFooter />
          <AchievementToastHost />
        </div>
        </AppProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}
