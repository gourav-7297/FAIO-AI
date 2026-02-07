// Test OpenAI API
import OpenAI from 'openai';

const API_KEY = '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';

async function test() {
    console.log('=== Testing OpenAI API ===\n');

    const openai = new OpenAI({ apiKey: API_KEY });

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are FAIO, a helpful travel assistant.' },
                { role: 'user', content: 'Is Bali safe for tourists? Give a helpful 3-4 sentence answer.' }
            ],
            temperature: 0.7,
            max_tokens: 200,
        });

        console.log('✅ SUCCESS! API key is working.\n');
        console.log('Response:');
        console.log(response.choices[0]?.message?.content);
    } catch (error: any) {
        console.log('❌ Error:', error.message);
        if (error.code === 'invalid_api_key') {
            console.log('\nThe API key is invalid. Please check your OpenAI API key.');
        }
    }
}

test();
