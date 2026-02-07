// Test OpenRouter Detailed Itinerary
import OpenAI from 'openai';

const API_KEY = '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';

const PROMPT = `You are FAIO, an expert AI travel planner. Generate a HIGHLY DETAILED travel itinerary.

IMPORTANT: Respond ONLY with valid JSON. No markdown. No explanations.

Input:
- Destination: Bali, Indonesia
- Dates: 2024-05-01 to 2024-05-03
- Budget: 1000 USD
- Travel Style: Adventure, Foodie
- Travelers: 2

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
`;

async function test() {
    console.log('=== Testing Detailed Itinerary Generation ===\n');

    const openai = new OpenAI({
        apiKey: API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
            'HTTP-Referer': 'https://faio.ai',
        }
    });

    try {
        console.log('Sending prompt...');
        const response = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-001',
            messages: [{ role: 'user', content: PROMPT }],
        });

        const content = response.choices[0]?.message?.content || '';
        console.log('\nResponse length:', content.length);
        console.log('Response Snippet:', content.substring(0, 500) + '...');

        try {
            let jsonText = content.trim();
            if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7);
            if (jsonText.startsWith('```')) jsonText = jsonText.slice(3);
            if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);

            const data = JSON.parse(jsonText.trim());
            console.log('\n✅ JSON Parsed Successfully!');
            console.log('Overview:', data.overview);
            console.log('Top Places:', data.topPlaces?.length);
            console.log('Dining Spots:', data.dining?.length);
            console.log('Days:', data.days?.length);
        } catch (e: any) {
            console.log('❌ JSON Parse Error:', e.message);
        }

    } catch (error: any) {
        console.log('\n❌ API Error:', error.message);
    }
}

test();
