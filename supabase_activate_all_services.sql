-- =============================================
-- FAIO AI — Activate All Services
-- Run this ONCE in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS)
-- Uses TEXT user_id for Firebase Auth compatibility
-- =============================================

-- =============================================
-- 1. PROFILES (fix for Firebase UID — TEXT id)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT,
    avatar_url TEXT,
    bio TEXT,
    travel_styles TEXT[],
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update own profile" ON public.profiles;

-- Open policies for Firebase Auth (no auth.uid() check)
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own profile" ON public.profiles FOR UPDATE USING (true);

-- =============================================
-- 2. ITINERARIES (saved AI-generated trips)
-- =============================================
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
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

ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can insert their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can update their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can delete their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "itineraries_select" ON public.itineraries;
DROP POLICY IF EXISTS "itineraries_insert" ON public.itineraries;
DROP POLICY IF EXISTS "itineraries_update" ON public.itineraries;
DROP POLICY IF EXISTS "itineraries_delete" ON public.itineraries;

CREATE POLICY "itineraries_select" ON public.itineraries FOR SELECT USING (true);
CREATE POLICY "itineraries_insert" ON public.itineraries FOR INSERT WITH CHECK (true);
CREATE POLICY "itineraries_update" ON public.itineraries FOR UPDATE USING (true);
CREATE POLICY "itineraries_delete" ON public.itineraries FOR DELETE USING (true);

-- =============================================
-- 3. LOCAL SECRETS (community hidden gems)
-- =============================================
CREATE TABLE IF NOT EXISTS public.local_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    destination TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    location JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.local_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view local secrets" ON public.local_secrets;
DROP POLICY IF EXISTS "Authenticated users can insert local secrets" ON public.local_secrets;
DROP POLICY IF EXISTS "Users can update their own secrets" ON public.local_secrets;
DROP POLICY IF EXISTS "local_secrets_select" ON public.local_secrets;
DROP POLICY IF EXISTS "local_secrets_insert" ON public.local_secrets;
DROP POLICY IF EXISTS "local_secrets_update" ON public.local_secrets;
DROP POLICY IF EXISTS "local_secrets_delete" ON public.local_secrets;

CREATE POLICY "local_secrets_select" ON public.local_secrets FOR SELECT USING (true);
CREATE POLICY "local_secrets_insert" ON public.local_secrets FOR INSERT WITH CHECK (true);
CREATE POLICY "local_secrets_update" ON public.local_secrets FOR UPDATE USING (true);
CREATE POLICY "local_secrets_delete" ON public.local_secrets FOR DELETE USING (true);

-- =============================================
-- 4. REVIEWS
-- =============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    place_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete" ON public.reviews;

CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "reviews_delete" ON public.reviews FOR DELETE USING (true);

-- =============================================
-- 5. GUIDES (verified local guides directory)
-- =============================================
CREATE TABLE IF NOT EXISTS public.guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view guides" ON public.guides;
DROP POLICY IF EXISTS "guides_select" ON public.guides;

CREATE POLICY "guides_select" ON public.guides FOR SELECT USING (true);

-- =============================================
-- 6. HOTELS / STAYS
-- =============================================
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    price_per_night INTEGER,
    rating FLOAT,
    safety_verified BOOLEAN DEFAULT FALSE,
    women_friendly BOOLEAN DEFAULT FALSE,
    eco_certified BOOLEAN DEFAULT FALSE,
    amenities TEXT[],
    image_url TEXT,
    location JSONB
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view hotels" ON public.hotels;
DROP POLICY IF EXISTS "hotels_select" ON public.hotels;

CREATE POLICY "hotels_select" ON public.hotels FOR SELECT USING (true);

-- =============================================
-- 7. BUDDY REQUESTS (travel buddy finder)
-- =============================================
CREATE TABLE IF NOT EXISTS public.buddy_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    destination TEXT NOT NULL,
    travel_dates JSONB,
    preferences JSONB,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.buddy_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view open buddy requests" ON public.buddy_requests;
