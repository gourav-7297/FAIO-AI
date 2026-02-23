import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Groq uses the OpenAI-compatible API with a different base URL
let groqClient: OpenAI | null = null;

function getGroqClient() {
    if (!groqClient && API_KEY) {
        groqClient = new OpenAI({
            apiKey: API_KEY,
            baseURL: 'https://api.groq.com/openai/v1',
            dangerouslyAllowBrowser: true,
        });
    }
    return groqClient;
}

// Fast, high-quality model on Groq
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

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

const TRIP_GENERATION_PROMPT = `You are FAIO, an expert AI travel planner. Generate a COMPREHENSIVE AND HIGHLY DETAILED travel itinerary.

IMPORTANT: Respond ONLY with valid JSON. No markdown. No explanations. No comments.

Input:
- Destination: {destination}
- Dates: {startDate} to {endDate}
- Budget: $\{budget\} USD
- Travel Style: {travelStyles}
- Travelers: {travelers}

Generate a JSON response with this EXACT structure. BE VERY DETAILED — fill every day with 5-7 activities, include 6+ top places, 5+ dining spots:
{
  "destination": "City, Country",
  "dates": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "totalDays": number,
  "totalCost": number,
  "carbonFootprint": number,
  "sustainabilityScore": number (1-100),
  "overview": "3-4 sentences capturing the destination vibe, culture, and what makes this trip special.",
  "bestTimeToVisit": "e.g. March to May",
  "currency": "e.g. JPY (Japanese Yen)",
  "language": "e.g. Japanese",
  "topPlaces": [
    { "name": "Place Name", "type": "History/Nature/Landmark/Market/Park/Temple", "description": "2 sentences why this is a must-visit", "bestTime": "Morning/Sunset/Evening", "estimatedCost": "Free/$10/etc", "rating": 4.8 }
  ],
  "dining": [
    { "name": "Restaurant Name", "cuisine": "Local/Fusion/Street Food/Fine Dining", "price": "$/$$/$$$", "description": "What makes this place special", "specialty": "Must-order dish name", "rating": 4.5, "neighborhood": "Area name" }
  ],
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayNumber": 1,
      "theme": "Short theme like 'Cultural Immersion' or 'Beach & Chill'",
      "activities": [
        {
          "id": "d1a1",
          "name": "Activity Name",
          "time": "09:00",
          "duration": "2 hours",
          "cost": 20,
          "carbonKg": 0.5,
          "location": "Specific address or area name",
          "description": "2-3 sentences about what to do and why it's worth visiting.",
          "backupOption": "Indoor alternative if weather is bad",
          "isEcoFriendly": true,
          "isOutdoor": true,
          "type": "culture/food/nature/adventure/shopping/nightlife"
        }
      ],
      "totalCost": 100
    }
  ],
  "packingList": ["item1", "item2", "item3", "item4", "item5", "item6", "item7", "item8"],
  "safetyTips": ["tip1", "tip2", "tip3", "tip4"],
  "localSecrets": ["Hidden gem 1", "Insider tip 2", "Local trick 3", "Secret spot 4"],
  "transportTips": ["How to get from airport", "Best local transport", "Apps to use"]
}

CRITICAL REQUIREMENTS:
1. Generate AT LEAST 5-7 activities per day, spread from morning to night.
2. Include AT LEAST 6 top places and 5 dining spots.
3. Each activity MUST have a specific location, detailed description, and realistic cost.
4. Include a mix of activity types (culture, food, nature, adventure, shopping, nightlife).
5. Activities should have realistic travel times between them.
6. Include local breakfast, lunch, dinner, and snack stops.
7. Make the packing list have 8+ items tailored to the destination.
8. Make safety tips specific to the destination, not generic.
9. Local secrets should be things only locals would know.
10. Each day should have a unique theme.

Make it incredibly detailed, specific, and tailored to the travel style. This should feel like a professional travel guide.`;

