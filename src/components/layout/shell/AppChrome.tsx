import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/AppProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import AchievementToastHost from '@/components/ui/feedback/AchievementToastHost';
import PageLayout from './PageLayout';
import SiteFooter from './SiteFooter';

interface AppChromeProps {
  children: ReactNode;
}

/** Shared app shell — providers, header, footer, achievement toasts. */
export default function AppChrome({ children }: AppChromeProps) {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="flex min-h-full flex-1 flex-col">
          <PageLayout>{children}</PageLayout>
          <SiteFooter />
          <AchievementToastHost />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
