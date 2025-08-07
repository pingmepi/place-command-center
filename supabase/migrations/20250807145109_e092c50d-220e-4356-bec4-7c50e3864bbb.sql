-- Create storage buckets for different entities
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('user-avatars', 'user-avatars', true),
  ('community-images', 'community-images', true),
  ('event-images', 'event-images', true);

-- Add image_url column to events table
ALTER TABLE public.events ADD COLUMN image_url TEXT;

-- Create RLS policies for user avatars bucket
CREATE POLICY "User avatars are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for community images bucket
CREATE POLICY "Community images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'community-images');

CREATE POLICY "Admins can upload community images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'community-images' 
  AND get_user_role() = 'admin'::user_role
);

CREATE POLICY "Admins can update community images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'community-images' 
  AND get_user_role() = 'admin'::user_role
);

CREATE POLICY "Admins can delete community images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'community-images' 
  AND get_user_role() = 'admin'::user_role
);

-- Create RLS policies for event images bucket
CREATE POLICY "Event images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-images');

CREATE POLICY "Admins can upload event images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'event-images' 
  AND get_user_role() = 'admin'::user_role
);

CREATE POLICY "Admins can update event images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'event-images' 
  AND get_user_role() = 'admin'::user_role
);

CREATE POLICY "Admins can delete event images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'event-images' 
  AND get_user_role() = 'admin'::user_role
);