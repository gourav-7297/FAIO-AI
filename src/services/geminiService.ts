import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
    if (!genAI && API_KEY) {
        genAI = new GoogleGenerativeAI(API_KEY);
    }
    return genAI;
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
    const ai = getGenAI();

    if (!ai) {
        console.warn('Gemini AI not configured, using fallback');
        return generateFallbackTrip(params);
    }

    try {
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = TRIP_GENERATION_PROMPT
            .replace('{destination}', params.destination)
            .replace('{startDate}', params.startDate)
            .replace('{endDate}', params.endDate)
            .replace('{budget}', params.budget.toString())
            .replace('{travelStyles}', params.travelStyles.join(', '))
            .replace('{travelers}', (params.travelers || 1).toString());

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

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
        console.error('Error generating trip with Gemini:', error);
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

## Example Good Responses:
Q: "Best cafes in Paris?"
A: "For authentic Parisian cafe culture, try Café de Flore in Saint-Germain-des-Prés - it's been serving artists and writers since 1887. For amazing coffee, Boot Café in Le Marais has some of the best specialty roasts. If you want a local vibe away from tourists, Café Oberkampf in the 11th arrondissement is perfect. ☕ Most cafes are busiest 10am-noon, so try going in the afternoon for a quieter experience."

Q: "Is Bali safe?"
A: "Bali is generally very safe for tourists! The main concerns are petty theft (keep valuables secure at beaches), traffic accidents (roads can be chaotic - consider hiring a driver), and surf conditions for swimmers. Stick to reputable money changers, stay hydrated in the heat, and respect temple dress codes. The locals are incredibly friendly and helpful. 🌴"

Remember: You're not just an AI - you're a knowledgeable travel companion who genuinely helps people have amazing trips!`;

export async function chatWithAI(messages: ChatMessage[], userMessage: string): Promise<string> {
    const ai = getGenAI();

    if (!ai) {
        return getFallbackChatResponse(userMessage);
    }

    try {
        const model = ai.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7, // Balanced creativity and accuracy
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 500, // Keep responses focused
            }
        });

        // Build conversation history
        const history = messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'FAIO'}: ${m.content}`).join('\n');

        const prompt = `${CHAT_SYSTEM_PROMPT}

Previous conversation:
${history}

User: ${userMessage}

FAIO:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error chatting with Gemini:', error);
        return getFallbackChatResponse(userMessage);
    }
}

// Mood detection with AI
export async function detectMoodWithAI(text: string): Promise<string[]> {
    const ai = getGenAI();

    if (!ai) {
        return ['exploring']; // Default fallback
    }

    try {
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analyze this text and return a JSON array of detected travel moods. 
Possible moods: calm, energetic, aesthetic, foodie, local, adventurous, relaxed, cultural, romantic, budget.
Return ONLY a JSON array like ["mood1", "mood2"]. Max 3 moods.

Text: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const moods = JSON.parse(response.text().trim());
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

    // Safety
    if (lowerMessage.includes('safe') || lowerMessage.includes('danger') || lowerMessage.includes('scam')) {
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

    // Weather
    if (lowerMessage.includes('weather') || lowerMessage.includes('pack') || lowerMessage.includes('wear') || lowerMessage.includes('rain')) {
        return "I recommend checking weather forecasts 1-2 weeks before your trip. General packing tips: Always bring a light rain jacket, layers for temperature changes, comfortable walking shoes, and don't overpack - you can buy basics anywhere! ☀️ Which destination are you packing for?";
    }

    // Accommodation
    if (lowerMessage.includes('hotel') || lowerMessage.includes('stay') || lowerMessage.includes('hostel') || lowerMessage.includes('airbnb')) {
        return "Accommodation tips: Book on weekdays for better rates, check reviews from the last 3 months, look at the location on a map (tourist areas are pricier), and consider what's included (breakfast, WiFi, AC). Hostels are great for meeting people, hotels for comfort, and Airbnbs for local experiences! 🏨 Where are you looking to stay?";
    }

    // Specific destinations mentioned
    if (lowerMessage.includes('tokyo') || lowerMessage.includes('japan')) {
        return "Tokyo is amazing! Must-sees: Senso-ji Temple (go early), Shibuya Crossing, Shinjuku for nightlife, and Tsukiji Outer Market for sushi breakfast. Get a Suica card for easy transit, bow when greeting, and don't tip (it's considered rude). Best times: March-May (cherry blossoms) or Oct-Nov (fall colors). 🗼";
    }
    if (lowerMessage.includes('paris') || lowerMessage.includes('france')) {
        return "Paris tips: Skip the Eiffel Tower line with summit tickets online, the Louvre is best on Wed/Fri evenings, walk Saint-Germain and Le Marais for cafe culture, and take a day trip to Versailles. Learn basic French (Bonjour, Merci) - locals appreciate the effort! Best months: April-June or September-October. 🥐";
    }
    if (lowerMessage.includes('bali') || lowerMessage.includes('indonesia')) {
        return "Bali guide: Ubud for culture & rice terraces, Seminyak for beaches & nightlife, Canggu for surf & digital nomads. Rent a scooter (get an international license) or hire a driver (~$50/day). Visit temples before 9am, pack a sarong, and try warungs (local restaurants) for amazing cheap food! 🌴";
    }

    // Default - encourage more specific question
    return "Great question! 🌍 I can help with trip planning, restaurant recommendations, safety tips, budget advice, and destination guides. Could you tell me more specifically what you're looking for, or which destination you're interested in?";
}

export function isAIConfigured(): boolean {
    return !!API_KEY;
}
