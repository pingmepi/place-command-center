// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Read from Vite environment variables.
// Ensure you define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env files.
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const SUPABASE_URL = rawUrl;
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Fail fast in development if env vars are missing; in production this should also be configured.
  throw new Error("Supabase env missing. Set VITE_SUPABASE_URL (e.g., https://your-ref.supabase.co) and VITE_SUPABASE_ANON_KEY.");
}

// Validate URL format early to provide clear guidance (common mistake: missing https:// or using db.*)
try {
  const u = new URL(SUPABASE_URL);
  if (u.protocol !== 'https:') {
    throw new Error('Supabase URL must start with https://');
  }
  if (u.hostname.startsWith('db.')) {
    throw new Error('Supabase URL should be https://<ref>.supabase.co, not db.<ref>.supabase.co');
  }
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  throw new Error(`Invalid VITE_SUPABASE_URL: ${msg}`);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});