export async function generateTripWithAI(params: TripGenerationParams): Promise<GeneratedTrip | null> {
    const ai = getGroqClient();

    if (!ai) {
        console.warn('Groq AI not configured, using fallback');
        return generateFallbackTrip(params);
    }

    try {
        const prompt = TRIP_GENERATION_PROMPT
            .replace('{destination}', params.destination)
            .replace('{startDate}', params.startDate)
            .replace('{endDate}', params.endDate)
            .replace('{budget}', params.budget.toString())
            .replace('{travelStyles}', params.travelStyles.join(', '))
            .replace('{travelers}', (params.travelers || 1).toString());

        const response = await ai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 8000,
        });

        const text = response.choices[0]?.message?.content || '';

        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7);
        if (jsonText.startsWith('```')) jsonText = jsonText.slice(3);
        if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);

        return JSON.parse(jsonText.trim()) as GeneratedTrip;
    } catch (error) {
        console.error('Error generating trip with Groq:', error);
        return generateFallbackTrip(params);
    }
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const CHAT_SYSTEM_PROMPT = `You are FAIO, an elite AI travel assistant. Your goal is to provide exceptional, professional, and inspiring travel advice.

STYLE GUIDELINES:
1. **Tone**: Enthusiastic, professional, knowledgeable, and warm. Like a seasoned travel expert who loves their job.
2. **Formatting**:
   - Use **bold** for locations, key tips, and important details.
   - Use emojis effectively to add visual appeal (e.g., ✈️, 🍜, 📸, 🏨).
   - Use bullet points for recommendations or lists.
   - Keep paragraphs short and readable.
3. **Structure**:
   - Start with a direct and helpful opening.
   - Provide the core advice with specific examples.
   - Include "Pro Tips" or "Local Secrets" where relevant.
   - End with an engaging follow-up question.

INTERACTION RULES:
- If asked complexity planning, give great initial ideas and mention the "Planner" feature.
- Be concise but comprehensive. Focus on value.
- You are FAIO (Future AI Organizer). Make travel magical.`;

export async function chatWithAI(messages: ChatMessage[], userMessage: string): Promise<string> {
    const ai = getGroqClient();
    if (!ai) return getFallbackChatResponse(userMessage);

    try {
        const response = await ai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: CHAT_SYSTEM_PROMPT },
                ...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userMessage }
            ],
            max_tokens: 500
        });
        return response.choices[0]?.message?.content?.trim() || getFallbackChatResponse(userMessage);
    } catch (error) {
        return getFallbackChatResponse(userMessage);
    }
}

// Detailed Fallback Trip
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
                {
                    id: `d${i + 1}a1`, name: 'Morning Café & Breakfast', time: '08:00', duration: '1 hour',
                    cost: dailyBudget * 0.08, carbonKg: 0.2, location: `${params.destination} Old Town`,
                    description: 'Start the day with local coffee and pastries at a charming café.', isEcoFriendly: true, type: 'food'
                },
                {
                    id: `d${i + 1}a2`, name: 'Heritage Walking Tour', time: '09:30', duration: '2.5 hours',
                    cost: dailyBudget * 0.15, carbonKg: 0.3, location: `${params.destination} Historic District`,
                    description: 'Explore iconic landmarks and learn the city\'s fascinating history.', isOutdoor: true,
                    backupOption: 'Museum Visit', type: 'culture'
                },
                {
                    id: `d${i + 1}a3`, name: 'Street Food Lunch', time: '12:30', duration: '1.5 hours',
                    cost: dailyBudget * 0.10, carbonKg: 0.3, location: 'Central Market Area',
                    description: 'Taste authentic local street food at the bustling city market.', isEcoFriendly: true, type: 'food'
                },
                {
                    id: `d${i + 1}a4`, name: 'Scenic Viewpoint', time: '14:30', duration: '1.5 hours',
                    cost: dailyBudget * 0.05, carbonKg: 0.5, location: 'City Hilltop Park',
                    description: 'Take in panoramic views and capture stunning photos.', isOutdoor: true,
                    backupOption: 'Indoor Observation Deck', type: 'nature'
                },
                {
                    id: `d${i + 1}a5`, name: 'Local Market Shopping', time: '16:30', duration: '1.5 hours',
                    cost: dailyBudget * 0.15, carbonKg: 0.2, location: 'Artisan Quarter',
                    description: 'Browse handmade crafts, souvenirs, and local produce.', type: 'shopping'
                },
                {
                    id: `d${i + 1}a6`, name: 'Sunset & Dinner', time: '19:00', duration: '2 hours',
                    cost: dailyBudget * 0.20, carbonKg: 0.5, location: 'Waterfront Restaurant District',
                    description: 'Enjoy a wonderful dinner with sunset views at a top-rated restaurant.', type: 'food'
                },
            ],
            totalCost: dailyBudget
        });
    }

    return {
        destination: params.destination,
        dates: { start: params.startDate, end: params.endDate },
        totalDays, totalCost: params.budget,
        carbonFootprint: totalDays * 2.5, sustainabilityScore: 78,
        overview: `A fantastic ${totalDays}-day journey to ${params.destination}, blending culture, cuisine, and adventure. You'll explore iconic landmarks, taste authentic street food, and discover hidden gems that most tourists never find.`,
        bestTimeToVisit: 'Year-round',
        currency: 'Local currency',
        language: 'Local language',
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

function getFallbackChatResponse(_message: string): string {
    return "I can help you plan your trip! Try the Planner feature for a full AI-powered itinerary.";
}

export function isAIConfigured(): boolean {
    return !!API_KEY;
}
