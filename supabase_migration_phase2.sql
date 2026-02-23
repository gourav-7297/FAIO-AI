-- ================================================================
-- FAIO AI — Phase 2 Migration: New Tables for Community & Expenses
-- ================================================================
-- Run this script in your Supabase SQL Editor to create the
-- tables required by communityService and expenseService.
-- ================================================================

-- 1. Travel Stories (for Community feed)
CREATE TABLE IF NOT EXISTS travel_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT '',
    images TEXT[] DEFAULT '{}',
    caption TEXT DEFAULT '',
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE travel_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stories"
    ON travel_stories FOR SELECT USING (true);

CREATE POLICY "Auth users can insert own stories"
    ON travel_stories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
    ON travel_stories FOR UPDATE USING (auth.uid() = user_id);


-- 2. Group Trips (for Community group trip listings)
CREATE TABLE IF NOT EXISTS group_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    dates JSONB DEFAULT '{}',
    duration TEXT DEFAULT '',
    vibes TEXT[] DEFAULT '{}',
    spots_filled INTEGER DEFAULT 0,
    spots_total INTEGER DEFAULT 4,
    price_amount NUMERIC DEFAULT 0,
    price_currency TEXT DEFAULT 'USD',
    includes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE group_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view group trips"
    ON group_trips FOR SELECT USING (true);

CREATE POLICY "Auth users can create trips"
    ON group_trips FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own trips"
    ON group_trips FOR UPDATE USING (auth.uid() = host_id);


-- 3. Expenses (for Wallet expense tracking)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    date DATE DEFAULT CURRENT_DATE,
    carbon_kg NUMERIC DEFAULT NULL,
    is_eco_option BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
    ON expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
    ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
    ON expenses FOR DELETE USING (auth.uid() = user_id);
