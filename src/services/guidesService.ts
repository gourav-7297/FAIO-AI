import { supabaseUntyped as supabase } from '../lib/supabase';
import type { Guide } from '../types/database.types';

export const guidesService = {
    // Get guides for a destination
    async getGuides(destination?: string): Promise<{ data: Guide[]; error: Error | null }> {
        try {
            let query = supabase
                .from('guides')
                .select('*')
                .eq('is_verified', true)
                .order('rating', { ascending: false });

            if (destination) {
                query = query.ilike('destination', `%${destination}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error fetching guides:', error);
            return { data: [], error: error as Error };
        }
    },

    // Get a single guide by ID
    async getGuide(id: string): Promise<{ data: Guide | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('guides')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching guide:', error);
            return { data: null, error: error as Error };
        }
    },

    // Search guides by specialty
    async searchBySpecialty(specialty: string): Promise<{ data: Guide[]; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('guides')
                .select('*')
                .eq('is_verified', true)
                .contains('specialties', [specialty])
                .order('rating', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error searching guides:', error);
            return { data: [], error: error as Error };
        }
    },
};

export default guidesService;
