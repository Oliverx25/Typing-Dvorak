import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          avatar_custom: boolean;
          display_name: string | null;
          display_name_custom: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          avatar_custom?: boolean;
          display_name?: string | null;
          display_name_custom?: boolean;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      user_settings: {
        Row: {
          user_id: string;
          locale: 'en' | 'es' | null;
          multiplayer_privacy: 'public' | 'initials' | 'anonymous';
          zen_mode_enabled: boolean;
          ghost_mode_enabled: boolean;
          pacer_enabled: boolean;
          pacer_target_wpm: number;
          sound_enabled: boolean;
          blind_mode_enabled: boolean;
          finger_colors_enabled: boolean;
          practice_mode: 'practice' | 'test';
          highlight_theme: string;
          theme: 'light' | 'dark';
          updated_at: string;
        };
        Insert: {
          user_id: string;
          locale?: 'en' | 'es' | null;
          multiplayer_privacy?: 'public' | 'initials' | 'anonymous';
          zen_mode_enabled?: boolean;
          ghost_mode_enabled?: boolean;
          pacer_enabled?: boolean;
          pacer_target_wpm?: number;
          sound_enabled?: boolean;
          blind_mode_enabled?: boolean;
          finger_colors_enabled?: boolean;
          practice_mode?: 'practice' | 'test';
          highlight_theme?: string;
          theme?: 'light' | 'dark';
        };
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };
      typing_sessions: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          wpm: number;
          accuracy: number;
          stars: number;
          mode: string;
          created_at: string;
          max_combo: number;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          wpm: number;
          accuracy: number;
          stars: number;
          mode?: string;
          max_combo?: number;
        };
        Update: Partial<Database['public']['Tables']['typing_sessions']['Insert']>;
      };
      key_errors: {
        Row: {
          id: string;
          user_id: string;
          key_char: string;
          error_count: number;
        };
        Insert: {
          user_id: string;
          key_char: string;
          error_count?: number;
        };
        Update: Partial<Database['public']['Tables']['key_errors']['Insert']>;
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          unlocked_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_badges']['Insert']>;
      };
      user_stats: {
        Row: {
          user_id: string;
          total_sessions_played: number;
          total_perfect_sessions: number;
          highest_wpm_ever: number;
          highest_combo_ever: number;
          current_day_streak: number;
          last_practice_date: string | null;
          total_multiplayer_matches: number;
          total_multiplayer_wins: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_sessions_played?: number;
          total_perfect_sessions?: number;
          highest_wpm_ever?: number;
          highest_combo_ever?: number;
          current_day_streak?: number;
          last_practice_date?: string | null;
          total_multiplayer_matches?: number;
          total_multiplayer_wins?: number;
        };
        Update: Partial<Database['public']['Tables']['user_stats']['Insert']>;
      };
      race_results: {
        Row: {
          id: string;
          user_id: string;
          room_id: string | null;
          wpm: number;
          accuracy: number;
          max_combo: number;
          finished: boolean;
          win_condition: string;
          placement: number | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          room_id?: string | null;
          wpm: number;
          accuracy: number;
          max_combo?: number;
          finished?: boolean;
          win_condition?: string;
          placement?: number | null;
        };
        Update: Partial<Database['public']['Tables']['race_results']['Insert']>;
      };
      rooms: {
        Row: {
          id: string;
          code: string;
          host_id: string;
          status: 'open' | 'closed' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          host_id: string;
          status?: 'open' | 'closed' | 'inactive';
        };
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
    };
    Functions: {
      purge_stale_rooms: {
        Args: { stale_hours?: number };
        Returns: number;
      };
    };
  };
};

let client: SupabaseClient<Database> | null = null;

/** Returns true when Supabase env vars are configured. */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.length > 0 && key.length > 0);
}

/** Singleton Supabase client. Returns null if env vars are missing (local-only mode). */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient<Database>(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  return client;
}
