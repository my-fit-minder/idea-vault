// Notification service for daily reminders
import * as Notifications from 'expo-notifications';
import { Platform, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Suppress the expo-notifications warning in Expo Go
// Local scheduled notifications still work, only push notifications are limited
LogBox.ignoreLogs([
  'expo-notifications',
  'Android Push notifications',
]);

// Motivational quotes for idea reminders
const IDEA_QUOTES = [
  {
    title: "💡 Time for Ideas!",
    body: "The best time to plant a tree was 20 years ago. The second best time is now. What ideas are waiting to be planted?",
  },
  {
    title: "🚀 Capture Your Thoughts",
    body: "Ideas are like rabbits. You get a couple and learn how to handle them, and pretty soon you have a dozen.",
  },
  {
    title: "✨ Your Daily Spark",
    body: "Every great achievement started as someone's wild idea. What's yours today?",
  },
  {
    title: "🧠 Mind Check-in",
    body: "Your mind is a garden, your thoughts are the seeds. Time to check what's growing in your Idea Vault!",
  },
  {
    title: "📝 Idea Time!",
    body: "The only bad idea is the one you never write down. Open your vault and capture your thoughts!",
  },
  {
    title: "💭 Evening Reflection",
    body: "Before the day ends, take a moment to capture the ideas that crossed your mind today.",
  },
  {
    title: "🌟 Dream Big",
    body: "Today's ideas are tomorrow's reality. What will you create?",
  },
  {
    title: "🔮 Future You Thanks You",
    body: "The ideas you capture today could change your tomorrow. What's on your mind?",
  },
  {
    title: "💪 Keep Building",
    body: "Every empire was built one idea at a time. How's yours coming along?",
  },
  {
    title: "🎯 Focus Time",
    body: "Success is the sum of small efforts. Check in on your ideas and keep moving forward!",
  },
  {
    title: "🌱 Nurture Your Ideas",
    body: "Ideas need attention to grow. Which one will you nurture today?",
  },
  {
    title: "⚡ Energy Check",
    body: "Got 2 minutes? That's enough to capture an idea that could change everything.",
  },
  {
    title: "🎨 Creative Corner",
    body: "Creativity is intelligence having fun. What fun ideas do you have today?",
  },
  {
    title: "📚 Knowledge Vault",
    body: "The more ideas you capture, the richer your mind becomes. Open your vault!",
  },
  {
    title: "🌈 Possibility Check",
    body: "Every moment holds infinite possibilities. What possibilities are you exploring?",
  },
];

const NOTIFICATION_STORAGE_KEY = '@idea_vault_notification_scheduled';
const NOTIFICATION_ENABLED_KEY = '@idea_vault_notifications_enabled';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  // Get a random quote
  private getRandomQuote() {
    const index = Math.floor(Math.random() * IDEA_QUOTES.length);
    return IDEA_QUOTES[index];
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Android specific channel setup
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-reminders', {
          name: 'Daily Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#667eea',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.log('Failed to request permissions:', error);
      return false;
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
      return enabled !== 'false'; // Default to true if not set
    } catch {
      return true;
    }
  }

  // Enable/disable notifications
  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled.toString());
      if (enabled) {
        await this.scheduleDailyNotification();
      } else {
        await this.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Failed to set notification preference:', error);
    }
  }

  // Schedule daily notification at 7pm
  async scheduleDailyNotification(): Promise<void> {
    try {
      // Check if notifications are enabled
      const enabled = await this.areNotificationsEnabled();
      if (!enabled) {
        console.log('Notifications are disabled by user');
        return;
      }

      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('No notification permission');
        return;
      }

      // Cancel existing notifications first
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Get a random quote for today
      const quote = this.getRandomQuote();

      // Schedule notification for 7pm daily
      const trigger: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19, // 7 PM
        minute: 0,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: quote.title,
          body: quote.body,
          sound: 'default',
          data: { type: 'daily-reminder' },
        },
        trigger,
      });

      // Mark as scheduled
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, new Date().toISOString());
      console.log('📅 Daily notification scheduled for 7 PM');
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      console.log('🔕 All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  // Initialize notification listeners
  initializeListeners(onNotificationReceived?: (notification: Notifications.Notification) => void): void {
    // Listen for notifications when app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log('Notification response:', response);
      }
    );
  }

  // Cleanup listeners
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }

  // Send a test notification immediately
  async sendTestNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('No notification permission for test');
      return;
    }

    const quote = this.getRandomQuote();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: quote.title,
        body: quote.body,
        sound: 'default',
        data: { type: 'test' },
      },
      trigger: null, // null means immediate
    });

    console.log('📬 Test notification sent');
  }
}

export const notificationService = new NotificationService();
