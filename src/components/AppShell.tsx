import type { ReactNode } from 'react';
import { AppProvider } from '../contexts/AppProvider';
import PageLayout from './PageLayout';
import SiteFooter from './SiteFooter';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <AppProvider>
      <PageLayout>{children}</PageLayout>
      <SiteFooter />
    </AppProvider>
  );
}
