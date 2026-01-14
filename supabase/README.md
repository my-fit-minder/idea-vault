# Supabase Setup

This directory contains Supabase configuration and database migrations.

## Initial Setup

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to your project** (or create a new one):
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Run migrations**:
   ```bash
   supabase db push
   ```

## Local Development

To run Supabase locally:

```bash
supabase start
```

This will start:
- PostgreSQL database on port 54322
- Supabase Studio on http://localhost:54323
- API server on http://localhost:54321
- Realtime server on port 4000

## Migrations

Migrations are located in `migrations/` directory. The initial schema includes:
- `ideas` table with RLS policies
- Automatic `updated_at` timestamp trigger
- Indexes for performance

## Environment Variables

After linking your project, get your API keys from:
https://app.supabase.com/project/_/settings/api

Add them to your `.env` file (see root `.env.example`).
