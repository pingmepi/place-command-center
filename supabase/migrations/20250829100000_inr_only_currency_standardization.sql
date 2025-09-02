-- Standardize platform on INR only
-- 1) Ensure default currency = 'INR' for events and payment_sessions
-- 2) Backfill any existing rows to INR
-- NOTE: We are intentionally not dropping columns to avoid breaking existing code paths.

-- Events table: set default and backfill
DO $$
BEGIN
  -- Set default to 'INR' if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'currency'
  ) THEN
    EXECUTE 'ALTER TABLE public.events ALTER COLUMN currency SET DEFAULT ''INR''';
    -- Backfill all rows to INR
    EXECUTE 'UPDATE public.events SET currency = ''INR'' WHERE currency IS DISTINCT FROM ''INR''';
  END IF;
END $$;

-- Payment sessions: set default and backfill
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_sessions' AND column_name = 'currency'
  ) THEN
    EXECUTE 'ALTER TABLE public.payment_sessions ALTER COLUMN currency SET DEFAULT ''INR''';
    EXECUTE 'UPDATE public.payment_sessions SET currency = ''INR'' WHERE currency IS DISTINCT FROM ''INR''';
  END IF;
END $$;

-- Optional: Add a check constraint to limit to INR only (safe only if no other values remain)
-- Commented out by default to avoid accidental breakage; uncomment if desired.
-- ALTER TABLE public.events ADD CONSTRAINT events_currency_inr_only CHECK (currency = 'INR') NOT VALID;
-- ALTER TABLE public.payment_sessions ADD CONSTRAINT payment_sessions_currency_inr_only CHECK (currency = 'INR') NOT VALID;
-- To validate later (after verifying data):
-- ALTER TABLE public.events VALIDATE CONSTRAINT events_currency_inr_only;
-- ALTER TABLE public.payment_sessions VALIDATE CONSTRAINT payment_sessions_currency_inr_only;

