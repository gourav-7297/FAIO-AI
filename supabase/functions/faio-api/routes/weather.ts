/**
 * Weather Routes — Proxies OpenWeatherMap API calls.
 * API key is stored in Supabase Secrets, never exposed to the client.
 */

import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts';

const weather = new Hono();

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function getApiKey(): string {
  const key = Deno.env.get('WEATHER_API_KEY');
  if (!key) throw new Error('WEATHER_API_KEY is not set in Supabase Secrets');
  return key;
}

// ━━━ GET /weather/current?city=Tokyo ━━━━━━━━━━━━━━━━━━━━━

weather.get('/current', async (c) => {
  const city = c.req.query('city');
  if (!city) return c.json({ error: 'Missing city parameter' }, 400);

  try {
    const apiKey = getApiKey();
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      return c.json({ error: `Weather API error: ${response.status}` }, response.status);
    }

    const data = await response.json();
    return c.json({
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      cityName: data.name,
      country: data.sys.country,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      visibility: data.visibility,
      pressure: data.main.pressure,
    });
  } catch (error) {
    console.error('Weather fetch error:', error);
    return c.json({ error: 'Failed to fetch weather' }, 500);
  }
});

// ━━━ GET /weather/forecast?city=Tokyo&days=5 ━━━━━━━━━━━━━

weather.get('/forecast', async (c) => {
  const city = c.req.query('city');
  const days = parseInt(c.req.query('days') || '5', 10);
  if (!city) return c.json({ error: 'Missing city parameter' }, 400);

  try {
    const apiKey = getApiKey();
    const response = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      return c.json({ error: `Forecast API error: ${response.status}` }, response.status);
    }

    const data = await response.json();

    // Group by day
    const dailyData: Record<string, any[]> = {};
    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date]) dailyData[date] = [];
      dailyData[date].push(item);
    });

    const forecast = Object.entries(dailyData)
      .slice(0, days)
      .map(([date, items]) => {
        const temps = items.map((i: any) => i.main.temp);
        const midday = items.find((i: any) => i.dt_txt.includes('12:00')) || items[0];
        return {
          date,
          dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          tempMax: Math.round(Math.max(...temps)),
          tempMin: Math.round(Math.min(...temps)),
          description: midday.weather[0].description,
          icon: midday.weather[0].icon,
          pop: Math.round(
            (items.reduce((sum: number, i: any) => sum + (i.pop || 0), 0) / items.length) * 100
          ),
        };
      });

    return c.json(forecast);
  } catch (error) {
    console.error('Forecast fetch error:', error);
    return c.json({ error: 'Failed to fetch forecast' }, 500);
  }
});

export default weather;
