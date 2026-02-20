import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Itinerary } from '../types/database.types';

interface SaveItineraryData {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    styles: string[];
    dayPlan: any[];
    carbonFootprint?: number;
    safetyScore?: number;
}

export const itineraryService = {
    // Save a new itinerary
    async saveItinerary(userId: string, data: SaveItineraryData): Promise<{ data: Itinerary | null; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: null, error: new Error('Database not available') };
        }
        try {
            const { data: itinerary, error } = await supabase
                .from('itineraries')
                .insert({
                    user_id: userId,
                    destination: data.destination,
                    start_date: data.startDate,
                    end_date: data.endDate,
                    budget: data.budget,
                    styles: data.styles,
                    day_plan: data.dayPlan,
                    carbon_footprint: data.carbonFootprint || 0,
                    safety_score: data.safetyScore || 85,
                    is_public: false,
                } as any)
                .select()
                .single();

            if (error) throw error;
            return { data: itinerary, error: null };
        } catch (error) {
            console.error('Error saving itinerary:', error);
            return { data: null, error: error as Error };
        }
    },

    // Get user's itineraries
    async getUserItineraries(userId: string): Promise<{ data: Itinerary[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: [], error: null };
        }
        try {
            const { data, error } = await supabase
                .from('itineraries')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error fetching itineraries:', error);
            return { data: [], error: error as Error };
        }
    },

    // Get a single itinerary by ID
    async getItinerary(id: string): Promise<{ data: Itinerary | null; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: null, error: null };
        }
        try {
            const { data, error } = await supabase
                .from('itineraries')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching itinerary:', error);
            return { data: null, error: error as Error };
        }
    },

    // Delete an itinerary
    async deleteItinerary(id: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { error: new Error('Database not available') };
        }
        try {
            const { error } = await supabase
                .from('itineraries')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error deleting itinerary:', error);
            return { error: error as Error };
        }
    },

    // Share an itinerary (make public)
    async shareItinerary(id: string): Promise<{ shareUrl: string | null; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { shareUrl: null, error: new Error('Database not available') };
        }
        try {
            const { error } = await supabase
                .from('itineraries')
                .update({ is_public: true } as any)
                .eq('id', id);

            if (error) throw error;

            const shareUrl = `${window.location.origin}/shared/${id}`;
            return { shareUrl, error: null };
        } catch (error) {
            console.error('Error sharing itinerary:', error);
            return { shareUrl: null, error: error as Error };
        }
    },

    // Get a public itinerary
    async getPublicItinerary(id: string): Promise<{ data: Itinerary | null; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: null, error: null };
        }
        try {
            const { data, error } = await supabase
                .from('itineraries')
                .select('*')
                .eq('id', id)
                .eq('is_public', true)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching public itinerary:', error);
            return { data: null, error: error as Error };
        }
    },
};

export default itineraryService;
