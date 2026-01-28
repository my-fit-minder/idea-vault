// Auth store for mobile app - uses Supabase with AsyncStorage
import { create } from 'zustand';
import { supabase } from './supabase';
import type { User } from './types';

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

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    set({ user: null, session: null });
  },

  initialize: async () => {
    try {
      set({ loading: true });

      // Get initial session from AsyncStorage
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
      // IMPORTANT: Don't use await directly in onAuthStateChange callback
      // This causes a deadlock with setSession. Use setTimeout to defer async operations.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // Update state immediately (synchronous)
        set({
          session,
          user: session?.user ? { id: session.user.id, email: session.user.email } : null,
        });

        // Defer async operations to prevent deadlock
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            // Generate username for new OAuth users
            const username = session.user.user_metadata?.username;
            if (!username) {
              try {
                const newUsername = generateRandomUsername();
                await supabase.auth.updateUser({
                  data: { username: newUsername }
                });
              } catch (error) {
                console.error('Failed to generate username:', error);
              }
            }
          }, 0);
        }
      });

      // Return cleanup function (though it's not used in zustand)
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, session: null, loading: false, initialized: true });
    }
  },
}));

// Simple username generator for OAuth users
function generateRandomUsername(): string {
  const adjectives = ['creative', 'brilliant', 'curious', 'bold', 'swift', 'clever', 'bright', 'eager'];
  const nouns = ['thinker', 'maker', 'builder', 'dreamer', 'creator', 'inventor', 'pioneer', 'explorer'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}_${noun}_${num}`;
}
