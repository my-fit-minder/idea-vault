// Environment configuration for mobile app
// Expo automatically injects EXPO_PUBLIC_* variables at build time

// Access env vars - Expo replaces these at build time
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const env = {
  SUPABASE_URL: SUPABASE_URL || '',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY || '',
  API_URL: API_URL || 'http://localhost:3001',
};

// Log env status in development
if (__DEV__) {
  console.log('📱 Environment loaded:', {
    SUPABASE_URL: env.SUPABASE_URL ? `${env.SUPABASE_URL.substring(0, 30)}...` : '❌ MISSING',
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY ? '✓ Set' : '❌ MISSING',
    API_URL: env.API_URL,
  });
}
