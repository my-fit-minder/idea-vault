// Settings screen for mobile app
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useAuthStore } from '../lib/authStore';
import { Colors } from '../constants/theme';
import { syncService } from '../lib/syncService';
import { offlineStorage } from '../lib/offlineStorage';
import { notificationService } from '../lib/notificationService';

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const { user, signOut } = useAuthStore();
  const { isOnline, pendingOperations, lastSyncTime, triggerSync, isSyncing } = useNetworkStatus();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Load notification preference on mount
  useEffect(() => {
    loadNotificationPreference();
  }, []);

  const loadNotificationPreference = async () => {
    try {
      const enabled = await notificationService.areNotificationsEnabled();
      setNotificationsEnabled(enabled);
    } catch (error) {
      console.error('Failed to load notification preference:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await notificationService.setNotificationsEnabled(value);
      if (value) {
        Alert.alert(
          '🔔 Reminders Enabled',
          "You'll receive a daily reminder at 7 PM to check on your ideas!"
        );
      }
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      setNotificationsEnabled(!value); // Revert on error
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('✅ Test Sent', 'Check your notifications!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send test notification');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      pendingOperations > 0
        ? `You have ${pendingOperations} unsynced changes. They will be lost if you sign out now. Continue?`
        : 'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await syncService.clearLocalData();
            signOut();
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Local Data',
      'This will clear all cached data. Unsynced changes will be lost. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await offlineStorage.clearAllData();
            Alert.alert('Success', 'Local data cleared');
          },
        },
      ]
    );
  };

  const handleForceSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline');
      return;
    }

    try {
      const result = await triggerSync();
      Alert.alert(
        'Sync Complete',
        `Synced ${result.synced} items${result.errors > 0 ? `, ${result.errors} errors` : ''}`
      );
    } catch (error: any) {
      Alert.alert('Sync Failed', error.message || 'Failed to sync');
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const date = new Date(lastSyncTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const styles = createStyles(isDark, colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={handleSignOut}>
              <Text style={styles.dangerLabel}>Sign Out</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.label}>Daily Reminder</Text>
                <Text style={styles.sublabel}>Get reminded at 7 PM</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#e2e8f0', true: '#c3dafe' }}
                thumbColor={notificationsEnabled ? '#667eea' : '#a0aec0'}
                disabled={loadingNotifications}
              />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={handleTestNotification}>
              <Text style={styles.actionLabel}>Send Test Notification</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync & Data</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Network Status</Text>
              <View style={[styles.statusBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
                <Text style={[styles.statusText, isOnline ? styles.onlineText : styles.offlineText]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Pending Changes</Text>
              <Text style={[styles.value, pendingOperations > 0 && styles.pendingValue]}>
                {pendingOperations}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Last Sync</Text>
              <Text style={styles.value}>{formatLastSync()}</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={[styles.row, !isOnline && styles.rowDisabled]}
              onPress={handleForceSync}
              disabled={!isOnline || isSyncing}
            >
              <Text style={[styles.actionLabel, !isOnline && styles.actionLabelDisabled]}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={handleClearCache}>
              <Text style={styles.dangerLabel}>Clear Local Data</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://ideafy.zensthub.com/privacy/')}
            >
              <Text style={styles.actionLabel}>Privacy Policy</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://ideafy.zensthub.com/terms/')}
            >
              <Text style={styles.actionLabel}>Terms of Service</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('mailto:singh99amitoj@gmail.com')}
            >
              <Text style={styles.actionLabel}>Support</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline Mode Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Offline Mode</Text>
          <Text style={styles.infoText}>
            Ideafy works offline! Create and edit ideas even without internet connection.
            Your changes will automatically sync when you&apos;re back online.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean, colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f7fafc',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    closeButton: {
      width: 60,
    },
    closeText: {
      fontSize: 16,
      color: '#667eea',
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: '#1a202c',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#718096',
      marginBottom: 8,
      marginLeft: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    rowContent: {
      flex: 1,
      marginRight: 12,
    },
    rowDisabled: {
      opacity: 0.5,
    },
    sublabel: {
      fontSize: 13,
      color: '#718096',
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: '#e2e8f0',
      marginLeft: 16,
    },
    label: {
      fontSize: 16,
      color: '#1a202c',
    },
    value: {
      fontSize: 16,
      color: '#718096',
    },
    pendingValue: {
      color: '#d97706',
      fontWeight: '600',
    },
    actionLabel: {
      fontSize: 16,
      color: '#667eea',
    },
    actionLabelDisabled: {
      color: '#a0aec0',
    },
    dangerLabel: {
      fontSize: 16,
      color: '#c53030',
    },
    chevron: {
      fontSize: 20,
      color: '#a0aec0',
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    onlineBadge: {
      backgroundColor: '#c6f6d5',
    },
    offlineBadge: {
      backgroundColor: '#fed7d7',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    onlineText: {
      color: '#276749',
    },
    offlineText: {
      color: '#c53030',
    },
    infoSection: {
      backgroundColor: '#f0f4ff',
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: '#c3dafe',
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1a202c',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: '#718096',
      lineHeight: 20,
    },
  });
