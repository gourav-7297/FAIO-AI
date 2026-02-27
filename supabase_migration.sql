-- =============================================
-- FAIO AI — Phase 1: Production Tables
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO '';

-- 1. Packing Lists
CREATE TABLE IF NOT EXISTS packing_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    destination TEXT NOT NULL DEFAULT '',
    duration INTEGER NOT NULL DEFAULT 5,
    weather TEXT NOT NULL DEFAULT 'moderate',
    activities TEXT[] DEFAULT '{}',
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own packing lists"
    ON packing_lists FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Travel Documents
CREATE TABLE IF NOT EXISTS travel_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL DEFAULT 'Other',
    title TEXT NOT NULL,
    doc_number TEXT DEFAULT '',
    issue_date DATE,
    expiry_date DATE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE travel_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own documents"
    ON travel_documents FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    booking_type TEXT NOT NULL, -- 'flight', 'train', 'bus', 'hotel', 'cab'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    details JSONB NOT NULL DEFAULT '{}',
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_id TEXT,
    payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own bookings"
    ON bookings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    home_city TEXT DEFAULT 'Delhi',
    preferred_currency TEXT DEFAULT 'INR',
    language TEXT DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT true,
    dark_mode BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own preferences"
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER packing_lists_updated_at BEFORE UPDATE ON packing_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER travel_documents_updated_at BEFORE UPDATE ON travel_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
