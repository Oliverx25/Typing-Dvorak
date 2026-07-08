import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserAchievementProgress } from '@/utils/achievements/catalogTypes';
import type { UserProgress } from '@/utils/progress/storage';
import type { UserProfileRow } from '@/services/supabase/profileRow';
import {
  replaceLocalAchievementProgress,
  saveLocalAchievementProgress,
} from '@/utils/achievements/progressStorage';
import { dispatchBadgesUpdated } from '@/utils/app/events';

const STORE_KEY = 'typing-dvorak-app-store';

export interface AppStoreState {
  userId: string | null;
  userProfile: UserProfileRow | null;
  /** UI cache — may hydrate from persist; never used as write baseline. */
  userAchievements: Record<string, UserAchievementProgress>;
  /** In-memory server truth — hydrated from Supabase, updated only after successful writes. */
  serverAchievements: Record<string, UserAchievementProgress>;
  userProgress: UserProgress | null;
  isHydrated: boolean;

  setProfile: (profile: UserProfileRow | null) => void;
  setUserProgress: (progress: UserProgress) => void;
  /** Replace UI + server maps from a trusted cloud fetch (login hydration). */
  setAchievements: (rows: UserAchievementProgress[]) => void;
  /** Full hydration after the single cloud fetch on sign-in. */
  hydrateFromCloud: (payload: {
    userId: string;
    profile: UserProfileRow | null;
    achievements: UserAchievementProgress[];
    progress: UserProgress;
  }) => void;
  /** Merge a session delta after Supabase acknowledges the bulk upsert. */
  commitSyncedAchievements: (rows: UserAchievementProgress[]) => void;
  /** After MPA reload — seed in-memory server map from UI cache (writes still re-fetch). */
  restoreServerBaselineFromUiCache: () => void;
  clearStore: () => void;
}

const INITIAL_STATE = {
  userId: null,
  userProfile: null,
  userAchievements: {} as Record<string, UserAchievementProgress>,
  serverAchievements: {} as Record<string, UserAchievementProgress>,
  userProgress: null,
  isHydrated: false,
};

function rowsToMap(rows: UserAchievementProgress[]): Record<string, UserAchievementProgress> {
  const map: Record<string, UserAchievementProgress> = {};
  for (const row of rows) {
    map[String(row.achievementId)] = row;
  }
  return map;
}

function mergeAchievementMaps(
  base: Record<string, UserAchievementProgress>,
  rows: UserAchievementProgress[],
): Record<string, UserAchievementProgress> {
  const next = { ...base };
  for (const row of rows) {
    next[String(row.achievementId)] = row;
  }
  return next;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setProfile: (profile) => set({ userProfile: profile }),

      setUserProgress: (progress) => set({ userProgress: progress }),

      setAchievements: (rows) => {
        const map = rowsToMap(rows);
        replaceLocalAchievementProgress(rows);
        set({ userAchievements: map, serverAchievements: map });
      },

      hydrateFromCloud: ({ userId, profile, achievements, progress }) => {
        const map = rowsToMap(achievements);
        replaceLocalAchievementProgress(achievements);
        set({
          userId,
          userProfile: profile,
          userAchievements: map,
          serverAchievements: map,
          userProgress: progress,
          isHydrated: true,
        });
      },

      commitSyncedAchievements: (rows) => {
        if (rows.length === 0) return;
        const userAchievements = mergeAchievementMaps(get().userAchievements, rows);
        const serverAchievements = mergeAchievementMaps(get().serverAchievements, rows);
        saveLocalAchievementProgress(userAchievements);
        set({ userAchievements, serverAchievements });
        dispatchBadgesUpdated();
      },

      restoreServerBaselineFromUiCache: () => {
        const ui = get().userAchievements;
        if (Object.keys(ui).length === 0) return;
        set({ serverAchievements: { ...ui } });
      },

      clearStore: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        userId: state.userId,
        userProfile: state.userProfile,
        userAchievements: state.userAchievements,
        userProgress: state.userProgress,
        isHydrated: state.isHydrated,
      }),
    },
  ),
);

/** Non-reactive read — safe inside async services and event handlers. */
export function getAppStoreState(): AppStoreState {
  return useAppStore.getState();
}
