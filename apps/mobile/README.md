# Ideafy Mobile App

A React Native mobile app for managing your startup ideas with **full offline support**. Built with Expo and designed following iOS and Android guidelines.

## Features

- 📱 **Native iOS & Android experience** - Follows platform design guidelines
- 🔐 **Authentication** - Email/password and Google OAuth sign-in
- 💡 **Ideas Management** - Create, edit, view, archive, and delete ideas
- 🏷️ **Tags & Search** - Organize ideas with tags (max 4) and search functionality
- 🤖 **AI Reports** - Generate AI-powered startup idea analysis reports
- 📴 **Offline Support** - Full offline functionality with automatic sync
- 🔄 **Auto Sync** - Changes sync automatically when back online
- 🌙 **Dark Mode** - Automatic dark/light mode based on system settings

## Offline Support

The app works completely offline:

1. **Create ideas offline** - New ideas are saved locally with a `local-` prefix
2. **Edit ideas offline** - Changes are queued for sync
3. **Delete ideas offline** - Deletions are queued and applied when online
4. **Automatic sync** - When network is restored, all pending changes sync automatically
5. **Sync queue** - View pending operations in Settings

### How Offline Sync Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Action   │ --> │  Local Storage  │ --> │   Sync Queue    │
└─────────────────┘     │  (AsyncStorage) │     │   (Pending Ops) │
                        └─────────────────┘     └─────────────────┘
                                                        │
                                                        │ Network Restored
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UI Updated    │ <-- │  Local Storage  │ <-- │   API Server    │
│                 │     │    Refreshed    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your physical device (optional)

### Installation

1. Install dependencies:
```bash
cd apps/mobile
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3001  # or your production API URL
```

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Ideas list tab
│   │   └── settings.tsx   # Settings tab
│   ├── _layout.tsx        # Root layout with auth handling
│   └── modal.tsx          # Modal screens
├── components/            # React Native components
│   ├── AuthScreen.tsx     # Authentication UI
│   ├── IdeasList.tsx      # Ideas list with search/filter
│   ├── IdeaEditor.tsx     # Create/edit idea form
│   ├── IdeaDetail.tsx     # Idea detail view with AI report
│   └── SettingsScreen.tsx # App settings & sync status
├── config/
│   └── env.ts            # Environment configuration
├── constants/
│   └── theme.ts          # Color themes and fonts
├── hooks/
│   ├── use-color-scheme.ts
│   ├── use-theme-color.ts
│   └── useNetworkStatus.ts # Network & sync status hook
└── lib/
    ├── apiClient.ts      # API communication
    ├── auth.ts           # Authentication functions
    ├── authStore.ts      # Zustand auth state
    ├── offlineStorage.ts # AsyncStorage wrapper
    ├── supabase.ts       # Supabase client
    ├── syncService.ts    # Offline sync logic
    └── types.ts          # TypeScript types
```

## iOS App Store Requirements

The app is configured to comply with Apple's guidelines:

- ✅ **Privacy Policy** - Link provided in Settings
- ✅ **Non-exempt encryption** - Declared as false (only HTTPS)
- ✅ **Data handling** - User data stored securely
- ✅ **Offline functionality** - App works without network
- ✅ **Permission descriptions** - All permissions have usage descriptions

## Google Play Store Requirements

The app is configured to comply with Google's guidelines:

- ✅ **Permissions declared** - Only INTERNET and ACCESS_NETWORK_STATE
- ✅ **Privacy Policy** - Link provided in Settings
- ✅ **Data safety** - No sensitive data collection beyond user account
- ✅ **Adaptive icons** - Proper Android adaptive icon setup

## Building for Production

### iOS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `EXPO_PUBLIC_API_URL` | Backend API URL |

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router v6
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Network**: @react-native-community/netinfo
- **Authentication**: Supabase Auth
- **Styling**: React Native StyleSheet (no external UI library)

## License

MIT
