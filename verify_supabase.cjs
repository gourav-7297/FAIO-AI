const https = require('https');

// Extract values from the environment variables string (simulating reading .env)
const envContent = `
VITE_SUPABASE_URL=https://ztiskcmivzieaauitihk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0aXNrY21pdnppZWFhdWl0aWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyODIxNTMsImV4cCI6MjA4NTg1ODE1M30.A0Zrvr32MZhuyyQ2YkICDk-BYDYaXbkTEONeAwHgAms
`;

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const url = getEnv('VITE_SUPABASE_URL');
const key = getEnv('VITE_SUPABASE_ANON_KEY');

console.log('--- Configuration Check ---');
console.log(`URL: ${url}`);
console.log(`Key length: ${key ? key.length : 0}`);

if (!url || !key) {
    console.error('ERROR: Missing URL or Key');
    process.exit(1);
}

// 1. Verify URL format and extract Project Ref
const urlMatch = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
if (!urlMatch) {
    console.error('ERROR: Invalid Supabase URL format');
    process.exit(1);
}
const projectRef = urlMatch[1];
console.log(`Project Ref from URL: ${projectRef}`);

// 2. Decode JWT (Anon Key)
try {
    const parts = key.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format (not 3 parts)');

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('\n--- Key Claims (decoded) ---');
    console.log(`Role: ${payload.role}`);
    console.log(`Ref: ${payload.ref}`);
    console.log(`Exp: ${new Date(payload.exp * 1000).toISOString()}`);

    if (payload.item_ref === projectRef || payload.ref === projectRef) {
        console.log('✅ Key matches Project URL (ref match)');
    } else {
        console.error(`❌ Mismatch! Key is for ref "${payload.ref || payload.item_ref}", but URL is for "${projectRef}"`);
    }

} catch (e) {
    console.error('ERROR Decoding JWT:', e.message);
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
        console.log(`Response: ${data}`);
        if (res.statusCode === 200) {
            console.log('✅ Connection Successful!');
        } else {
            console.log('❌ Connection Failed. Check if project is paused or network is blocked.');
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
