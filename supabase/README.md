# KoulutusBot Supabase Setup

This directory contains the database schema and configuration for KoulutusBot.

## Files

- `migrations/20250912000001_initial_schema.sql` - Initial database schema migration
- `seed.sql` - Sample data for development and testing
- `config.toml` - Supabase CLI configuration

## Quick Setup

### 1. Local Development

```bash
# Make sure you have Supabase CLI installed
npm install -g supabase

# Start local Supabase instance
npx supabase start

# Apply migrations
npx supabase db reset

# Or apply just the migration without resetting
npx supabase db migrate up
```

### 2. Production Deployment

```bash
# Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to production
npx supabase db push

# Optional: Apply seed data
npx supabase db reset --with-seed
```

## Database Schema Overview

### Tables

1. **profiles** - User profiles extending Supabase auth
   - Stores user metadata, credits, preferences
   - Automatically created via trigger on user signup

2. **educational_content** - Generated quizzes, courses, presentations
   - Main content storage with JSONB for flexible structure
   - Supports sharing settings and OPH curriculum alignment

3. **quiz_sessions** - Student quiz attempts and results
   - Tracks individual quiz sessions and responses
   - Linked to educational_content for analytics

4. **credit_transactions** - Credit usage tracking
   - Audit trail for all credit-based actions
   - Supports refunds and purchases

5. **content_templates** - Reusable educational patterns
   - Public templates for common educational formats
   - Community-shared educational structures

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Public content visible to all users
- Link-sharing support for controlled access

### Features

- Automatic profile creation on signup
- Timestamp tracking with auto-update triggers
- Optimized indexes for common queries
- JSONB storage for flexible content structures

## Development Workflow

1. Make schema changes in a new migration file
2. Test locally with `npx supabase start`
3. Apply with `npx supabase db migrate up`
4. When ready, push to production with `npx supabase db push`

## Environment Variables

Make sure these are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Useful Commands

```bash
# Reset database and apply all migrations + seed
npx supabase db reset

# Create a new migration
npx supabase migration new migration_name

# Generate TypeScript types
npx supabase gen types typescript --local > types/database.ts

# View database diff
npx supabase db diff

# Backup production database
npx supabase db dump --data-only -f backup.sql
```