-- Replace this email with your administrator account email after the user signs up.
-- Run this in Supabase SQL Editor.
update public.profiles
set role = 'admin', full_name = coalesce(full_name, '教务管理员')
where email = 'admin@example.com';
