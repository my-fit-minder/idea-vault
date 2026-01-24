// Root layout for Idea Vault mobile app
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useAuthStore } from '@/lib/authStore';
import { syncService } from '@/lib/syncService';
import { notificationService } from '@/lib/notificationService';
import { AuthScreen } from '@/components/AuthScreen';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { user, loading, initialized, initialize } = useAuthStore();
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize auth on app start
  useEffect(() => {
    if (!initialized) {
      initialize().catch((err: any) => {
        console.error('Failed to initialize app:', err);
        setInitError(err.message || 'Failed to initialize application');
      });
    }
  }, [initialized, initialize]);

  // Set user ID for offline storage when user changes
  useEffect(() => {
    if (user?.id) {
      syncService.setUserId(user.id);
    }
  }, [user?.id]);

  // Initialize notifications when user is logged in
  useEffect(() => {
    if (user) {
      // Schedule daily notification at 7pm
      notificationService.scheduleDailyNotification();
      
      // Initialize notification listeners
      notificationService.initializeListeners();
      
      return () => {
        notificationService.cleanup();
      };
    }
  }, [user]);

  // Handle app state changes for sync
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && user) {
        // App became active - start periodic sync
        syncService.startPeriodicSync(60000); // Sync every minute
        // Trigger immediate sync
        syncService.sync().catch(console.error);
      } else if (nextAppState === 'background') {
        // App going to background - stop periodic sync
        syncService.stopPeriodicSync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Start sync if app is already active and user is logged in
    if (AppState.currentState === 'active' && user) {
      syncService.startPeriodicSync(60000);
    }

    return () => {
      subscription.remove();
      syncService.stopPeriodicSync();
    };
  }, [user]);

  // Show loading screen while initializing
  if (loading || !initialized) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loadingContainer, { backgroundColor: '#f7fafc' }]}>
          <ActivityIndicator size="large" color="#667eea" />
          {initError && (
            <View style={styles.errorContainer}>
              <View style={[styles.errorBox, { backgroundColor: '#fed7d7' }]}>
                <Text style={[styles.errorText, { color: '#c53030' }]}>{initError}</Text>
              </View>
            </View>
          )}
        </View>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <AuthScreen />
          <StatusBar style="light" />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  // Show main app
  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              headerShown: false,
            }} 
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    maxWidth: 300,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
