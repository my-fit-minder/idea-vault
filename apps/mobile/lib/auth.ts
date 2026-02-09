// Auth functions for mobile app
import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { User } from './types';

// Warm up browser for faster OAuth
WebBrowser.maybeCompleteAuthSession();

// Check if running in Expo Go (development) or standalone build (production)
const isExpoGo = Constants.appOwnership === 'expo';

// Google OAuth Client IDs
// IMPORTANT: For native Google Sign-In, you need a WEB Client ID (not iOS/Android specific)
// This Web Client ID is used for native Google Sign-In in development/production builds
const GOOGLE_WEB_CLIENT_ID = '565801059910-b2g42nn3pak9aa9ionstrhfl8l45e5a3.apps.googleusercontent.com';

// iOS Client ID (optional, for iOS-specific configuration)
const GOOGLE_IOS_CLIENT_ID = '565801059910-5c9rf0khttimdesh5gkeagmr8crsrj3e.apps.googleusercontent.com';

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
  // Use native Google Sign-In for development/production builds (better UX)
  // Fall back to OAuth browser flow for Expo Go or if Web Client ID is not configured
  // Note: Native Google Sign-In only works in development/production builds, not Expo Go
  if (!isExpoGo && GOOGLE_WEB_CLIENT_ID) {
    try {
      // Try native Google Sign-In (requires @react-native-google-signin/google-signin)
      // This will only work in development/production builds, not Expo Go
      const googleSignInModule = await import('@react-native-google-signin/google-signin');
      const { GoogleSignin } = googleSignInModule;
      
      // Safety check: verify module is properly loaded
      if (!GoogleSignin || typeof GoogleSignin.configure !== 'function') {
        console.warn('⚠️  Google Sign-In module not properly initialized, using OAuth fallback');
        throw new Error('Google Sign-In module not available');
      }
      
      // Configure Google Sign-In
      // IMPORTANT: To use native Google Sign-In with Supabase, you MUST either:
      // 1. Upgrade @react-native-google-signin/google-signin to a version with Universal module support
      //    and generate custom nonce (see: https://react-native-google-signin.github.io/docs/security)
      // 2. OR disable "Skip nonce checks" in Supabase Dashboard → Authentication → Providers → Google
      const config: any = {
        webClientId: GOOGLE_WEB_CLIENT_ID, // Use Web Client ID (required)
        offlineAccess: false, // Disable offline access to prevent nonce in ID token
      };
      
      // Add iOS client ID if on iOS (optional but can help with some configurations)
      if (Platform.OS === 'ios') {
        config.iosClientId = GOOGLE_IOS_CLIENT_ID;
      }
      
      // Wrap configure in try-catch for additional safety
      try {
        GoogleSignin.configure(config);
      } catch (configError: any) {
        console.error('❌ Failed to configure Google Sign-In:', configError);
        throw new Error('Google Sign-In configuration failed');
      }
      
      console.log('🔐 Using native Google Sign-In');
      console.log('⚠️  Note: Ensure "Skip nonce checks" is enabled in Supabase Dashboard for Google provider');
      
      // Check if Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const response = await GoogleSignin.signIn();
      
      if (response.type === 'success' && response.data?.idToken) {
        console.log('✅ Google Sign-In successful, exchanging ID token with Supabase...');
        
        // Exchange ID token with Supabase
        // NOTE: Do NOT pass nonce here - Supabase dashboard must have "Skip nonce checks" enabled
        // because the current version of @react-native-google-signin doesn't expose the raw nonce
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.data.idToken,
        });
        
        if (error) {
          console.error('❌ Supabase signInWithIdToken error:', error);
          // If it's a nonce error, provide helpful message
          if (error.message?.includes('nonce') || error.message?.includes('Nonce')) {
            console.error('');
            console.error('🔧 NONCE ERROR FIX:');
            console.error('   Go to Supabase Dashboard → Authentication → Providers → Google');
            console.error('   Enable "Skip nonce checks" option');
            console.error('');
            console.error('   Alternatively, upgrade @react-native-google-signin to use the Universal module');
            console.error('   with custom nonce support. See: https://react-native-google-signin.github.io/docs/security');
          }
          throw error;
        }
        
        console.log('✅ Supabase session created successfully!');
        return data;
      } else {
        throw new Error('Google Sign-In was cancelled or failed');
      }
    } catch (error: any) {
      // If native sign-in fails or library not available, fall back to OAuth
      // This is expected in Expo Go since native modules aren't available
      const errorMessage = error?.message || String(error || '');
      const isTurboModuleError = errorMessage.includes('TurboModuleRegistry') || 
                                  errorMessage.includes('RNGoogleSignin') ||
                                  errorMessage.includes('could not be found');
      
      // Check if it's a nonce error - these should not fall back to OAuth (same issue)
      const isNonceError = errorMessage.includes('nonce') || errorMessage.includes('Nonce');
      if (isNonceError) {
        throw error; // Re-throw nonce errors, don't fall back
      }
      
      if (isTurboModuleError) {
        // Native module not available (expected in Expo Go or if not properly configured)
        console.log('ℹ️  Native Google Sign-In not available (requires development build), using OAuth flow');
        // Fall through to OAuth flow below
      } else if (error.code === 10) {
        // DEVELOPER_ERROR (code 10) - usually means Web Client ID is not properly configured
        // or SHA-1 fingerprint is missing (Android) or iOS client not configured
        console.log('⚠️  Native Google Sign-In DEVELOPER_ERROR (code 10)');
        console.log('   Platform:', Platform.OS);
        console.log('   Web Client ID:', GOOGLE_WEB_CLIENT_ID);
        if (Platform.OS === 'ios') {
          console.log('   iOS Client ID:', GOOGLE_IOS_CLIENT_ID);
          console.log('   ⚠️  For iOS, make sure:');
          console.log('   1. iOS Client ID is added to Google Cloud Console');
          console.log('   2. Bundle ID matches: com.zensthub.ideafy');
          console.log('   3. iOS URL scheme is configured in app.json');
          console.log('   4. Web Client ID is correct and linked to iOS client');
        } else {
          console.log('   ⚠️  For Android, you need to:');
          console.log('   1. Get SHA-1 fingerprint from EAS credentials');
          console.log('   2. Add SHA-1 to Google Cloud Console → Android OAuth Client');
          console.log('   3. Package name must match: com.zensthub.ideafy');
          console.log('   4. Web Client ID must be correct');
          console.log('');
          console.log('   To get SHA-1 fingerprint, run:');
          console.log('   npx eas-cli credentials --platform android');
          console.log('   Then select "development" profile → "Show credentials" → copy SHA-1');
        }
        console.log('   Falling back to OAuth flow...');
        // Fall through to OAuth flow
      } else if (error.code) {
        // Error has a code - might be from Google Sign-In
        console.log('⚠️  Native Google Sign-In error:', error.code, error.message);
        // Fall through to OAuth flow
      } else {
        // Other errors
        console.log('⚠️  Native Google Sign-In failed, falling back to OAuth:', errorMessage);
        // Fall through to OAuth flow
      }
      // Fall through to OAuth flow below
    }
  } else {
    if (isExpoGo) {
      console.log('ℹ️  Running in Expo Go, using OAuth flow (native sign-in requires development build)');
    } else if (!GOOGLE_WEB_CLIENT_ID) {
      console.log('ℹ️  Web Client ID not configured, using OAuth flow');
    }
  }
  
  // OAuth browser flow (for Expo Go or as fallback)
  console.log('🔐 Using OAuth browser flow');
  
  // Different redirect URLs for development vs production
  // - Expo Go (dev): Uses Expo auth proxy → https://auth.expo.io/@amitojsingh99/ideafy
  // - Production build: Uses native scheme → ideafy://auth/callback
  let redirectUrl: string;
  
  if (isExpoGo) {
    // For Expo Go, use the Expo auth proxy URL
    redirectUrl = 'https://auth.expo.io/@amitojsingh99/ideafy';
  } else {
    // For production builds, use the native scheme
    redirectUrl = makeRedirectUri({
      scheme: 'ideafy',
      path: 'auth/callback',
    });
  }
  
  console.log('🔐 OAuth Configuration:');
  console.log('  Redirect URL:', redirectUrl);
  console.log('  Environment:', isExpoGo ? 'Expo Go (development)' : 'Production build');
  console.log('  ✅ Make sure this is in Supabase: https://auth.expo.io/@amitojsingh99/ideafy');
  console.log('  💡 Tip: You can also add wildcard: https://auth.expo.io/@amitojsingh99/*');
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('❌ Supabase OAuth error:', error);
      throw error;
    }

    if (!data.url) {
      throw new Error('No OAuth URL returned from Supabase');
    }

    console.log('🌐 Opening OAuth URL in browser...');
    console.log('  OAuth URL:', data.url.substring(0, 100) + '...');
    console.log('  Waiting for redirect to:', redirectUrl);
    
    // Helper function to extract and set session from URL
    const extractAndSetSession = async (url: string) => {
      console.log('✅ Processing callback URL...');
      console.log('  Full URL:', url);
      
      // Extract parameters from URL
      let params: URLSearchParams;
      const hashIndex = url.indexOf('#');
      const queryIndex = url.indexOf('?');
      
      if (hashIndex !== -1) {
        const hash = url.substring(hashIndex + 1);
        params = new URLSearchParams(hash);
        console.log('  Using hash fragment, length:', hash.length);
      } else if (queryIndex !== -1) {
        const query = url.substring(queryIndex + 1);
        params = new URLSearchParams(query);
        console.log('  Using query string');
      } else {
        console.error('❌ No parameters found in URL');
        throw new Error('No auth parameters in callback URL');
      }
      
      // Log all available parameters (without sensitive values)
      const paramKeys = Array.from(params.keys());
      console.log('  Available params:', paramKeys);
      
      // Check for errors
      const errorParam = params.get('error');
      const errorDescription = params.get('error_description');
      if (errorParam) {
        console.error('❌ OAuth error:', errorParam, errorDescription);
        throw new Error(errorDescription || errorParam);
      }
      
      // Try access_token first (implicit flow)
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        console.log('🔑 Found access token (length:', accessToken.length, '), setting session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }
        console.log('✅ Session set successfully!');
        return sessionData;
      }
      
      // Try code (PKCE flow)
      const code = params.get('code');
      if (code) {
        console.log('🔑 Found authorization code, exchanging for session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) {
          console.error('❌ Code exchange error:', sessionError);
          throw sessionError;
        }
        console.log('✅ Session exchanged successfully!');
        return sessionData;
      }
      
      console.error('❌ No access token or code found in callback');
      throw new Error('No access token or code in callback');
    };
    
    // Check for initial URL (in case redirect happened before listener was set up)
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl && (initialUrl.includes('access_token') || initialUrl.includes('code='))) {
      console.log('🔗 Found initial URL with auth params:', initialUrl);
      return await extractAndSetSession(initialUrl);
    }
    
    // Set up a deep link listener as a fallback
    // This will catch the redirect even if openAuthSessionAsync doesn't return properly
    let deepLinkUrl: string | null = null;
    let deepLinkResolve: ((url: string) => void) | null = null;
    
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      console.log('🔗 Deep link received:', event.url);
      if (event.url.includes('access_token') || event.url.includes('code=')) {
        deepLinkUrl = event.url;
        if (deepLinkResolve) {
          deepLinkResolve(event.url);
        }
      }
    });
    
    // Create a promise that resolves when we get a deep link
    const deepLinkPromise = new Promise<string>((resolve) => {
      deepLinkResolve = resolve;
    });
    
    try {
      // Open browser for OAuth
      // The redirect URL must match EXACTLY what's in Supabase
      const result = await Promise.race([
        WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
          {
            showInRecents: true,
            preferEphemeralSession: false,
          }
        ),
        // Also race against deep link
        deepLinkPromise.then((url) => ({ type: 'deepLink' as const, url })),
        // Timeout after 2 minutes
        new Promise<{ type: string; url?: string }>((resolve) => {
          setTimeout(() => {
            resolve({ type: 'timeout' });
          }, 120000);
        }),
      ]);
      
      console.log('📱 Browser result:', result.type);
      
      // Handle deep link result (from our listener)
      if (result.type === 'deepLink' && 'url' in result && result.url) {
        console.log('🔗 Deep link caught, processing...');
        // Close the browser if it's still open
        try {
          await WebBrowser.dismissBrowser();
        } catch {
          // Ignore if browser is already closed
        }
        return await extractAndSetSession(result.url);
      }
      
      if ('url' in result && result.url) {
        console.log('📱 Result URL:', result.url.substring(0, 150) + '...');
      }
      
      // If we got a deep link while waiting, use that instead
      if (deepLinkUrl && (!('url' in result && result.url) || result.type === 'timeout' || result.type === 'cancel')) {
        console.log('🔗 Using deep link URL instead (browser was closed but we have the URL)');
        try {
          await WebBrowser.dismissBrowser();
        } catch {
          // Ignore if browser is already closed
        }
        return await extractAndSetSession(deepLinkUrl);
      }
      
      // If timeout, check if we have a deep link
      if (result.type === 'timeout') {
        if (deepLinkUrl) {
          console.log('⏱️  Timeout but found deep link, using it...');
          return await extractAndSetSession(deepLinkUrl);
        }
        throw new Error('OAuth timeout - please try again');
      }
      
      if (result.type === 'success' && 'url' in result && result.url) {
        return await extractAndSetSession(result.url);
      } else if (result.type === 'cancel') {
        // Before throwing, check if we have a deep link (user might have closed browser after redirect)
        if (deepLinkUrl) {
          console.log('⚠️  Browser was cancelled but we have deep link, using it...');
          return await extractAndSetSession(deepLinkUrl);
        }
        console.log('⚠️  User cancelled authentication');
        throw new Error('Sign in was cancelled');
      } else if (result.type === 'dismiss') {
        // Before throwing, check if we have a deep link
        if (deepLinkUrl) {
          console.log('⚠️  Browser was dismissed but we have deep link, using it...');
          return await extractAndSetSession(deepLinkUrl);
        }
        console.log('⚠️  Authentication window was dismissed');
        throw new Error('Sign in was dismissed');
      } else {
        console.error('❌ Unexpected result type:', result.type);
        console.error('  Full result:', result);
        // Even if result.type is not 'success', check if there's a URL
        if ('url' in result && result.url) {
          console.log('⚠️  Result type is not success but URL exists, trying to process...');
          return await extractAndSetSession(result.url);
        }
        throw new Error(`Unexpected result type: ${result.type}`);
      }
    } finally {
      // Clean up the listener
      linkingSubscription.remove();
    }
  } catch (error: any) {
    console.error('❌ signInWithGoogle error:', error);
    throw error;
  }
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
