// Auth store for web app - uses local Supabase client
import { create } from 'zustand';
import { supabase } from './supabase';
import type { User } from '@idea-vault/shared';

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  initialize: async () => {
    try {
      set({ loading: true });

      // Check if Supabase is properly configured
      const supabaseUrl = (supabase as any).supabaseUrl;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        console.error('Supabase not configured properly');
        set({ user: null, session: null, loading: false, initialized: true });
        return;
      }

      // Get initial session - Supabase will process recovery tokens automatically
      // if detectSessionInUrl is true (which it is)
      const { data, error } = await supabase.auth.getSession();
      
      let session = null;
      if (error) {
        console.error('Error getting session:', error);
      } else {
        session = data.session;
      }
      
      set({
        session,
        user: session?.user ? { id: session.user.id, email: session.user.email } : null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        // Generate username for new OAuth users (e.g., Google sign-in)
        if (event === 'SIGNED_IN' && session?.user) {
          const username = session.user.user_metadata?.username;
          if (!username) {
            try {
              const { generateRandomUsername } = await import('./username');
              const newUsername = generateRandomUsername();
              await supabase.auth.updateUser({
                data: { username: newUsername }
              });
            } catch (error) {
              console.error('Failed to generate username for OAuth user:', error);
              // Don't block auth - username can be set later in Settings
            }
          }
        }

        set({
          session,
          user: session?.user ? { id: session.user.id, email: session.user.email } : null,
        });
      });
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      set({ user: null, session: null, loading: false, initialized: true });
    }
  },
}));
