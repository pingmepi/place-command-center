# Supabase Local Development Guide

This guide explains how to work with Supabase locally for this project.

## 🚀 Quick Start

### 1. Start Local Supabase

```bash
supabase start
```

This will:
- Start a local Postgres database on port `54322`
- Start local Supabase services (Auth, Storage, etc.)
- Apply all migrations from `supabase/migrations/`
- Start Supabase Studio on `http://127.0.0.1:54323`

### 2. Access Local Services

After starting, you'll have access to:

- **API URL**: http://127.0.0.1:54321
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio URL**: http://127.0.0.1:54323 (Database GUI)
- **Mailpit URL**: http://127.0.0.1:54324 (Email testing)

### 3. Run Your Application

Your `.env.local` file is already configured to use the local Supabase instance:

```bash
npm run dev
# or
npm start
```

## 📝 Database Migrations

### Create a New Migration

When you need to make database changes:

```bash
supabase migration new your_migration_name
```

This creates a new file in `supabase/migrations/`. Edit it with your SQL changes.

### Apply Migrations

```bash
# Reset database and apply all migrations (recommended during development)
supabase db reset

# Or just apply new migrations
supabase migration up
```

### Example Migration

```sql
-- supabase/migrations/20250104120000_add_users_table.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔄 Syncing with Remote

### Pull Changes from Remote

If someone else made changes to the remote database:

```bash
supabase db pull
```

This will create a new migration file with the remote changes.

### Push Changes to Remote

When you're ready to deploy your local changes:

```bash
supabase db push
```

**Note**: If you encounter connection issues with `supabase link`, you can push directly using the database URL:

```bash
# Get your database URL from Supabase Dashboard → Project Settings → Database
supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.ggochdssgkfnvcrrmtlp.supabase.co:5432/postgres"
```

## 🛠️ Useful Commands

```bash
# Check status of local Supabase
supabase status

# Stop local Supabase
supabase stop

# View database logs
supabase db logs

# Generate TypeScript types from your database schema
supabase gen types typescript --local > src/types/database.types.ts

# Open Supabase Studio in browser
open http://127.0.0.1:54323
```

## 🔍 Debugging

### View Database in Studio

Open http://127.0.0.1:54323 to:
- Browse tables
- Run SQL queries
- View logs
- Test RLS policies

### Connect with psql

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Reset Everything

If things get messy:

```bash
supabase db reset
```

This will drop all data and reapply all migrations from scratch.

## 📋 Workflow Example

Here's a typical workflow for adding a new feature:

1. **Start local Supabase**
   ```bash
   supabase start
   ```

2. **Create a migration for your database changes**
   ```bash
   supabase migration new add_events_table
   ```

3. **Edit the migration file** in `supabase/migrations/`
   ```sql
   CREATE TABLE events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **Apply the migration**
   ```bash
   supabase db reset
   ```

5. **Develop and test your feature locally**
   ```bash
   npm run dev
   ```

6. **When ready, push to remote**
   ```bash
   supabase db push
   ```

7. **Commit your migration files**
   ```bash
   git add supabase/migrations/
   git commit -m "Add events table"
   git push
   ```

## 🔐 Environment Variables

- **`.env.local`**: Local development (points to http://127.0.0.1:54321)
- **`.env`**: Production (points to your remote Supabase instance)

Make sure you're using `.env.local` for local development!

## 📚 Additional Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## ⚠️ Important Notes

1. **Never commit `.env` or `.env.local`** - These contain sensitive keys
2. **Always test migrations locally** before pushing to remote
3. **Use `supabase db reset`** frequently during development to ensure migrations work from scratch
4. **Commit migration files** to version control
5. **Update Supabase CLI regularly**: `brew upgrade supabase`

