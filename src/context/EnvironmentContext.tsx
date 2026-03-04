import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
    getCurrentWeather,
    getWeatherForecast,
    getWeatherAlert,
    getSuggestedActivities,
    getWeatherEmoji,
    isWeatherConfigured,
    type WeatherData,
    type ForecastDay,
    type WeatherAlert
} from '../services/weatherService';

interface EnvironmentContextType {
    // Weather
    weather: WeatherData | null;
    forecast: ForecastDay[];
    weatherAlert: WeatherAlert | null;
    suggestedActivities: string[];
    isWeatherLoading: boolean;
    refreshWeather: () => Promise<void>;
    setCity: (city: string) => void;
    currentCity: string;

    // Environment flags (can be simulated or real)
    isRaining: boolean;
    toggleRain: () => void;
    isHighTraffic: boolean;
    toggleTraffic: () => void;
    isEmergency: boolean;
    toggleEmergency: () => void;

    // API Status
    isWeatherConfigured: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
    const [currentCity, setCurrentCity] = useState('New Delhi');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
    const [suggestedActivities, setSuggestedActivities] = useState<string[]>([]);
    const [isWeatherLoading, setIsWeatherLoading] = useState(false);

    // Manual toggles for simulation
    const [isRaining, setIsRaining] = useState(false);
    const [isHighTraffic, setIsHighTraffic] = useState(false);
    const [isEmergency, setIsEmergency] = useState(false);

    // Detect user's city via geolocation on mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
                        );
                        const data = await res.json();
                        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district;
                        if (city) setCurrentCity(city);
                    } catch (err) {
                        console.warn('Reverse geocoding failed, using default city');
                    }
                },
                () => {
                    console.warn('Geolocation denied, using default city');
                },
                { timeout: 5000 }
            );
        }
    }, []);

    const fetchWeatherData = useCallback(async (city: string) => {
        setIsWeatherLoading(true);
        try {
            const [weatherData, forecastData] = await Promise.all([
                getCurrentWeather(city),
                getWeatherForecast(city, 5),
            ]);

            if (weatherData) {
                setWeather(weatherData);
                setWeatherAlert(getWeatherAlert(weatherData));
                setSuggestedActivities(getSuggestedActivities(weatherData));

                // Auto-detect rain from weather
                const desc = weatherData.description.toLowerCase();
                if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
                    setIsRaining(true);
                }
            }

            setForecast(forecastData);
        } catch (error) {
            console.error('Error fetching weather:', error);
        } finally {
            setIsWeatherLoading(false);
        }
    }, []);

    // Fetch weather on mount and when city changes
    useEffect(() => {
        fetchWeatherData(currentCity);
    }, [currentCity, fetchWeatherData]);

    const refreshWeather = useCallback(async () => {
        await fetchWeatherData(currentCity);
    }, [currentCity, fetchWeatherData]);

    const setCity = useCallback((city: string) => {
        setCurrentCity(city);
    }, []);

    return (
        <EnvironmentContext.Provider value={{
            weather,
            forecast,
            weatherAlert,
            suggestedActivities,
            isWeatherLoading,
            refreshWeather,
            setCity,
            currentCity,
            isRaining,
            toggleRain: () => setIsRaining(prev => !prev),
            isHighTraffic,
            toggleTraffic: () => setIsHighTraffic(prev => !prev),
            isEmergency,
            toggleEmergency: () => setIsEmergency(prev => !prev),
            isWeatherConfigured: isWeatherConfigured(),
        }}>
            {children}
        </EnvironmentContext.Provider>
    );
}

export function useEnvironment() {
    const context = useContext(EnvironmentContext);
    if (context === undefined) {
        throw new Error('useEnvironment must be used within an EnvironmentProvider');
    }
    return context;
}

// Helper to get weather emoji
export { getWeatherEmoji };
