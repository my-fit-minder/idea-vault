// Environment configuration for the web app
// This file ensures Vite processes the env vars correctly

export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
};

// Validate required env vars
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables:', {
    SUPABASE_URL: env.SUPABASE_URL ? '✓' : '✗',
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY ? '✓' : '✗',
    allEnvVars: import.meta.env,
  });
}
