-- FAIO AI Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Itineraries (Saved Trips)
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    budget INTEGER,
    styles TEXT[],
    day_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
    carbon_footprint FLOAT,
    safety_score FLOAT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for itineraries
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Policies for itineraries
CREATE POLICY "Users can view their own itineraries" ON public.itineraries
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own itineraries" ON public.itineraries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries" ON public.itineraries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries" ON public.itineraries
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Local Secrets (Community Hidden Gems)
CREATE TABLE IF NOT EXISTS public.local_secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    destination TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('viewpoint', 'food', 'shortcut', 'activity', 'cafe', 'stay')),
    description TEXT,
    image_url TEXT,
    location JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for local_secrets
ALTER TABLE public.local_secrets ENABLE ROW LEVEL SECURITY;

-- Policies for local_secrets (anyone can view, authenticated can insert)
CREATE POLICY "Anyone can view local secrets" ON public.local_secrets
    FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert local secrets" ON public.local_secrets
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own secrets" ON public.local_secrets
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Verified Guides
CREATE TABLE IF NOT EXISTS public.guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    languages TEXT[],
    specialties TEXT[],
    rating FLOAT DEFAULT 5.0,
    price_per_day INTEGER,
    avatar_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    contact_info JSONB
);

-- Enable RLS for guides
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- Policies for guides (public read)
CREATE POLICY "Anyone can view guides" ON public.guides
    FOR SELECT USING (TRUE);

-- 6. Hotels/Stays
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('hotel', 'hostel', 'airbnb', 'eco-stay', 'homestay')),
    price_per_night INTEGER,
    rating FLOAT,
    safety_verified BOOLEAN DEFAULT FALSE,
    women_friendly BOOLEAN DEFAULT FALSE,
    eco_certified BOOLEAN DEFAULT FALSE,
    amenities TEXT[],
    image_url TEXT,
    location JSONB
);

-- Enable RLS for hotels
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Policies for hotels (public read)
CREATE POLICY "Anyone can view hotels" ON public.hotels
    FOR SELECT USING (TRUE);

-- 7. Trip Buddy Requests
CREATE TABLE IF NOT EXISTS public.buddy_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    travel_dates JSONB,
    preferences JSONB,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for buddy_requests
ALTER TABLE public.buddy_requests ENABLE ROW LEVEL SECURITY;

-- Policies for buddy_requests
CREATE POLICY "Anyone can view open buddy requests" ON public.buddy_requests
    FOR SELECT USING (status = 'open' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create buddy requests" ON public.buddy_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buddy requests" ON public.buddy_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, 'traveler_' || LEFT(NEW.id::TEXT, 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for hotels
INSERT INTO public.hotels (destination, name, type, price_per_night, rating, safety_verified, women_friendly, eco_certified, amenities, image_url) VALUES
('Tokyo', 'Sakura Inn', 'hotel', 120, 4.8, TRUE, TRUE, TRUE, ARRAY['WiFi', 'Breakfast', 'AC'], 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=400'),
('Tokyo', 'Shibuya Hostel', 'hostel', 45, 4.5, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Locker', 'Common Kitchen'], 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'),
('Tokyo', 'Zen Garden Stay', 'eco-stay', 180, 4.9, TRUE, TRUE, TRUE, ARRAY['WiFi', 'Breakfast', 'Garden', 'Onsen'], 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400'),
('Paris', 'Le Petit Hotel', 'hotel', 150, 4.7, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Breakfast', 'City View'], 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'),
('Paris', 'Montmartre Hostel', 'hostel', 55, 4.3, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Bar', 'Tours'], 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'),
('Bali', 'Ubud Eco Resort', 'eco-stay', 95, 4.9, TRUE, TRUE, TRUE, ARRAY['Pool', 'Yoga', 'Organic Food'], 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400'),
('Bali', 'Beach Bungalow', 'homestay', 65, 4.6, TRUE, TRUE, FALSE, ARRAY['Beach Access', 'Breakfast', 'Surfing'], 'https://images.unsplash.com/photo-1559599238-308793637427?w=400');

-- Insert sample data for guides
INSERT INTO public.guides (destination, name, languages, specialties, rating, price_per_day, avatar_url, bio, is_verified) VALUES
('Tokyo', 'Yuki Tanaka', ARRAY['Japanese', 'English'], ARRAY['Food Tours', 'History', 'Photography'], 4.9, 150, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', 'Local food expert with 10 years experience showing hidden Tokyo gems.', TRUE),
('Tokyo', 'Kenji Yamamoto', ARRAY['Japanese', 'English', 'Spanish'], ARRAY['Anime', 'Gaming', 'Nightlife'], 4.7, 120, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'Your guide to Tokyo pop culture and nightlife!', TRUE),
('Paris', 'Marie Dubois', ARRAY['French', 'English'], ARRAY['Art', 'Wine', 'History'], 4.8, 180, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', 'Art historian and sommelier, I show you the real Paris.', TRUE),
('Bali', 'Made Wayan', ARRAY['Indonesian', 'English'], ARRAY['Temples', 'Rice Terraces', 'Spiritual'], 4.9, 80, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', 'Born in Ubud, I share my homeland spiritual traditions.', TRUE);

-- Insert sample local secrets
INSERT INTO public.local_secrets (destination, name, type, description, is_verified, upvotes) VALUES
('Tokyo', 'Golden Gai Hidden Bar', 'cafe', 'Tiny bar with only 6 seats, serves amazing sake. Look for the red lantern.', TRUE, 234),
('Tokyo', 'Sunrise at Senso-ji', 'viewpoint', 'Visit at 5am to see the temple without crowds and catch sunrise.', TRUE, 456),
('Paris', 'Secret Garden Cafe', 'cafe', 'Hidden courtyard cafe near Le Marais with the best croissants.', TRUE, 189),
('Bali', 'Tegallalang Shortcut', 'shortcut', 'Take the small path behind the main entrance to avoid tourist crowds.', TRUE, 321);

SELECT 'Database setup complete! All tables created with sample data.' AS status;
