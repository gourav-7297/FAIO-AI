// Test script for Gemini AI - Tests API key validity
// Run with: npx tsx test-gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

// Using the NEW API key from .env
const API_KEY = 'AIzaSyDoLQCnLySvyXThoBNdu5pLsqppDwnEXj4';

async function testGemini() {
    console.log('=== Testing Gemini API Key ===');
    console.log('Key:', API_KEY.substring(0, 10) + '...' + API_KEY.substring(API_KEY.length - 5));
    console.log('');

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Try the most common model names
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
    ];

    let success = false;

    for (const modelName of models) {
        console.log(`Testing: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Is Bali safe for tourists? Give a helpful answer.');
            const text = await result.response.text();
            console.log(`\n✅ SUCCESS with ${modelName}!`);
            console.log(`\nResponse:`);
            console.log(text.substring(0, 150) + '...');
            success = true;
            break;
        } catch (error: any) {
            const errorMsg = error.message || String(error);
            if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('invalid')) {
                console.log(`❌ API KEY IS INVALID`);
                break;
            } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
                console.log(`  - Model not available`);
            } else {
                console.log(`  - Error: ${errorMsg.substring(0, 80)}`);
            }
        }
    }

    if (!success) {
        console.log('\n❌ RESULT: API key appears to be INVALID or all models are unavailable.');
    } else {
        console.log('\n✅ RESULT: API key is VALID and working!');
    }
}

testGemini();
