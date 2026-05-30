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

-- Recreate with secure, ownership-checking policies
CREATE POLICY "Users can delete own stories" ON public.travel_stories FOR DELETE USING (user_id = auth.uid()::TEXT);
CREATE POLICY "Users can unlike own stories" ON public.story_likes FOR DELETE USING (user_id = auth.uid()::TEXT);
CREATE POLICY "Users can delete own comments" ON public.story_comments FOR DELETE USING (user_id = auth.uid()::TEXT);
CREATE POLICY "Users can cancel own requests" ON public.trip_join_requests FOR DELETE USING (user_id = auth.uid()::TEXT);

-- Add missing DELETE policy for group_trips (restricting to host owner)
CREATE POLICY "Hosts can delete own trips" ON public.group_trips FOR DELETE USING (host_id = auth.uid()::TEXT);

SELECT 'Done! Secure owner-only delete policies applied to all community tables.' AS status;
