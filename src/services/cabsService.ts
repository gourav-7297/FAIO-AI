// ============================
// CAB PROVIDERS DIRECTORY SERVICE
// Browse real cab agencies, get their contact info, call directly
// ============================

import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';

// ============================
// TYPES
// ============================

export interface CabProvider {
    id: string;
    name: string;
    city: string;
    phone: string;
    whatsapp: string | null;
    services: string[];
    vehicle_types: string[];
    price_range: string;
    rating: number;
    total_ratings: number;
    verified: boolean;
    description: string;
    logo_url: string | null;
    years_in_service: number;
    languages: string[];
}

export interface RouteInfo {
    distanceKm: number;
    durationMin: number;
}

// ============================
// FALLBACK DATA (when Supabase unavailable)
// ============================

const FALLBACK_PROVIDERS: CabProvider[] = [
    {
        id: 'f1', name: 'Savaari Car Rentals', city: 'Delhi',
        phone: '+91-9045454545', whatsapp: '+919045454545',
        services: ['Airport Transfer', 'Outstation', 'Local', 'Corporate'],
        vehicle_types: ['Sedan', 'SUV', 'Tempo Traveller', 'Innova'],
        price_range: '₹10-18/km', rating: 4.5, total_ratings: 12500,
        verified: true, description: 'Pan-India chauffeur-driven car rental. Professional drivers, well-maintained fleet.',
        logo_url: null, years_in_service: 15, languages: ['Hindi', 'English'],
    },
    {
        id: 'f2', name: 'Meru Cabs', city: 'Delhi',
        phone: '+91-1244224422', whatsapp: '+911244224422',
        services: ['Airport Transfer', 'Local', 'Hourly Rental'],
        vehicle_types: ['Sedan', 'SUV', 'Hatchback'],
        price_range: '₹12-20/km', rating: 4.3, total_ratings: 8900,
        verified: true, description: 'India\'s first GPS-enabled metered taxi service. Known for safety.',
        logo_url: null, years_in_service: 18, languages: ['Hindi', 'English'],
    },
    {
        id: 'f3', name: 'Cool Cab (MERU)', city: 'Mumbai',
        phone: '+91-2244224422', whatsapp: '+912244224422',
        services: ['Airport Transfer', 'Local', 'City Tour'],
        vehicle_types: ['Sedan', 'Hatchback', 'SUV'],
        price_range: '₹14-22/km', rating: 4.4, total_ratings: 9200,
        verified: true, description: 'Mumbai\'s trusted AC taxi service. Fixed fare from airport. Available 24/7.',
        logo_url: null, years_in_service: 16, languages: ['Hindi', 'English', 'Marathi'],
    },
    {
        id: 'f4', name: 'Goa Tourism Taxi', city: 'Goa',
        phone: '+91-8322437728', whatsapp: '+918322437728',
        services: ['Airport Transfer', 'Beach Hopping', 'North Goa Tour', 'South Goa Tour'],
        vehicle_types: ['Hatchback', 'Sedan', 'SUV', 'Scooter Rental'],
        price_range: '₹8-14/km', rating: 4.4, total_ratings: 7800,
        verified: true, description: 'Licensed tourist taxi service covering all of Goa.',
        logo_url: null, years_in_service: 20, languages: ['Konkani', 'Hindi', 'English'],
    },
    {
        id: 'f5', name: 'Rajasthan Tourism Cabs', city: 'Jaipur',
        phone: '+91-1412200778', whatsapp: '+911412200778',
        services: ['Tourist Package', 'Heritage Tour', 'Desert Safari', 'Outstation'],
        vehicle_types: ['Sedan', 'Innova', 'Tempo Traveller', 'SUV'],
        price_range: '₹9-15/km', rating: 4.5, total_ratings: 6100,
        verified: true, description: 'Government-recognized tourist transport for Rajasthan heritage circuit.',
        logo_url: null, years_in_service: 22, languages: ['Hindi', 'English', 'Rajasthani'],
    },
    {
        id: 'f6', name: 'KSTDC Tourist Cabs', city: 'Bangalore',
        phone: '+91-8025584452', whatsapp: '+918025584452',
        services: ['Tourist Package', 'Outstation', 'Day Trip', 'Mysore Tour'],
        vehicle_types: ['Sedan', 'Innova', 'Tempo Traveller', 'Mini Bus'],
        price_range: '₹10-15/km', rating: 4.3, total_ratings: 5600,
        verified: true, description: 'Government-approved tourist taxi service. Best for Mysore, Coorg packages.',
        logo_url: null, years_in_service: 25, languages: ['Kannada', 'Hindi', 'English'],
    },
    {
        id: 'f7', name: 'Fast Track Cabs', city: 'Chennai',
        phone: '+91-4445454545', whatsapp: '+914445454545',
        services: ['Airport Transfer', 'Local', 'Outstation', 'Temple Tour'],
        vehicle_types: ['Sedan', 'SUV', 'Innova', 'Tempo Traveller'],
        price_range: '₹11-17/km', rating: 4.3, total_ratings: 5400,
        verified: true, description: 'Chennai\'s trusted tourist cab service. Specializes in temple tours.',
        logo_url: null, years_in_service: 14, languages: ['Tamil', 'Hindi', 'English'],
    },
];

