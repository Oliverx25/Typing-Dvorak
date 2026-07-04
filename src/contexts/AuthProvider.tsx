import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { SESSION_COMPLETE_EVENT, dispatchSessionComplete, dispatchKeyStatsUpdated } from '../utils/events';
import { getSessionHistory } from '../utils/storage';
import { clearGuestProgress } from '../utils/guestProgress';
import { syncSessionToCloud, syncKeyErrorsToCloud } from '../services/supabase/syncProgress';
import { syncBadgesToCloud } from '../services/supabase/syncBadges';
import {
  loadProgressFromCloud,
  restoreCustomAvatarFromProfile,
  type UserProfileRow,
} from '../services/supabase/loadProgress';
import { fetchUserProfile } from '../services/supabase/queries';

interface AuthContextValue {
  user: User | null;
  profile: UserProfileRow | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const lastLoadedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const userId = user?.id ?? null;

  /** On login: discard guest localStorage, load cloud progress, restore custom avatar. */
  useEffect(() => {
    if (!userId) {
      lastLoadedUserIdRef.current = null;
      setProfile(null);
      return;
    }

    if (lastLoadedUserIdRef.current === userId) return;

    let cancelled = false;

    (async () => {
      clearGuestProgress();
      const loadedProfile = await loadProgressFromCloud();
      await restoreCustomAvatarFromProfile();

      if (cancelled) return;

      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (!cancelled) setUser(data.user);
      }

      if (!cancelled) {
        setProfile(loadedProfile);
        lastLoadedUserIdRef.current = userId;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /** Background sync on session complete — cloud mirrors authenticated sessions. */
  useEffect(() => {
    if (!user) return;

    const handler = () => {
      const latest = getSessionHistory()[0];
      if (latest) {
        syncSessionToCloud(user.id, latest);
        syncKeyErrorsToCloud(user.id);
        syncBadgesToCloud(user.id);
      }
    };

    window.addEventListener(SESSION_COMPLETE_EVENT, handler);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, handler);
  }, [user]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    clearGuestProgress();
    dispatchSessionComplete();
    dispatchKeyStatsUpdated();
    lastLoadedUserIdRef.current = null;
    setProfile(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    const nextProfile = (await fetchUserProfile()) as UserProfileRow | null;
    setProfile(nextProfile);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isConfigured: isSupabaseConfigured(),
      signOut,
      refreshUser,
    }),
    [user, profile, loading, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
