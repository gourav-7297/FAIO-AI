// ============================
// PLACES SERVICE
// Real POI data via Overpass API (OpenStreetMap)
// No API key needed — 100% free
// ============================

export interface RealPlace {
    id: number;
    name: string;
    type: string;
    category: string;
    lat: number;
    lon: number;
    tags: Record<string, string>;
}

// Map OSM amenity types to user-friendly categories
const CATEGORY_MAP: Record<string, string> = {
    restaurant: '🍽️ Restaurant',
    cafe: '☕ Café',
    bar: '🍸 Bar',
    hotel: '🏨 Hotel',
    museum: '🏛️ Museum',
    gallery: '🎨 Gallery',
    theatre: '🎭 Theatre',
    cinema: '🎬 Cinema',
    park: '🌳 Park',
    temple: '🛕 Temple',
    church: '⛪ Church',
    mosque: '🕌 Mosque',
    hospital: '🏥 Hospital',
    pharmacy: '💊 Pharmacy',
    bank: '🏦 Bank',
    atm: '💳 ATM',
    supermarket: '🛒 Supermarket',
    marketplace: '🏪 Market',
    bus_station: '🚌 Bus Station',
    train_station: '🚉 Train Station',
};

/**
 * Search for real places near a location using OpenStreetMap Overpass API.
 * @param lat Latitude
 * @param lon Longitude
 * @param radiusMetres Search radius  
 * @param types OSM amenity types to search for
 */
export async function searchNearbyPlaces(
    lat: number,
    lon: number,
    radiusMetres: number = 2000,
    types: string[] = ['restaurant', 'cafe', 'hotel', 'museum', 'park', 'bar']
): Promise<RealPlace[]> {
    try {
        // Build Overpass query for multiple amenity types
        const amenityFilter = types.map(t => `node["amenity"="${t}"](around:${radiusMetres},${lat},${lon});`).join('\n');
        const tourismFilter = `node["tourism"~"hotel|museum|gallery|attraction"](around:${radiusMetres},${lat},${lon});`;

        const query = `
[out:json][timeout:10];
(
${amenityFilter}
${tourismFilter}
);
out body 50;
`;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);

        const data = await response.json();

        const places: RealPlace[] = (data.elements || [])
            .filter((el: any) => el.tags?.name)
            .map((el: any) => {
                const amenity = el.tags.amenity || el.tags.tourism || 'place';
                return {
                    id: el.id,
                    name: el.tags.name,
                    type: amenity,
                    category: CATEGORY_MAP[amenity] || `📍 ${amenity}`,
                    lat: el.lat,
                    lon: el.lon,
                    tags: el.tags,
                };
            });

        return places;
    } catch (error) {
        console.error('Overpass API error:', error);
        return [];
    }
}

/**
 * Search for specific place types (e.g. only restaurants)
 */
export async function searchPlacesByType(
    lat: number,
    lon: number,
    type: string,
    radiusMetres: number = 3000
): Promise<RealPlace[]> {
    return searchNearbyPlaces(lat, lon, radiusMetres, [type]);
}

/**
 * Get user's current location via browser Geolocation API.
 */
export function getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 5000, enableHighAccuracy: false }
        );
    });
}
