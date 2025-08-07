-- Add status field to flags table to track flag state
CREATE TYPE flag_status AS ENUM ('open', 'resolved', 'urgent');

-- Add status column with default value 'open'
ALTER TABLE public.flags 
ADD COLUMN status flag_status NOT NULL DEFAULT 'open';

-- Add resolved_at and resolved_by columns for audit trail
ALTER TABLE public.flags 
ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN resolved_by UUID REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX idx_flags_status ON public.flags(status);
CREATE INDEX idx_flags_created_at ON public.flags(created_at);