import { supabaseUntyped as supabase } from '../lib/supabase';
import type { Review } from '../types/database.types';

interface CreateReviewData {
    placeId: string;
    rating: number;
    comment?: string;
}

export const reviewsService = {
    // Get reviews for a place
    async getReviews(placeId: string): Promise<{ data: Review[]; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('place_id', placeId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return { data: [], error: error as Error };
        }
    },

    // Create a review
    async createReview(userId: string, data: CreateReviewData): Promise<{ data: Review | null; error: Error | null }> {
        try {
            const { data: review, error } = await supabase
                .from('reviews')
                .insert({
                    user_id: userId,
                    place_id: data.placeId,
                    rating: data.rating,
                    comment: data.comment || null,
                } as any)
                .select()
                .single();

            if (error) throw error;
            return { data: review, error: null };
        } catch (error) {
            console.error('Error creating review:', error);
            return { data: null, error: error as Error };
        }
    },

    // Get user's reviews
    async getUserReviews(userId: string): Promise<{ data: Review[]; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            return { data: [], error: error as Error };
        }
    },

    // Delete a review
    async deleteReview(id: string): Promise<{ error: Error | null }> {
        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error deleting review:', error);
            return { error: error as Error };
        }
    },

    // Get average rating for a place
    async getAverageRating(placeId: string): Promise<{ rating: number; count: number }> {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('rating')
                .eq('place_id', placeId);

            if (error || !data || data.length === 0) {
                return { rating: 0, count: 0 };
            }

            const sum = data.reduce((acc, r) => acc + (r.rating || 0), 0);
            return { rating: sum / data.length, count: data.length };
        } catch (error) {
            console.error('Error getting average rating:', error);
            return { rating: 0, count: 0 };
        }
    },
};

export default reviewsService;
