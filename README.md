# 1分鐘律師 (1 Minute Lawyer) - Setup Guide

## Prerequisites

1. Node.js 18+
2. Supabase account (https://supabase.com)
3. MiniMax API key (for AI analysis)

## Environment Setup

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `MINIMAX_API_KEY`: Your MiniMax API key (for Edge Function)

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration in `supabase/migrations/001_init.sql`

Or use the Supabase CLI:
```bash
supabase db push
```

## Supabase Edge Function Setup

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Deploy the edge function:
   ```bash
   supabase functions deploy ai-analysis
   ```

5. Set the MINIMAX_API_KEY secret:
   ```bash
   supabase secrets set MINIMAX_API_KEY=your_api_key
   ```

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Deployment to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS + PWA
- **Backend**: Supabase (Database + Edge Functions)
- **AI**: MiniMax API
- **Hosting**: Vercel

## API Endpoints

### POST /api/questions
Submit a legal question and get AI analysis.

Request:
```json
{
  "category": "family",
  "subcategory": "結婚/同居",
  "question_text": "我同男朋友分手..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "category": "family",
    "subcategory": "結婚/同居",
    "question_text": "...",
    "ai_response": {
      "analysis": "...",
      "relevant_laws": ["..."],
      "possible_outcomes": "...",
      "recommendation": "...",
      "disclaimer": "..."
    },
    "created_at": "2024-..."
  }
}
```

### GET /api/questions?id=uuid
Get a specific question by ID.

### POST /api/referrals
Submit a lawyer referral request.

Request:
```json
{
  "question_id": "uuid (optional)",
  "name": "張三",
  "contact": "電話或電郵",
  "preferred_lawyer": "katrina|kelly|mike"
}
```
