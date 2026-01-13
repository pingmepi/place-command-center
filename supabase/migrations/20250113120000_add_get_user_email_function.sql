-- Create a function to get user email from auth.users
-- This is a security definer function that admins can call to get user emails
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT email
  FROM auth.users
  WHERE id = _user_id;
$$;

-- Grant execute permission to authenticated users (admins will use this)
GRANT EXECUTE ON FUNCTION public.get_user_email(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_user_email IS 'Returns the email address for a given user ID from auth.users. Only accessible to authenticated users.';

