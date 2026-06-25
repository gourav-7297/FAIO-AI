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
            expenses: {
                Row: {
                    id: string;
                    user_id: string | null;
                    category: string;
                    name: string;
                    amount: number;
                    currency: string;
                    date: string;
                    carbon_kg: number | null;
                    is_eco_option: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    category: string;
                    name: string;
                    amount: number;
                    currency?: string;
                    date?: string;
                    carbon_kg?: number | null;
                    is_eco_option?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    category?: string;
                    name?: string;
                    amount?: number;
                    currency?: string;
                    date?: string;
                    carbon_kg?: number | null;
                    is_eco_option?: boolean;
                    created_at?: string;
                };
            };
            packing_lists: {
                Row: {
                    id: string;
                    user_id: string | null;
                    name: string;
                    destination: string;
                    duration: number;
                    weather: string;
                    activities: string[];
                    items: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    name: string;
                    destination: string;
                    duration?: number;
                    weather?: string;
                    activities?: string[];
                    items?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    name?: string;
                    destination?: string;
                    duration?: number;
                    weather?: string;
                    activities?: string[];
                    items?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            travel_documents: {
                Row: {
                    id: string;
                    user_id: string | null;
                    type: string;
                    title: string;
                    doc_number: string;
                    issue_date: string | null;
                    expiry_date: string | null;
                    notes: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    type: string;
                    title: string;
                    doc_number?: string;
                    issue_date?: string | null;
                    expiry_date?: string | null;
                    notes?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    type?: string;
                    title?: string;
                    doc_number?: string;
                    issue_date?: string | null;
                    expiry_date?: string | null;
                    notes?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            bookings: {
                Row: {
                    id: string;
                    user_id: string | null;
                    booking_type: string;
                    status: string;
                    details: Json;
                    amount: number;
                    currency: string;
                    payment_id: string | null;
                    payment_status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    booking_type: string;
                    status?: string;
                    details?: Json;
                    amount?: number;
                    currency?: string;
                    payment_id?: string | null;
                    payment_status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    booking_type?: string;
                    status?: string;
                    details?: Json;
                    amount?: number;
                    currency?: string;
                    payment_id?: string | null;
                    payment_status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            travel_stories: {
                Row: {
                    id: string;
                    user_id: string | null;
                    user_name: string;
                    user_avatar: string;
                    location: string;
                    country: string;
                    images: string[];
                    caption: string;
                    likes: number;
                    comments: number;
                    saves: number;
                    tags: string[];
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    user_name?: string;
                    user_avatar?: string;
                    location: string;
                    country: string;
                    images?: string[];
                    caption: string;
                    likes?: number;
                    comments?: number;
                    saves?: number;
                    tags?: string[];
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    user_name?: string;
                    user_avatar?: string;
                    location?: string;
                    country?: string;
                    images?: string[];
                    caption?: string;
                    likes?: number;
                    comments?: number;
                    saves?: number;
                    tags?: string[];
                    created_at?: string;
                };
            };
            story_likes: {
                Row: {
                    id: string;
                    user_id: string;
                    story_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    story_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    story_id?: string;
                    created_at?: string;
                };
            };
            story_comments: {
                Row: {
                    id: string;
                    user_id: string;
                    story_id: string;
                    content: string;
                    user_name: string;
                    user_avatar: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    story_id: string;
                    content: string;
                    user_name?: string;
                    user_avatar?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    story_id?: string;
                    content?: string;
                    user_name?: string;
                    user_avatar?: string;
                    created_at?: string;
                };
            };
            group_trips: {
                Row: {
                    id: string;
                    host_id: string | null;
                    host_name: string;
                    host_avatar: string;
                    destination: string;
                    dates: Json;
                    duration: string;
                    vibes: string[];
                    spots_filled: number;
                    spots_total: number;
                    price_amount: number;
                    price_currency: string;
                    includes: string[];
                    description: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    host_id?: string | null;
                    host_name?: string;
                    host_avatar?: string;
                    destination: string;
                    dates: Json;
                    duration: string;
                    vibes?: string[];
                    spots_filled?: number;
                    spots_total?: number;
                    price_amount?: number;
                    price_currency?: string;
                    includes?: string[];
                    description?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    host_id?: string | null;
                    host_name?: string;
                    host_avatar?: string;
                    destination?: string;
                    dates?: Json;
                    duration?: string;
                    vibes?: string[];
                    spots_filled?: number;
                    spots_total?: number;
                    price_amount?: number;
                    price_currency?: string;
                    includes?: string[];
                    description?: string;
                    created_at?: string;
                };
            };
            trip_join_requests: {
                Row: {
                    id: string;
                    trip_id: string;
                    user_id: string;
                    message: string;
                    status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    trip_id: string;
                    user_id: string;
                    message?: string;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    trip_id?: string;
                    user_id?: string;
                    message?: string;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            cab_providers: {
                Row: {
                    id: string;
                    name: string;
                    city: string;
                    phone: string;
                    whatsapp: string | null;
                    services: string[];
                    vehicle_types: string[];
                    price_range: string;
                    rating: number;
                    total_ratings: number;
                    verified: boolean;
                    description: string;
                    logo_url: string | null;
                    years_in_service: number;
                    languages: string[];
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    city: string;
                    phone: string;
                    whatsapp?: string | null;
                    services?: string[];
                    vehicle_types?: string[];
                    price_range?: string;
                    rating?: number;
                    total_ratings?: number;
                    verified?: boolean;
                    description?: string;
                    logo_url?: string | null;
                    years_in_service?: number;
                    languages?: string[];
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    city?: string;
                    phone?: string;
                    whatsapp?: string | null;
                    services?: string[];
                    vehicle_types?: string[];
                    price_range?: string;
                    rating?: number;
                    total_ratings?: number;
                    verified?: boolean;
                    description?: string;
                    logo_url?: string | null;
                    years_in_service?: number;
                    languages?: string[];
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
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type PackingList = Database['public']['Tables']['packing_lists']['Row'];
export type TravelDocument = Database['public']['Tables']['travel_documents']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type TravelStoryTable = Database['public']['Tables']['travel_stories']['Row'];
export type StoryLike = Database['public']['Tables']['story_likes']['Row'];
export type StoryCommentTable = Database['public']['Tables']['story_comments']['Row'];
export type GroupTripTable = Database['public']['Tables']['group_trips']['Row'];
export type TripJoinRequest = Database['public']['Tables']['trip_join_requests']['Row'];
export type CabProvider = Database['public']['Tables']['cab_providers']['Row'];

