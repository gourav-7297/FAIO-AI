/**
 * Visa & Travel Info Service
 * Uses REST Countries API (free, no key) + curated visa data for Indian passport holders.
 */

export type VisaStatus = 'visa-free' | 'visa-on-arrival' | 'e-visa' | 'visa-required';

export interface CountryInfo {
    name: string;
    code: string;
    flag: string;
    capital: string;
    region: string;
    population: number;
    currency: { code: string; name: string; symbol: string };
    languages: string[];
    timezone: string;
    callingCode: string;
    driveSide: string;
    visaStatus: VisaStatus;
    visaDuration: string;
    emergencyNumbers: { police: string; ambulance: string; fire: string };
    plugType: string;
    travelAdvisory: 'safe' | 'caution' | 'avoid';
    bestMonths: string;
}

// Visa data for Indian passport holders
const VISA_DATA: Record<string, { status: VisaStatus; duration: string }> = {
    TH: { status: 'visa-on-arrival', duration: '15 days' },
    NP: { status: 'visa-free', duration: '150 days' },
    BT: { status: 'visa-free', duration: '14 days' },
    ID: { status: 'visa-free', duration: '30 days' },
    MV: { status: 'visa-on-arrival', duration: '30 days' },
    LK: { status: 'e-visa', duration: '30 days' },
    MY: { status: 'e-visa', duration: '30 days' },
    SG: { status: 'visa-required', duration: '30 days' },
    AE: { status: 'visa-on-arrival', duration: '14 days' },
    JP: { status: 'visa-required', duration: '90 days' },
    KR: { status: 'visa-required', duration: '90 days' },
    GB: { status: 'visa-required', duration: '180 days' },
    US: { status: 'visa-required', duration: '10 years (B1/B2)' },
    CA: { status: 'visa-required', duration: '10 years' },
    AU: { status: 'visa-required', duration: '12 months' },
    FR: { status: 'visa-required', duration: '90 days' },
    DE: { status: 'visa-required', duration: '90 days' },
    IT: { status: 'visa-required', duration: '90 days' },
    MU: { status: 'visa-free', duration: '90 days' },
    FJ: { status: 'visa-free', duration: '120 days' },
    SC: { status: 'visa-free', duration: '90 days' },
    KH: { status: 'visa-on-arrival', duration: '30 days' },
    LA: { status: 'visa-on-arrival', duration: '30 days' },
    MM: { status: 'visa-on-arrival', duration: '28 days' },
    QA: { status: 'visa-on-arrival', duration: '30 days' },
    OM: { status: 'e-visa', duration: '30 days' },
    KE: { status: 'e-visa', duration: '90 days' },
    TZ: { status: 'visa-on-arrival', duration: '90 days' },
    TR: { status: 'e-visa', duration: '30 days' },
    EG: { status: 'visa-on-arrival', duration: '30 days' },
    ET: { status: 'e-visa', duration: '30 days' },
    VN: { status: 'e-visa', duration: '30 days' },
    RU: { status: 'visa-required', duration: '30 days' },
    CN: { status: 'visa-required', duration: '30 days' },
    NZ: { status: 'visa-required', duration: '9 months' },
    ZA: { status: 'visa-required', duration: '30 days' },
    BR: { status: 'visa-required', duration: '90 days' },
};

const EMERGENCY_NUMBERS: Record<string, { police: string; ambulance: string; fire: string }> = {
    US: { police: '911', ambulance: '911', fire: '911' },
    GB: { police: '999', ambulance: '999', fire: '999' },
    AE: { police: '999', ambulance: '998', fire: '997' },
    TH: { police: '191', ambulance: '1669', fire: '199' },
    SG: { police: '999', ambulance: '995', fire: '995' },
    JP: { police: '110', ambulance: '119', fire: '119' },
    AU: { police: '000', ambulance: '000', fire: '000' },
    FR: { police: '17', ambulance: '15', fire: '18' },
    DE: { police: '110', ambulance: '112', fire: '112' },
};

const PLUG_TYPES: Record<string, string> = {
    US: 'Type A/B', GB: 'Type G', AE: 'Type G', TH: 'Type A/B/C',
    SG: 'Type G', JP: 'Type A/B', AU: 'Type I', FR: 'Type C/E',
    DE: 'Type C/F', IN: 'Type C/D/M', CN: 'Type A/C/I',
};

