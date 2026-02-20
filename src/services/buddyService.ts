import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';
import type { BuddyRequest } from '../types/database.types';

interface CreateBuddyRequestData {
    destination: string;
    travelDates: {
        start: string;
        end: string;
    };
    preferences: {
        travelStyle?: string[];
        budget?: string;
        interests?: string[];
        ageRange?: string;
        gender?: string;
    };
}

export const buddyService = {
    // Create a buddy request
    async createRequest(userId: string, data: CreateBuddyRequestData): Promise<{ data: BuddyRequest | null; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: null, error: new Error('Database not available') };
        }
        try {
            const { data: request, error } = await supabase
                .from('buddy_requests')
                .insert({
                    user_id: userId,
                    destination: data.destination,
                    travel_dates: data.travelDates,
                    preferences: data.preferences,
                    status: 'open',
                } as any)
                .select()
                .single();

            if (error) throw error;
            return { data: request, error: null };
        } catch (error) {
            console.error('Error creating buddy request:', error);
            return { data: null, error: error as Error };
        }
    },

    // Find matching buddy requests
    async findMatches(destination: string, _travelDates?: { start: string; end: string }): Promise<{ data: BuddyRequest[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: [], error: null };
        }
        try {
            let query = supabase
                .from('buddy_requests')
                .select('*')
                .eq('status', 'open')
                .ilike('destination', `%${destination}%`);

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error finding matches:', error);
            return { data: [], error: error as Error };
        }
    },

    // Get user's buddy requests
    async getUserRequests(userId: string): Promise<{ data: BuddyRequest[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: [], error: null };
        }
        try {
            const { data, error } = await supabase
                .from('buddy_requests')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error fetching user requests:', error);
            return { data: [], error: error as Error };
        }
    },

    // Update request status
    async updateRequestStatus(id: string, status: 'open' | 'matched' | 'closed'): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { error: new Error('Database not available') };
        }
        try {
            const { error } = await supabase
                .from('buddy_requests')
                .update({ status } as any)
                .eq('id', id);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error updating request:', error);
            return { error: error as Error };
        }
    },

    // Cancel a buddy request
    async cancelRequest(id: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { error: new Error('Database not available') };
        }
        try {
            const { error } = await supabase
                .from('buddy_requests')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error canceling request:', error);
            return { error: error as Error };
        }
    },
};

export default buddyService;
