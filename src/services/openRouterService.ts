/**
 * AI Service — Frontend client for the faio-api Edge Function.
 *
 * All Groq API calls now happen server-side. This file is a thin
 * wrapper that sends requests to the Edge Function and returns results.
 *
 * NO API KEYS are stored or used in this file.
 */

import { fetchEdgeFn } from '../lib/edgeFn';

export interface TripGenerationParams {
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    travelStyles: string[];
    travelers?: number;
}

export interface GeneratedActivity {
    id: string;
    name: string;
    time: string;
    duration: string;
    cost: number;
    carbonKg: number;
    location: string;
    description: string;
    backupOption?: string;
    isEcoFriendly?: boolean;
    isOutdoor?: boolean;
    type?: string;
}

export interface GeneratedDay {
    date: string;
    dayNumber: number;
    theme: string;
    activities: GeneratedActivity[];
    totalCost: number;
    weather?: string;
}

export interface TopPlace {
    name: string;
    type: string;
    description: string;
    bestTime: string;
    estimatedCost?: string;
    rating?: number;
}

export interface DiningSpot {
    name: string;
    cuisine: string;
    price: string;
    description: string;
    specialty: string;
    rating?: number;
    neighborhood?: string;
}

export interface GeneratedTrip {
    destination: string;
    dates: { start: string; end: string };
    totalDays: number;
    totalCost: number;
    carbonFootprint: number;
    sustainabilityScore: number;

    overview: string;
    bestTimeToVisit: string;
    currency: string;
    language: string;
    topPlaces: TopPlace[];
    dining: DiningSpot[];

    days: GeneratedDay[];
    packingList: string[];
    safetyTips: string[];
    localSecrets: string[];
    transportTips: string[];
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AnalyzedReceipt {
    name: string;
    amount: number;
    category: string;
}

// ━━━ Trip Generation ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function generateTripWithAI(params: TripGenerationParams): Promise<GeneratedTrip | null> {
    try {
        return await fetchEdgeFn<GeneratedTrip>({
            method: 'POST',
            path: '/ai/generate-trip',
            body: {
                destination: params.destination,
                startDate: params.startDate,
                endDate: params.endDate,
                budget: params.budget,
                travelStyles: params.travelStyles,
                travelers: params.travelers || 1,
            },
        });
    } catch (error) {
        console.error('Error generating trip:', error);
        return generateFallbackTrip(params);
    }
}

// ━━━ Chat ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function chatWithAI(messages: ChatMessage[], userMessage: string): Promise<string> {
    try {
        const data = await fetchEdgeFn<{ reply: string }>({
            method: 'POST',
            path: '/ai/chat',
            body: { messages, userMessage },
        });
        return data.reply || getFallbackChatResponse(userMessage);
    } catch (error) {
        console.error('Chat error:', error);
        return getFallbackChatResponse(userMessage);
    }
}

// ━━━ Receipt Analysis ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function analyzeReceiptWithAI(base64Image: string): Promise<AnalyzedReceipt | null> {
    try {
        return await fetchEdgeFn<AnalyzedReceipt>({
            method: 'POST',
            path: '/ai/receipt',
            body: { base64Image },
        });
    } catch (error) {
        console.error('Receipt analysis error:', error);
        return null;
    }
}

// ━━━ Budget Advice ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function generateBudgetAdvice(
    expenses: any[],
    budget: number
): Promise<{ message: string; emoji: string; type: 'good' | 'warning' | 'danger' }> {
    try {
        return await fetchEdgeFn<{ message: string; emoji: string; type: 'good' | 'warning' | 'danger' }>({
            method: 'POST',
            path: '/ai/budget-advice',
            body: { expenses, budget },
        });
    } catch (error) {
        console.error('Budget advice error:', error);
        return { message: "Looking good! Add more expenses so I can analyze your spending.", emoji: "👀", type: "good" };
    }
}

// ━━━ Status Check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function isAIConfigured(): boolean {
    // AI is always available via the Edge Function — no client-side key needed
    return true;
}

// ━━━ Fallback Data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getFallbackChatResponse(_message: string): string {
    return "I can help you plan your trip! Try the Planner feature for a full AI-powered itinerary.";
}

