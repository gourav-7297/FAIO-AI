// ============================
// TYPES
// ============================

export interface RideOption {
    id: string;
    type: 'Economy' | 'Comfort' | 'Premium' | 'Van';
    name: string;
    image: string;
    price: number;
    currency: string;
    eta: number;
    capacity: number;
    description: string;
}

export interface Driver {
    name: string;
    rating: number;
    carModel: string;
    plateNumber: string;
    phone: string;
    avatar: string;
}

// ============================
// BASE OPTIONS (prices fluctuate)
// ============================

const BASE_RIDES: Omit<RideOption, 'price' | 'eta'>[] = [
    {
        id: '1',
        type: 'Economy',
        name: 'Eco Saver',
        image: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png',
        currency: 'USD',
        capacity: 3,
        description: 'Affordable rides for everyday travel',
    },
    {
        id: '2',
        type: 'Comfort',
        name: 'Comfort Plus',
        image: 'https://cdn-icons-png.flaticon.com/512/3097/3097144.png',
        currency: 'USD',
        capacity: 4,
        description: 'Spacious cars with AC and extra legroom',
    },
    {
        id: '3',
        type: 'Premium',
        name: 'Lux Sedan',
        image: 'https://cdn-icons-png.flaticon.com/512/5765/5765924.png',
        currency: 'USD',
        capacity: 3,
        description: 'Premium vehicles, professional drivers',
    },
    {
        id: '4',
        type: 'Van',
        name: 'Van XL',
        image: 'https://cdn-icons-png.flaticon.com/512/3097/3097186.png',
        currency: 'USD',
        capacity: 6,
        description: 'Rides for groups up to 6',
    },
];



// Pool of realistic drivers
const DRIVER_POOL: Driver[] = [
    { name: 'Miguel Santos', rating: 4.8, carModel: 'Toyota Camry (White)', plateNumber: 'GH-882-KL', phone: '+1 555 0123', avatar: 'https://i.pravatar.cc/150?u=miguel' },
    { name: 'Aisha Patel', rating: 4.9, carModel: 'Honda Civic (Silver)', plateNumber: 'BT-451-MN', phone: '+1 555 0456', avatar: 'https://i.pravatar.cc/150?u=aisha' },
    { name: 'Liam O\'Brien', rating: 4.7, carModel: 'Hyundai Elantra (Blue)', plateNumber: 'KP-773-RA', phone: '+1 555 0789', avatar: 'https://i.pravatar.cc/150?u=liam' },
    { name: 'Yuki Nakamura', rating: 5.0, carModel: 'Tesla Model 3 (Black)', plateNumber: 'TX-001-JP', phone: '+1 555 1234', avatar: 'https://i.pravatar.cc/150?u=yukid' },
];

// ============================
// TIME-OF-DAY SURGE MULTIPLIER
// ============================

function getSurgeMultiplier(): number {
    const hour = new Date().getHours();
    // Rush hours: 7-9am, 5-8pm
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) return 1.3 + Math.random() * 0.4;
    // Late night: 11pm-5am
    if (hour >= 23 || hour <= 5) return 1.2 + Math.random() * 0.3;
    // Normal hours
    return 1.0 + Math.random() * 0.15;
}

// ============================
// SERVICE
// ============================

export interface RouteInfo {
    distanceKm: number;
    durationMin: number;
}

// OSRM free routing API - returns real driving distance & time
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

// Per-km pricing by ride type (INR)
const PER_KM_RATE: Record<string, number> = {
    Economy: 9,
    Comfort: 14,
    Premium: 22,
    Van: 18,
};
const BASE_FARE: Record<string, number> = {
    Economy: 50,
    Comfort: 80,
    Premium: 150,
    Van: 120,
};

export const cabsService = {
    getRideOptions(route?: RouteInfo | null): RideOption[] {
        const surge = getSurgeMultiplier();
        const km = route?.distanceKm || 10;

        return BASE_RIDES.map((ride) => {
            const base = BASE_FARE[ride.type] || 50;
            const perKm = PER_KM_RATE[ride.type] || 10;
            const price = Math.round((base + km * perKm) * surge);
            const eta = route
                ? Math.round(route.durationMin * 0.3 + Math.random() * 3)
                : Math.round(3 + Math.random() * 10);
            return { ...ride, price, eta };
        });
    },

    refreshPrices(currentOptions: RideOption[], route?: RouteInfo | null): RideOption[] {
        const surge = getSurgeMultiplier();
        const km = route?.distanceKm || 10;

        return currentOptions.map((ride) => {
            const base = BASE_FARE[ride.type] || 50;
            const perKm = PER_KM_RATE[ride.type] || 10;
            const price = Math.round((base + km * perKm) * surge * (0.95 + Math.random() * 0.1));
            const eta = route
                ? Math.round(route.durationMin * 0.3 + Math.random() * 3)
                : Math.round(3 + Math.random() * 10);
            return { ...ride, price, eta };
        });
    },

    getAssignedDriver(): Driver {
        return DRIVER_POOL[Math.floor(Math.random() * DRIVER_POOL.length)];
    },

    isSurgeActive(): boolean {
        return getSurgeMultiplier() > 1.2;
    },

    estimateFare(distanceKm: number, rideType: string = 'Economy'): number {
        const base = BASE_FARE[rideType] || 50;
        const perKm = PER_KM_RATE[rideType] || 10;
        return Math.round((base + distanceKm * perKm) * getSurgeMultiplier());
    },
};

export default cabsService;
