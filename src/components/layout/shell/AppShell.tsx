import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/AppProvider';
import { AuthProvider } from '@/contexts/AuthProvider';
import PageLayout from './PageLayout';
import SiteFooter from './SiteFooter';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="flex min-h-full flex-1 flex-col">
          <PageLayout>{children}</PageLayout>
          <SiteFooter />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
