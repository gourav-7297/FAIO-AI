import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';

// ============================
// TYPES
// ============================

export interface TravelStory {
    id: string;
    user: {
        name: string;
        avatar: string;
        verified: boolean;
    };
    location: string;
    country: string;
    images: string[];
    caption: string;
    likes: number;
    comments: number;
    saves: number;
    postedAt: string;
    tags: string[];
}

export interface GroupTrip {
    id: string;
    host: {
        name: string;
        avatar: string;
        verified: boolean;
        rating: number;
        tripsHosted: number;
    };
    destination: string;
    dates: { start: string; end: string };
    duration: string;
    vibes: string[];
    spots: { filled: number; total: number };
    price: { amount: number; currency: string };
    includes: string[];
}

// ============================
// FALLBACK DATA
// ============================

const FALLBACK_STORIES: TravelStory[] = [
    {
        id: '1',
        user: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarah', verified: true },
        location: 'Kyoto',
        country: 'Japan',
        images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600'],
        caption: 'Found the most beautiful hidden temple in Kyoto. The cherry blossoms were incredible! 🌸',
        likes: 2345,
        comments: 89,
        saves: 432,
        postedAt: '2h ago',
        tags: ['Culture', 'Photography', 'Cherry Blossoms'],
    },
    {
        id: '2',
        user: { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=alex', verified: false },
        location: 'Santorini',
        country: 'Greece',
        images: ['https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=600'],
        caption: 'Sunset from Oia — absolutely worth every second of the hike up here. 🌅',
        likes: 4521,
        comments: 234,
        saves: 892,
        postedAt: '5h ago',
        tags: ['Foodie', 'Views', 'Sunset'],
    },
    {
        id: '3',
        user: { name: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?u=priya', verified: false },
        location: 'Tromsø',
        country: 'Norway',
        images: ['https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=600'],
        caption: 'Northern Lights from our cabin window. Nature is the best artist. ✨',
        likes: 8234,
        comments: 567,
        saves: 2341,
        postedAt: '2d ago',
        tags: ['Adventure', 'Nature', 'NorthernLights'],
    },
];

const FALLBACK_TRIPS: GroupTrip[] = [
    {
        id: '1',
        host: { name: 'Jessica Wong', avatar: 'https://i.pravatar.cc/150?u=jessica', verified: true, rating: 4.9, tripsHosted: 23 },
        destination: 'Vietnam',
        dates: { start: 'Mar 15', end: 'Mar 20' },
        duration: '5 days',
        vibes: ['Adventure', 'Budget', 'Nature'],
        spots: { filled: 3, total: 5 },
        price: { amount: 320, currency: 'USD' },
        includes: ['Bike rental', 'Fuel', 'Homestays', 'Local guide'],
    },
    {
        id: '2',
        host: { name: 'David Park', avatar: 'https://i.pravatar.cc/150?u=david', verified: true, rating: 4.8, tripsHosted: 15 },
        destination: 'Seoul',
        dates: { start: 'Apr 1', end: 'Apr 8' },
        duration: '7 days',
        vibes: ['Foodie', 'City', 'Culture'],
        spots: { filled: 4, total: 6 },
        price: { amount: 850, currency: 'USD' },
        includes: ['Accommodation', 'Food tours', 'Transport card', 'Experiences'],
    },
];

// ============================
// SERVICE
// ============================

export const communityService = {
    async getStories(): Promise<{ data: TravelStory[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: FALLBACK_STORIES, error: null };
        }
        try {
            const { data, error } = await supabase
                .from('travel_stories')
                .select('*, profiles(username, avatar_url)')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (!data || data.length === 0) {
                return { data: FALLBACK_STORIES, error: null };
            }

            const stories: TravelStory[] = data.map((row: any) => ({
                id: row.id,
                user: {
                    name: row.profiles?.username || 'Traveler',
                    avatar: row.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${row.id}`,
                    verified: false,
                },
                location: row.location,
                country: row.country,
                images: row.images || [],
                caption: row.caption || '',
                likes: row.likes || 0,
                comments: row.comments || 0,
                saves: row.saves || 0,
                postedAt: formatTimeAgo(new Date(row.created_at)),
                tags: row.tags || [],
            }));

            return { data: stories, error: null };
        } catch (error) {
            console.error('Error fetching stories:', error);
            return { data: FALLBACK_STORIES, error: error as Error };
        }
    },

    async getGroupTrips(): Promise<{ data: GroupTrip[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: FALLBACK_TRIPS, error: null };
        }
        try {
            const { data, error } = await supabase
                .from('group_trips')
                .select('*, profiles(username, avatar_url)')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (!data || data.length === 0) {
                return { data: FALLBACK_TRIPS, error: null };
            }

            const trips: GroupTrip[] = data.map((row: any) => ({
                id: row.id,
                host: {
                    name: row.profiles?.username || 'Host',
                    avatar: row.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${row.id}`,
                    verified: false,
                    rating: 4.5,
                    tripsHosted: 0,
                },
                destination: row.destination,
                dates: row.dates || { start: '', end: '' },
                duration: row.duration || '',
                vibes: row.vibes || [],
                spots: { filled: row.spots_filled || 0, total: row.spots_total || 4 },
                price: { amount: row.price_amount || 0, currency: row.price_currency || 'USD' },
                includes: row.includes || [],
            }));

            return { data: trips, error: null };
        } catch (error) {
            console.error('Error fetching group trips:', error);
            return { data: FALLBACK_TRIPS, error: error as Error };
        }
    },

    async toggleLike(storyId: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { error: null }; // Silently succeed in offline mode
        }
        try {
            const { data: story, error: fetchError } = await supabase
                .from('travel_stories')
                .select('likes')
                .eq('id', storyId)
                .single();

            if (fetchError) throw fetchError;

            const { error } = await supabase
                .from('travel_stories')
                .update({ likes: (story?.likes || 0) + 1 } as any)
                .eq('id', storyId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error toggling like:', error);
            return { error: error as Error };
        }
    },
};

// ============================
// HELPERS
// ============================

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default communityService;
