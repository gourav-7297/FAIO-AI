-- ============================================
-- FAIO AI — Firebase UID Fix (v3)
-- Step 1: Drop ALL policies on ALL tables
-- Step 2: Alter ALL columns
-- Step 3: Recreate ALL policies
-- ============================================

-- ========== STEP 1: DROP ALL POLICIES ==========

DO $$ 
DECLARE pol RECORD;
BEGIN
  -- travel_stories
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'travel_stories' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.travel_stories', pol.policyname);
  END LOOP;
  -- group_trips
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'group_trips' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_trips', pol.policyname);
  END LOOP;
  -- story_likes
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'story_likes' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.story_likes', pol.policyname);
  END LOOP;
  -- story_comments
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'story_comments' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.story_comments', pol.policyname);
  END LOOP;
  -- trip_join_requests
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'trip_join_requests' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.trip_join_requests', pol.policyname);
  END LOOP;
END $$;

-- Disable RLS on all tables
ALTER TABLE public.travel_stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_join_requests DISABLE ROW LEVEL SECURITY;


-- ========== STEP 2: ALTER ALL COLUMNS ==========

-- travel_stories.user_id
ALTER TABLE public.travel_stories DROP CONSTRAINT IF EXISTS travel_stories_user_id_fkey;
ALTER TABLE public.travel_stories ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- group_trips.host_id
ALTER TABLE public.group_trips DROP CONSTRAINT IF EXISTS group_trips_host_id_fkey;
ALTER TABLE public.group_trips ALTER COLUMN host_id TYPE TEXT USING host_id::TEXT;

-- story_likes.user_id
ALTER TABLE public.story_likes DROP CONSTRAINT IF EXISTS story_likes_user_id_fkey;
ALTER TABLE public.story_likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- story_comments.user_id
ALTER TABLE public.story_comments DROP CONSTRAINT IF EXISTS story_comments_user_id_fkey;
ALTER TABLE public.story_comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- trip_join_requests.user_id
ALTER TABLE public.trip_join_requests DROP CONSTRAINT IF EXISTS trip_join_requests_user_id_fkey;
ALTER TABLE public.trip_join_requests ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;


-- ========== STEP 3: RE-ENABLE RLS & CREATE POLICIES ==========

ALTER TABLE public.travel_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_join_requests ENABLE ROW LEVEL SECURITY;

-- travel_stories
CREATE POLICY "Anyone can view stories" ON public.travel_stories FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can create stories" ON public.travel_stories FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can update own stories" ON public.travel_stories FOR UPDATE USING (user_id = auth.uid()::TEXT);
CREATE POLICY "Users can delete own stories" ON public.travel_stories FOR DELETE USING (user_id = auth.uid()::TEXT);

-- group_trips
CREATE POLICY "Anyone can view trips" ON public.group_trips FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can create trips" ON public.group_trips FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Hosts can update trips" ON public.group_trips FOR UPDATE USING (host_id = auth.uid()::TEXT);

-- story_likes
CREATE POLICY "Anyone can view likes" ON public.story_likes FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can like" ON public.story_likes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can unlike" ON public.story_likes FOR DELETE USING (user_id = auth.uid()::TEXT);

-- story_comments
CREATE POLICY "Anyone can view comments" ON public.story_comments FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can comment" ON public.story_comments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can delete own comments" ON public.story_comments FOR DELETE USING (user_id = auth.uid()::TEXT);

-- trip_join_requests
CREATE POLICY "Anyone can view requests" ON public.trip_join_requests FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can request to join" ON public.trip_join_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can cancel requests" ON public.trip_join_requests FOR DELETE USING (user_id = auth.uid()::TEXT);
CREATE POLICY "Anyone can update requests" ON public.trip_join_requests FOR UPDATE USING (TRUE);

SELECT 'Done! All user_id/host_id columns changed to TEXT.' AS status;
