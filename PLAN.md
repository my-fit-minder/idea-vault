# Cross-Platform Idea Vault App

## Technology Stack

### Frontend (Cross-Platform)

- **Expo (React Native)** - Primary framework for iOS and Android apps
- **React** - For web app (can share components with Expo)
- **TypeScript** - Type safety across all platforms
- **React Native Web** - Share components between mobile and web

### Backend & Services

- **Node.js + Express** - Primary backend API that talks to the database and exposes REST/JSON endpoints to all UIs.
- **Supabase (PostgreSQL + Auth)**:
  - PostgreSQL database (structured storage for ideas)
  - Authentication (multi-user support; UI talks directly to Supabase Auth)
  - Row Level Security (RLS) for data isolation
  - SQL migrations (versioned schema in `supabase/migrations`)

## Backend & API Design

- **Database**: PostgreSQL managed by Supabase, with schema defined via SQL migrations in `supabase/migrations`.
- **Auth**:
  - Supabase Auth handles user registration, login, and session tokens (handled on the client).
  - The backend receives and validates Supabase JWTs on every request (no custom user table in the backend).
- **Primary table**: `ideas` – one row per idea, owned by a specific user.
- **Access control**:
  - RLS policies in Supabase ensure that users can only access their own ideas.
  - Express middleware validates the Supabase JWT and passes `userId` through the request context.
- **API layer (Express)**:
  - The apps call the Express backend (e.g. `/api/ideas`) instead of talking directly to the database.
  - Express uses the Supabase server client (or pg driver) to run database queries.
  - All non-auth business logic (validation, mapping, future integrations) lives in the backend, not in the UI.

### Backend Project Shape (Express)

- `apps/api/` (or similar) for the Node.js/Express service:
  - `src/index.ts` – Express app bootstrap.
  - `src/routes/ideas.ts` – CRUD routes for ideas.
  - `src/middleware/auth.ts` – Supabase JWT verification, attaches `req.user`.
  - `src/services/ideasService.ts` – business logic for ideas (called by routes).
  - `src/clients/supabaseClient.ts` – configured Supabase server client.

### Core Backend Entities

- **Table: `ideas`**

  - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `title TEXT NOT NULL`
  - `content TEXT`
  - `tags TEXT[] DEFAULT ARRAY[]::TEXT[]`
  - `created_at TIMESTAMPTZ DEFAULT NOW()`
  - `updated_at TIMESTAMPTZ DEFAULT NOW()`
  - `synced_at TIMESTAMPTZ`

- **Triggers & Functions**

  - `update_updated_at_column()` – trigger function that automatically updates `updated_at` on every row update.

- **RLS Policies on `ideas`**
  - Select: user can read only rows where `auth.uid() = user_id`.
  - Insert: user can insert rows only when `auth.uid() = user_id`.
  - Update: user can update rows only when `auth.uid() = user_id`.
  - Delete: user can delete rows only when `auth.uid() = user_id`.

### Application → Backend Flows

- **Authentication (only part that talks directly to Supabase from the UI)**

  - User signs up / logs in via Supabase Auth SDK in the client.
  - Client stores Supabase session (access token + refresh token).
  - For all subsequent API calls, client sends the Supabase access token in the `Authorization: Bearer <token>` header to the Express backend.

- **Create Idea**

  - App collects `title`, `content`, `tags`.
  - Sends `POST /api/ideas` to Express with JSON body.
  - Auth middleware validates the Supabase JWT, extracts `userId`.
  - Backend creates a new row in `ideas` with `user_id = userId`.
  - DB sets `id`, `created_at`, `updated_at`.

- **Read Ideas**

  - App calls `GET /api/ideas`.
  - Backend queries `ideas` filtered by `user_id = userId`, ordered by `created_at DESC`.
  - RLS still provides an additional safety net.

- **Update Idea**

  - App calls `PUT /api/ideas/:id` with updated fields.
  - Backend checks ownership (via `userId`) and updates the row.
  - Trigger updates `updated_at`.

- **Delete Idea**

  - App calls `DELETE /api/ideas/:id`.
  - Backend checks ownership and deletes the row.

- **Realtime / Sync**
  - Phase 1: Sync via periodic polling or manual refresh (backend still the only path to the DB).
  - Phase 2 (optional): Add Supabase Realtime on the backend side and push updates to clients (e.g. via WebSockets or SSE).

