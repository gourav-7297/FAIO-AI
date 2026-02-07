import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Running in demo mode.');
}

// Typed client - use when tables exist in Supabase
export const supabase = createClient<Database>(
    supabaseUrl || 'https://demo.supabase.co',
    supabaseAnonKey || 'demo-key'
);

// Untyped client for services - avoids 'never' type errors before tables exist
// Once you run supabase_schema.sql, you can switch services to use the typed client
export const supabaseUntyped = createClient(
    supabaseUrl || 'https://demo.supabase.co',
    supabaseAnonKey || 'demo-key'
);

export default supabase;
