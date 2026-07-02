import { AppProvider } from '../contexts/AppProvider';
import HomePage from './HomePage';
import PageLayout from './PageLayout';

export default function HomePageWithProvider() {
  return (
    <AppProvider>
      <PageLayout>
        <HomePage />
      </PageLayout>
    </AppProvider>
  );
}
