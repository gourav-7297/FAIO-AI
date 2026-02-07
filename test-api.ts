// Direct API test for Gemini - testing multiple models
const API_KEY = 'AIzaSyAK5BUMBS_LVxs__HT64gmRbkD2kZzpdLE';

async function testModel(modelName: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hi' }] }]
            })
        });

        const data = await response.json();

        if (response.ok && data.candidates) {
            return { success: true, model: modelName, text: data.candidates[0].content.parts[0].text };
        } else {
            return { success: false, model: modelName, error: data.error?.message || 'Unknown error' };
        }
    } catch (err: any) {
        return { success: false, model: modelName, error: err.message };
    }
}

async function test() {
    console.log('Testing Gemini API with multiple models...\n');
    console.log('API Key:', API_KEY.substring(0, 15) + '...\n');

    const models = [
        'gemini-pro',
        'gemini-1.0-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash-exp',
    ];

    for (const model of models) {
        console.log(`Testing ${model}...`);
        const result = await testModel(model);
        if (result.success) {
            console.log(`\n✅ SUCCESS: ${model} works!`);
            console.log(`Response: ${result.text}\n`);
            console.log('=== Your API key is VALID! ===');
            console.log(`Use model: ${model} in your app.`);
            return model;
        } else {
            console.log(`  ❌ ${result.error?.substring(0, 60)}`);
        }
    }

    console.log('\n❌ All models failed. API key may be invalid.');
    return null;
}

test();
