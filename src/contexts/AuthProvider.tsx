import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';
import { SESSION_COMPLETE_EVENT } from '../utils/events';
import { getSessionHistory } from '../utils/storage';
import { syncSessionToCloud, syncKeyErrorsToCloud, migrateLocalSessionsToCloud } from '../services/supabase/syncProgress';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const MIGRATION_KEY = 'typing-dvorak-cloud-migrated';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** One-time local → cloud migration after login. */
  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(MIGRATION_KEY)) return;

    const history = getSessionHistory();
    migrateLocalSessionsToCloud(user.id, history).then((count) => {
      if (count > 0) localStorage.setItem(MIGRATION_KEY, 'true');
    });
  }, [user]);

  /** Background sync on session complete — localStorage remains source of truth. */
  useEffect(() => {
    if (!user) return;

    const handler = () => {
      const latest = getSessionHistory()[0];
      if (latest) {
        syncSessionToCloud(user.id, latest);
        syncKeyErrorsToCloud(user.id);
      }
    };

    window.addEventListener(SESSION_COMPLETE_EVENT, handler);
    return () => window.removeEventListener(SESSION_COMPLETE_EVENT, handler);
  }, [user]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isConfigured: isSupabaseConfigured(),
      signOut,
    }),
    [user, loading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
