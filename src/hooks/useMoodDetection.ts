import { useState, useCallback } from 'react';

type Mood = 'calm' | 'energetic' | 'aesthetic' | 'foodie' | 'local' | 'adventurous' | 'relaxed' | 'cultural' | 'romantic' | 'budget';

interface MoodKeywords {
    [key: string]: Mood[];
}

const MOOD_KEYWORDS: MoodKeywords = {
    // Calm mood
    'relax': ['calm'],
    'peaceful': ['calm'],
    'quiet': ['calm'],
    'serene': ['calm'],
    'chill': ['calm', 'relaxed'],
    'tranquil': ['calm'],
    'spa': ['calm', 'relaxed'],
    'meditation': ['calm'],
    'zen': ['calm'],

    // Energetic mood
    'adventure': ['energetic', 'adventurous'],
    'exciting': ['energetic'],
    'active': ['energetic'],
    'thrill': ['energetic', 'adventurous'],
    'sports': ['energetic'],
    'hiking': ['energetic', 'adventurous'],
    'party': ['energetic'],
    'nightlife': ['energetic'],
    'dance': ['energetic'],

    // Aesthetic mood
    'photo': ['aesthetic'],
    'instagram': ['aesthetic'],
    'beautiful': ['aesthetic'],
    'scenic': ['aesthetic'],
    'view': ['aesthetic'],
    'sunset': ['aesthetic', 'romantic'],
    'sunrise': ['aesthetic'],
    'pretty': ['aesthetic'],
    'picturesque': ['aesthetic'],
    'architecture': ['aesthetic', 'cultural'],

    // Foodie mood
    'food': ['foodie'],
    'eat': ['foodie'],
    'restaurant': ['foodie'],
    'cuisine': ['foodie'],
    'delicious': ['foodie'],
    'taste': ['foodie'],
    'chef': ['foodie'],
    'cooking': ['foodie'],
    'street food': ['foodie', 'local'],
    'cafe': ['foodie', 'calm'],
    'coffee': ['foodie', 'calm'],

    // Local mood
    'authentic': ['local'],
    'local': ['local'],
    'hidden': ['local'],
    'secret': ['local'],
    'traditional': ['local', 'cultural'],
    'native': ['local'],
    'offbeat': ['local', 'adventurous'],

    // Adventurous
    'explore': ['adventurous'],
    'discover': ['adventurous'],
    'unknown': ['adventurous'],
    'extreme': ['adventurous', 'energetic'],
    'wild': ['adventurous'],

    // Relaxed
    'beach': ['relaxed', 'calm'],
    'lazy': ['relaxed'],
    'slow': ['relaxed'],
    'easy': ['relaxed'],
    'comfortable': ['relaxed'],

    // Cultural
    'museum': ['cultural'],
    'history': ['cultural'],
    'art': ['cultural', 'aesthetic'],
    'heritage': ['cultural'],
    'temple': ['cultural', 'calm'],
    'monument': ['cultural'],

    // Romantic
    'romantic': ['romantic'],
    'couple': ['romantic'],
    'honeymoon': ['romantic'],
    'love': ['romantic'],
    'intimate': ['romantic'],
    'candlelit': ['romantic'],

    // Budget
    'cheap': ['budget'],
    'affordable': ['budget'],
    'free': ['budget'],
    'save': ['budget'],
    'budget': ['budget'],
    'economical': ['budget'],
};

// Sentiment patterns
const POSITIVE_PATTERNS = [
    'would love', 'want to', 'excited', 'can\'t wait', 'looking forward',
    'interested in', 'fascinated', 'passionate', 'dream', 'bucket list'
];

const NEGATIVE_PATTERNS = [
    'don\'t want', 'avoid', 'hate', 'dislike', 'not interested',
    'boring', 'skip', 'no thanks'
];

