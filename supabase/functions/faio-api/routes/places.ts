/**
 * Places Routes — Proxies Foursquare Places API v2.
 * Credentials are stored in Supabase Secrets.
 */

import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts';

const places = new Hono();

const FSQ_BASE = 'https://api.foursquare.com/v2';
const FSQ_VERSION = '20231010';

function getAuthParams(): string {
  const clientId = Deno.env.get('FOURSQUARE_CLIENT_ID');
  const clientSecret = Deno.env.get('FOURSQUARE_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('Foursquare credentials not set in Supabase Secrets');
  return `client_id=${clientId}&client_secret=${clientSecret}&v=${FSQ_VERSION}`;
}

// ━━━ GET /places/search?near=Tokyo&query=hotel&categoryId=...&limit=20 ━━━

places.get('/search', async (c) => {
  const near = c.req.query('near');
  const query = c.req.query('query') || '';
  const categoryId = c.req.query('categoryId') || '';
  const limit = c.req.query('limit') || '20';

  if (!near) return c.json({ error: 'Missing near parameter' }, 400);

  try {
    let url = `${FSQ_BASE}/venues/search?${getAuthParams()}&near=${encodeURIComponent(near)}&limit=${limit}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;
    if (categoryId) url += `&categoryId=${categoryId}`;

    const resp = await fetch(url);
    if (!resp.ok) return c.json({ error: `Foursquare API error: ${resp.status}` }, resp.status);

    const data = await resp.json();
    return c.json(data.response?.venues || []);
  } catch (error) {
    console.error('Foursquare search error:', error);
    return c.json({ error: 'Failed to search places' }, 500);
  }
});

// ━━━ GET /places/nearby?lat=35.68&lon=139.76&query=hospital&radius=5000 ━━━

places.get('/nearby', async (c) => {
  const lat = c.req.query('lat');
  const lon = c.req.query('lon');
  const query = c.req.query('query') || '';
  const categoryId = c.req.query('categoryId') || '';
  const limit = c.req.query('limit') || '20';
  const radius = c.req.query('radius') || '5000';

  if (!lat || !lon) return c.json({ error: 'Missing lat/lon parameters' }, 400);

  try {
    let url = `${FSQ_BASE}/venues/search?${getAuthParams()}&ll=${lat},${lon}&radius=${radius}&limit=${limit}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;
    if (categoryId) url += `&categoryId=${categoryId}`;

    const resp = await fetch(url);
    if (!resp.ok) return c.json({ error: `Foursquare API error: ${resp.status}` }, resp.status);

    const data = await resp.json();
    return c.json(data.response?.venues || []);
  } catch (error) {
    console.error('Foursquare nearby error:', error);
    return c.json({ error: 'Failed to search nearby places' }, 500);
  }
});

export default places;
