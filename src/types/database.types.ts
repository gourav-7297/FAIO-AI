// Database types for Supabase
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    username: string | null;
                    avatar_url: string | null;
                    bio: string | null;
                    travel_styles: string[] | null;
                    preferences: Json;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    username?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    travel_styles?: string[] | null;
                    preferences?: Json;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    travel_styles?: string[] | null;
                    preferences?: Json;
                    created_at?: string;
                };
            };
            itineraries: {
                Row: {
                    id: string;
                    user_id: string | null;
                    destination: string;
                    start_date: string | null;
                    end_date: string | null;
                    budget: number | null;
                    styles: string[] | null;
                    day_plan: Json;
                    carbon_footprint: number | null;
                    safety_score: number | null;
                    is_public: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    destination: string;
                    start_date?: string | null;
                    end_date?: string | null;
                    budget?: number | null;
                    styles?: string[] | null;
                    day_plan: Json;
                    carbon_footprint?: number | null;
                    safety_score?: number | null;
                    is_public?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    destination?: string;
                    start_date?: string | null;
                    end_date?: string | null;
                    budget?: number | null;
                    styles?: string[] | null;
                    day_plan?: Json;
                    carbon_footprint?: number | null;
                    safety_score?: number | null;
                    is_public?: boolean;
                    created_at?: string;
                };
            };
            local_secrets: {
                Row: {
                    id: string;
                    user_id: string | null;
                    destination: string;
                    name: string;
                    type: string;
                    description: string | null;
                    image_url: string | null;
                    location: Json | null;
                    is_verified: boolean;
                    upvotes: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    destination: string;
                    name: string;
                    type: string;
                    description?: string | null;
                    image_url?: string | null;
                    location?: Json | null;
                    is_verified?: boolean;
                    upvotes?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    destination?: string;
                    name?: string;
                    type?: string;
                    description?: string | null;
                    image_url?: string | null;
                    location?: Json | null;
                    is_verified?: boolean;
                    upvotes?: number;
                    created_at?: string;
                };
            };
            reviews: {
                Row: {
                    id: string;
                    user_id: string | null;
                    place_id: string;
                    rating: number;
                    comment: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    place_id: string;
                    rating: number;
                    comment?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    place_id?: string;
                    rating?: number;
                    comment?: string | null;
                    created_at?: string;
                };
            };
            guides: {
                Row: {
                    id: string;
                    name: string;
                    destination: string;
                    languages: string[] | null;
                    specialties: string[] | null;
                    rating: number;
                    price_per_day: number | null;
                    avatar_url: string | null;
                    bio: string | null;
                    is_verified: boolean;
                    contact_info: Json | null;
                };
                Insert: {
                    id?: string;
                    name: string;
                    destination: string;
                    languages?: string[] | null;
                    specialties?: string[] | null;
                    rating?: number;
                    price_per_day?: number | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    is_verified?: boolean;
                    contact_info?: Json | null;
                };
                Update: {
                    id?: string;
                    name?: string;
                    destination?: string;
                    languages?: string[] | null;
                    specialties?: string[] | null;
                    rating?: number;
                    price_per_day?: number | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    is_verified?: boolean;
                    contact_info?: Json | null;
                };
            };
            hotels: {
                Row: {
                    id: string;
                    destination: string;
                    name: string;
                    type: string | null;
                    price_per_night: number | null;
                    rating: number | null;
                    safety_verified: boolean;
                    women_friendly: boolean;
                    eco_certified: boolean;
                    amenities: string[] | null;
                    image_url: string | null;
                    location: Json | null;
                };
                Insert: {
                    id?: string;
                    destination: string;
                    name: string;
                    type?: string | null;
                    price_per_night?: number | null;
                    rating?: number | null;
                    safety_verified?: boolean;
                    women_friendly?: boolean;
                    eco_certified?: boolean;
                    amenities?: string[] | null;
                    image_url?: string | null;
                    location?: Json | null;
                };
                Update: {
                    id?: string;
                    destination?: string;
                    name?: string;
                    type?: string | null;
                    price_per_night?: number | null;
                    rating?: number | null;
                    safety_verified?: boolean;
                    women_friendly?: boolean;
                    eco_certified?: boolean;
                    amenities?: string[] | null;
                    image_url?: string | null;
                    location?: Json | null;
                };
            };
            buddy_requests: {
                Row: {
                    id: string;
                    user_id: string | null;
                    destination: string;
                    travel_dates: Json | null;
                    preferences: Json | null;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    destination: string;
                    travel_dates?: Json | null;
                    preferences?: Json | null;
                    status?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    destination?: string;
                    travel_dates?: Json | null;
                    preferences?: Json | null;
                    status?: string;
                    created_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Itinerary = Database['public']['Tables']['itineraries']['Row'];
export type LocalSecret = Database['public']['Tables']['local_secrets']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Guide = Database['public']['Tables']['guides']['Row'];
export type Hotel = Database['public']['Tables']['hotels']['Row'];
export type BuddyRequest = Database['public']['Tables']['buddy_requests']['Row'];
