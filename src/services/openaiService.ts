import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

let openai: OpenAI | null = null;

function getOpenAI() {
    if (!openai && API_KEY) {
        openai = new OpenAI({
            apiKey: API_KEY,
            dangerouslyAllowBrowser: true // For client-side use
        });
    }
    return openai;
}

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

export interface GeneratedTrip {
    destination: string;
    dates: { start: string; end: string };
    totalDays: number;
    totalCost: number;
    carbonFootprint: number;
    sustainabilityScore: number;
    days: GeneratedDay[];
    packingList: string[];
    safetyTips: string[];
    localSecrets: string[];
}

const TRIP_GENERATION_PROMPT = `You are FAIO, an AI travel companion. Generate a detailed travel itinerary.

IMPORTANT: Respond ONLY with valid JSON, no markdown, no explanation.

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
  "carbonFootprint": number (in kg CO2),
  "sustainabilityScore": number (1-100),
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayNumber": 1,
      "activities": [
        {
          "id": "unique-id",
          "name": "Activity Name",
          "time": "09:00",
          "duration": "2 hours",
          "cost": 25,
          "carbonKg": 0.5,
          "location": "Address or area",
          "description": "Brief description",
          "backupOption": "Alternative if closed/busy",
          "isEcoFriendly": true
        }
      ],
      "totalCost": 100
    }
  ],
  "packingList": ["item1", "item2"],
  "safetyTips": ["tip1", "tip2"],
  "localSecrets": ["secret1", "secret2"]
}

Make the itinerary realistic, fun, and consider local culture. Include eco-friendly options.`;

export async function generateTripWithAI(params: TripGenerationParams): Promise<GeneratedTrip | null> {
    const ai = getOpenAI();

    if (!ai) {
        console.warn('OpenAI not configured, using fallback');
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
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const text = response.choices[0]?.message?.content || '';

        // Clean up the response - remove markdown code blocks if present
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.slice(7);
        }
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.slice(3);
        }
        if (jsonText.endsWith('```')) {
            jsonText = jsonText.slice(0, -3);
        }

        const trip = JSON.parse(jsonText.trim()) as GeneratedTrip;
        return trip;
    } catch (error) {
        console.error('Error generating trip with OpenAI:', error);
        return generateFallbackTrip(params);
    }
}

// Chat with AI - Enhanced for better responses
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const CHAT_SYSTEM_PROMPT = `You are FAIO, an expert AI travel companion with deep knowledge about destinations worldwide. You provide accurate, helpful, and personalized travel advice.

## Your Expertise Areas:
1. **Destinations**: Detailed knowledge of cities, countries, attractions, neighborhoods, and hidden gems
2. **Planning**: Itinerary creation, timing, logistics, and day-by-day schedules
3. **Local Culture**: Customs, etiquette, language tips, festivals, and traditions
4. **Food & Dining**: Restaurant recommendations, local cuisines, street food, dietary accommodations
5. **Safety**: Travel advisories, safe neighborhoods, common scams, emergency info
6. **Budget**: Cost estimates, money-saving tips, currency exchange, tipping customs
7. **Transportation**: Best ways to get around, public transit, taxis, walkability
8. **Accommodation**: Areas to stay, types of lodging, booking tips
9. **Weather & Timing**: Best times to visit, seasonal considerations, what to pack
10. **Sustainability**: Eco-friendly options, responsible tourism practices

## Response Guidelines:
- Give SPECIFIC, ACTIONABLE advice with real names of places, restaurants, and attractions
- Include PRACTICAL details like operating hours, approximate costs, and how to get there
- Share INSIDER TIPS that locals would know
- Be ACCURATE - if you're unsure about something, say so rather than making up information
- Keep responses CONVERSATIONAL but informative (3-5 sentences for simple questions, more for complex ones)
- Use EMOJIS sparingly to add personality (1-2 per response max)
- When recommending places, explain WHY they're worth visiting
- Consider the traveler's context (solo, family, budget, luxury, adventure, relaxation)

Remember: You're a knowledgeable travel companion who genuinely helps people have amazing trips!`;

export async function chatWithAI(messages: ChatMessage[], userMessage: string): Promise<string> {
    const ai = getOpenAI();

    if (!ai) {
        return getFallbackChatResponse(userMessage);
    }

    try {
        // Build conversation history for OpenAI format
        const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: CHAT_SYSTEM_PROMPT }
        ];

        // Add last 10 messages from history
        messages.slice(-10).forEach(m => {
            chatMessages.push({ role: m.role, content: m.content });
        });

        // Add current user message
        chatMessages.push({ role: 'user', content: userMessage });

        const response = await ai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0]?.message?.content?.trim() || getFallbackChatResponse(userMessage);
    } catch (error) {
        console.error('Error chatting with OpenAI:', error);
        return getFallbackChatResponse(userMessage);
    }
}

// Mood detection with AI
export async function detectMoodWithAI(text: string): Promise<string[]> {
    const ai = getOpenAI();

    if (!ai) {
        return ['exploring']; // Default fallback
    }

    try {
        const response = await ai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: `Analyze this text and return a JSON array of detected travel moods. 
Possible moods: calm, energetic, aesthetic, foodie, local, adventurous, relaxed, cultural, romantic, budget.
Return ONLY a JSON array like ["mood1", "mood2"]. Max 3 moods.

Text: "${text}"`
            }],
            temperature: 0.5,
            max_tokens: 50,
        });

        const moods = JSON.parse(response.choices[0]?.message?.content?.trim() || '["exploring"]');
        return moods;
    } catch (error) {
        console.error('Error detecting mood:', error);
        return ['exploring'];
    }
}

