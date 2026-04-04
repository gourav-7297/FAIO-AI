// ============================
// EMERGENCY NUMBERS DATABASE
// 55+ most-traveled countries
// ============================

export interface EmergencyNumbers {
    police: string;
    ambulance: string;
    fire: string;
    touristPolice?: string;
    general?: string; // Single number for all (like 911)
    countryName: string;
    flag: string;
}

export const EMERGENCY_NUMBERS: Record<string, EmergencyNumbers> = {
    // ─── Americas ────────────────────────────
    US: { police: '911', ambulance: '911', fire: '911', general: '911', countryName: 'United States', flag: '🇺🇸' },
    CA: { police: '911', ambulance: '911', fire: '911', general: '911', countryName: 'Canada', flag: '🇨🇦' },
    MX: { police: '911', ambulance: '911', fire: '911', general: '911', touristPolice: '078', countryName: 'Mexico', flag: '🇲🇽' },
    BR: { police: '190', ambulance: '192', fire: '193', touristPolice: '194', countryName: 'Brazil', flag: '🇧🇷' },
    AR: { police: '101', ambulance: '107', fire: '100', touristPolice: '0800-999-5000', countryName: 'Argentina', flag: '🇦🇷' },
    CO: { police: '123', ambulance: '123', fire: '123', general: '123', countryName: 'Colombia', flag: '🇨🇴' },
    PE: { police: '105', ambulance: '116', fire: '116', touristPolice: '0800-22-221', countryName: 'Peru', flag: '🇵🇪' },
    CL: { police: '133', ambulance: '131', fire: '132', countryName: 'Chile', flag: '🇨🇱' },
    CR: { police: '911', ambulance: '911', fire: '911', general: '911', countryName: 'Costa Rica', flag: '🇨🇷' },
    CU: { police: '106', ambulance: '104', fire: '105', countryName: 'Cuba', flag: '🇨🇺' },

    // ─── Europe ──────────────────────────────
    GB: { police: '999', ambulance: '999', fire: '999', general: '999', countryName: 'United Kingdom', flag: '🇬🇧' },
    FR: { police: '17', ambulance: '15', fire: '18', general: '112', countryName: 'France', flag: '🇫🇷' },
    DE: { police: '110', ambulance: '112', fire: '112', general: '112', countryName: 'Germany', flag: '🇩🇪' },
    IT: { police: '113', ambulance: '118', fire: '115', general: '112', countryName: 'Italy', flag: '🇮🇹' },
    ES: { police: '091', ambulance: '061', fire: '080', general: '112', touristPolice: '902-102-112', countryName: 'Spain', flag: '🇪🇸' },
    PT: { police: '112', ambulance: '112', fire: '112', general: '112', countryName: 'Portugal', flag: '🇵🇹' },
    NL: { police: '112', ambulance: '112', fire: '112', general: '112', countryName: 'Netherlands', flag: '🇳🇱' },
    BE: { police: '101', ambulance: '112', fire: '112', general: '112', countryName: 'Belgium', flag: '🇧🇪' },
    CH: { police: '117', ambulance: '144', fire: '118', countryName: 'Switzerland', flag: '🇨🇭' },
    AT: { police: '133', ambulance: '144', fire: '122', general: '112', countryName: 'Austria', flag: '🇦🇹' },
    GR: { police: '100', ambulance: '166', fire: '199', general: '112', touristPolice: '171', countryName: 'Greece', flag: '🇬🇷' },
    TR: { police: '155', ambulance: '112', fire: '110', general: '112', touristPolice: '153', countryName: 'Turkey', flag: '🇹🇷' },
    CZ: { police: '158', ambulance: '155', fire: '150', general: '112', countryName: 'Czech Republic', flag: '🇨🇿' },
    PL: { police: '997', ambulance: '999', fire: '998', general: '112', countryName: 'Poland', flag: '🇵🇱' },
    HU: { police: '107', ambulance: '104', fire: '105', general: '112', countryName: 'Hungary', flag: '🇭🇺' },
    HR: { police: '192', ambulance: '194', fire: '193', general: '112', countryName: 'Croatia', flag: '🇭🇷' },
    SE: { police: '112', ambulance: '112', fire: '112', general: '112', countryName: 'Sweden', flag: '🇸🇪' },
    NO: { police: '112', ambulance: '113', fire: '110', countryName: 'Norway', flag: '🇳🇴' },
    DK: { police: '112', ambulance: '112', fire: '112', general: '112', countryName: 'Denmark', flag: '🇩🇰' },
    FI: { police: '112', ambulance: '112', fire: '112', general: '112', countryName: 'Finland', flag: '🇫🇮' },
    IE: { police: '999', ambulance: '999', fire: '999', general: '112', countryName: 'Ireland', flag: '🇮🇪' },
    RO: { police: '112', ambulance: '112', fire: '112', general: '112', countryName: 'Romania', flag: '🇷🇴' },
    RU: { police: '102', ambulance: '103', fire: '101', general: '112', countryName: 'Russia', flag: '🇷🇺' },

    // ─── Asia ────────────────────────────────
    IN: { police: '100', ambulance: '108', fire: '101', touristPolice: '1363', general: '112', countryName: 'India', flag: '🇮🇳' },
    JP: { police: '110', ambulance: '119', fire: '119', countryName: 'Japan', flag: '🇯🇵' },
    CN: { police: '110', ambulance: '120', fire: '119', countryName: 'China', flag: '🇨🇳' },
    KR: { police: '112', ambulance: '119', fire: '119', touristPolice: '1330', countryName: 'South Korea', flag: '🇰🇷' },
    TH: { police: '191', ambulance: '1669', fire: '199', touristPolice: '1155', countryName: 'Thailand', flag: '🇹🇭' },
    VN: { police: '113', ambulance: '115', fire: '114', countryName: 'Vietnam', flag: '🇻🇳' },
    ID: { police: '110', ambulance: '118', fire: '113', countryName: 'Indonesia', flag: '🇮🇩' },
    MY: { police: '999', ambulance: '999', fire: '994', general: '999', countryName: 'Malaysia', flag: '🇲🇾' },
    SG: { police: '999', ambulance: '995', fire: '995', countryName: 'Singapore', flag: '🇸🇬' },
    PH: { police: '117', ambulance: '911', fire: '911', general: '911', countryName: 'Philippines', flag: '🇵🇭' },
    LK: { police: '119', ambulance: '110', fire: '111', touristPolice: '1912', countryName: 'Sri Lanka', flag: '🇱🇰' },
    NP: { police: '100', ambulance: '102', fire: '101', touristPolice: '1144', countryName: 'Nepal', flag: '🇳🇵' },
    PK: { police: '15', ambulance: '115', fire: '16', countryName: 'Pakistan', flag: '🇵🇰' },
    BD: { police: '999', ambulance: '999', fire: '199', general: '999', countryName: 'Bangladesh', flag: '🇧🇩' },
    MM: { police: '199', ambulance: '192', fire: '191', countryName: 'Myanmar', flag: '🇲🇲' },
    KH: { police: '117', ambulance: '119', fire: '118', touristPolice: '1294', countryName: 'Cambodia', flag: '🇰🇭' },

    // ─── Middle East & Africa ────────────────
    AE: { police: '999', ambulance: '998', fire: '997', countryName: 'UAE', flag: '🇦🇪' },
    SA: { police: '999', ambulance: '997', fire: '998', countryName: 'Saudi Arabia', flag: '🇸🇦' },
    EG: { police: '122', ambulance: '123', fire: '180', touristPolice: '126', countryName: 'Egypt', flag: '🇪🇬' },
    MA: { police: '19', ambulance: '15', fire: '15', touristPolice: '177', countryName: 'Morocco', flag: '🇲🇦' },
    ZA: { police: '10111', ambulance: '10177', fire: '10177', countryName: 'South Africa', flag: '🇿🇦' },
    KE: { police: '999', ambulance: '999', fire: '999', general: '999', countryName: 'Kenya', flag: '🇰🇪' },
    IL: { police: '100', ambulance: '101', fire: '102', touristPolice: '110', countryName: 'Israel', flag: '🇮🇱' },
    JO: { police: '911', ambulance: '911', fire: '911', general: '911', countryName: 'Jordan', flag: '🇯🇴' },
    QA: { police: '999', ambulance: '999', fire: '999', general: '999', countryName: 'Qatar', flag: '🇶🇦' },

    // ─── Oceania ──────────────────────────────
    AU: { police: '000', ambulance: '000', fire: '000', general: '000', countryName: 'Australia', flag: '🇦🇺' },
    NZ: { police: '111', ambulance: '111', fire: '111', general: '111', countryName: 'New Zealand', flag: '🇳🇿' },
    FJ: { police: '917', ambulance: '911', fire: '910', countryName: 'Fiji', flag: '🇫🇯' },
};

// Fallback for unknown countries
export const DEFAULT_EMERGENCY: EmergencyNumbers = {
    police: '112',
    ambulance: '112',
    fire: '112',
    general: '112',
    countryName: 'International',
    flag: '🌍',
};

/**
 * Get emergency numbers for a country code (ISO 3166-1 alpha-2)
 */
export function getEmergencyNumbers(countryCode: string): EmergencyNumbers {
    const upper = countryCode.toUpperCase();
    return EMERGENCY_NUMBERS[upper] || DEFAULT_EMERGENCY;
}

/**
 * Get all available country codes
 */
export function getAvailableCountries(): { code: string; name: string; flag: string }[] {
    return Object.entries(EMERGENCY_NUMBERS).map(([code, data]) => ({
        code,
        name: data.countryName,
        flag: data.flag,
    }));
}
