-- ============================================
-- FAIO AI — Community Feature Migration
-- Creates tables for likes, comments, join requests
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Story Likes (per-user like tracking)
CREATE TABLE IF NOT EXISTS public.story_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.travel_stories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.story_likes
    FOR SELECT USING (TRUE);
CREATE POLICY "Users can like" ON public.story_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.story_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 2. Story Comments
CREATE TABLE IF NOT EXISTS public.story_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.travel_stories(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.story_comments
    FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can comment" ON public.story_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.story_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Trip Join Requests
CREATE TABLE IF NOT EXISTS public.trip_join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

ALTER TABLE public.trip_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view join requests" ON public.trip_join_requests
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IN (SELECT host_id FROM public.group_trips WHERE id = trip_id)
    );
CREATE POLICY "Users can request to join" ON public.trip_join_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Hosts can update requests" ON public.trip_join_requests
    FOR UPDATE USING (
        auth.uid() IN (SELECT host_id FROM public.group_trips WHERE id = trip_id)
    );
CREATE POLICY "Users can cancel own requests" ON public.trip_join_requests
    FOR DELETE USING (auth.uid() = user_id);

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_story_likes_story ON public.story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_user ON public.story_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story ON public.story_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_trip_join_requests_trip ON public.trip_join_requests(trip_id);

SELECT 'Community migration complete! story_likes, story_comments, trip_join_requests created.' AS status;
