import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  SESSION_COMPLETE_EVENT,
  dispatchKeyStatsUpdated,
  dispatchSessionComplete,
  sessionCompleteDetail,
} from '@/utils/app/events';
import { clearGuestProgress } from '@/utils/progress/guestProgress';
import { scheduleSessionCloudSync, scheduleKeyErrorsCloudSync } from '@/services/supabase/syncProgress';
import { syncBadgesToCloud } from '@/services/supabase/syncBadges';
import { safeAsync, safeAsyncVoid } from '@/utils/network/graceful';
import { invalidateQueryCache, invalidateUserProgressCache } from '@/services/supabase/queryCache';
import {
  loadProgressFromCloud,
  restoreCustomAvatarFromProfile,
  restoreProfileDisplayFromProfile,
  restoreProfilePreferencesFromProfile,
  type UserProfileRow,
} from '@/services/supabase/loadProgress';
import { fetchUserProfile, primeUserProfileCache } from '@/services/supabase/queries';
import { useAppStore } from '@/store/useAppStore';
import { createHydrationGuard, useAuthInitializer } from '@/hooks/useAuthInitializer';
import { snapshotFromSessionRecord } from '@/utils/achievements/achievementEvaluator';

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

const hydrationGuard = createHydrationGuard();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [progressReady, setProgressReady] = useState(!isSupabaseConfigured());
  const syncedSessionKeysRef = useRef(new Set<string>());
  const clearStore = useAppStore((state) => state.clearStore);
  const storeHydrated = useAppStore((state) => state.isHydrated);
  const storeUserId = useAppStore((state) => state.userId);
  const storeProfile = useAppStore((state) => state.userProfile);

  const resetAccountState = useCallback(
    (userId?: string) => {
      if (userId) invalidateQueryCache(userId);
      else invalidateQueryCache();
      syncedSessionKeysRef.current.clear();
      setProfile(null);
      clearStore();
      clearGuestProgress();
      dispatchSessionComplete();
      dispatchKeyStatsUpdated();
    },
    [clearStore],
  );

  const handleSignedOut = useCallback(() => {
    resetAccountState(user?.id);
    setUser(null);
  }, [resetAccountState, user?.id]);

  const handleSignedIn = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const handleLoadingResolved = useCallback(() => {
    setLoading(false);
  }, []);

  useAuthInitializer({
    onSignedOut: handleSignedOut,
    onSignedIn: handleSignedIn,
    onLoadingResolved: handleLoadingResolved,
  });

  const userId = user?.id ?? null;

  /** Single cloud fetch per sign-in — Zustand persist skips this on MPA navigations. */
  useEffect(() => {
    if (!userId) return;

    if (storeHydrated && storeUserId === userId) {
      useAppStore.getState().restoreServerBaselineFromUiCache();
      setProfile(storeProfile);
      setProgressReady(true);
      return;
    }

    const taskId = hydrationGuard.start();
    setProgressReady(false);

    (async () => {
      invalidateUserProgressCache(userId);

      const loadedProfile = await loadProgressFromCloud(userId);
      if (!hydrationGuard.isCurrent(taskId)) return;

      await safeAsync('restore profile preferences', () => restoreProfilePreferencesFromProfile(loadedProfile), undefined);
      await safeAsync('restore profile display', () => restoreProfileDisplayFromProfile(loadedProfile), undefined);
      await safeAsync('restore custom avatar', () => restoreCustomAvatarFromProfile(loadedProfile), undefined);

      if (!hydrationGuard.isCurrent(taskId)) return;

      setProfile(loadedProfile);
      setProgressReady(true);
    })();
  }, [userId, storeHydrated, storeUserId, storeProfile]);

  /** Achievement sync only when a session actually completes — never on route change. */
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

      const lastSession = snapshotFromSessionRecord(record);
      safeAsyncVoid('achievements cloud sync', () => syncBadgesToCloud(user.id, lastSession));
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
    setUser(nextUser);

    if (!nextUser) {
      resetAccountState(user?.id);
      setProgressReady(true);
      return;
    }

    invalidateUserProgressCache(nextUser.id);
    const nextProfile = (await fetchUserProfile()) as UserProfileRow | null;
    if (nextProfile) {
      primeUserProfileCache(nextUser.id, nextProfile);
      useAppStore.getState().setProfile(nextProfile);
    }
    setProfile(nextProfile);
  }, [resetAccountState, user?.id]);

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
