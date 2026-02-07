const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
    temperature: number;
    feelsLike: number;
    humidity: number;
    description: string;
    icon: string;
    windSpeed: number;
    cityName: string;
    country: string;
    sunrise: number;
    sunset: number;
    visibility: number;
    pressure: number;
}

export interface ForecastDay {
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    description: string;
    icon: string;
    pop: number; // Probability of precipitation
}

export interface WeatherAlert {
    type: 'rain' | 'storm' | 'heat' | 'cold' | 'wind' | 'normal';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
}

// Icon mapping for weather conditions
export const WEATHER_ICONS: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
};

export async function getCurrentWeather(city: string): Promise<WeatherData | null> {
    if (!API_KEY) {
        console.warn('Weather API key not configured');
        return getMockWeather(city);
    }

    try {
        const response = await fetch(
            `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Weather API key not yet active, using mock data');
                return getMockWeather(city);
            }
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        return {
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
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        return getMockWeather(city);
    }
}

export async function getWeatherForecast(city: string, days: number = 5): Promise<ForecastDay[]> {
    if (!API_KEY) {
        return getMockForecast(days);
    }

    try {
        const response = await fetch(
            `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            return getMockForecast(days);
        }

        const data = await response.json();

        // Group by day and get daily summary
        const dailyData: Record<string, any[]> = {};
        data.list.forEach((item: any) => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyData[date]) dailyData[date] = [];
            dailyData[date].push(item);
        });

        const forecast: ForecastDay[] = Object.entries(dailyData)
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
                    pop: Math.round((items.reduce((sum: number, i: any) => sum + (i.pop || 0), 0) / items.length) * 100),
                };
            });

        return forecast;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        return getMockForecast(days);
    }
}

export function getWeatherAlert(weather: WeatherData): WeatherAlert | null {
    const desc = weather.description.toLowerCase();

    if (desc.includes('thunderstorm') || desc.includes('storm')) {
        return {
            type: 'storm',
            title: '⛈️ Storm Warning',
            description: 'Thunderstorms expected. Stay indoors and avoid outdoor activities.',
            severity: 'high'
        };
    }

    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
        return {
            type: 'rain',
            title: '🌧️ Rain Expected',
            description: 'Carry an umbrella and consider indoor alternatives.',
            severity: 'medium'
        };
    }

    if (weather.temperature > 35) {
        return {
            type: 'heat',
            title: '🌡️ Heat Advisory',
            description: 'High temperatures expected. Stay hydrated and seek shade.',
            severity: 'high'
        };
    }

    if (weather.temperature < 5) {
        return {
            type: 'cold',
            title: '❄️ Cold Weather',
            description: 'Bundle up! Low temperatures expected.',
            severity: 'medium'
        };
    }

    if (weather.windSpeed > 10) {
        return {
            type: 'wind',
            title: '💨 Windy Conditions',
            description: 'Strong winds expected. Secure loose items.',
            severity: 'low'
        };
    }

    return null;
}

export function getWeatherEmoji(iconCode: string): string {
    return WEATHER_ICONS[iconCode] || '🌤️';
}

export function getSuggestedActivities(weather: WeatherData): string[] {
    const desc = weather.description.toLowerCase();
    const temp = weather.temperature;

    // Rainy - suggest indoor activities
    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('storm')) {
        return ['Museum visit', 'Shopping mall', 'Indoor food court', 'Spa treatment', 'Cooking class'];
    }

    // Hot - suggest cool activities
    if (temp > 30) {
        return ['Beach visit', 'Swimming pool', 'Air-conditioned cafe', 'Evening sightseeing', 'Water sports'];
    }

    // Cold - suggest warm activities
    if (temp < 10) {
        return ['Hot springs', 'Cozy cafe', 'Indoor markets', 'Museum tour', 'Local food tour'];
    }

    // Nice weather - outdoor activities
    return ['Walking tour', 'Park visit', 'Outdoor sightseeing', 'Street food tour', 'Photography spots'];
}

// Mock data for when API is not available
function getMockWeather(city: string): WeatherData {
    return {
        temperature: 24,
        feelsLike: 26,
        humidity: 65,
        description: 'partly cloudy',
        icon: '02d',
        windSpeed: 3.5,
        cityName: city,
        country: '',
        sunrise: Date.now() / 1000 - 21600,
        sunset: Date.now() / 1000 + 21600,
        visibility: 10000,
        pressure: 1013,
    };
}

function getMockForecast(days: number): ForecastDay[] {
    const forecast: ForecastDay[] = [];
    const conditions = ['sunny', 'partly cloudy', 'cloudy', 'light rain', 'clear'];
    const icons = ['01d', '02d', '03d', '10d', '01d'];

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        forecast.push({
            date: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            tempMax: 25 + Math.floor(Math.random() * 8),
            tempMin: 18 + Math.floor(Math.random() * 5),
            description: conditions[i % conditions.length],
            icon: icons[i % icons.length],
            pop: Math.floor(Math.random() * 40),
        });
    }

    return forecast;
}

export function isWeatherConfigured(): boolean {
    return !!API_KEY;
}
