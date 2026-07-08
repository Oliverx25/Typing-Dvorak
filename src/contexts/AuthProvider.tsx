import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { SESSION_COMPLETE_EVENT, dispatchKeyStatsUpdated, dispatchSessionComplete, sessionCompleteDetail } from '@/utils/app/events';
import { clearGuestProgress } from '@/utils/progress/guestProgress';
import { scheduleSessionCloudSync, scheduleKeyErrorsCloudSync } from '@/services/supabase/syncProgress';
import { syncBadgesToCloud } from '@/services/supabase/syncBadges';
import { safeAsync, safeAsyncVoid } from '@/utils/network/graceful';
import { setAuthSessionUser } from '@/services/supabase/authSession';
import { invalidateQueryCache, invalidateUserProgressCache } from '@/services/supabase/queryCache';
import {
  loadProgressFromCloud,
  restoreCustomAvatarFromProfile,
  restoreProfileDisplayFromProfile,
  restoreProfilePreferencesFromProfile,
  type UserProfileRow,
} from '@/services/supabase/loadProgress';
import { fetchUserProfile, primeUserProfileCache } from '@/services/supabase/queries';

interface AuthContextValue {
  user: User | null;
  profile: UserProfileRow | null;
  loading: boolean;
  /** False while cloud progress is being fetched for a signed-in user. */
  progressReady: boolean;
  /** True during the post-login cloud hydration pass. */
  isHydrating: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [progressReady, setProgressReady] = useState(!isSupabaseConfigured());
  const activeUserIdRef = useRef<string | null>(null);
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const forceHydrationRef = useRef(false);
  const hydrationTaskRef = useRef(0);
  const syncedSessionKeysRef = useRef(new Set<string>());

  const resetAccountState = useCallback((userId?: string) => {
    if (userId) invalidateQueryCache(userId);
    else invalidateQueryCache();
    lastLoadedUserIdRef.current = null;
    forceHydrationRef.current = false;
    syncedSessionKeysRef.current.clear();
    setProfile(null);
    clearGuestProgress();
    dispatchSessionComplete();
    dispatchKeyStatsUpdated();
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      setProgressReady(true);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;

      if (event === 'SIGNED_OUT' || !nextUser) {
        resetAccountState(activeUserIdRef.current ?? undefined);
        activeUserIdRef.current = null;
        setAuthSessionUser(null);
        setUser(null);
        setLoading(false);
        setProgressReady(true);
        return;
      }

      activeUserIdRef.current = nextUser.id;
      setAuthSessionUser(nextUser);
      setUser(nextUser);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        forceHydrationRef.current = true;
        lastLoadedUserIdRef.current = null;
        setProgressReady(false);
        return;
      }

      if (event === 'INITIAL_SESSION' && lastLoadedUserIdRef.current !== nextUser.id) {
        setProgressReady(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [resetAccountState]);

  const userId = user?.id ?? null;

  /** On login / initial session: invalidate cache, load cloud progress, restore profile prefs. */
  useEffect(() => {
    if (!userId) return;

    const shouldHydrate =
      forceHydrationRef.current || lastLoadedUserIdRef.current !== userId;

    if (!shouldHydrate) {
      setProgressReady(true);
      return;
    }

    const taskId = hydrationTaskRef.current + 1;
    hydrationTaskRef.current = taskId;
    forceHydrationRef.current = false;
    setProgressReady(false);

    (async () => {
      invalidateUserProgressCache(userId);

      const loadedProfile = await loadProgressFromCloud();
      await safeAsync('restore profile preferences', () => restoreProfilePreferencesFromProfile(loadedProfile), undefined);
      await safeAsync('restore profile display', () => restoreProfileDisplayFromProfile(loadedProfile), undefined);
      await safeAsync('restore custom avatar', () => restoreCustomAvatarFromProfile(loadedProfile), undefined);

      if (hydrationTaskRef.current !== taskId) return;

      setProfile(loadedProfile);
      lastLoadedUserIdRef.current = userId;
      setProgressReady(true);
    })();
  }, [userId]);

  /** Background sync only when a session actually completes (event carries the record). */
  useEffect(() => {
    if (!user) return;

    const handler = (event: Event) => {
      const { record } = sessionCompleteDetail(event);
      if (!record) return;

      const syncKey = record.completedAt;
      if (syncedSessionKeysRef.current.has(syncKey)) return;
      syncedSessionKeysRef.current.add(syncKey);

      scheduleSessionCloudSync(user.id, record);
      scheduleKeyErrorsCloudSync(user.id);
      invalidateUserProgressCache(user.id);
      safeAsyncVoid('badges cloud sync', () => syncBadgesToCloud(user.id));
    };

    window.addEventListener(SESSION_COMPLETE_EVENT, handler);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, handler);
  }, [user]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
  }, []);

  const refreshUser = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data } = await supabase.auth.getUser();
    const nextUser = data.user ?? null;
    setAuthSessionUser(nextUser);
    setUser(nextUser);

    if (!nextUser) {
      resetAccountState(activeUserIdRef.current ?? undefined);
      activeUserIdRef.current = null;
      setProgressReady(true);
      return;
    }

    activeUserIdRef.current = nextUser.id;
    invalidateUserProgressCache(nextUser.id);
    const nextProfile = (await fetchUserProfile()) as UserProfileRow | null;
    if (nextProfile) primeUserProfileCache(nextUser.id, nextProfile);
    setProfile(nextProfile);
  }, [resetAccountState]);

  const isHydrating = Boolean(userId) && !progressReady;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      progressReady,
      isHydrating,
      isConfigured: isSupabaseConfigured(),
      signOut,
      refreshUser,
    }),
    [user, profile, loading, progressReady, isHydrating, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
