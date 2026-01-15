// Supabase client for web app
// This file is in the web app so Vite can properly process import.meta.env
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vite will replace these at build/dev time
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '❌ Supabase configuration missing!\n' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in apps/web/.env\n' +
    'Current values:', { 
      SUPABASE_URL: SUPABASE_URL ? '✓' : '✗', 
      SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '✓' : '✗',
      allEnvKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
    }
  );
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
