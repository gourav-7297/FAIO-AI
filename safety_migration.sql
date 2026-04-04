-- ============================
-- SAFETY HUB TABLES
-- Run this in your Supabase SQL Editor
-- ============================

-- 1. Emergency Contacts (synced across devices)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relation TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only access their own contacts
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
    ON emergency_contacts FOR SELECT
    USING (user_id = auth.uid()::text OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own contacts"
    ON emergency_contacts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete own contacts"
    ON emergency_contacts FOR DELETE
    USING (user_id = auth.uid()::text OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow anon access for now (matches existing community pattern)
CREATE POLICY "Allow anon read emergency_contacts"
    ON emergency_contacts FOR SELECT
    USING (true);

CREATE POLICY "Allow anon insert emergency_contacts"
    ON emergency_contacts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anon delete emergency_contacts"
    ON emergency_contacts FOR DELETE
    USING (true);


-- 2. Location Sharing Sessions
CREATE TABLE IF NOT EXISTS location_sharing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    share_token TEXT UNIQUE NOT NULL,
    lat FLOAT8 DEFAULT 0,
    lon FLOAT8 DEFAULT 0,
    city TEXT DEFAULT '',
    country TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE location_sharing_sessions ENABLE ROW LEVEL SECURITY;

-- Allow broad access (same pattern as community tables)
CREATE POLICY "Allow anon read location_sharing_sessions"
    ON location_sharing_sessions FOR SELECT
    USING (true);

CREATE POLICY "Allow anon insert location_sharing_sessions"
    ON location_sharing_sessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anon update location_sharing_sessions"
    ON location_sharing_sessions FOR UPDATE
    USING (true);


-- 3. Community Safety Alerts
CREATE TABLE IF NOT EXISTS safety_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('warning', 'caution', 'info')),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    lat FLOAT8,
    lon FLOAT8,
    area TEXT DEFAULT '',
    country_code TEXT DEFAULT '',
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read safety_alerts"
    ON safety_alerts FOR SELECT
    USING (true);

CREATE POLICY "Allow anon insert safety_alerts"
    ON safety_alerts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anon delete safety_alerts"
    ON safety_alerts FOR DELETE
    USING (true);


-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_location_sharing_user ON location_sharing_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_location_sharing_token ON location_sharing_sessions(share_token);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_country ON safety_alerts(country_code);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_expires ON safety_alerts(expires_at);
