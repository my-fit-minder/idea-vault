// Auth functions for mobile app
import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { User } from './types';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

// Generate a simple username
function generateRandomUsername(): string {
  const adjectives = ['creative', 'brilliant', 'curious', 'bold', 'swift', 'clever', 'bright', 'eager'];
  const nouns = ['thinker', 'maker', 'builder', 'dreamer', 'creator', 'inventor', 'pioneer', 'explorer'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}_${noun}_${num}`;
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
  // Get the redirect URL for deep linking back to the app
  const redirectUrl = Linking.createURL('/');
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  // Open the OAuth URL in a browser
  if (data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    
    if (result.type === 'success') {
      // Extract tokens from the URL and set session
      const url = result.url;
      const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (sessionError) {
          throw sessionError;
        }
        
        return sessionData;
      }
    }
  }

  return data;
}

export async function resetPassword(email: string) {
  const redirectUrl = Linking.createURL('/reset-password');
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    throw error;
  }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
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

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return session;
}
