-- ============================================
-- FAIO AI — Atomic Community Interactions
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Toggle Story Like Function
CREATE OR REPLACE FUNCTION public.toggle_story_like(p_story_id UUID, p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if like already exists
    SELECT EXISTS (
        SELECT 1 FROM public.story_likes 
        WHERE story_id = p_story_id AND user_id = p_user_id
    ) INTO v_exists;

    IF v_exists THEN
        -- Unlike: remove row and decrement likes count
        DELETE FROM public.story_likes 
        WHERE story_id = p_story_id AND user_id = p_user_id;
        
        UPDATE public.travel_stories 
        SET likes = GREATEST(0, COALESCE(likes, 1) - 1)
        WHERE id = p_story_id;
        
        RETURN FALSE; -- Means not liked now
    ELSE
        -- Like: insert row and increment likes count
        INSERT INTO public.story_likes (story_id, user_id)
        VALUES (p_story_id, p_user_id);
        
        UPDATE public.travel_stories 
        SET likes = COALESCE(likes, 0) + 1
        WHERE id = p_story_id;
        
        RETURN TRUE; -- Means liked now
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add Story Comment Function
CREATE OR REPLACE FUNCTION public.add_story_comment(
    p_story_id UUID,
    p_user_id TEXT,
    p_content TEXT,
    p_user_name TEXT,
    p_user_avatar TEXT
)
RETURNS UUID AS $$
DECLARE
    v_comment_id UUID;
BEGIN
    -- Insert comment
    INSERT INTO public.story_comments (story_id, user_id, content, user_name, user_avatar)
    VALUES (p_story_id, p_user_id, p_content, p_user_name, p_user_avatar)
    RETURNING id INTO v_comment_id;

    -- Increment comments count on the story
    UPDATE public.travel_stories 
    SET comments = COALESCE(comments, 0) + 1
    WHERE id = p_story_id;

    RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Delete Story Comment Function
CREATE OR REPLACE FUNCTION public.delete_story_comment(
    p_comment_id UUID,
    p_user_id TEXT,
    p_story_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Delete comment
    DELETE FROM public.story_comments 
    WHERE id = p_comment_id AND user_id = p_user_id;
    
    IF FOUND THEN
        -- Decrement comments count on the story
        UPDATE public.travel_stories 
        SET comments = GREATEST(0, COALESCE(comments, 1) - 1)
        WHERE id = p_story_id;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Atomic community functions created successfully!' AS status;
