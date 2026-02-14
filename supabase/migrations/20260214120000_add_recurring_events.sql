-- Migration: Add recurring events support to events table
-- Created: 2026-02-14
-- Description: Adds columns needed for recurring event templates and child instances.
--   Parent events (is_recurring_parent=true) act as templates and hold recurrence config.
--   Child events are fully independent rows with parent_event_id pointing back to the template.

-- 1. Add recurrence columns to events table
ALTER TABLE public.events
  ADD COLUMN is_recurring_parent boolean NOT NULL DEFAULT false,
  ADD COLUMN parent_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  ADD COLUMN recurrence_pattern text CHECK (
    recurrence_pattern IN ('daily', 'weekly', 'monthly', 'custom')
  ),
  ADD COLUMN recurrence_frequency integer DEFAULT 1 CHECK (recurrence_frequency > 0),
  ADD COLUMN recurrence_days_of_week integer[] CHECK (
    recurrence_days_of_week <@ ARRAY[0,1,2,3,4,5,6]
  ),
  ADD COLUMN recurrence_day_of_month integer CHECK (
    recurrence_day_of_month BETWEEN 1 AND 31
  ),
  ADD COLUMN recurrence_end_type text CHECK (
    recurrence_end_type IN ('date', 'count', 'never')
  ),
  ADD COLUMN recurrence_end_date timestamptz,
  ADD COLUMN recurrence_count integer CHECK (recurrence_count > 0),
  ADD COLUMN recurrence_metadata jsonb,
  ADD COLUMN series_index integer CHECK (series_index > 0);

-- 2. Index for fast child lookup by parent
CREATE INDEX idx_events_parent_event_id ON public.events(parent_event_id)
  WHERE parent_event_id IS NOT NULL;

-- 3. Index for filtering out template events in public queries
CREATE INDEX idx_events_is_recurring_parent ON public.events(is_recurring_parent)
  WHERE is_recurring_parent = true;

-- 4. Constraint: only parent events should have recurrence config populated
ALTER TABLE public.events
  ADD CONSTRAINT chk_recurrence_config CHECK (
    (is_recurring_parent = true AND recurrence_pattern IS NOT NULL)
    OR (is_recurring_parent = false)
  );

-- 5. Existing RLS policies apply automatically to new columns (no changes needed)

