-- ============================================
-- FAIO AI — Add missing columns
-- Adds user_name, user_avatar to stories,
-- host_name, host_avatar, description to trips
-- Run this in Supabase SQL Editor
-- ============================================

-- travel_stories: Add user_name and user_avatar columns
ALTER TABLE public.travel_stories ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT '';
ALTER TABLE public.travel_stories ADD COLUMN IF NOT EXISTS user_avatar TEXT DEFAULT '';

-- group_trips: Add host_name, host_avatar, and description columns
ALTER TABLE public.group_trips ADD COLUMN IF NOT EXISTS host_name TEXT DEFAULT '';
ALTER TABLE public.group_trips ADD COLUMN IF NOT EXISTS host_avatar TEXT DEFAULT '';
ALTER TABLE public.group_trips ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- story_comments: Add user_name and user_avatar columns
ALTER TABLE public.story_comments ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT '';
ALTER TABLE public.story_comments ADD COLUMN IF NOT EXISTS user_avatar TEXT DEFAULT '';

SELECT 'Done! Added user_name, user_avatar, host_name, host_avatar, description columns.' AS status;
