-- Create system settings table for app-wide configuration (e.g., currency)
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone not null default now(),
  updated_by uuid references auth.users(id)
);

comment on table public.system_settings is 'Key/value store for global app settings (e.g., { key: "currency", value: { code: "INR" } })';

-- Seed default currency = INR if not present
insert into public.system_settings(key, value)
values ('currency', '{"code":"INR"}'::jsonb)
on conflict (key) do nothing;

-- Enable RLS and add policies
alter table public.system_settings enable row level security;

-- Allow anyone authenticated to read settings
create policy "Allow read settings to authenticated"
  on public.system_settings for select
  to authenticated
  using (true);

-- Only admins can insert/update/delete settings
create policy "Admins manage settings"
  on public.system_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

