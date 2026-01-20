# Setup Guide - Idea Vault

Complete setup instructions for running the Idea Vault application.

## Step 1: Supabase Configuration

1. **Create a Supabase Project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in project details and wait for it to be ready

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` key (keep this secret!)

3. **Configure Google OAuth (Optional but Recommended)**
   - Go to Project Settings → Authentication → Providers
   - Enable the "Google" provider
   - You'll need to:
     - Create a Google OAuth application at https://console.cloud.google.com/apis/credentials
     - Add your Supabase redirect URL: `https://your-project.supabase.co/auth/v1/callback`
     - Copy the Client ID and Client Secret from Google
     - Paste them into Supabase's Google provider settings
   - Save the configuration

4. **Run Database Migration**
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

   Or manually run the SQL in `supabase/migrations/001_initial_schema.sql` via the Supabase SQL Editor.

## Step 2: Backend Setup

1. **Navigate to API directory**
   ```bash
   cd apps/api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend**
   ```bash
   npm run dev
   ```

   You should see: `🚀 Server running on http://localhost:3001`

## Step 3: Web App Setup

1. **Navigate to web directory**
   ```bash
   cd apps/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_API_URL=http://localhost:3001
   ```

4. **Start the web app**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to http://localhost:5173
   - Sign up for a new account or sign in

## Step 4: Verify Everything Works

1. **Backend Health Check**
   - Visit http://localhost:3001/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Web App**
   - Should show login/signup page
   - Create an account
   - Create your first idea!

## Troubleshooting

### Backend Issues

- **"Missing Supabase environment variables"**
  - Check that your `.env` file exists in `apps/api/`
  - Verify all three Supabase variables are set

- **"Port already in use"**
  - Change `PORT` in `.env` to a different port (e.g., 3002)
  - Update `VITE_API_URL` in web app `.env` to match

### Web App Issues

- **"Failed to load ideas"**
  - Make sure the backend is running
  - Check browser console for CORS errors
  - Verify `VITE_API_URL` matches backend port

- **"Authentication failed"**
  - Verify Supabase credentials in `.env`
  - Check that Supabase project is active

### Database Issues

- **"Table 'ideas' does not exist"**
  - Run the migration: `supabase db push`
  - Or manually run SQL from `supabase/migrations/001_initial_schema.sql`

## Development Workflow

1. Start backend: `cd apps/api && npm run dev`
2. Start web app: `cd apps/web && npm run dev`
3. Make changes and see them hot-reload
4. Check browser console and backend logs for errors

## Production Deployment

For production:
1. Set `NODE_ENV=production` in backend `.env`
2. Build web app: `cd apps/web && npm run build`
3. Deploy backend to a hosting service (Railway, Render, etc.)
4. Deploy web app to Vercel, Netlify, etc.
5. Update environment variables in production