// ============================
// SUPPORTED CITIES
// ============================

export const CAB_CITIES = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Goa',
    'Jaipur', 'Kolkata', 'Hyderabad', 'Pune', 'Kochi',
];

// ============================
// OSRM ROUTE (kept — provides real distance/time)
// ============================

export async function getRouteInfo(
    originLat: number, originLng: number,
    destLat: number, destLng: number
): Promise<RouteInfo | null> {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=false`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const route = data?.routes?.[0];
        if (!route) return null;
        return {
            distanceKm: Math.round(route.distance / 100) / 10,
            durationMin: Math.round(route.duration / 60),
        };
    } catch {
        return null;
    }
}

// ============================
// SERVICE
// ============================

export const cabsService = {
    // Get all providers for a city
    async getProviders(city: string): Promise<CabProvider[]> {
        if (isSupabaseAvailable && supabase) {
            try {
                const { data, error } = await supabase
                    .from('cab_providers')
                    .select('*')
                    .ilike('city', `%${city}%`)
                    .order('rating', { ascending: false });

                if (!error && data && data.length > 0) {
                    return data as unknown as CabProvider[];
                }
            } catch (e) {
                console.warn('Supabase cab_providers fetch failed:', e);
            }
        }

        // Fallback to local data
        return FALLBACK_PROVIDERS.filter(
            p => p.city.toLowerCase().includes(city.toLowerCase())
        );
    },

    // Get all providers (no city filter)
    async getAllProviders(): Promise<CabProvider[]> {
        if (isSupabaseAvailable && supabase) {
            try {
                const { data, error } = await supabase
                    .from('cab_providers')
                    .select('*')
                    .order('rating', { ascending: false });

                if (!error && data && data.length > 0) {
                    return data as unknown as CabProvider[];
                }
            } catch (e) {
                console.warn('Supabase cab_providers fetch failed:', e);
            }
        }
        return FALLBACK_PROVIDERS;
    },

    // Search providers by name or city
    searchProviders(query: string, providers: CabProvider[]): CabProvider[] {
        const q = query.toLowerCase();
        return providers.filter(
            p => p.name.toLowerCase().includes(q) ||
                p.city.toLowerCase().includes(q) ||
                p.services.some(s => s.toLowerCase().includes(q))
        );
    },

    // Build call link
    getCallLink(phone: string): string {
        return `tel:${phone.replace(/[\s-]/g, '')}`;
    },

    // Build WhatsApp link with preset message
    getWhatsAppLink(whatsapp: string, providerName: string, city: string): string {
        const message = encodeURIComponent(
            `Hi, I found ${providerName} on FAIO AI app. I'm looking for a cab in ${city}. Can you share your availability and rates?`
        );
        const number = whatsapp.replace(/[\s\-+]/g, '');
        return `https://wa.me/${number}?text=${message}`;
    },

    // Get available cities
    getCities(): string[] {
        return CAB_CITIES;
    },
};

export default cabsService;