DROP POLICY IF EXISTS "Authenticated users can create buddy requests" ON public.buddy_requests;
DROP POLICY IF EXISTS "Users can update their own buddy requests" ON public.buddy_requests;
DROP POLICY IF EXISTS "buddy_requests_select" ON public.buddy_requests;
DROP POLICY IF EXISTS "buddy_requests_insert" ON public.buddy_requests;
DROP POLICY IF EXISTS "buddy_requests_update" ON public.buddy_requests;
DROP POLICY IF EXISTS "buddy_requests_delete" ON public.buddy_requests;

CREATE POLICY "buddy_requests_select" ON public.buddy_requests FOR SELECT USING (true);
CREATE POLICY "buddy_requests_insert" ON public.buddy_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "buddy_requests_update" ON public.buddy_requests FOR UPDATE USING (true);
CREATE POLICY "buddy_requests_delete" ON public.buddy_requests FOR DELETE USING (true);

-- =============================================
-- 8. PACKING LISTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.packing_lists (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    destination TEXT NOT NULL DEFAULT '',
    duration INTEGER NOT NULL DEFAULT 5,
    weather TEXT NOT NULL DEFAULT 'moderate',
    activities TEXT[] DEFAULT '{}',
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.packing_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own packing lists" ON public.packing_lists;
DROP POLICY IF EXISTS "packing_lists_select" ON public.packing_lists;
DROP POLICY IF EXISTS "packing_lists_insert" ON public.packing_lists;
DROP POLICY IF EXISTS "packing_lists_update" ON public.packing_lists;
DROP POLICY IF EXISTS "packing_lists_delete" ON public.packing_lists;

CREATE POLICY "packing_lists_select" ON public.packing_lists FOR SELECT USING (true);
CREATE POLICY "packing_lists_insert" ON public.packing_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "packing_lists_update" ON public.packing_lists FOR UPDATE USING (true);
CREATE POLICY "packing_lists_delete" ON public.packing_lists FOR DELETE USING (true);

-- =============================================
-- 9. TRAVEL DOCUMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.travel_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    type TEXT NOT NULL DEFAULT 'Other',
    title TEXT NOT NULL,
    doc_number TEXT DEFAULT '',
    issue_date DATE,
    expiry_date DATE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.travel_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own documents" ON public.travel_documents;
DROP POLICY IF EXISTS "travel_documents_select" ON public.travel_documents;
DROP POLICY IF EXISTS "travel_documents_insert" ON public.travel_documents;
DROP POLICY IF EXISTS "travel_documents_update" ON public.travel_documents;
DROP POLICY IF EXISTS "travel_documents_delete" ON public.travel_documents;

CREATE POLICY "travel_documents_select" ON public.travel_documents FOR SELECT USING (true);
CREATE POLICY "travel_documents_insert" ON public.travel_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "travel_documents_update" ON public.travel_documents FOR UPDATE USING (true);
CREATE POLICY "travel_documents_delete" ON public.travel_documents FOR DELETE USING (true);

-- =============================================
-- 10. BOOKINGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    booking_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    details JSONB NOT NULL DEFAULT '{}',
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_id TEXT,
    payment_status TEXT DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own bookings" ON public.bookings;
DROP POLICY IF EXISTS "bookings_select" ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;
DROP POLICY IF EXISTS "bookings_update" ON public.bookings;
DROP POLICY IF EXISTS "bookings_delete" ON public.bookings;

CREATE POLICY "bookings_select" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "bookings_delete" ON public.bookings FOR DELETE USING (true);

-- =============================================
-- 11. EXPENSES (if not already created)
-- =============================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    date DATE DEFAULT CURRENT_DATE,
    carbon_kg FLOAT,
    is_eco_option BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expenses_select" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete" ON public.expenses;

CREATE POLICY "expenses_select" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "expenses_update" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "expenses_delete" ON public.expenses FOR DELETE USING (true);

-- =============================================
-- 12. CAB PROVIDERS (if not already created)
-- =============================================
CREATE TABLE IF NOT EXISTS public.cab_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    services TEXT[],
    vehicle_types TEXT[],
    price_range TEXT,
    rating FLOAT DEFAULT 4.0,
    total_ratings INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    description TEXT,
    logo_url TEXT,
    years_in_service INTEGER DEFAULT 0,
    languages TEXT[]
);

