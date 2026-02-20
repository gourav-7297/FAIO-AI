import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseAvailable = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseAvailable) {
    console.warn(
        '⚠️ Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. The app will run with mock data.'
    );
}

// Create clients only if env vars are available
let supabase: SupabaseClient<Database> | null = null;
let supabaseUntyped: SupabaseClient | null = null;

if (isSupabaseAvailable) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    supabaseUntyped = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase, supabaseUntyped };
export default supabase;
