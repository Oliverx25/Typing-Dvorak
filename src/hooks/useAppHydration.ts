import { useAuth } from '@/contexts/AuthProvider';
import { useCatalog } from '@/contexts/CatalogProvider';

/** Shared readiness flags for auth, cloud progress, and curriculum catalog. */
export function useAppHydration() {
  const { user, loading, progressReady, isHydrating } = useAuth();
  const { ready: catalogReady } = useCatalog();

  const authReady = !loading;
  const progressHydrated = !user || progressReady;

  return {
    authReady,
    catalogReady,
    progressReady: progressHydrated,
    isHydrating,
    appReady: authReady && progressHydrated && catalogReady,
  };
}