// Fallback functions when AI is not available
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
                    location: `${params.destination} City Center`,
                    description: 'Explore the local area and attractions',
                    backupOption: 'Visit nearby museum if weather is bad',
                    isEcoFriendly: true
                },
                {
                    id: `day${i + 1}-2`,
                    name: 'Local Lunch',
                    time: '12:30',
                    duration: '1.5 hours',
                    cost: dailyBudget * 0.2,
                    carbonKg: 0.3,
                    location: 'Local Restaurant Area',
                    description: 'Try authentic local cuisine',
                    isEcoFriendly: true
                },
                {
                    id: `day${i + 1}-3`,
                    name: 'Afternoon Activity',
                    time: '14:30',
                    duration: '3 hours',
                    cost: dailyBudget * 0.3,
                    carbonKg: 0.8,
                    location: `${params.destination} Attractions`,
                    description: 'Visit popular attractions',
                    backupOption: 'Shopping or cafe visit'
                },
                {
                    id: `day${i + 1}-4`,
                    name: 'Dinner Experience',
                    time: '19:00',
                    duration: '2 hours',
                    cost: dailyBudget * 0.2,
                    carbonKg: 0.4,
                    location: 'Recommended Restaurant',
                    description: 'Enjoy dinner at a local favorite'
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
        sustainabilityScore: 72,
        days,
        packingList: ['Comfortable walking shoes', 'Weather-appropriate clothing', 'Travel documents', 'Phone charger', 'Reusable water bottle'],
        safetyTips: ['Keep valuables secure', 'Stay aware of surroundings', 'Have emergency contacts saved', 'Know local emergency numbers'],
        localSecrets: ['Ask locals for restaurant recommendations', 'Visit attractions early to avoid crowds', 'Try street food for authentic experience']
    };
}

function getFallbackChatResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hey there! 👋 I'm FAIO, your AI travel companion. I can help you plan trips, find hidden gems, get safety tips, or answer any travel questions. What are you dreaming about?";
    }

    // Food related
    if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('restaurant') || lowerMessage.includes('cafe')) {
        return "For the best food experience, I recommend: 1) Ask hotel staff for their personal favorites, 2) Look for restaurants busy with locals around 7-8pm, 3) Try street food at busy stalls (high turnover = fresh food), and 4) Use Google Maps to check recent reviews. What cuisine are you craving? 🍜";
    }

    // Safety - including Bali
    if (lowerMessage.includes('safe') || lowerMessage.includes('danger') || lowerMessage.includes('scam')) {
        if (lowerMessage.includes('bali')) {
            return "Bali is generally very safe for tourists! 🌴 The main concerns are: petty theft at beaches (keep valuables secure), traffic accidents (roads can be chaotic - consider hiring a driver for ~$50/day), and aggressive money changers (use ATMs or reputable exchanges). The locals are incredibly friendly, just respect temple dress codes (sarongs required) and you'll have an amazing time!";
        }
        return "Key safety tips: Keep copies of important documents in your email, use a money belt for valuables, share your itinerary with family, and research common local scams before you go. Most tourist areas are quite safe - just use the same street smarts you'd use at home! 🛡️ Which destination are you concerned about?";
    }

    // Budget
    if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('money') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
        return "Budget travel tips: Use local transit instead of taxis, eat where locals eat (usually cheaper & better), visit free attractions (parks, markets, temples), travel in shoulder season, and book accommodation with a kitchen. 💰 What's your destination and budget range?";
    }

    // Trip planning
    if (lowerMessage.includes('plan') || lowerMessage.includes('itiner') || lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('visit')) {
        return "I'd love to help you plan! To create the perfect itinerary, tell me: 1) Where you want to go, 2) How many days, 3) Your travel style (adventure, relaxation, culture, food), and 4) Your approximate budget. Then I can suggest a day-by-day plan! 🗓️";
    }

    // Bali specific
    if (lowerMessage.includes('bali')) {
        return "Bali is amazing! 🌴 Top areas: Ubud for culture & rice terraces, Seminyak for beaches & nightlife, Canggu for surf & cafes. Best months: April-October (dry season). Must-dos: Tegallalang Rice Terraces, Uluwatu Temple at sunset, snorkeling in Nusa Penida. Rent a scooter or hire a driver to get around. Try warungs (local restaurants) for amazing food at ~$3 per meal!";
    }

    // Weather
    if (lowerMessage.includes('weather') || lowerMessage.includes('pack') || lowerMessage.includes('wear') || lowerMessage.includes('rain')) {
        return "I recommend checking weather forecasts 1-2 weeks before your trip. General packing tips: Always bring a light rain jacket, layers for temperature changes, comfortable walking shoes, and don't overpack - you can buy basics anywhere! ☀️ Which destination are you packing for?";
    }

    // Default
    return "Great question! 🌍 I can help with trip planning, restaurant recommendations, safety tips, budget advice, and destination guides. Could you tell me more specifically what you're looking for, or which destination you're interested in?";
}

export function isAIConfigured(): boolean {
    return !!API_KEY;
}
