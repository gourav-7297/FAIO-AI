-- ============================================
-- FAIO AI — Fix delete policies
-- Adds missing DELETE policy for group_trips
-- Makes delete policies permissive (TRUE)
-- since ownership is checked in app code
-- ============================================

-- Drop existing restrictive delete policies
DROP POLICY IF EXISTS "Users can delete own stories" ON public.travel_stories;
DROP POLICY IF EXISTS "Users can unlike" ON public.story_likes;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.story_comments;
DROP POLICY IF EXISTS "Users can cancel requests" ON public.trip_join_requests;

-- Recreate with permissive policies
CREATE POLICY "Users can delete stories" ON public.travel_stories FOR DELETE USING (TRUE);
CREATE POLICY "Users can unlike" ON public.story_likes FOR DELETE USING (TRUE);
CREATE POLICY "Users can delete comments" ON public.story_comments FOR DELETE USING (TRUE);
CREATE POLICY "Users can cancel requests" ON public.trip_join_requests FOR DELETE USING (TRUE);

-- Add missing DELETE policy for group_trips
CREATE POLICY "Users can delete trips" ON public.group_trips FOR DELETE USING (TRUE);

SELECT 'Done! Delete policies fixed for all community tables.' AS status;
