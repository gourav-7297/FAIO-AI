import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';
import type { LocalSecret } from '../types/database.types';

interface SubmitSecretData {
    destination: string;
    name: string;
    type: 'viewpoint' | 'food' | 'shortcut' | 'activity' | 'cafe' | 'stay';
    description?: string;
    imageUrl?: string;
    location?: { lat: number; lng: number };
}

export const secretsService = {
    // Get secrets for a destination
    async getSecrets(destination?: string): Promise<{ data: LocalSecret[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: [], error: null };
        }
        try {
            let query = supabase
                .from('local_secrets')
                .select('*')
                .order('upvotes', { ascending: false });

            if (destination) {
                query = query.ilike('destination', `%${destination}%`);
            }

            const { data, error } = await query.limit(50);

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error fetching secrets:', error);
            return { data: [], error: error as Error };
        }
    },

    // Submit a new local secret
    async submitSecret(userId: string, data: SubmitSecretData): Promise<{ data: LocalSecret | null; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: null, error: new Error('Database not available') };
        }
        try {
            const { data: secret, error } = await supabase
                .from('local_secrets')
                .insert({
                    user_id: userId,
                    destination: data.destination,
                    name: data.name,
                    type: data.type,
                    description: data.description || null,
                    image_url: data.imageUrl || null,
                    location: data.location || null,
                    is_verified: false,
                    upvotes: 0,
                } as any)
                .select()
                .single();

            if (error) throw error;
            return { data: secret, error: null };
        } catch (error) {
            console.error('Error submitting secret:', error);
            return { data: null, error: error as Error };
        }
    },

    // Upvote a secret
    async upvoteSecret(id: string): Promise<{ error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { error: new Error('Database not available') };
        }
        try {
            // Get current upvotes
            const { data: secret, error: fetchError } = await supabase
                .from('local_secrets')
                .select('upvotes')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Increment upvotes
            const { error } = await supabase
                .from('local_secrets')
                .update({ upvotes: (secret?.upvotes || 0) + 1 } as any)
                .eq('id', id);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error upvoting secret:', error);
            return { error: error as Error };
        }
    },

    // Get user's submitted secrets
    async getUserSecrets(userId: string): Promise<{ data: LocalSecret[]; error: Error | null }> {
        if (!isSupabaseAvailable || !supabase) {
            return { data: [], error: null };
        }
        try {
            const { data, error } = await supabase
                .from('local_secrets')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error fetching user secrets:', error);
            return { data: [], error: error as Error };
        }
    },
};

export default secretsService;
