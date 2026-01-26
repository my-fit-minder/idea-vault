import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Direct access to import.meta.env - Vite will replace these at build/dev time
// Using direct property access so Vite's static analysis can find and replace them
const env = (import.meta as any).env || {};

const SUPABASE_URL = env.VITE_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '❌ Supabase configuration missing!\n' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in apps/web/.env\n' +
    '\n' +
    'Current values:\n' +
    `  SUPABASE_URL: ${SUPABASE_URL ? '✓ Set' : '✗ Missing'}\n` +
    `  SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}\n` +
    '\n' +
    'Available env vars:', Object.keys(env).filter((k: string) => k.startsWith('VITE_') || k.startsWith('EXPO_'))
  );
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
