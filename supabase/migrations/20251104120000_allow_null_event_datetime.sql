-- Allow null values for event date_time to support TBD events
-- The frontend already handles null values by displaying "TBD"

ALTER TABLE public.events 
ALTER COLUMN date_time DROP NOT NULL;

COMMENT ON COLUMN public.events.date_time IS 'Event date and time. NULL indicates TBD (To Be Determined).';

