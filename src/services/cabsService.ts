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

// Pricing tiers: [base, range, etaMin, etaMax]
const PRICE_CONFIG: Record<string, [number, number, number, number]> = {
    Economy: [8, 5, 3, 8],
    Comfort: [15, 8, 5, 10],
    Premium: [25, 12, 4, 7],
    Van: [30, 10, 8, 15],
};

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

export const cabsService = {
    /**
     * Get ride options with dynamically fluctuating prices based on time of day.
     * Generates realistic pricing without needing an external API.
     */
    getRideOptions(): RideOption[] {
        const surge = getSurgeMultiplier();

        return BASE_RIDES.map((ride) => {
            const [base, range, etaMin, etaMax] = PRICE_CONFIG[ride.type];
            const price = Math.round((base + Math.random() * range) * surge * 100) / 100;
            const eta = Math.round(etaMin + Math.random() * (etaMax - etaMin));

            return { ...ride, price, eta };
        });
    },

    /**
     * Simulate price refresh — returns updated prices for existing rides.
     */
    refreshPrices(currentOptions: RideOption[]): RideOption[] {
        const surge = getSurgeMultiplier();

        return currentOptions.map((ride) => {
            const [base, range, etaMin, etaMax] = PRICE_CONFIG[ride.type];
            const price = Math.round((base + Math.random() * range) * surge * 100) / 100;
            const eta = Math.round(etaMin + Math.random() * (etaMax - etaMin));

            return { ...ride, price, eta };
        });
    },

    /**
     * Get a random driver for the booked ride.
     */
    getAssignedDriver(): Driver {
        return DRIVER_POOL[Math.floor(Math.random() * DRIVER_POOL.length)];
    },

    /**
     * Check if surge pricing is active.
     */
    isSurgeActive(): boolean {
        return getSurgeMultiplier() > 1.2;
    },
};

export default cabsService;
