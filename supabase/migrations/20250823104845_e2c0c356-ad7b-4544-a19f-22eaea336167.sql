-- Fix infinite recursion by creating security definer functions
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_members
    WHERE user_id = _user_id 
    AND community_id = _community_id
  );
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = _user_id 
    AND role = 'admin'
  );
$$;

-- Drop existing problematic policies on community_members
DROP POLICY IF EXISTS "Users can view members of joined communities only" ON public.community_members;

-- Create new simplified policy for community_members viewing
CREATE POLICY "Members can view community members or admins can view all"
ON public.community_members
FOR SELECT
USING (
  public.is_admin_user() OR 
  public.is_community_member(auth.uid(), community_id)
);

-- Update events policies to allow public viewing but restrict actions to community members
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events"
ON public.events
FOR SELECT
USING (true);

-- Update discussions policies to restrict viewing to community members only
DROP POLICY IF EXISTS "Anyone can view visible discussions" ON public.discussions;
CREATE POLICY "Community members can view discussions or admins can view all"
ON public.discussions
FOR SELECT
USING (
  public.is_admin_user() OR 
  public.is_community_member(auth.uid(), community_id)
);

-- Update discussion comments policy to use the new function
DROP POLICY IF EXISTS "Anyone can view comments on visible discussions" ON public.discussion_comments;
CREATE POLICY "Community members can view comments or admins can view all"
ON public.discussion_comments
FOR SELECT
USING (
  public.is_admin_user() OR 
  EXISTS (
    SELECT 1
    FROM public.discussions d
    WHERE d.id = discussion_comments.discussion_id
    AND public.is_community_member(auth.uid(), d.community_id)
  )
);

-- Ensure event registrations require community membership
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
CREATE POLICY "Community members can register for events"
ON public.event_registrations
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = event_id
    AND public.is_community_member(auth.uid(), e.community_id)
  )
);