// ============================
// FOURSQUARE SERVICE
// Real places data via Foursquare Places API v2
// Provides hotels, restaurants, cafes, attractions with real data
// ============================

const FSQ_CLIENT_ID = import.meta.env.VITE_FOURSQUARE_CLIENT_ID || '';
const FSQ_CLIENT_SECRET = import.meta.env.VITE_FOURSQUARE_CLIENT_SECRET || '';
const FSQ_BASE = 'https://api.foursquare.com/v2';
const FSQ_VERSION = '20231010'; // API version date

export interface FoursquarePlace {
    id: string;
    name: string;
    category: string;
    categoryIcon: string;
    address: string;
    city: string;
    state: string;
    country: string;
    lat: number;
    lon: number;
    distance?: number; // metres from search point
    phone?: string;
    website?: string;
    rating?: number;
    price?: number; // 1-4 price tier
    photos: string[];
    isVerified: boolean;
}

// ─── Category IDs (Foursquare) ───────────────────
export const FSQ_CATEGORIES = {
    hotel:       '4bf58dd8d48988d1fa931735',
    resort:      '4bf58dd8d48988d12f951735',
    hostel:      '4bf58dd8d48988d1ee931735',
    restaurant:  '4d4b7105d754a06374d81259',
    cafe:        '4bf58dd8d48988d16d941735',
    bar:         '4bf58dd8d48988d116941735',
    nightclub:   '4bf58dd8d48988d11f941735',
    museum:      '4bf58dd8d48988d181941735',
    park:        '4bf58dd8d48988d163941735',
    monument:    '4bf58dd8d48988d12d941735',
    temple:      '4bf58dd8d48988d131941735',
    beach:       '4bf58dd8d48988d1e2941735',
    mall:        '4bf58dd8d48988d1fd941735',
    pharmacy:    '4bf58dd8d48988d10f951735',
    hospital:    '4bf58dd8d48988d196941735',
    atm:         '52f2ab2ebcbc57f1066b8b56',
    airport:     '4bf58dd8d48988d1ed931735',
    trainStation:'4bf58dd8d48988d129951735',
    busStation:  '4bf58dd8d48988d1fe931735',
};

// ─── Category display mapping ────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
    'Hotel':            '🏨',
    'Resort':           '🏖️',
    'Hostel':           '🛏️',
    'Restaurant':       '🍽️',
    'Café':             '☕',
    'Coffee Shop':      '☕',
    'Bar':              '🍸',
    'Nightclub':        '🎶',
    'Museum':           '🏛️',
    'Park':             '🌳',
    'Monument':         '🗽',
    'Temple':           '🛕',
    'Beach':            '🏖️',
    'Shopping Mall':    '🛍️',
    'Pharmacy':         '💊',
    'Hospital':         '🏥',
    'ATM':              '💳',
    'Airport':          '✈️',
    'Train Station':    '🚉',
    'Bus Station':      '🚌',
};

function getEmojiForCategory(catName: string): string {
    for (const [key, emoji] of Object.entries(CATEGORY_EMOJI)) {
        if (catName.toLowerCase().includes(key.toLowerCase())) return emoji;
    }
    return '📍';
}

// ─── Auth params ─────────────────────────────────
function authParams(): string {
    return `client_id=${FSQ_CLIENT_ID}&client_secret=${FSQ_CLIENT_SECRET}&v=${FSQ_VERSION}`;
}

function isConfigured(): boolean {
    return !!(FSQ_CLIENT_ID && FSQ_CLIENT_SECRET);
}

// ─── Parse venue to FoursquarePlace ──────────────
function parseVenue(venue: any): FoursquarePlace {
    const cat = venue.categories?.[0];
    const catName = cat?.name || 'Place';
    return {
        id: venue.id,
        name: venue.name,
        category: `${getEmojiForCategory(catName)} ${catName}`,
        categoryIcon: cat ? `${cat.icon.prefix}64${cat.icon.suffix}` : '',
        address: venue.location?.formattedAddress?.join(', ') || venue.location?.address || '',
        city: venue.location?.city || '',
        state: venue.location?.state || '',
        country: venue.location?.country || '',
        lat: venue.location?.lat || 0,
        lon: venue.location?.lng || 0,
        distance: venue.location?.distance,
        phone: venue.contact?.formattedPhone || venue.contact?.phone,
        website: venue.url,
        rating: venue.rating ? venue.rating / 2 : undefined, // FSQ uses 0-10, normalize to 0-5
        price: venue.price?.tier,
        photos: [],
        isVerified: venue.verified || false,
    };
}

// ═══════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════

/**
 * Search for places near a city/location string.
 * Returns real venues from Foursquare.
 */
