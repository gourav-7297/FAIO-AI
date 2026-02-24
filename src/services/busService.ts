/**
 * Bus Search Service
 * Inter-city bus search with popular Indian operators.
 */

export interface BusCity {
    name: string;
    state: string;
}

export interface BusResult {
    id: string;
    operator: string;
    type: 'Sleeper' | 'AC Sleeper' | 'Semi-Sleeper' | 'Seater' | 'Volvo AC' | 'Non-AC Seater';
    from: string;
    to: string;
    departure: string;
    arrival: string;
    duration: string;
    durationMins: number;
    price: number;
    rating: number;
    totalRatings: number;
    seatsAvailable: number;
    amenities: string[];
    isAC: boolean;
    boardingPoints: string[];
    droppingPoints: string[];
}

const CITIES: BusCity[] = [
    { name: 'Mumbai', state: 'Maharashtra' },
    { name: 'Pune', state: 'Maharashtra' },
    { name: 'Bangalore', state: 'Karnataka' },
    { name: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Hyderabad', state: 'Telangana' },
    { name: 'Delhi', state: 'Delhi' },
    { name: 'Goa', state: 'Goa' },
    { name: 'Ahmedabad', state: 'Gujarat' },
    { name: 'Jaipur', state: 'Rajasthan' },
    { name: 'Kolkata', state: 'West Bengal' },
    { name: 'Indore', state: 'Madhya Pradesh' },
    { name: 'Nagpur', state: 'Maharashtra' },
    { name: 'Surat', state: 'Gujarat' },
    { name: 'Udaipur', state: 'Rajasthan' },
    { name: 'Mysore', state: 'Karnataka' },
    { name: 'Coimbatore', state: 'Tamil Nadu' },
    { name: 'Mangalore', state: 'Karnataka' },
    { name: 'Nashik', state: 'Maharashtra' },
    { name: 'Lucknow', state: 'Uttar Pradesh' },
    { name: 'Kochi', state: 'Kerala' },
];

const OPERATORS = [
    'VRL Travels', 'SRS Travels', 'Neeta Travels', 'Paulo Travels',
    'Orange Tours', 'IntrCity SmartBus', 'Shivneri', 'KSRTC',
    'APSRTC', 'MSRTC', 'RedBus Connect', 'Humsafar',
    'Kallada Travels', 'KPN Travels', 'Kaveri Travels', 'Sharma Transports',
];

const BUS_TYPES: BusResult['type'][] = ['Sleeper', 'AC Sleeper', 'Semi-Sleeper', 'Seater', 'Volvo AC', 'Non-AC Seater'];

const AMENITIES_POOL = ['WiFi', 'Charging', 'Blanket', 'Water', 'Snacks', 'TV', 'Reading Light', 'Track My Bus'];

export function searchCities(query: string): BusCity[] {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return CITIES.filter(c =>
        c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
    ).slice(0, 8);
}

export async function searchBuses(from: string, to: string, _date: string): Promise<BusResult[]> {
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const count = 5 + Math.floor(Math.random() * 8);
    const distance = 200 + Math.floor(Math.random() * 800);

    return Array.from({ length: count }, (_, i) => {
        const type = BUS_TYPES[i % BUS_TYPES.length];
        const isAC = type.includes('AC') || type === 'Volvo AC';

        const depHour = 17 + Math.floor(Math.random() * 8); // most buses 5PM-1AM
        const depMin = Math.floor(Math.random() / 2) * 30; // :00 or :30
        const durationMins = Math.round(distance / (isAC ? 55 : 45) * 60);
        const arrHour = (depHour + Math.floor(durationMins / 60)) % 24;
        const arrMin = (depMin + durationMins % 60) % 60;

        const basePrice = isAC ? 800 : 400;
        const price = Math.round(basePrice + distance * (isAC ? 1.2 : 0.7) + (type === 'Volvo AC' ? 300 : 0));

        const amenityCount = isAC ? 4 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 3);
        const amenities = [...AMENITIES_POOL].sort(() => Math.random() - 0.5).slice(0, amenityCount);

        return {
            id: `bus-${i}`,
            operator: OPERATORS[Math.floor(Math.random() * OPERATORS.length)],
            type,
            from,
            to,
            departure: `${String(depHour % 24).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`,
            arrival: `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`,
            duration: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
            durationMins,
            price,
            rating: +(3.2 + Math.random() * 1.8).toFixed(1),
            totalRatings: 50 + Math.floor(Math.random() * 2000),
            seatsAvailable: Math.floor(Math.random() * 30),
            amenities,
            isAC,
            boardingPoints: [`${from} Central`, `${from} Station`, `${from} Highway`],
            droppingPoints: [`${to} Central`, `${to} Bus Stand`, `${to} Junction`],
        };
    }).sort((a, b) => a.price - b.price);
}

export function getCities(): BusCity[] {
    return CITIES;
}