### State Management & Storage

- **Zustand** or **React Context** - Lightweight state management
- **@react-native-async-storage/async-storage** - Local storage for offline support
- **Supabase Realtime** - Automatic sync when connection is restored

### UI Components

- **NativeBase** - Cross-platform UI component library
- **React Native Reanimated** - Smooth animations

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                         User Devices                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │   Web    │    │ Android  │    │   iOS    │               │
│  │  (React) │    │  (Expo)  │    │  (Expo)  │               │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘               │
│       │               │               │                      │
│       └───────────────┼───────────────┘                      │
│                       │                                      │
│                ┌──────▼──────┐                               │
│                │  Shared     │                               │
│                │  UI Logic   │                               │
│                └──────┬──────┘                               │
└───────────────────────┼──────────────────────────────────────┘
                        │  HTTPS (JSON APIs)
                        ▼
                ┌────────────────┐
                │  Express API   │
                │ (Node.js)      │
                └──────┬─────────┘
                       │
             ┌─────────┼───────────────┐
             │                         │
       ┌─────▼─────┐             ┌─────▼─────┐
       │  Supabase │             │ PostgreSQL│
       │   Auth    │             │  (Supabase)
       └───────────┘             └───────────┘
```

- UIs only talk **directly** to Supabase for authentication.
- All idea data and future business logic go through the **Express API**, which talks to the Supabase PostgreSQL database.

## Project Structure

```
idealot/
├── apps/
│   ├── mobile/              # Expo app (iOS + Android)
│   │   ├── app.json
│   │   ├── App.tsx
│   │   └── src/
│   ├── web/                 # React web app
│   │   ├── index.html
│   │   └── src/
│   └── api/                 # Node.js + Express backend
│       ├── src/
│       │   ├── index.ts     # Express app bootstrap
│       │   ├── routes/
│       │   │   └── ideas.ts
│       │   ├── middleware/
│       │   │   └── auth.ts  # Supabase JWT validation
│       │   ├── services/
│       │   │   └── ideasService.ts
│       │   └── clients/
│       │       └── supabaseClient.ts
│       └── package.json
├── packages/
│   └── shared/              # Shared code between platforms
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       ├── services/        # API client for talking to Express
│       ├── types/           # TypeScript types
│       └── utils/           # Utility functions
├── supabase/
│   └── migrations/          # Database schema migrations
└── package.json             # Monorepo root
```

## Database Schema (Summary)

- **Schema managed via SQL migration** in `supabase/migrations/001_initial_schema.sql`.
- Matches the `ideas` table and policies described above.

## Key Features Implementation

### 1. Offline-First Architecture

- Store ideas locally using AsyncStorage when offline
- Queue sync operations when connection is restored
- Show sync status indicator in UI

### 2. Real-time Sync (Later Phase)

- Phase 1: Simple sync via Express API (polling/manual refresh).
- Phase 2: Add realtime updates (WebSockets/SSE) from Express, optionally backed by Supabase Realtime.

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

- Initialize Expo project (mobile)
- Initialize React web project
- Set up Supabase project and database schema
- Initialize Express backend (`apps/api`) with TypeScript, ESLint, etc.
- Configure shared package structure
- Set up authentication flow (Supabase Auth in clients + JWT verification middleware in backend)

### Phase 2: Core Features

- Implement backend CRUD endpoints for ideas (`/api/ideas`, `/api/ideas/:id`)
- Wire mobile + web apps to use the Express API (not DB directly)
- Implement local storage for offline support
- Build basic sync mechanism (API-based)
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
4. **Setup Express Backend** - Create `apps/api` with Express, TypeScript, and basic health check route
5. **Shared Package** - Set up shared package structure for code reuse across platforms (types, API client, utilities)
6. **Auth Flow** - Implement Supabase-based authentication in clients + JWT verification middleware in backend
7. **Idea CRUD API** - Implement backend endpoints for ideas and connect them to the Supabase database
8. **Client Integration** - Wire mobile and web apps to call the Express API for idea operations
9. **Offline Storage** - Implement local storage with AsyncStorage for offline support
10. **Sync Mechanism** - Build sync mechanism to merge local and remote changes when online (via backend)
11. **UI Components** - Create reusable UI components (idea cards, forms, navigation)
12. **Tags & Filtering** - Implement tags system and filtering functionality

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
