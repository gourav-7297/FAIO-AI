/**
 * Currency Routes — Proxies FreeCurrencyAPI.
 * API key is stored in Supabase Secrets.
 */

import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts';

const currency = new Hono();

const API_URL = 'https://api.freecurrencyapi.com/v1/latest';

// Server-side cache (persists across requests within the same Deno worker)
let cachedRates: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// ━━━ GET /currency/rates ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

currency.get('/rates', async (c) => {
  // Return cached rates if fresh
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return c.json(cachedRates);
  }

  const apiKey = Deno.env.get('CURRENCY_API_KEY');
  if (!apiKey) return c.json({ error: 'CURRENCY_API_KEY not set' }, 500);

  try {
    const response = await fetch(`${API_URL}?apikey=${apiKey}`);
    if (!response.ok) {
      return c.json({ error: `Currency API error: ${response.status}` }, response.status);
    }

    const data = await response.json();
    cachedRates = data.data;
    cacheTimestamp = Date.now();

    return c.json(cachedRates);
  } catch (error) {
    console.error('Currency fetch error:', error);
    // Return stale cache if available
    if (cachedRates) return c.json(cachedRates);
    return c.json({ error: 'Failed to fetch exchange rates' }, 500);
  }
});

export default currency;
