# Ideafy - Web Application

React web application for the Ideafy project, built with Vite, TypeScript, and modern React patterns.

## Features

- 🔐 **Authentication** - Secure login/signup with Supabase Auth
- 💡 **Idea Management** - Create, edit, delete, and view ideas
- 🔍 **Search & Filter** - Search ideas by title, content, or tags
- 🏷️ **Tags System** - Organize ideas with custom tags
- 📱 **Offline Support** - Works offline with automatic sync when online
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Supabase Auth** - Authentication
- **Express API** - Backend communication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see `apps/api/README.md`)
- Supabase project configured

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:3001
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to http://localhost:5173
   - Sign up for a new account or sign in

## Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
apps/web/
├── src/
│   ├── components/      # React components
│   │   ├── AuthPage.tsx      # Login/signup page
│   │   ├── IdeasApp.tsx      # Main app container
│   │   ├── IdeasList.tsx     # Ideas list view
│   │   ├── IdeaEditor.tsx    # Create/edit form
│   │   └── IdeaDetail.tsx    # Idea detail view
│   ├── App.tsx          # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
└── vite.config.ts        # Vite configuration
```

## Architecture

### Authentication Flow

1. User signs up/logs in via Supabase Auth (client-side)
2. Supabase returns JWT access token
3. Token is stored in localStorage
4. All API requests include token in `Authorization: Bearer <token>` header
5. Backend validates token and processes request

### Offline Support

- **Local Storage**: Ideas are cached in localStorage
- **Sync Queue**: Offline operations are queued
- **Auto Sync**: When connection is restored, queued operations sync automatically
- **Status Indicator**: Shows online/offline status in header

### API Integration

The app communicates with the Express backend API:
- `GET /api/ideas` - Fetch all ideas
- `GET /api/ideas/:id` - Get specific idea
- `POST /api/ideas` - Create new idea
- `PUT /api/ideas/:id` - Update idea
- `DELETE /api/ideas/:id` - Delete idea

All requests are authenticated with Supabase JWT tokens.

## Shared Package

The app uses `@idea-vault/shared` package for:
- Type definitions (`Idea`, `User`, etc.)
- API client (`apiClient`)
- Auth utilities (`signIn`, `signUp`, `signOut`)
- Offline storage and sync services
- Zustand stores (`useAuthStore`)

## Development

### Hot Module Replacement

Vite provides instant HMR. Changes to components will update immediately without losing state.

### TypeScript

The project uses strict TypeScript. All components and utilities are fully typed.

### Styling

- CSS modules or regular CSS files
- Responsive design with mobile-first approach
- Modern CSS features (flexbox, grid, custom properties)

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables

### Other Platforms

Any static hosting service that supports Node.js build processes will work. Make sure to:
- Set all `VITE_*` environment variables
- Point `VITE_API_URL` to your production backend URL

## Troubleshooting

### "Failed to load ideas"
- Ensure backend API is running
- Check `VITE_API_URL` in `.env`
- Verify backend is accessible from browser

### "Authentication failed"
- Verify Supabase credentials in `.env`
- Check Supabase project is active
- Ensure email confirmation is disabled (or confirm email)

### "Module not found: @idea-vault/shared"
- Run `npm install` in `packages/shared` first
- Verify the shared package is linked correctly
- Check `package.json` has correct file path

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build` (shows type errors)
- Verify all environment variables are set

## License

MIT
