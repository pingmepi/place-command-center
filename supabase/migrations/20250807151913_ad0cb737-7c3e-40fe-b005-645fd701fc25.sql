-- Phase 11: Advanced User Management - Fixed Role System Refactor

-- 1. Create enhanced role enum with more granular permissions
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'community_manager', 'event_organizer', 'user');

-- 2. Create user_roles table referencing our users table (not auth.users)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_by UUID REFERENCES public.users(id),
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create role checking function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 4. Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_highest_role(_user_id UUID DEFAULT auth.uid())
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'community_manager' THEN 3
      WHEN 'event_organizer' THEN 4
      WHEN 'user' THEN 5
    END
  LIMIT 1
$$;

-- 5. Create function to check if user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- 6. Create bulk operations log table
CREATE TABLE public.bulk_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL,
    initiated_by UUID REFERENCES public.users(id) NOT NULL,
    target_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    operation_data JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bulk_operations
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;

-- 7. Create user permissions table for granular permissions
CREATE TABLE public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    permission_type TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    granted_by UUID REFERENCES public.users(id),
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (user_id, permission_type, resource_type, resource_id)
);

-- Enable RLS on user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- 8. Create permission checking function
CREATE OR REPLACE FUNCTION public.has_permission(
    _user_id UUID,
    _permission_type TEXT,
    _resource_type TEXT DEFAULT NULL,
    _resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND permission_type = _permission_type
      AND (resource_type IS NULL OR resource_type = _resource_type)
      AND (resource_id IS NULL OR resource_id = _resource_id)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 9. Migrate existing user roles to new system
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role
FROM public.users
WHERE role IS NOT NULL;

-- 10. Create RLS policies for user_roles
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 11. Create RLS policies for bulk_operations
CREATE POLICY "Admins can manage bulk operations"
ON public.bulk_operations
FOR ALL
TO authenticated
USING (public.is_admin());

-- 12. Create RLS policies for user_permissions
CREATE POLICY "Admins can manage all user permissions"
ON public.user_permissions
FOR ALL
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can view their own permissions"
ON public.user_permissions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 13. Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_active ON public.user_roles(is_active) WHERE is_active = true;
CREATE INDEX idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX idx_user_permissions_type ON public.user_permissions(permission_type);
CREATE INDEX idx_bulk_operations_status ON public.bulk_operations(status);
CREATE INDEX idx_bulk_operations_initiated_by ON public.bulk_operations(initiated_by);

-- 14. Create trigger to update role timestamps
CREATE OR REPLACE FUNCTION public.update_role_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.granted_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_roles_timestamp
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_role_timestamp();