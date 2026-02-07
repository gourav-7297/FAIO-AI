import { useState, useEffect, useCallback } from 'react';
import {
    fetchExchangeRates,
    convertCurrency,
    formatCurrencyValue,
    getCurrencyInfo,
    SUPPORTED_CURRENCIES,
    isCurrencyConfigured,
    type ExchangeRates
} from '../services/currencyService';

const STORAGE_KEY = 'faio_currency_settings';

interface CurrencySettings {
    baseCurrency: string;
    targetCurrency: string;
    lastUpdated: string | null;
}

export { SUPPORTED_CURRENCIES as CURRENCIES };

export function useCurrency() {
    const [settings, setSettings] = useState<CurrencySettings>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                // Fall through to default
            }
        }
        return {
            baseCurrency: 'USD',
            targetCurrency: 'USD',
            lastUpdated: null,
        };
    });

    const [rates, setRates] = useState<ExchangeRates>({});
    const [isLoading, setIsLoading] = useState(false);

    // Load rates on mount
    useEffect(() => {
        const loadRates = async () => {
            setIsLoading(true);
            const fetchedRates = await fetchExchangeRates();
            setRates(fetchedRates);
            setSettings(prev => ({
                ...prev,
                lastUpdated: new Date().toISOString(),
            }));
            setIsLoading(false);
        };
        loadRates();
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const setBaseCurrency = useCallback((code: string) => {
        setSettings(prev => ({ ...prev, baseCurrency: code }));
    }, []);

    const setTargetCurrency = useCallback((code: string) => {
        setSettings(prev => ({ ...prev, targetCurrency: code }));
    }, []);

    const convert = useCallback((amount: number, from?: string, to?: string): number => {
        const fromCurrency = from || settings.baseCurrency;
        const toCurrency = to || settings.targetCurrency;
        return convertCurrency(amount, fromCurrency, toCurrency, rates);
    }, [settings.baseCurrency, settings.targetCurrency, rates]);

    const formatCurrency = useCallback((amount: number, currencyCode?: string): string => {
        const code = currencyCode || settings.targetCurrency;
        return formatCurrencyValue(amount, code);
    }, [settings.targetCurrency]);

    const refreshRates = useCallback(async () => {
        setIsLoading(true);
        const fetchedRates = await fetchExchangeRates();
        setRates(fetchedRates);
        setSettings(prev => ({
            ...prev,
            lastUpdated: new Date().toISOString(),
        }));
        setIsLoading(false);
    }, []);

    const getCurrencyInfoFn = useCallback((code: string) => {
        return getCurrencyInfo(code);
    }, []);

    return {
        baseCurrency: settings.baseCurrency,
        targetCurrency: settings.targetCurrency,
        rates,
        lastUpdated: settings.lastUpdated,
        isLoading,
        setBaseCurrency,
        setTargetCurrency,
        convert,
        formatCurrency,
        refreshRates,
        getCurrencyInfo: getCurrencyInfoFn,
        isConfigured: isCurrencyConfigured(),
    };
}

// Quick conversion helper using live or cached rates
export function quickConvert(amount: number, from: string, to: string): number {
    if (from === to) return amount;
    // For quick convert, we'll use synchronous fallback
    const mockRates: ExchangeRates = {
        USD: 1, EUR: 0.85, GBP: 0.73, JPY: 155.5, INR: 90.42,
        AUD: 1.42, CAD: 1.36, CHF: 0.78, CNY: 6.94, KRW: 1449.6,
    };
    return convertCurrency(amount, from, to, mockRates);
}
