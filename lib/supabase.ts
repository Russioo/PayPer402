import { createClient } from '@supabase/supabase-js';

// Default placeholder values for when env vars are not set
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// Client for browser (with anon key)
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Admin client for server-side operations (with service role key)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== 'https://placeholder.supabase.co' && 
         SUPABASE_ANON_KEY !== 'placeholder-anon-key';
};

