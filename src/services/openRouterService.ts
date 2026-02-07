import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// OpenRouter uses OpenAI's SDK but with a different base URL
let openRouter: OpenAI | null = null;

function getOpenAI() {
    if (!openRouter && API_KEY) {
        openRouter = new OpenAI({
            apiKey: API_KEY,
            baseURL: 'https://openrouter.ai/api/v1',
            dangerouslyAllowBrowser: true, // For client-side use
            defaultHeaders: {
                'HTTP-Referer': 'https://faio.ai', // Required by OpenRouter
                'X-Title': 'FAIO Travel Assistant', // Optional
            }
        });
    }
    return openRouter;
}

// Low-cost, reliable model
const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

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
}

export interface GeneratedDay {
    date: string;
    dayNumber: number;
    activities: GeneratedActivity[];
    totalCost: number;
    weather?: string;
}

// New Interfaces for Detailed Sections
export interface TopPlace {
    name: string;
    type: string;
    description: string;
    bestTime: string;
}

export interface DiningSpot {
    name: string;
    cuisine: string;
    price: string;
    description: string;
    specialty: string;
}

export interface GeneratedTrip {
    destination: string;
    dates: { start: string; end: string };
    totalDays: number;
    totalCost: number;
    carbonFootprint: number;
    sustainabilityScore: number;

    // Detailed Sections
    overview: string; // Brief intro/vibe check
    topPlaces: TopPlace[]; // Must-see spots
    dining: DiningSpot[]; // Food recommendations

    days: GeneratedDay[];
    packingList: string[];
    safetyTips: string[];
    localSecrets: string[];
}

const TRIP_GENERATION_PROMPT = `You are FAIO, an expert AI travel planner. Generate a HIGHLY DETAILED travel itinerary.

IMPORTANT: Respond ONLY with valid JSON. No markdown. No explanations.

Input:
- Destination: {destination}
- Dates: {startDate} to {endDate}
- Budget: ${"{budget}"} USD
- Travel Style: {travelStyles}
- Travelers: {travelers}

Generate a JSON response with this EXACT structure:
{
  "destination": "City, Country",
  "dates": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "totalDays": number,
  "totalCost": number,
  "carbonFootprint": number,
  "sustainabilityScore": number,
  "overview": "2-3 sentences capturing the vibe of the trip.",
  "topPlaces": [
    { "name": "Place Name", "type": "History/Nature/etc", "description": "Why go?", "bestTime": "Sunset/Early Morning" }
  ],
  "dining": [
    { "name": "Restaurant Name", "cuisine": "Local/Fusion", "price": "$$", "description": "Vibe check", "specialty": "Must order dish" }
  ],
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayNumber": 1,
      "activities": [
        {
          "id": "u1",
          "name": "Activity Name",
          "time": "09:00",
          "duration": "2 hours",
          "cost": 20,
          "carbonKg": 0.5,
          "location": "Address",
          "description": "Detailed description of what to do there.",
          "backupOption": "Indoor alternative",
          "isEcoFriendly": true
        }
      ],
      "totalCost": 100
    }
  ],
  "packingList": ["item1", "item2"],
  "safetyTips": ["tip1", "tip2"],
  "localSecrets": ["Hidden spot 1", "Local tip 2"]
}

Make it detailed, specific, and tailored to the travel style.`;

export async function generateTripWithAI(params: TripGenerationParams): Promise<GeneratedTrip | null> {
    const ai = getOpenAI();

    if (!ai) {
        console.warn('OpenRouter not configured, using fallback');
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
            max_tokens: 4000, // Increased for detailed response
        });

        const text = response.choices[0]?.message?.content || '';

        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7);
        if (jsonText.startsWith('```')) jsonText = jsonText.slice(3);
        if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);

        return JSON.parse(jsonText.trim()) as GeneratedTrip;
    } catch (error) {
        console.error('Error generating trip with OpenRouter:', error);
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

// Simplified Chat Function (re-implementation of previous logic or simplified import)
// Since we are replacing the whole file, we need to keep chatWithAI
export async function chatWithAI(messages: ChatMessage[], userMessage: string): Promise<string> {
    const ai = getOpenAI();
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

// Updated Fallback Function
function generateFallbackTrip(params: TripGenerationParams): GeneratedTrip {
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const days: GeneratedDay[] = [];
    const dailyBudget = params.budget / totalDays;

    for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        days.push({
            date: date.toISOString().split('T')[0],
            dayNumber: i + 1,
            activities: [
                {
                    id: `day${i + 1}-1`,
                    name: 'Morning Exploration',
                    time: '09:00',
                    duration: '3 hours',
                    cost: dailyBudget * 0.3,
                    carbonKg: 0.5,
                    location: `${params.destination} Center`,
                    description: 'Explore local landmarks and soak in the atmosphere.',
                    isEcoFriendly: true
                },
                {
                    id: `day${i + 1}-2`,
                    name: 'Local Dining',
                    time: '13:00',
                    duration: '1.5 hours',
                    cost: dailyBudget * 0.2,
                    carbonKg: 0.3,
                    location: 'City Center',
                    description: 'Try the famous local dish at a recommended spot.',
                    isEcoFriendly: true
                }
            ],
            totalCost: dailyBudget
        });
    }

    return {
        destination: params.destination,
        dates: { start: params.startDate, end: params.endDate },
        totalDays,
        totalCost: params.budget,
        carbonFootprint: totalDays * 2.5,
        sustainabilityScore: 78,
        overview: `A fantastic ${totalDays}-day journey to ${params.destination}, blending culture, food, and adventure.`,
        topPlaces: [
            { name: "Historic Old Town", type: "Culture", description: "Beautiful ancient architecture and streets.", bestTime: "Morning" },
            { name: "Central Park", type: "Nature", description: "Lush greenery in the heart of the city.", bestTime: "Afternoon" }
        ],
        dining: [
            { name: "The Local Spoon", cuisine: "Local", price: "$$", description: "Authentic flavors in a cozy setting.", specialty: "Signature Stew" },
            { name: "Sunset Lounge", cuisine: "Fusion", price: "$$$", description: "Great views and cocktails.", specialty: "Fresh Seafood" }
        ],
        days,
        packingList: ['Walking shoes', 'Camera', 'Adaptor'],
        safetyTips: ['Watch your bags', 'Use official taxis'],
        localSecrets: ['Visit the market early', 'Try the street food']
    };
}

function getFallbackChatResponse(_message: string): string {
    return "I can help you plan your trip! Try the Planner feature.";
}

export function isAIConfigured(): boolean {
    return !!API_KEY;
}
