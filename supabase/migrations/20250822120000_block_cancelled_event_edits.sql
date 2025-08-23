-- Enforce read-only state for cancelled events: prevent UPDATE and DELETE on cancelled rows
-- This preserves ability to cancel (update from is_cancelled = false -> true),
-- but blocks any subsequent modifications once cancelled.

-- Update policy: only allow updates on non-cancelled events by admins or event organizers
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
TO authenticated
USING (
  (public.is_admin() OR public.has_role(auth.uid(), 'event_organizer'))
  AND is_cancelled = false
);

-- Delete policy: only allow delete on non-cancelled events by admins
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
TO authenticated
USING (
  public.is_admin()
  AND is_cancelled = false
);