function generateFallbackTrip(params: TripGenerationParams): GeneratedTrip {
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const days: GeneratedDay[] = [];
    const dailyBudget = params.budget / totalDays;
    const themes = ['Cultural Immersion', 'Adventure Day', 'Local Flavors & Markets', 'Nature & Relaxation', 'Hidden Gems', 'Nightlife & Entertainment', 'Shopping & Wellness'];

    for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        days.push({
            date: date.toISOString().split('T')[0],
            dayNumber: i + 1,
            theme: themes[i % themes.length],
            activities: [
                { id: `d${i + 1}a1`, name: 'Morning Café & Breakfast', time: '08:00', duration: '1 hour', cost: dailyBudget * 0.08, carbonKg: 0.2, location: `${params.destination} Old Town`, description: 'Start the day with local coffee and pastries at a charming café.', isEcoFriendly: true, type: 'food' },
                { id: `d${i + 1}a2`, name: 'Heritage Walking Tour', time: '09:30', duration: '2.5 hours', cost: dailyBudget * 0.15, carbonKg: 0.3, location: `${params.destination} Historic District`, description: 'Explore iconic landmarks and learn the city\'s fascinating history.', isOutdoor: true, backupOption: 'Museum Visit', type: 'culture' },
                { id: `d${i + 1}a3`, name: 'Street Food Lunch', time: '12:30', duration: '1.5 hours', cost: dailyBudget * 0.10, carbonKg: 0.3, location: 'Central Market Area', description: 'Taste authentic local street food at the bustling city market.', isEcoFriendly: true, type: 'food' },
                { id: `d${i + 1}a4`, name: 'Scenic Viewpoint', time: '14:30', duration: '1.5 hours', cost: dailyBudget * 0.05, carbonKg: 0.5, location: 'City Hilltop Park', description: 'Take in panoramic views and capture stunning photos.', isOutdoor: true, backupOption: 'Indoor Observation Deck', type: 'nature' },
                { id: `d${i + 1}a5`, name: 'Local Market Shopping', time: '16:30', duration: '1.5 hours', cost: dailyBudget * 0.15, carbonKg: 0.2, location: 'Artisan Quarter', description: 'Browse handmade crafts, souvenirs, and local produce.', type: 'shopping' },
                { id: `d${i + 1}a6`, name: 'Sunset & Dinner', time: '19:00', duration: '2 hours', cost: dailyBudget * 0.20, carbonKg: 0.5, location: 'Waterfront Restaurant District', description: 'Enjoy a wonderful dinner with sunset views at a top-rated restaurant.', type: 'food' },
            ],
            totalCost: dailyBudget,
        });
    }

    return {
        destination: params.destination,
        dates: { start: params.startDate, end: params.endDate },
        totalDays, totalCost: params.budget,
        carbonFootprint: totalDays * 2.5, sustainabilityScore: 78,
        overview: `A fantastic ${totalDays}-day journey to ${params.destination}, blending culture, cuisine, and adventure. You'll explore iconic landmarks, taste authentic street food, and discover hidden gems that most tourists never find.`,
        bestTimeToVisit: 'Year-round', currency: 'Local currency', language: 'Local language',
        topPlaces: [
            { name: "Historic Old Town", type: "Culture", description: "Beautiful ancient architecture and winding cobblestone streets.", bestTime: "Morning", estimatedCost: "Free", rating: 4.8 },
            { name: "Central Park", type: "Nature", description: "Lush greenery, jogging paths, and a peaceful lake.", bestTime: "Afternoon", estimatedCost: "Free", rating: 4.6 },
            { name: "National Museum", type: "Museum", description: "World-class artifacts spanning thousands of years of history.", bestTime: "Morning", estimatedCost: "$15", rating: 4.7 },
            { name: "City Viewpoint", type: "Landmark", description: "Panoramic 360° views of the entire city skyline.", bestTime: "Sunset", estimatedCost: "$5", rating: 4.9 },
            { name: "Artisan Market", type: "Market", description: "Handmade crafts, local produce, and vibrant atmosphere.", bestTime: "Morning", estimatedCost: "Free", rating: 4.5 },
            { name: "Waterfront Promenade", type: "Nature", description: "Beautiful seaside walk with cafés and street performers.", bestTime: "Evening", estimatedCost: "Free", rating: 4.4 },
        ],
        dining: [
            { name: "The Local Spoon", cuisine: "Local", price: "$$", description: "Authentic flavors in a cozy, family-run setting.", specialty: "Signature Stew", rating: 4.7, neighborhood: "Old Town" },
            { name: "Street Noodle Stand", cuisine: "Street Food", price: "$", description: "The best noodles in town — queue is worth it.", specialty: "Hand-pulled Noodles", rating: 4.8, neighborhood: "Central Market" },
            { name: "Sunset Lounge", cuisine: "Fusion", price: "$$$", description: "Rooftop cocktails with incredible sunset views.", specialty: "Fresh Seafood Platter", rating: 4.6, neighborhood: "Waterfront" },
            { name: "Morning Brew Café", cuisine: "Café", price: "$", description: "Artisan coffee and freshly baked croissants.", specialty: "Pour-over Coffee", rating: 4.5, neighborhood: "Arts District" },
            { name: "Garden Bistro", cuisine: "Vegetarian", price: "$$", description: "Farm-to-table dishes in a beautiful garden.", specialty: "Seasonal Tasting Menu", rating: 4.4, neighborhood: "Uptown" },
        ],
        days,
        packingList: ['Walking shoes', 'Camera', 'Universal adaptor', 'Day backpack', 'Sunscreen SPF50', 'Reusable water bottle', 'Light rain jacket', 'Portable charger'],
        safetyTips: ['Use official taxis or ride apps', 'Keep valuables in hotel safe', 'Carry a copy of your passport', 'Stay in well-lit areas at night'],
        localSecrets: ['Visit the market before 8am for the freshest produce', 'The rooftop bar on 5th Ave has no cover charge at sunset', 'Ask locals about the hidden garden behind the cathedral', 'Take the local ferry instead of a taxi — much cheaper and scenic'],
        transportTips: ['Airport express train is the fastest way to city center', 'Day passes for public transport save money', 'Download the local transit app'],
    };
}
