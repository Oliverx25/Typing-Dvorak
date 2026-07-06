import { AuthProvider } from '@/contexts/AuthProvider';
import { AppProvider } from '@/contexts/AppProvider';
import SiteHeader from '@/components/layout/header/SiteHeader';

/** Header island for the landing page — theme toggle, nav, and auth controls. */
export default function LandingChrome() {
  return (
    <AuthProvider>
      <AppProvider>
        <SiteHeader variant="landing" />
      </AppProvider>
    </AuthProvider>
  );
}