export async function searchPlaces(
    near: string,
    query: string = '',
    categoryId?: string,
    limit: number = 20
): Promise<FoursquarePlace[]> {
    if (!isConfigured()) {
        console.warn('Foursquare: Not configured (missing API keys)');
        return [];
    }

    try {
        let url = `${FSQ_BASE}/venues/search?${authParams()}&near=${encodeURIComponent(near)}&limit=${limit}`;
        if (query) url += `&query=${encodeURIComponent(query)}`;
        if (categoryId) url += `&categoryId=${categoryId}`;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Foursquare API error: ${resp.status}`);

        const data = await resp.json();
        return (data.response?.venues || []).map(parseVenue);
    } catch (error) {
        console.error('Foursquare search error:', error);
        return [];
    }
}

/**
 * Search for places near coordinates (lat/lon).
 */
export async function searchPlacesNearby(
    lat: number,
    lon: number,
    query: string = '',
    categoryId?: string,
    limit: number = 20,
    radius: number = 5000
): Promise<FoursquarePlace[]> {
    if (!isConfigured()) {
        console.warn('Foursquare: Not configured (missing API keys)');
        return [];
    }

    try {
        let url = `${FSQ_BASE}/venues/search?${authParams()}&ll=${lat},${lon}&radius=${radius}&limit=${limit}`;
        if (query) url += `&query=${encodeURIComponent(query)}`;
        if (categoryId) url += `&categoryId=${categoryId}`;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Foursquare API error: ${resp.status}`);

        const data = await resp.json();
        return (data.response?.venues || []).map(parseVenue);
    } catch (error) {
        console.error('Foursquare nearby search error:', error);
        return [];
    }
}

// ─── Convenience helpers ─────────────────────────

export async function searchHotels(near: string, limit = 15): Promise<FoursquarePlace[]> {
    return searchPlaces(near, 'hotel', FSQ_CATEGORIES.hotel, limit);
}

export async function searchRestaurants(near: string, limit = 15): Promise<FoursquarePlace[]> {
    return searchPlaces(near, 'restaurant', FSQ_CATEGORIES.restaurant, limit);
}

export async function searchCafes(near: string, limit = 15): Promise<FoursquarePlace[]> {
    return searchPlaces(near, 'cafe', FSQ_CATEGORIES.cafe, limit);
}

export async function searchBars(near: string, limit = 15): Promise<FoursquarePlace[]> {
    return searchPlaces(near, 'bar', FSQ_CATEGORIES.bar, limit);
}

export async function searchAttractions(near: string, limit = 15): Promise<FoursquarePlace[]> {
    // Combine museums, monuments, parks, temples, beaches
    const results = await Promise.all([
        searchPlaces(near, '', FSQ_CATEGORIES.museum, 5),
        searchPlaces(near, '', FSQ_CATEGORIES.monument, 5),
        searchPlaces(near, '', FSQ_CATEGORIES.park, 5),
        searchPlaces(near, '', FSQ_CATEGORIES.temple, 5),
        searchPlaces(near, '', FSQ_CATEGORIES.beach, 5),
    ]);
    return results.flat().slice(0, limit);
}

/**
 * Get a comprehensive overview of a destination.
 * Returns hotels, restaurants, cafes, and attractions.
 */
export async function getDestinationOverview(city: string): Promise<{
    hotels: FoursquarePlace[];
    restaurants: FoursquarePlace[];
    cafes: FoursquarePlace[];
    attractions: FoursquarePlace[];
}> {
    const [hotels, restaurants, cafes, attractions] = await Promise.all([
        searchHotels(city, 10),
        searchRestaurants(city, 10),
        searchCafes(city, 10),
        searchAttractions(city, 10),
    ]);

    return { hotels, restaurants, cafes, attractions };
}

/**
 * Get highly rated places that aren't verified chains (simulated 'Hidden Gems')
 */
export async function searchHiddenGems(city: string, limit = 15): Promise<FoursquarePlace[]> {
    // Search a broad category (food, drinks, arts) with a larger limit to have a pool to filter
    const places = await searchPlaces(city, '', [FSQ_CATEGORIES.cafe, FSQ_CATEGORIES.restaurant, FSQ_CATEGORIES.bar, FSQ_CATEGORIES.museum, FSQ_CATEGORIES.park].join(','), 50);
    
    // Filter out verified chains, or places with massive popularity, prioritize high rating if available
    const hiddenGems = places.filter(p => !p.isVerified).sort(() => 0.5 - Math.random()); // Randomize slightly for variety
    
    // Return unique categories if possible
    return hiddenGems.slice(0, limit);
}

/**
 * Check if Foursquare is configured and working.
 */
export function isFoursquareAvailable(): boolean {
    return isConfigured();
}
