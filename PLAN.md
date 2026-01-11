# Cross-Platform Idea Vault App

## Technology Stack

### Frontend (Cross-Platform)

- **Expo (React Native)** - Primary framework for iOS and Android apps
- **React** - For web app (can share components with Expo)
- **TypeScript** - Type safety across all platforms
- **React Native Web** - Share components between mobile and web

### Backend & Services

- **Supabase** - Backend-as-a-Service providing:
- PostgreSQL database (structured storage for ideas)
- Authentication (multi-user support)
- Real-time subscriptions (sync when online)
- Row Level Security (RLS) for data isolation
- REST API (automatic from database schema)

### State Management & Storage

- **Zustand** or **React Context** - Lightweight state management
- **@react-native-async-storage/async-storage** - Local storage for offline support
- **Supabase Realtime** - Automatic sync when connection is restored

### UI Components

- **NativeBase** - Cross-platform UI component library
- **React Native Reanimated** - Smooth animations

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Devices                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Web    │  │ Android  │  │   iOS    │             │
│  │  (React) │  │  (Expo)  │  │  (Expo)  │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │             │                    │
│       └─────────────┼─────────────┘                    │
│                     │                                    │
│            ┌────────▼────────┐                          │
│            │  Shared Logic   │                          │
│            │  (React Native) │                          │
│            └────────┬─────────┘                          │
└─────────────────────┼────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼────┐  ┌────▼────┐  ┌───▼────┐
    │ Local   │  │ Supabase│  │ Sync   │
    │ Storage │  │  API    │  │ Engine │
    │(Offline)│  │(Online) │  │        │
    └─────────┘  └─────────┘  └────────┘
```

## Project Structure

```
idealot/
├── apps/
│   ├── mobile/          # Expo app (iOS + Android)
│   │   ├── app.json
│   │   ├── App.tsx
│   │   └── src/
│   └── web/             # React web app
│       ├── index.html
│       └── src/
├── packages/
│   └── shared/          # Shared code between platforms
│       ├── components/  # Reusable UI components
│       ├── hooks/       # Custom React hooks
│       ├── services/    # Supabase client, API calls
│       ├── types/       # TypeScript types
│       └── utils/       # Utility functions
├── supabase/
│   └── migrations/      # Database schema migrations
└── package.json         # Monorepo root
```

## Database Schema

```sql
-- Users table (handled by Supabase Auth)
-- ideas table
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own ideas
CREATE POLICY "Users can view own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);
```

## Key Features Implementation

### 1. Offline-First Architecture

- Store ideas locally using AsyncStorage when offline
- Queue sync operations when connection is restored
- Show sync status indicator in UI

### 2. Real-time Sync

- Use Supabase Realtime subscriptions to detect changes
- Merge local and remote changes on sync
- Handle conflict resolution (last-write-wins or manual merge)

### 3. Authentication

- Supabase Auth with email/password
- Session persistence across app restarts
- Secure token storage

### 4. Structured UI

- Card-based layout for ideas
- Search and filter functionality
- Tag system for organization
- Rich text editing (markdown support)

## Development Phases

### Phase 1: Setup & Core Infrastructure

- Initialize Expo project
- Initialize React web project
- Set up Supabase project and database schema
- Configure shared package structure
- Set up authentication flow

### Phase 2: Core Features

- Create idea CRUD operations
- Implement local storage for offline support
- Build sync mechanism
- Create basic UI components

### Phase 3: Enhanced Features

- Add tags and filtering
- Implement search functionality
- Add rich text editing
- Polish UI/UX

### Phase 4: Testing & Deployment

- Test on all platforms
- Set up build pipelines
- Deploy web app
- Build and test mobile apps

## Development Tasks

1. **Setup Expo** - Initialize Expo project for mobile apps (iOS + Android)
2. **Setup Web** - Initialize React web app with React Native Web support
3. **Setup Supabase** - Create Supabase project, configure database schema, and set up authentication
4. **Shared Package** - Set up shared package structure for code reuse across platforms
5. **Auth Flow** - Implement authentication flow (login, signup, session management)
6. **Idea CRUD** - Build CRUD operations for ideas (create, read, update, delete)
7. **Offline Storage** - Implement local storage with AsyncStorage for offline support
8. **Sync Mechanism** - Build sync mechanism to merge local and remote changes when online
9. **UI Components** - Create reusable UI components (idea cards, forms, navigation)
10. **Tags & Filtering** - Implement tags system and filtering functionality

## Why This Stack?

1. **Expo** - Minimal setup, no native code needed initially, can build for iOS/Android/Web
2. **Supabase** - Free tier sufficient for low-medium traffic, handles auth/database/sync automatically
3. **Shared Code** - Write once, use across all platforms
4. **Offline Support** - Built-in with AsyncStorage + Supabase sync
5. **Scalable** - Can handle growth without major refactoring

## Estimated Setup Time

- Initial setup: 1-2 hours
- Core features: 4-6 hours
- Polish & testing: 2-3 hours
- **Total: ~8-12 hours** for MVP

