// Test OpenRouter API
import OpenAI from 'openai';

const API_KEY = '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';

async function test() {
    console.log('=== Testing OpenRouter API ===\n');
    console.log('Model: google/gemini-2.0-flash-001');

    const openai = new OpenAI({
        apiKey: API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
            'HTTP-Referer': 'https://faio.ai',
            'X-Title': 'FAIO Test Script',
        }
    });

    try {
        const response = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-001',
            messages: [
                { role: 'user', content: 'Is Bali safe? Answer in 1 short sentence.' }
            ],
        });

        console.log('\n✅ SUCCESS! API key is working.');
        console.log('Response:', response.choices[0]?.message?.content);
    } catch (error: any) {
        console.log('\n❌ Error:', error.message);
        if (error.response) {
            console.log('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

test();
