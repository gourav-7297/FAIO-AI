import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Hotel } from '../types/database.types';

interface HotelFilters {
    destination?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    safetyVerified?: boolean;
    womenFriendly?: boolean;
    ecoCertified?: boolean;
}

export const hotelsService = {
    // Search hotels with filters
    async searchHotels(filters: HotelFilters = {}): Promise<{ data: Hotel[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: [], error: null };
        }
        try {
            let query = supabase.from('hotels').select('*');

            if (filters.destination) {
                query = query.ilike('destination', `%${filters.destination}%`);
            }
            if (filters.type) {
                query = query.eq('type', filters.type);
            }
            if (filters.minPrice !== undefined) {
                query = query.gte('price_per_night', filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
                query = query.lte('price_per_night', filters.maxPrice);
            }
            if (filters.safetyVerified) {
                query = query.eq('safety_verified', true);
            }
            if (filters.womenFriendly) {
                query = query.eq('women_friendly', true);
            }
            if (filters.ecoCertified) {
                query = query.eq('eco_certified', true);
            }

            const { data, error } = await query.order('rating', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error searching hotels:', error);
            return { data: [], error: error as Error };
        }
    },

    // Get a single hotel by ID
    async getHotel(id: string): Promise<{ data: Hotel | null; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: null, error: null };
        }
        try {
            const { data, error } = await supabase
                .from('hotels')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching hotel:', error);
            return { data: null, error: error as Error };
        }
    },

    // Get hotels by destination
    async getHotelsByDestination(destination: string): Promise<{ data: Hotel[]; error: Error | null }> {
        return this.searchHotels({ destination });
    },
};

export default hotelsService;
