/**
 * Flights Routes — Proxies Sky Scrapper RapidAPI.
 * API key is stored in Supabase Secrets.
 */

import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts';

const flights = new Hono();

const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}/api`;

function getHeaders(): Record<string, string> {
  const key = Deno.env.get('RAPIDAPI_KEY');
  if (!key) throw new Error('RAPIDAPI_KEY is not set in Supabase Secrets');
  return {
    'x-rapidapi-key': key,
    'x-rapidapi-host': RAPIDAPI_HOST,
  };
}

// ━━━ GET /flights/airports?query=Del ━━━━━━━━━━━━━━━━━━━━

flights.get('/airports', async (c) => {
  const query = c.req.query('query');
  if (!query || query.length < 2) return c.json([]);

  try {
    const response = await fetch(
      `${BASE_URL}/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=en-US`,
      { headers: getHeaders() }
    );

    if (!response.ok) return c.json({ error: `Airport search failed: ${response.status}` }, response.status);

    const data = await response.json();
    return c.json(data?.data || []);
  } catch (error) {
    console.error('Airport search error:', error);
    return c.json({ error: 'Airport search failed' }, 500);
  }
});

// ━━━ POST /flights/search ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

flights.post('/search', async (c) => {
  const {
    originSkyId, destinationSkyId,
    originEntityId, destinationEntityId,
    date, returnDate,
    adults = 1, cabinClass = 'economy', currency = 'INR',
  } = await c.req.json();

  if (!originSkyId || !destinationSkyId || !date) {
    return c.json({ error: 'Missing required flight search params' }, 400);
  }

  try {
    let url = `${BASE_URL}/v2/flights/searchFlightsComplete?originSkyId=${originSkyId}&destinationSkyId=${destinationSkyId}&originEntityId=${originEntityId}&destinationEntityId=${destinationEntityId}&date=${date}&adults=${adults}&cabinClass=${cabinClass}&currency=${currency}&market=en-US&countryCode=IN`;

    if (returnDate) url += `&returnDate=${returnDate}`;

    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) return c.json({ error: `Flight search failed: ${response.status}` }, response.status);

    const data = await response.json();
    const itineraries = data?.data?.itineraries || [];

    const results = itineraries.map((itin: any) => ({
      id: itin.id,
      price: itin.price || { raw: 0, formatted: '₹0' },
      legs: (itin.legs || []).map((leg: any) => ({
        id: leg.id,
        origin: { name: leg.origin?.name || '', displayCode: leg.origin?.displayCode || '', city: leg.origin?.city || '' },
        destination: { name: leg.destination?.name || '', displayCode: leg.destination?.displayCode || '', city: leg.destination?.city || '' },
        departure: leg.departure || '',
        arrival: leg.arrival || '',
        durationInMinutes: leg.durationInMinutes || 0,
        stopCount: leg.stopCount || 0,
        carriers: {
          marketing: (leg.carriers?.marketing || []).map((c: any) => ({ name: c.name || '', logoUrl: c.logoUrl || '' })),
        },
      })),
      score: itin.score || 0,
      isSelfTransfer: itin.isSelfTransfer || false,
    }));

    return c.json({
      flights: results,
      status: data?.data?.context?.status || 'complete',
      sessionId: data?.data?.context?.sessionId,
    });
  } catch (error) {
    console.error('Flight search error:', error);
    return c.json({ error: 'Flight search failed' }, 500);
  }
});

export default flights;
