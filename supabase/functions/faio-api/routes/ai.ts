/**
 * AI Routes — Trip generation, chat, receipt scanning, budget advice
 * All Groq API calls happen here (server-side only).
 */

import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts';
import { getGroqClient, DEFAULT_MODEL, VISION_MODEL } from '../lib/groq.ts';
import { getUser } from '../lib/auth.ts';

const ai = new Hono();

// ━━━ Prompts ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// ━━━ POST /ai/generate-trip ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ai.post('/generate-trip', async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { destination, startDate, endDate, budget, travelStyles, travelers } = await c.req.json();

  if (!destination || !startDate || !endDate || !budget) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const prompt = TRIP_GENERATION_PROMPT
    .replace('{destination}', destination)
    .replace('{startDate}', startDate)
    .replace('{endDate}', endDate)
    .replace('{budget}', budget.toString())
    .replace('{travelStyles}', (travelStyles || []).join(', '))
    .replace('{travelers}', (travelers || 1).toString());

  try {
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000,
    });

    let text = response.choices[0]?.message?.content || '';
    text = text.trim();
    if (text.startsWith('```json')) text = text.slice(7);
    if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);

    const trip = JSON.parse(text.trim());
    return c.json(trip);
  } catch (error) {
    console.error('Trip generation error:', error);
    return c.json({ error: 'AI generation failed' }, 500);
  }
});

// ━━━ POST /ai/chat ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ai.post('/chat', async (c) => {
  const { messages, userMessage } = await c.req.json();

  if (!userMessage) {
    return c.json({ error: 'Missing userMessage' }, 400);
  }

  try {
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...(messages || []).slice(-5).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content?.trim() || '';
    return c.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ reply: "I can help you plan your trip! Try the Planner feature for a full AI-powered itinerary." });
  }
});

// ━━━ POST /ai/receipt ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ai.post('/receipt', async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { base64Image } = await c.req.json();
  if (!base64Image) return c.json({ error: 'Missing base64Image' }, 400);

  try {
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "Parse this receipt. Respond ONLY with a JSON object containing three keys: 'name' (a short, clean description of the merchant or item), 'amount' (the total cost as a number), and 'category' (must be exactly one of: 'Food', 'Transport', 'Stay', 'Activity', 'Shopping', or 'Coffee'). No other text." },
            { type: 'image_url', image_url: { url: base64Image } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    let text = response.choices[0]?.message?.content || '';
    text = text.trim();
    if (text.startsWith('```json')) text = text.slice(7);
    if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);

    const parsed = JSON.parse(text.trim());
    if (parsed.name && typeof parsed.amount === 'number' && parsed.category) {
      return c.json(parsed);
    }
    return c.json({ error: 'Could not parse receipt' }, 422);
  } catch (error) {
    console.error('Receipt analysis error:', error);
    return c.json({ error: 'Receipt analysis failed' }, 500);
  }
});

// ━━━ POST /ai/budget-advice ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ai.post('/budget-advice', async (c) => {
  const user = await getUser(c.req.raw);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { expenses, budget } = await c.req.json();

  if (!expenses || !budget) {
    return c.json({ message: "Looking good! Add more expenses so I can analyze your spending.", emoji: "👀", type: "good" });
  }

  const totalSpent = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const percent = (totalSpent / budget) * 100;
  const recentExpenses = expenses.slice(0, 10).map((e: any) => `${e.name}: $${e.amount} (${e.category})`).join(', ');

  const prompt = `You are FAIO, a slightly sassy but highly knowledgeable travel budget AI. 
The user has a budget of $${budget} and has spent $${totalSpent} (${percent.toFixed(0)}%).
Here are their recent expenses: ${recentExpenses}.

Give them ONE short, witty sentence of advice or a gentle roast about their spending habits based on these specific entries. 
Then, on the next line, provide exactly one emoji that summarizes the vibe.
Then, on the next line, output exactly one word: 'good' if they are on track, 'warning' if they are spending too fast or too much on one thing, or 'danger' if they are over budget or spending recklessly.

Respond strictly in this three-line format:
[Sentence]
[Emoji]
[good/warning/danger]`;

  try {
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 150,
    });

    const lines = (response.choices[0]?.message?.content || '').trim().split('\n').filter((l: string) => l.trim().length > 0);
    if (lines.length >= 3) {
      const typeRaw = lines[lines.length - 1].trim().toLowerCase();
      const type = (typeRaw === 'good' || typeRaw === 'warning' || typeRaw === 'danger') ? typeRaw : (percent > 90 ? 'danger' : percent > 50 ? 'warning' : 'good');
      return c.json({ message: lines[0].trim(), emoji: lines[1].trim(), type });
    }
    throw new Error('Failed to parse AI advice format');
  } catch (error) {
    console.error('Budget advice error:', error);
    if (percent > 90) return c.json({ message: "Red alert! You are almost out of money.", emoji: "🚨", type: "danger" });
    if (percent > 50) return c.json({ message: "Past the halfway mark. Pace yourself!", emoji: "⚠️", type: "warning" });
    return c.json({ message: "You're spending wisely. Keep it up!", emoji: "👍", type: "good" });
  }
});

export default ai;
