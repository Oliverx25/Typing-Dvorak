import { useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { setAuthSessionUser } from '@/services/supabase/authSession';

interface UseAuthInitializerOptions {
  onSignedOut: () => void;
  onSignedIn: (user: User) => void;
  onLoadingResolved: () => void;
}

/**
 * Subscribes to Supabase auth once. Hydration (cloud fetch) is handled separately
 * by AuthProvider when userId changes and the Zustand store is not yet warm.
 */
export function useAuthInitializer({
  onSignedOut,
  onSignedIn,
  onLoadingResolved,
}: UseAuthInitializerOptions): void {
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      onLoadingResolved();
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;

      if (event === 'SIGNED_OUT' || !nextUser) {
        setAuthSessionUser(null);
        onSignedOut();
        onLoadingResolved();
        return;
      }

      setAuthSessionUser(nextUser);
      onSignedIn(nextUser);
      onLoadingResolved();
    });

    return () => subscription.unsubscribe();
  }, [onSignedIn, onSignedOut, onLoadingResolved]);
}

/** Tracks in-flight hydration across AuthProvider remounts within the same page. */
export function createHydrationGuard() {
  const taskRef = { current: 0 };
  return {
    start: () => ++taskRef.current,
    isCurrent: (id: number) => taskRef.current === id,
  };
}

export type HydrationGuard = ReturnType<typeof createHydrationGuard>;
