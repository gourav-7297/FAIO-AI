/**
 * Hotels Routes — Proxies Booking.com RapidAPI.
 * API key is stored in Supabase Secrets.
 */

import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts';

const hotels = new Hono();

const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}/v1/hotels`;

function getHeaders(): Record<string, string> {
  const key = Deno.env.get('RAPIDAPI_KEY');
  if (!key) throw new Error('RAPIDAPI_KEY is not set in Supabase Secrets');
  return {
    'x-rapidapi-key': key,
    'x-rapidapi-host': RAPIDAPI_HOST,
  };
}

// ━━━ GET /hotels/destinations?query=Mumbai ━━━━━━━━━━━━━━

hotels.get('/destinations', async (c) => {
  const query = c.req.query('query');
  if (!query) return c.json({ error: 'Missing query parameter' }, 400);

  const paramsToTry = ['name', 'query', 'query_text'];

  for (const param of paramsToTry) {
    try {
      const url = `${BASE_URL}/locations?${param}=${encodeURIComponent(query)}&locale=en-gb`;
      const response = await fetch(url, { headers: getHeaders() });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return c.json(data);
        }
      }
    } catch (error) {
      console.error(`Hotel destination search error with ${param}:`, error);
    }
  }

  return c.json([]);
});

// ━━━ POST /hotels/search ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

hotels.post('/search', async (c) => {
  const {
    dest_id, dest_type,
    checkin_date, checkout_date,
    adults_number,
    room_number = 1,
    order_by = 'popularity',
    units = 'metric',
    currency = 'INR',
  } = await c.req.json();

  if (!dest_id || !checkin_date || !checkout_date || !adults_number) {
    return c.json({ error: 'Missing required hotel search params' }, 400);
  }

  try {
    const url = `${BASE_URL}/search?dest_id=${dest_id}&dest_type=${dest_type}&checkin_date=${checkin_date}&checkout_date=${checkout_date}&adults_number=${adults_number}&room_number=${room_number}&order_by=${order_by}&units=${units}&currency=${currency}&locale=en-gb`;

    const response = await fetch(url, { headers: getHeaders() });

    if (response.ok) {
      const data = await response.json();
      return c.json(data.result || []);
    }

    return c.json({ error: `Hotel search failed: ${response.status}` }, response.status);
  } catch (error) {
    console.error('Hotel search error:', error);
    return c.json({ error: 'Hotel search failed' }, 500);
  }
});

export default hotels;
