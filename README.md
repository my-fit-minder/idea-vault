# Idea Vault

A cross-platform idea management application with offline support, built with React, Express, and Supabase.

## Features

- 💡 Create, edit, and delete ideas
- 🔍 Search and filter ideas
- 🏷️ Tag system for organization
- 📱 Offline support with automatic sync
- 🔐 Secure authentication with Supabase
- 🎨 Beautiful, modern UI

## Project Structure

```
idealot/
├── apps/
│   ├── api/          # Express backend API
│   ├── mobile/       # Expo mobile app (not actively developed)
│   └── web/          # React web application
├── packages/
│   └── shared/       # Shared code (types, services, stores)
└── supabase/
    └── migrations/   # Database migrations
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 1. Supabase Setup

1. Create a Supabase project at https://app.supabase.com
2. Get your project credentials:
   - Project URL
   - Anon key
   - Service role key (for backend)
3. Run the database migration:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

### 2. Backend Setup

1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the backend:
   ```bash
   npm run dev
   ```

### 3. Web App Setup

1. Navigate to the web directory:
   ```bash
   cd apps/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:3001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

### 4. Shared Package

The shared package needs to be installed in the web app. If using npm workspaces, it should be handled automatically. Otherwise:

```bash
cd packages/shared
npm install
```

## Development

### Running Everything

1. Start the backend (in `apps/api`):
   ```bash
   npm run dev
   ```

2. Start the web app (in `apps/web`):
   ```bash
   npm run dev
   ```

### Architecture

- **Frontend**: React web app that communicates with Express API
- **Backend**: Express API that validates Supabase JWTs and queries PostgreSQL
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth (client-side only, backend validates tokens)
- **Offline**: LocalStorage + sync queue for offline operations

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State Management**: Zustand
- **Styling**: CSS (modern, responsive design)

## License

MIT
