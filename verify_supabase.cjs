const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.resolve(__dirname, '.env');

console.log('Reading .env from:', envPath);

try {
    const envContent = fs.readFileSync(envPath, 'utf8');

    const getEnv = (key) => {
        const match = envContent.match(new RegExp(`${key}=(.*)`));
        return match ? match[1].trim() : null;
    };

    const url = getEnv('VITE_SUPABASE_URL');
    const key = getEnv('VITE_SUPABASE_ANON_KEY');

    console.log('--- Configuration Check ---');
    console.log(`URL: ${url}`);
    // console.log(`Key: ${key}`); // Don't log full key
    console.log(`Key length: ${key ? key.length : 0}`);

    if (!url || !key) {
        console.error('ERROR: Missing URL or Key in .env');
        process.exit(1);
    }

    if (url.includes('demo.supabase.co')) {
        console.error('ERROR: URL is set to demo.supabase.co!');
        process.exit(1);
    }

    // 1. Verify URL format and extract Project Ref
    const urlMatch = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
    if (!urlMatch) {
        // It might be a custom domain, but for supabase.co it should match
        console.warn('WARNING: URL does not match standard Supabase format (https://xxx.supabase.co)');
    } else {
        const projectRef = urlMatch[1];
        console.log(`Project Ref from URL: ${projectRef}`);
    }

    // 3. Live Connection Test
    console.log('\n--- Live Connection Test ---');
    const options = {
        method: 'GET',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    };

    const req = https.request(`${url}/auth/v1/health`, options, (res) => {
        console.log(`Status Code: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('✅ Connection Successful!');
            } else {
                console.log(`❌ Connection Failed: ${data}`);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.end();

} catch (err) {
    console.error('Error reading .env:', err.message);
}
