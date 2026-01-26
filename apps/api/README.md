# Ideafy API

Express backend API for the Ideafy application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in this directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Ideas (requires authentication)
- `GET /api/ideas` - Get all ideas for the authenticated user
- `GET /api/ideas/:id` - Get a specific idea
- `POST /api/ideas` - Create a new idea
- `PUT /api/ideas/:id` - Update an idea
- `DELETE /api/ideas/:id` - Delete an idea

All endpoints require a `Authorization: Bearer <supabase_jwt_token>` header.

## Authentication

The API validates Supabase JWT tokens. Users authenticate through Supabase Auth on the client side, and the client sends the access token with each request.