ALTER TABLE public.cab_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cab_providers_select" ON public.cab_providers;

CREATE POLICY "cab_providers_select" ON public.cab_providers FOR SELECT USING (true);

-- =============================================
-- AUTO-UPDATE updated_at TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS packing_lists_updated_at ON packing_lists;
CREATE TRIGGER packing_lists_updated_at BEFORE UPDATE ON packing_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS travel_documents_updated_at ON travel_documents;
CREATE TRIGGER travel_documents_updated_at BEFORE UPDATE ON travel_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================
-- SEED DATA — Guides
-- =============================================
INSERT INTO public.guides (destination, name, languages, specialties, rating, price_per_day, avatar_url, bio, is_verified)
SELECT * FROM (VALUES
    ('Tokyo', 'Yuki Tanaka', ARRAY['Japanese', 'English'], ARRAY['Food Tours', 'History', 'Photography'], 4.9, 150, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', 'Local food expert with 10 years experience showing hidden Tokyo gems.', TRUE),
    ('Tokyo', 'Kenji Yamamoto', ARRAY['Japanese', 'English', 'Spanish'], ARRAY['Anime', 'Gaming', 'Nightlife'], 4.7, 120, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'Your guide to Tokyo pop culture and nightlife!', TRUE),
    ('Paris', 'Marie Dubois', ARRAY['French', 'English'], ARRAY['Art', 'Wine', 'History'], 4.8, 180, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', 'Art historian and sommelier, I show you the real Paris.', TRUE),
    ('Bali', 'Made Wayan', ARRAY['Indonesian', 'English'], ARRAY['Temples', 'Rice Terraces', 'Spiritual'], 4.9, 80, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', 'Born in Ubud, I share my homeland spiritual traditions.', TRUE),
    ('Delhi', 'Rajesh Kumar', ARRAY['Hindi', 'English', 'Punjabi'], ARRAY['Food Tours', 'Heritage Walk', 'Markets'], 4.8, 60, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'Born and raised in Old Delhi. I know every hidden lane and street food stall.', TRUE),
    ('Jaipur', 'Priya Rathore', ARRAY['Hindi', 'English', 'Rajasthani'], ARRAY['Palace Tours', 'Photography', 'Culture'], 4.9, 70, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', 'Jaipur royal heritage expert. Let me show you the Pink City like a local princess.', TRUE),
    ('Goa', 'Antonio Fernandes', ARRAY['Konkani', 'English', 'Hindi', 'Portuguese'], ARRAY['Beach Hopping', 'Nightlife', 'Food Tours'], 4.7, 55, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', '3rd-generation Goan. I know every hidden beach and shack.', TRUE),
    ('Mumbai', 'Sneha Patil', ARRAY['Marathi', 'Hindi', 'English'], ARRAY['Street Food', 'Bollywood', 'Markets'], 4.8, 65, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'Mumbai street food queen. From vada pav to fine dining, I cover it all.', TRUE)
) AS t(destination, name, languages, specialties, rating, price_per_day, avatar_url, bio, is_verified)
WHERE NOT EXISTS (SELECT 1 FROM public.guides LIMIT 1);


-- =============================================
-- SEED DATA — Hotels
-- =============================================
INSERT INTO public.hotels (destination, name, type, price_per_night, rating, safety_verified, women_friendly, eco_certified, amenities, image_url)
SELECT * FROM (VALUES
    ('Tokyo', 'Sakura Inn', 'hotel', 120, 4.8, TRUE, TRUE, TRUE, ARRAY['WiFi', 'Breakfast', 'AC'], 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=400'),
    ('Tokyo', 'Shibuya Hostel', 'hostel', 45, 4.5, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Locker', 'Common Kitchen'], 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'),
    ('Tokyo', 'Zen Garden Stay', 'eco-stay', 180, 4.9, TRUE, TRUE, TRUE, ARRAY['WiFi', 'Breakfast', 'Garden', 'Onsen'], 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400'),
    ('Paris', 'Le Petit Hotel', 'hotel', 150, 4.7, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Breakfast', 'City View'], 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'),
    ('Paris', 'Montmartre Hostel', 'hostel', 55, 4.3, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Bar', 'Tours'], 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'),
    ('Bali', 'Ubud Eco Resort', 'eco-stay', 95, 4.9, TRUE, TRUE, TRUE, ARRAY['Pool', 'Yoga', 'Organic Food'], 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400'),
    ('Bali', 'Beach Bungalow', 'homestay', 65, 4.6, TRUE, TRUE, FALSE, ARRAY['Beach Access', 'Breakfast', 'Surfing'], 'https://images.unsplash.com/photo-1559599238-308793637427?w=400'),
    ('Delhi', 'Haveli Heritage Stay', 'hotel', 80, 4.6, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Breakfast', 'Rooftop'], 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'),
    ('Delhi', 'Zostel Delhi', 'hostel', 25, 4.4, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Locker', 'Common Area'], 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'),
    ('Goa', 'Palolem Beach Resort', 'hotel', 70, 4.7, TRUE, TRUE, TRUE, ARRAY['Pool', 'Beach Access', 'Restaurant'], 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400'),
    ('Jaipur', 'Pink City Palace Hotel', 'hotel', 90, 4.8, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Pool', 'Heritage'], 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400'),
    ('Mumbai', 'Sea View Mumbai', 'hotel', 110, 4.5, TRUE, TRUE, FALSE, ARRAY['WiFi', 'Sea View', 'Restaurant'], 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400')
) AS t(destination, name, type, price_per_night, rating, safety_verified, women_friendly, eco_certified, amenities, image_url)
WHERE NOT EXISTS (SELECT 1 FROM public.hotels LIMIT 1);


-- =============================================
-- SEED DATA — Local Secrets
-- =============================================
INSERT INTO public.local_secrets (destination, name, type, description, is_verified, upvotes)
SELECT * FROM (VALUES
    ('Tokyo', 'Golden Gai Hidden Bar', 'cafe', 'Tiny bar with only 6 seats, serves amazing sake. Look for the red lantern on the 3rd alley.', TRUE, 234),
    ('Tokyo', 'Sunrise at Senso-ji', 'viewpoint', 'Visit at 5am to see the temple without crowds and catch an incredible sunrise.', TRUE, 456),
    ('Paris', 'Secret Garden Cafe', 'cafe', 'Hidden courtyard cafe near Le Marais with the best croissants in Paris.', TRUE, 189),
    ('Bali', 'Tegallalang Shortcut', 'shortcut', 'Take the small path behind the main entrance to avoid tourist crowds at the rice terraces.', TRUE, 321),
    ('Delhi', 'Paranthe Wali Gali', 'food', 'The legendary paratha lane in Chandni Chowk. Try the rabri paratha at the 2nd shop.', TRUE, 567),
    ('Delhi', 'Humayun Tomb Sunset', 'viewpoint', 'Go at 5pm in winter — the sunset behind the tomb is magical and uncrowded.', TRUE, 289),
    ('Goa', 'Butterfly Beach Trek', 'activity', 'Hidden beach only accessible by a 20-min trail from Palolem. Almost no tourists.', TRUE, 412),
    ('Jaipur', 'Nahargarh Fort Night', 'viewpoint', 'Visit Nahargarh Fort at sunset. The entire Pink City lights up below you.', TRUE, 378),
    ('Mumbai', 'Bandra Bandstand Walk', 'activity', 'Walk along the seafront from Bandra Fort to Land''s End during low tide. Beautiful rocks.', TRUE, 245),
    ('Mumbai', 'Khau Galli Lane', 'food', 'Behind Mithibai College — the best student street food in Mumbai under ₹100.', TRUE, 534)
) AS t(destination, name, type, description, is_verified, upvotes)
WHERE NOT EXISTS (SELECT 1 FROM public.local_secrets LIMIT 1);


-- =============================================
-- SEED DATA — Cab Providers
-- =============================================
INSERT INTO public.cab_providers (name, city, phone, whatsapp, services, vehicle_types, price_range, rating, total_ratings, verified, description, years_in_service, languages)
SELECT * FROM (VALUES
    ('Savaari Car Rentals', 'Delhi', '+91-9045454545', '+919045454545', ARRAY['Airport Transfer', 'Outstation', 'Local', 'Corporate'], ARRAY['Sedan', 'SUV', 'Tempo Traveller', 'Innova'], '₹10-18/km', 4.5, 12500, TRUE, 'Pan-India chauffeur-driven car rental. Professional drivers, well-maintained fleet.', 15, ARRAY['Hindi', 'English']),
    ('Meru Cabs', 'Delhi', '+91-1244224422', '+911244224422', ARRAY['Airport Transfer', 'Local', 'Hourly Rental'], ARRAY['Sedan', 'SUV', 'Hatchback'], '₹12-20/km', 4.3, 8900, TRUE, 'India''s first GPS-enabled metered taxi service. Known for safety.', 18, ARRAY['Hindi', 'English']),
    ('Cool Cab (MERU)', 'Mumbai', '+91-2244224422', '+912244224422', ARRAY['Airport Transfer', 'Local', 'City Tour'], ARRAY['Sedan', 'Hatchback', 'SUV'], '₹14-22/km', 4.4, 9200, TRUE, 'Mumbai''s trusted AC taxi service. Fixed fare from airport. Available 24/7.', 16, ARRAY['Hindi', 'English', 'Marathi']),
    ('Goa Tourism Taxi', 'Goa', '+91-8322437728', '+918322437728', ARRAY['Airport Transfer', 'Beach Hopping', 'North Goa Tour', 'South Goa Tour'], ARRAY['Hatchback', 'Sedan', 'SUV', 'Scooter Rental'], '₹8-14/km', 4.4, 7800, TRUE, 'Licensed tourist taxi service covering all of Goa.', 20, ARRAY['Konkani', 'Hindi', 'English']),
    ('Rajasthan Tourism Cabs', 'Jaipur', '+91-1412200778', '+911412200778', ARRAY['Tourist Package', 'Heritage Tour', 'Desert Safari', 'Outstation'], ARRAY['Sedan', 'Innova', 'Tempo Traveller', 'SUV'], '₹9-15/km', 4.5, 6100, TRUE, 'Government-recognized tourist transport for Rajasthan heritage circuit.', 22, ARRAY['Hindi', 'English', 'Rajasthani']),
    ('KSTDC Tourist Cabs', 'Bangalore', '+91-8025584452', '+918025584452', ARRAY['Tourist Package', 'Outstation', 'Day Trip', 'Mysore Tour'], ARRAY['Sedan', 'Innova', 'Tempo Traveller', 'Mini Bus'], '₹10-15/km', 4.3, 5600, TRUE, 'Government-approved tourist taxi service. Best for Mysore, Coorg packages.', 25, ARRAY['Kannada', 'Hindi', 'English']),
    ('Fast Track Cabs', 'Chennai', '+91-4445454545', '+914445454545', ARRAY['Airport Transfer', 'Local', 'Outstation', 'Temple Tour'], ARRAY['Sedan', 'SUV', 'Innova', 'Tempo Traveller'], '₹11-17/km', 4.3, 5400, TRUE, 'Chennai''s trusted tourist cab service. Specializes in temple tours.', 14, ARRAY['Tamil', 'Hindi', 'English'])
) AS t(name, city, phone, whatsapp, services, vehicle_types, price_range, rating, total_ratings, verified, description, years_in_service, languages)
WHERE NOT EXISTS (SELECT 1 FROM public.cab_providers LIMIT 1);


-- =============================================
-- DONE!
-- =============================================
SELECT '✅ All tables created! All services are now ACTIVE!' AS status;
