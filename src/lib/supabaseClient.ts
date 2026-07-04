import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          current_streak: number;
          last_practice_date: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          current_streak?: number;
          last_practice_date?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
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
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          wpm: number;
          accuracy: number;
          stars: number;
          mode?: string;
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