export function useMoodDetection() {
    const [detectedMoods, setDetectedMoods] = useState<Mood[]>([]);
    const [confidence, setConfidence] = useState(0);

    const detectMood = useCallback((text: string): { moods: Mood[]; confidence: number } => {
        const lowerText = text.toLowerCase();
        const moodScores: Record<Mood, number> = {
            calm: 0,
            energetic: 0,
            aesthetic: 0,
            foodie: 0,
            local: 0,
            adventurous: 0,
            relaxed: 0,
            cultural: 0,
            romantic: 0,
            budget: 0,
        };

        // Check for keywords
        for (const [keyword, moods] of Object.entries(MOOD_KEYWORDS)) {
            if (lowerText.includes(keyword)) {
                moods.forEach(mood => {
                    moodScores[mood] += 1;
                });
            }
        }

        // Apply sentiment modifiers
        const isPositive = POSITIVE_PATTERNS.some(p => lowerText.includes(p));
        const isNegative = NEGATIVE_PATTERNS.some(p => lowerText.includes(p));

        if (isPositive) {
            // Boost all detected moods
            Object.keys(moodScores).forEach(mood => {
                if (moodScores[mood as Mood] > 0) {
                    moodScores[mood as Mood] *= 1.5;
                }
            });
        }

        if (isNegative) {
            // Reduce all detected moods (but don't go negative)
            Object.keys(moodScores).forEach(mood => {
                moodScores[mood as Mood] *= 0.5;
            });
        }

        // Sort moods by score
        const sortedMoods = Object.entries(moodScores)
            .filter(([_, score]) => score > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([mood]) => mood as Mood);

        // Calculate confidence (0-100)
        const totalScore = Object.values(moodScores).reduce((a, b) => a + b, 0);
        const maxPossible = Object.keys(MOOD_KEYWORDS).length * 2; // Rough estimate
        const calculatedConfidence = Math.min(Math.round((totalScore / maxPossible) * 100), 100);

        setDetectedMoods(sortedMoods);
        setConfidence(calculatedConfidence);

        return { moods: sortedMoods, confidence: calculatedConfidence };
    }, []);

    const resetMoods = useCallback(() => {
        setDetectedMoods([]);
        setConfidence(0);
    }, []);

    return {
        detectedMoods,
        confidence,
        detectMood,
        resetMoods,
    };
}

// Helper to get mood-based recommendations
export function getMoodRecommendations(moods: Mood[]): string[] {
    const recommendations: Record<Mood, string[]> = {
        calm: ['Spa retreat', 'Quiet café', 'Garden walk', 'Meditation center'],
        energetic: ['Adventure park', 'Nightclub', 'Sports event', 'Hiking trail'],
        aesthetic: ['Photo spot', 'Art gallery', 'Scenic viewpoint', 'Boutique hotel'],
        foodie: ['Local restaurant', 'Food tour', 'Cooking class', 'Night market'],
        local: ['Hidden gem', 'Local neighborhood', 'Traditional shop', 'Family restaurant'],
        adventurous: ['Off-road tour', 'Cave exploration', 'Mountain climb', 'Wild safari'],
        relaxed: ['Beach resort', 'Countryside inn', 'Slow food experience', 'Sunset cruise'],
        cultural: ['Museum visit', 'Historical site', 'Traditional performance', 'Heritage walk'],
        romantic: ['Candlelit dinner', 'Sunset point', 'Couples spa', 'Private tour'],
        budget: ['Free attraction', 'Street food', 'Hostel', 'Walking tour'],
    };

    const allRecs: string[] = [];
    moods.slice(0, 3).forEach(mood => {
        allRecs.push(...(recommendations[mood] || []));
    });

    // Return unique recommendations
    return [...new Set(allRecs)].slice(0, 8);
}

// Mood emoji mapping
export const MOOD_EMOJIS: Record<Mood, string> = {
    calm: '😌',
    energetic: '⚡',
    aesthetic: '📸',
    foodie: '🍜',
    local: '🏘️',
    adventurous: '🧗',
    relaxed: '🏖️',
    cultural: '🏛️',
    romantic: '💕',
    budget: '💰',
};
