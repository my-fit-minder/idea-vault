# Setup Guide

This guide will help you set up the Idea Vault project with Supabase, shared package, and authentication.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier works)

## Step 1: Supabase Project Setup

1. **Create a Supabase project**:
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in project details and wait for it to be ready

2. **Get your API credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon public` key

3. **Set up environment variables**:
   - Create `.env` files in both `apps/mobile/` and `apps/web/`
   - For mobile (Expo), add:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```
   - For web (Vite), add:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Run database migrations**:
   ```bash
   # Install Supabase CLI (if not installed)
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

   Alternatively, you can run the SQL migration manually:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run

## Step 2: Install Dependencies

```bash
# Install shared package dependencies
cd packages/shared
npm install

# Install mobile app dependencies
cd ../../apps/mobile
npm install

# Install web app dependencies
cd ../web
npm install
```

## Step 3: Verify Setup

### Test Supabase Connection

The shared package includes a Supabase client that will automatically use your environment variables.

### Test Authentication

The authentication store is ready to use. Initialize it in your app:

```typescript
import { useAuthStore } from '@idea-vault/shared';

// In your app initialization
const { initialize } = useAuthStore();
await initialize();
```

## Project Structure

```
idea-vault/
├── apps/
│   ├── mobile/          # Expo app
│   └── web/             # React web app
├── packages/
│   └── shared/          # Shared code
│       ├── src/
│       │   ├── services/    # Supabase client, auth functions
│       │   ├── stores/      # Zustand stores
│       │   ├── types/       # TypeScript types
│       │   ├── components/  # Shared components (to be added)
│       │   ├── hooks/       # Shared hooks (to be added)
│       │   └── utils/       # Utility functions (to be added)
│       └── package.json
└── supabase/
    ├── migrations/      # Database migrations
    └── config.toml      # Supabase config
```

## Next Steps

1. Set up authentication UI in both apps
2. Create idea CRUD operations
3. Implement offline storage
4. Build sync mechanism

## Troubleshooting

- **"Supabase URL and Anon Key are not set"**: Make sure your `.env` files are in the correct locations and have the right variable names
- **Database errors**: Ensure migrations have been run successfully
- **Type errors**: Run `npm install` in the shared package to ensure types are available
