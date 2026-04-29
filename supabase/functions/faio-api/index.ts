/**
 * FAIO API — Supabase Edge Function (Hono router)
 *
 * This is the single entry point for all server-side API calls.
 * It protects API keys by proxying requests to external services
 * (Groq, OpenWeatherMap, Foursquare, RapidAPI, FreeCurrencyAPI).
 *
 * Routes:
 *   /ai/*       — AI trip generation, chat, receipt scanning, budget advice
 *   /weather/*  — Current weather & forecast
 *   /places/*   — Foursquare venue search
 *   /flights/*  — Flight & airport search
 *   /hotels/*   — Hotel destination & search
 *   /currency/* — Exchange rates
 */

import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts';
import { cors } from 'https://deno.land/x/hono@v4.3.11/middleware.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

import aiRoutes from './routes/ai.ts';
import weatherRoutes from './routes/weather.ts';
import placesRoutes from './routes/places.ts';
import flightsRoutes from './routes/flights.ts';
import hotelsRoutes from './routes/hotels.ts';
import currencyRoutes from './routes/currency.ts';

const app = new Hono().basePath('/faio-api');

// ━━━ Global Middleware ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Authorization', 'x-client-info', 'apikey', 'content-type'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// ━━━ Health Check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'faio-api', timestamp: new Date().toISOString() });
});

// ━━━ Mount Routes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.route('/ai', aiRoutes);
app.route('/weather', weatherRoutes);
app.route('/places', placesRoutes);
app.route('/flights', flightsRoutes);
app.route('/hotels', hotelsRoutes);
app.route('/currency', currencyRoutes);

// ━━━ 404 fallback ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.notFound((c) => {
  return c.json({ error: 'Not found', path: c.req.path }, 404);
});

// ━━━ Global Error Handler ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.onError((err, c) => {
  console.error('FAIO API Error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

// ━━━ Start Server ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

serve(app.fetch);
