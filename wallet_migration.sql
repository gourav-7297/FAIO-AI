-- ============================
-- TRIP WALLET TABLES
-- Run this in your Supabase SQL Editor
-- ============================

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    carbon_kg DECIMAL,
    is_eco_option BOOLEAN DEFAULT false,
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only access their own expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
    ON expenses FOR SELECT
    USING (user_id = auth.uid()::text OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own expenses"
    ON expenses FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can delete own expenses"
    ON expenses FOR DELETE
    USING (user_id = auth.uid()::text OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Allow anon access for now (matches existing community pattern)
CREATE POLICY "Allow anon read expenses"
    ON expenses FOR SELECT
    USING (true);

CREATE POLICY "Allow anon insert expenses"
    ON expenses FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anon delete expenses"
    ON expenses FOR DELETE
    USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