const ADVISORIES: Record<string, 'safe' | 'caution' | 'avoid'> = {
    NP: 'safe', BT: 'safe', TH: 'safe', SG: 'safe', JP: 'safe',
    AE: 'safe', MV: 'safe', LK: 'safe', MY: 'safe', ID: 'safe',
    MU: 'safe', FR: 'safe', DE: 'safe', AU: 'safe', NZ: 'safe',
    US: 'safe', CA: 'safe', GB: 'safe', IT: 'safe',
    KH: 'caution', EG: 'caution', KE: 'caution', TR: 'caution',
    MM: 'avoid', RU: 'caution',
};

const BEST_MONTHS: Record<string, string> = {
    TH: 'Nov—Feb', MV: 'Dec—Apr', LK: 'Dec—Mar', SG: 'Feb—Apr',
    JP: 'Mar—May, Oct—Nov', AE: 'Nov—Mar', GB: 'Jun—Aug', FR: 'May—Sep',
    AU: 'Sep—Nov', NZ: 'Dec—Feb', US: 'Apr—Jun, Sep—Oct', CA: 'Jun—Sep',
    NP: 'Oct—Dec', BT: 'Mar—May, Sep—Nov', ID: 'May—Sep',
};

export async function getCountryInfo(countryCode: string): Promise<CountryInfo | null> {
    try {
        const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,cca2,flag,capital,region,population,currencies,languages,timezones,idd,car`);
        if (!res.ok) return null;

        const data = await res.json();
        const cc = data.cca2;
        const currencyKey = Object.keys(data.currencies || {})[0] || '';
        const curr = data.currencies?.[currencyKey] || {};
        const visa = VISA_DATA[cc] || { status: 'visa-required' as VisaStatus, duration: 'Check embassy' };

        return {
            name: data.name?.common || '',
            code: cc,
            flag: data.flag || '',
            capital: (data.capital || [])[0] || '',
            region: data.region || '',
            population: data.population || 0,
            currency: { code: currencyKey, name: curr.name || '', symbol: curr.symbol || '' },
            languages: Object.values(data.languages || {}),
            timezone: (data.timezones || [])[0] || '',
            callingCode: `${data.idd?.root || ''}${(data.idd?.suffixes || [])[0] || ''}`,
            driveSide: data.car?.side || 'right',
            visaStatus: visa.status,
            visaDuration: visa.duration,
            emergencyNumbers: EMERGENCY_NUMBERS[cc] || { police: '112', ambulance: '112', fire: '112' },
            plugType: PLUG_TYPES[cc] || 'Type C/F',
            travelAdvisory: ADVISORIES[cc] || 'caution',
            bestMonths: BEST_MONTHS[cc] || 'Year-round',
        };
    } catch (error) {
        console.error('Country info error:', error);
        return null;
    }
}

export async function searchCountries(query: string): Promise<{ name: string; code: string; flag: string }[]> {
    if (query.length < 2) return [];
    try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,cca2,flag`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data || []).slice(0, 8).map((c: any) => ({
            name: c.name?.common || '',
            code: c.cca2 || '',
            flag: c.flag || '',
        }));
    } catch {
        return [];
    }
}

export const POPULAR_DESTINATIONS = [
    { name: 'Thailand', code: 'TH', flag: '🇹🇭' },
    { name: 'Dubai', code: 'AE', flag: '🇦🇪' },
    { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
    { name: 'Maldives', code: 'MV', flag: '🇲🇻' },
    { name: 'Nepal', code: 'NP', flag: '🇳🇵' },
    { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰' },
    { name: 'Japan', code: 'JP', flag: '🇯🇵' },
    { name: 'USA', code: 'US', flag: '🇺🇸' },
    { name: 'UK', code: 'GB', flag: '🇬🇧' },
    { name: 'Bali', code: 'ID', flag: '🇮🇩' },
    { name: 'Turkey', code: 'TR', flag: '🇹🇷' },
    { name: 'Australia', code: 'AU', flag: '🇦🇺' },
];

export const VISA_STATUS_INFO: Record<VisaStatus, { label: string; color: string; description: string }> = {
    'visa-free': { label: 'Visa Free', color: 'emerald', description: 'No visa needed for Indian passport holders' },
    'visa-on-arrival': { label: 'Visa on Arrival', color: 'blue', description: 'Get your visa at the airport on arrival' },
    'e-visa': { label: 'E-Visa', color: 'amber', description: 'Apply online before travel' },
    'visa-required': { label: 'Visa Required', color: 'rose', description: 'Visit embassy/consulate to apply' },
};
