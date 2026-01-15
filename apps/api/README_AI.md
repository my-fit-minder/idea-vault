# AI Report Generation Setup

## Gemini API Configuration

To enable AI report generation, you need to:

1. **Get a Gemini API Key**:
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy the API key

2. **Add to `.env` file**:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Install dependencies** (if not already installed):
   ```bash
   cd apps/api
   npm install
   ```

## API Endpoint

- **POST** `/api/ideas/:id/generate-report`
  - Requires authentication
  - Generates an AI report using Gemini API
  - Returns: `{ report: string, idea: Idea }`
  - The report is automatically saved to the idea's `ai_report` field

## Customizing the Prompt

Edit `apps/api/src/services/aiService.ts` and modify the `buildPrompt()` method to customize the prompt sent to Gemini.

## Database Migration

Run the migration to add the `ai_report` column:

```bash
supabase db push
```

Or manually run the SQL in `supabase/migrations/003_add_ai_report.sql`
