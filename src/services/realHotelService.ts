// ============================
// REAL HOTEL SEARCH SERVICE
// Uses Overpass API to find real hotels + hostels
// near a destination — 100% free, no key needed
// ============================

export interface RealHotel {
    id: number;
    name: string;
    type: 'hotel' | 'hostel' | 'motel' | 'guest_house' | 'resort' | 'apartment';
    lat: number;
    lon: number;
    stars: number;
    address?: string;
    phone?: string;
    website?: string;
    internet?: boolean;
    wheelchair?: boolean;
    tags: Record<string, string>;
    // Estimated from type + stars (since Overpass doesn't have prices)
    estimatedPricePerNight: number;
    imageUrl: string;
}

// Realistic price estimation by type and stars
function estimatePrice(type: string, stars: number): number {
    const basePrices: Record<string, number> = {
        hotel: 2500,
        resort: 5000,
        hostel: 800,
        motel: 1200,
        guest_house: 1500,
        apartment: 2000,
    };
    const base = basePrices[type] || 2000;
    const starMultiplier = 1 + (stars - 1) * 0.6;
    // Add some variation
    const variation = 0.8 + Math.random() * 0.4;
    return Math.round(base * starMultiplier * variation / 100) * 100;
}

// Stock hotel images by type
const HOTEL_IMAGES: Record<string, string[]> = {
    hotel: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
    ],
    resort: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400&h=300&fit=crop',
    ],
    hostel: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1590490360182-c33d5c9f9421?w=400&h=300&fit=crop',
    ],
    guest_house: [
        'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&h=300&fit=crop',
    ],
    default: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    ],
};

function getHotelImage(type: string, index: number): string {
    const images = HOTEL_IMAGES[type] || HOTEL_IMAGES.default;
    return images[index % images.length];
}

/**
 * Search for real hotels near a destination using Overpass API.
 * @param cityName City name (used for geocoding first)
 * @param lat Optional latitude (skip geocoding)
 * @param lon Optional longitude (skip geocoding)
 */
export async function searchRealHotels(
    cityName?: string,
    lat?: number,
    lon?: number,
    radiusMetres: number = 5000
): Promise<RealHotel[]> {
    try {
        // Step 1: Geocode if no coordinates provided
        if (!lat || !lon) {
            if (!cityName) return [];
            const geo = await geocodeCity(cityName);
            if (!geo) return [];
            lat = geo.lat;
            lon = geo.lon;
        }

        // Step 2: Query Overpass for hotels
        const query = `
[out:json][timeout:15];
(
  node["tourism"="hotel"](around:${radiusMetres},${lat},${lon});
  node["tourism"="hostel"](around:${radiusMetres},${lat},${lon});
  node["tourism"="motel"](around:${radiusMetres},${lat},${lon});
  node["tourism"="guest_house"](around:${radiusMetres},${lat},${lon});
  way["tourism"="hotel"](around:${radiusMetres},${lat},${lon});
  way["tourism"="hostel"](around:${radiusMetres},${lat},${lon});
);
out body 30;
`;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) throw new Error(`Overpass error: ${response.status}`);
        const data = await response.json();

        const hotels: RealHotel[] = (data.elements || [])
            .filter((el: any) => el.tags?.name)
            .map((el: any, i: number) => {
                const type = (el.tags.tourism || 'hotel') as RealHotel['type'];
                const stars = el.tags.stars ? parseInt(el.tags.stars) : (type === 'hotel' ? 3 : type === 'resort' ? 4 : 2);

                return {
                    id: el.id,
                    name: el.tags.name,
                    type,
                    lat: el.lat || el.center?.lat || lat,
                    lon: el.lon || el.center?.lon || lon,
                    stars: Math.min(stars, 5),
                    address: el.tags['addr:street'] ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}`.trim() : undefined,
                    phone: el.tags.phone || el.tags['contact:phone'],
                    website: el.tags.website || el.tags['contact:website'],
                    internet: el.tags.internet_access === 'yes' || el.tags.internet_access === 'wlan',
                    wheelchair: el.tags.wheelchair === 'yes',
                    tags: el.tags,
                    estimatedPricePerNight: estimatePrice(type, stars),
                    imageUrl: getHotelImage(type, i),
                };
            });

        return hotels;
    } catch (error) {
        console.error('Real hotel search error:', error);
        return [];
    }
}

/**
 * Simple geocoding using Nominatim (OpenStreetMap) — free, no key.
 */
async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'FAIO-AI-App' } }
        );
        if (!response.ok) return null;
        const results = await response.json();
        if (results.length === 0) return null;
        return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
    } catch {
        return null;
    }
}
