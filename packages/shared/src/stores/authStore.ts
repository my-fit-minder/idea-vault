import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { User, AuthState } from '../types';

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
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  initialize: async () => {
    try {
      set({ loading: true });

      // Check if Supabase is properly configured
      const supabaseUrl = (supabase as any).supabaseUrl;
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        console.error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.');
        set({ user: null, session: null, loading: false, initialized: true });
        return;
      }

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ user: null, session: null, loading: false, initialized: true });
        return;
      }

      set({
        session,
        user: session?.user ? { id: session.user.id, email: session.user.email } : null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ? { id: session.user.id, email: session.user.email } : null,
        });
      });
    } catch (error: any) {
      console.error('Error initializing auth:', error);
      // Don't crash the app - just show as not authenticated
      set({ user: null, session: null, loading: false, initialized: true });
    }
  },
}));
