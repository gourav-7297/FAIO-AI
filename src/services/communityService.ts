import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';

// ============================
// TYPES
// ============================

export interface TravelStory {
    id: string;
    user_id?: string;
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
    isLikedByMe?: boolean;
}

export interface StoryComment {
    id: string;
    user_id: string;
    story_id: string;
    content: string;
    created_at: string;
    user: {
        name: string;
        avatar: string;
    };
}

export interface GroupTrip {
    id: string;
    host_id?: string;
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
    description: string;
    myJoinStatus?: 'none' | 'pending' | 'accepted' | 'rejected';
}

export interface JoinRequest {
    id: string;
    trip_id: string;
    user_id: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    user: {
        name: string;
        avatar: string;
    };
}

// ============================
// FALLBACK DATA
// ============================

const FALLBACK_STORIES: TravelStory[] = [
    {
        id: 'fallback-1',
        user: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarah', verified: true },
        location: 'Kyoto', country: 'Japan',
        images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600'],
        caption: 'Found the most beautiful hidden temple in Kyoto. The cherry blossoms were incredible! 🌸',
        likes: 2345, comments: 89, saves: 432, postedAt: '2h ago',
        tags: ['Culture', 'Photography', 'Cherry Blossoms'],
    },
    {
        id: 'fallback-2',
        user: { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=alex', verified: false },
        location: 'Santorini', country: 'Greece',
        images: ['https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=600'],
        caption: 'Sunset from Oia — absolutely worth every second of the hike up here. 🌅',
        likes: 4521, comments: 234, saves: 892, postedAt: '5h ago',
        tags: ['Foodie', 'Views', 'Sunset'],
    },
    {
        id: 'fallback-3',
        user: { name: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?u=priya', verified: false },
        location: 'Tromsø', country: 'Norway',
        images: ['https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=600'],
        caption: 'Northern Lights from our cabin window. Nature is the best artist. ✨',
        likes: 8234, comments: 567, saves: 2341, postedAt: '2d ago',
        tags: ['Adventure', 'Nature', 'NorthernLights'],
    },
];

const FALLBACK_TRIPS: GroupTrip[] = [
    {
        id: 'fallback-trip-1',
        host: { name: 'Jessica Wong', avatar: 'https://i.pravatar.cc/150?u=jessica', verified: true, rating: 4.9, tripsHosted: 23 },
        destination: 'Vietnam', dates: { start: 'Mar 15', end: 'Mar 20' }, duration: '5 days',
        vibes: ['Adventure', 'Budget', 'Nature'], spots: { filled: 3, total: 5 },
        price: { amount: 320, currency: 'USD' },
        includes: ['Bike rental', 'Fuel', 'Homestays', 'Local guide'], description: 'Explore the stunning landscapes of Northern Vietnam on motorbikes!',
    },
    {
        id: 'fallback-trip-2',
        host: { name: 'David Park', avatar: 'https://i.pravatar.cc/150?u=david', verified: true, rating: 4.8, tripsHosted: 15 },
        destination: 'Seoul', dates: { start: 'Apr 1', end: 'Apr 8' }, duration: '7 days',
        vibes: ['Foodie', 'City', 'Culture'], spots: { filled: 4, total: 6 },
        price: { amount: 850, currency: 'USD' },
        includes: ['Accommodation', 'Food tours', 'Transport card', 'Experiences'], description: 'The ultimate Seoul food and culture immersion!',
    },
];

// ============================
// STORIES SERVICE
// ============================

export const communityService = {
    // Create a new story
    async createStory(userId: string, data: {
        location: string; country: string; caption: string;
        tags: string[]; images: string[]; userName?: string; userAvatar?: string;
    }): Promise<{ data: any; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: null, error: new Error('Sign in to post stories') };
        }
        try {
            const { data: result, error } = await supabase
                .from('travel_stories')
                .insert({
                    user_id: userId,
                    location: data.location,
                    country: data.country,
                    caption: data.caption,
                    tags: data.tags,
                    images: data.images,
                    user_name: data.userName || 'Traveler',
                    user_avatar: data.userAvatar || '',
                    likes: 0, comments: 0, saves: 0,
                } as any)
                .select()
                .single();

            if (error) throw error;
            return { data: result, error: null };
        } catch (error) {
            console.error('Error creating story:', error);
            return { data: null, error: error as Error };
        }
    },

    // Get all stories
    async getStories(currentUserId?: string): Promise<{ data: TravelStory[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: FALLBACK_STORIES, error: null };
        }
        try {
            const { data, error } = await supabase
                .from('travel_stories')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (!data || data.length === 0) {
                return { data: FALLBACK_STORIES, error: null };
            }

            // Get user's likes if logged in
            let userLikes = new Set<string>();
            if (currentUserId) {
                const { data: likes } = await supabase
                    .from('story_likes')
                    .select('story_id')
                    .eq('user_id', currentUserId);
                if (likes) {
                    userLikes = new Set(likes.map((l: any) => l.story_id));
                }
            }

            const stories: TravelStory[] = data.map((row: any) => ({
                id: row.id,
                user_id: row.user_id,
                user: {
                    name: row.user_name || 'Traveler',
                    avatar: row.user_avatar || `https://i.pravatar.cc/150?u=${row.user_id}`,
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
                isLikedByMe: userLikes.has(row.id),
            }));

            return { data: stories, error: null };
        } catch (error) {
            console.error('Error fetching stories:', error);
            return { data: FALLBACK_STORIES, error: error as Error };
        }
    },

    // Delete own story
    async deleteStory(storyId: string, userId: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) return { error: new Error('Not available') };
        try {
            const { error } = await supabase
                .from('travel_stories')
                .delete()
                .eq('id', storyId)
                .eq('user_id', userId);
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    },

    // ============================
    // LIKES
    // ============================

    async toggleLike(storyId: string, userId: string): Promise<{ liked: boolean; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { liked: false, error: null };
        }
        try {
            // Check if already liked
            const { data: existing } = await supabase
                .from('story_likes')
                .select('id')
                .eq('story_id', storyId)
                .eq('user_id', userId)
                .single();

            if (existing) {
                // Unlike
                await supabase.from('story_likes').delete().eq('id', existing.id);
                // Decrement count
                const { data: story } = await supabase.from('travel_stories').select('likes').eq('id', storyId).single();
                await supabase.from('travel_stories').update({ likes: Math.max(0, (story?.likes || 1) - 1) } as any).eq('id', storyId);
                return { liked: false, error: null };
            } else {
                // Like
                await supabase.from('story_likes').insert({ story_id: storyId, user_id: userId } as any);
                // Increment count
                const { data: story } = await supabase.from('travel_stories').select('likes').eq('id', storyId).single();
                await supabase.from('travel_stories').update({ likes: (story?.likes || 0) + 1 } as any).eq('id', storyId);
                return { liked: true, error: null };
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            return { liked: false, error: error as Error };
        }
    },

    // ============================
    // COMMENTS
    // ============================

    async getComments(storyId: string): Promise<{ data: StoryComment[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) return { data: [], error: null };
        try {
            const { data, error } = await supabase
                .from('story_comments')
                .select('*')
                .eq('story_id', storyId)
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) throw error;

            const comments: StoryComment[] = (data || []).map((row: any) => ({
                id: row.id,
                user_id: row.user_id,
                story_id: row.story_id,
                content: row.content,
                created_at: row.created_at,
                user: {
                    name: row.user_name || 'Traveler',
                    avatar: row.user_avatar || `https://i.pravatar.cc/150?u=${row.user_id}`,
                },
            }));

            return { data: comments, error: null };
        } catch (error) {
            return { data: [], error: error as Error };
        }
    },

    async addComment(storyId: string, userId: string, content: string, userName?: string, userAvatar?: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) return { error: new Error('Sign in to comment') };
        try {
            const { error } = await supabase
                .from('story_comments')
                .insert({ story_id: storyId, user_id: userId, content, user_name: userName || 'Traveler', user_avatar: userAvatar || '' } as any);
            if (error) throw error;
            // Update comment count
            const { data: story } = await supabase.from('travel_stories').select('comments').eq('id', storyId).single();
            await supabase.from('travel_stories').update({ comments: (story?.comments || 0) + 1 } as any).eq('id', storyId);
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    },

    async deleteComment(commentId: string, userId: string, storyId: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) return { error: new Error('Not available') };
        try {
            const { error } = await supabase.from('story_comments').delete().eq('id', commentId).eq('user_id', userId);
            if (error) throw error;
            const { data: story } = await supabase.from('travel_stories').select('comments').eq('id', storyId).single();
            await supabase.from('travel_stories').update({ comments: Math.max(0, (story?.comments || 1) - 1) } as any).eq('id', storyId);
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    },

    // ============================
    // GROUP TRIPS
    // ============================

    async getGroupTrips(currentUserId?: string): Promise<{ data: GroupTrip[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: FALLBACK_TRIPS, error: null };
        }
        try {
            const { data, error } = await supabase
                .from('group_trips')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (!data || data.length === 0) {
                return { data: FALLBACK_TRIPS, error: null };
            }

            // Check join statuses
            let joinStatuses = new Map<string, string>();
            if (currentUserId) {
                const { data: requests } = await supabase
                    .from('trip_join_requests')
                    .select('trip_id, status')
                    .eq('user_id', currentUserId);
                if (requests) {
                    requests.forEach((r: any) => joinStatuses.set(r.trip_id, r.status));
                }
            }

            const trips: GroupTrip[] = data.map((row: any) => ({
                id: row.id,
                host_id: row.host_id,
                host: {
                    name: row.host_name || 'Host',
                    avatar: row.host_avatar || `https://i.pravatar.cc/150?u=${row.host_id}`,
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
                description: row.description || '',
                myJoinStatus: (joinStatuses.get(row.id) as any) || 'none',
            }));

            return { data: trips, error: null };
        } catch (error) {
            console.error('Error fetching group trips:', error);
            return { data: FALLBACK_TRIPS, error: error as Error };
        }
    },

    async createGroupTrip(hostId: string, data: {
        destination: string; dates: { start: string; end: string };
        duration: string; vibes: string[]; spotsTotal: number;
        priceAmount: number; priceCurrency: string;
        includes: string[]; description: string;
        hostName?: string; hostAvatar?: string;
    }): Promise<{ data: any; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: null, error: new Error('Sign in to host trips') };
        }
        try {
            const { data: result, error } = await supabase
                .from('group_trips')
                .insert({
                    host_id: hostId,
                    destination: data.destination,
                    dates: data.dates,
                    duration: data.duration,
                    vibes: data.vibes,
                    spots_filled: 1,
                    spots_total: data.spotsTotal,
                    price_amount: data.priceAmount,
                    price_currency: data.priceCurrency,
                    includes: data.includes,
                    description: data.description,
                    host_name: data.hostName || 'Host',
                    host_avatar: data.hostAvatar || '',
                } as any)
                .select()
                .single();

            if (error) throw error;
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    },

    async deleteTrip(tripId: string, hostId: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) return { error: new Error('Not available') };
        try {
            const { error } = await supabase.from('group_trips').delete().eq('id', tripId).eq('host_id', hostId);
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    },

    // ============================
    // JOIN REQUESTS
    // ============================

    async requestToJoin(tripId: string, userId: string, message: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) return { error: new Error('Sign in to join trips') };
        try {
            const { error } = await supabase
                .from('trip_join_requests')
                .insert({ trip_id: tripId, user_id: userId, message, status: 'pending' } as any);
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    },

    async getJoinRequests(tripId: string): Promise<{ data: JoinRequest[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) return { data: [], error: null };
        try {
            const { data, error } = await supabase
                .from('trip_join_requests')
                .select('*, profiles(username, avatar_url)')
                .eq('trip_id', tripId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const requests: JoinRequest[] = (data || []).map((row: any) => ({
                id: row.id,
                trip_id: row.trip_id,
                user_id: row.user_id,
                message: row.message || '',
                status: row.status,
                created_at: row.created_at,
                user: {
                    name: row.profiles?.username || 'Traveler',
                    avatar: row.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${row.user_id}`,
                },
            }));

            return { data: requests, error: null };
        } catch (error) {
            return { data: [], error: error as Error };
        }
    },

    async updateJoinRequest(requestId: string, status: 'accepted' | 'rejected', tripId?: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) return { error: new Error('Not available') };
        try {
            const { error } = await supabase
                .from('trip_join_requests')
                .update({ status, updated_at: new Date().toISOString() } as any)
                .eq('id', requestId);
            if (error) throw error;

            // If accepted, increment spots_filled
            if (status === 'accepted' && tripId) {
                const { data: trip } = await supabase.from('group_trips').select('spots_filled').eq('id', tripId).single();
                await supabase.from('group_trips').update({ spots_filled: (trip?.spots_filled || 0) + 1 } as any).eq('id', tripId);
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    },

    // ============================
    // STATS
    // ============================

    async getCommunityStats(): Promise<{ travelers: string; stories: string; trips: string; countries: string }> {
        if (!isSupabaseAvailable || !supabase) {
            return { travelers: '12.4K', stories: '3.2K', trips: '890', countries: '147' };
        }
        try {
            const [storiesRes, tripsRes] = await Promise.all([
                supabase.from('travel_stories').select('id', { count: 'exact', head: true }),
                supabase.from('group_trips').select('id', { count: 'exact', head: true }),
            ]);
            const storyCount = storiesRes.count || 0;
            const tripCount = tripsRes.count || 0;
            return {
                travelers: storyCount > 100 ? `${(storyCount / 100).toFixed(1)}K` : `${storyCount}`,
                stories: `${storyCount}`,
                trips: `${tripCount}`,
                countries: '147',
            };
        } catch {
            return { travelers: '12.4K', stories: '3.2K', trips: '890', countries: '147' };
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
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

export default communityService;
