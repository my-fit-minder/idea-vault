// Auth functions for web app
import { supabase } from './supabase';
import type { User } from '@idea-vault/shared';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export async function signIn(credentials: SignInCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
    session: data.session,
  };
}

export async function signUp(credentials: SignUpCredentials) {
  // Generate a random username
  const { generateRandomUsername } = await import('./username');
  const username = generateRandomUsername();

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
    session: data.session,
  };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email || undefined } : null;
}
