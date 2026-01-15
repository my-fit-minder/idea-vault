# Shared Package

This package contains shared code used across both the mobile (Expo) and web (React) applications.

## Structure

- `src/services/` - Supabase client and API services
- `src/stores/` - Zustand state management stores
- `src/types/` - TypeScript type definitions
- `src/components/` - Shared React components (to be added)
- `src/hooks/` - Shared React hooks (to be added)
- `src/utils/` - Utility functions (to be added)

## Usage

Import from the shared package:

```typescript
import { supabase, useAuthStore, type Idea } from '@idea-vault/shared';
```

## Setup

1. Install dependencies: `npm install`
2. Set environment variables (see root `.env.example`)
3. The package is ready to use in both mobile and web apps
