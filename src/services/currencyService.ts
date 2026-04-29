/**
 * Currency Service — Frontend client for the faio-api Edge Function.
 *
 * NO API KEYS are stored or used in this file.
 * Exchange rates are fetched from the secure backend proxy.
 */

import { fetchEdgeFn } from '../lib/edgeFn';

export interface ExchangeRates {
    [currency: string]: number;
}

export interface CurrencyInfo {
    code: string;
    name: string;
    symbol: string;
    flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
];

// Client-side cache (reduces unnecessary Edge Function calls)
let cachedRates: ExchangeRates | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function fetchExchangeRates(): Promise<ExchangeRates> {
    // Check client-side cache first
    if (cachedRates && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return cachedRates;
    }

    try {
        const rates = await fetchEdgeFn<ExchangeRates>({
            method: 'GET',
            path: '/currency/rates',
        });
        cachedRates = rates;
        cacheTimestamp = Date.now();
        return cachedRates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return cachedRates || getMockRates();
    }
}

export function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: ExchangeRates
): number {
    if (fromCurrency === toCurrency) return amount;
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    const inUSD = amount / fromRate;
    return inUSD * toRate;
}

export function formatCurrencyValue(
    amount: number,
    currencyCode: string,
    locale: string = 'en-US'
): string {
    const isWholeNumber = currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'IDR';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: isWholeNumber ? 0 : 2,
        maximumFractionDigits: isWholeNumber ? 0 : 2,
    }).format(amount);
}

export function getCurrencyInfo(code: string): CurrencyInfo | undefined {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
}

export function getCurrencySymbol(code: string): string {
    const info = getCurrencyInfo(code);
    return info?.symbol || code;
}

export function getPopularCurrencies(): CurrencyInfo[] {
    const popular = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CNY'];
    return SUPPORTED_CURRENCIES.filter(c => popular.includes(c.code));
}

// Mock rates when API is not available
function getMockRates(): ExchangeRates {
    return {
        USD: 1, EUR: 0.85, GBP: 0.73, JPY: 155.5, INR: 90.42,
        AUD: 1.42, CAD: 1.36, CHF: 0.78, CNY: 6.94, KRW: 1449.6,
        THB: 31.66, SGD: 1.27, MXN: 17.24, BRL: 5.24, IDR: 16785,
        MYR: 3.93, PHP: 59.01, NZD: 1.66, HKD: 7.81, SEK: 8.91,
    };
}

export function isCurrencyConfigured(): boolean {
    // Always available via the Edge Function
    return true;
}

export function getRateChangeIndicator(oldRate: number, newRate: number): 'up' | 'down' | 'stable' {
    const change = ((newRate - oldRate) / oldRate) * 100;
    if (change > 0.1) return 'up';
    if (change < -0.1) return 'down';
    return 'stable';
}
