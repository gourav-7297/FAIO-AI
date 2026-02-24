/**
 * Train Search Service
 * Uses Indian Railways mock data + IRCTC-like search experience.
 * Can be upgraded to use real API (RailwayAPI.com on RapidAPI) later.
 */

export interface Station {
    code: string;
    name: string;
    city: string;
}

export interface TrainResult {
    id: string;
    trainNumber: string;
    trainName: string;
    from: Station;
    to: Station;
    departure: string;     // HH:mm
    arrival: string;        // HH:mm
    duration: string;       // e.g. "12h 30m"
    durationMins: number;
    distance: number;       // km
    classes: TrainClass[];
    daysOfWeek: string[];   // ['Mon', 'Wed', 'Fri']
    type: 'Rajdhani' | 'Shatabdi' | 'Duronto' | 'Express' | 'Superfast' | 'Local';
    pantryAvailable: boolean;
    rating: number;
}

export interface TrainClass {
    code: string;           // '1A', '2A', '3A', 'SL', 'CC'
    name: string;
    price: number;
    available: number;      // seats available
    waitlist?: number;
}

// ============================
// POPULAR STATIONS
// ============================

const STATIONS: Station[] = [
    { code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
    { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai' },
    { code: 'CSTM', name: 'Chhatrapati Shivaji Terminus', city: 'Mumbai' },
    { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
    { code: 'MAS', name: 'Chennai Central', city: 'Chennai' },
    { code: 'SBC', name: 'Bangalore City Junction', city: 'Bangalore' },
    { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur' },
    { code: 'LKO', name: 'Lucknow Junction', city: 'Lucknow' },
    { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad' },
    { code: 'PNBE', name: 'Patna Junction', city: 'Patna' },
    { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad' },
    { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad' },
    { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur' },
    { code: 'AGC', name: 'Agra Cantt', city: 'Agra' },
    { code: 'PUNE', name: 'Pune Junction', city: 'Pune' },
    { code: 'CDG', name: 'Chandigarh', city: 'Chandigarh' },
    { code: 'GHY', name: 'Guwahati', city: 'Guwahati' },
    { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal' },
    { code: 'VSG', name: 'Vasco Da Gama', city: 'Goa' },
    { code: 'MDG', name: 'Madgaon Junction', city: 'Goa' },
];

// ============================
// SEARCH STATIONS
// ============================

export function searchStations(query: string): Station[] {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return STATIONS.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    ).slice(0, 8);
}

// ============================
// SEARCH TRAINS
// ============================

export async function searchTrains(
    fromCode: string,
    toCode: string,
    _date: string,
): Promise<TrainResult[]> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

    const from = STATIONS.find(s => s.code === fromCode) || STATIONS[0];
    const to = STATIONS.find(s => s.code === toCode) || STATIONS[1];

    return generateTrainResults(from, to);
}

// ============================
// MOCK DATA GENERATOR
// ============================

const TRAIN_NAMES: Record<string, string[]> = {
    Rajdhani: ['Rajdhani Express'],
    Shatabdi: ['Shatabdi Express'],
    Duronto: ['Duronto Express'],
    Express: ['Garib Rath', 'Sampark Kranti', 'Jan Shatabdi', 'Humsafar Express'],
    Superfast: ['Superfast Express', 'AC Express'],
};

function generateTrainResults(from: Station, to: Station): TrainResult[] {
    const distance = 500 + Math.floor(Math.random() * 1500);
    const count = 4 + Math.floor(Math.random() * 5);
    const types: TrainResult['type'][] = ['Rajdhani', 'Shatabdi', 'Duronto', 'Express', 'Superfast'];

    return Array.from({ length: count }, (_, i) => {
        const type = types[i % types.length];
        const depHour = 4 + Math.floor(Math.random() * 18);
        const depMin = Math.floor(Math.random() * 60);
        const durationMins = type === 'Rajdhani' ? 240 + Math.floor(Math.random() * 360)
            : type === 'Shatabdi' ? 180 + Math.floor(Math.random() * 240)
                : 300 + Math.floor(Math.random() * 720);
        const arrHour = (depHour + Math.floor(durationMins / 60)) % 24;
        const arrMin = (depMin + durationMins % 60) % 60;

        const basePrice = type === 'Rajdhani' ? 1800
            : type === 'Shatabdi' ? 1200
                : type === 'Duronto' ? 1500
                    : 500;
        const kmFactor = distance / 1000;

        const names = TRAIN_NAMES[type] || ['Express'];
        const trainName = names[Math.floor(Math.random() * names.length)];
        const trainNumber = `${10000 + Math.floor(Math.random() * 90000)}`;

        const classes: TrainClass[] = [];
        if (type === 'Rajdhani' || type === 'Duronto') {
            classes.push(
                { code: '1A', name: 'First AC', price: Math.round(basePrice * kmFactor * 3.5), available: Math.floor(Math.random() * 10) },
                { code: '2A', name: 'Second AC', price: Math.round(basePrice * kmFactor * 2.2), available: Math.floor(Math.random() * 30) },
                { code: '3A', name: 'Third AC', price: Math.round(basePrice * kmFactor * 1.5), available: Math.floor(Math.random() * 50) },
            );
        } else if (type === 'Shatabdi') {
            classes.push(
                { code: 'CC', name: 'Chair Car', price: Math.round(basePrice * kmFactor * 1.2), available: Math.floor(Math.random() * 60) },
                { code: 'EC', name: 'Exec Chair', price: Math.round(basePrice * kmFactor * 2.0), available: Math.floor(Math.random() * 20) },
            );
        } else {
            classes.push(
                { code: '2A', name: 'Second AC', price: Math.round(basePrice * kmFactor * 2.2), available: Math.floor(Math.random() * 25) },
                { code: '3A', name: 'Third AC', price: Math.round(basePrice * kmFactor * 1.5), available: Math.floor(Math.random() * 50) },
                { code: 'SL', name: 'Sleeper', price: Math.round(basePrice * kmFactor * 0.6), available: Math.floor(Math.random() * 100) },
            );
        }

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const runDays = type === 'Rajdhani' || type === 'Shatabdi'
            ? days
            : days.filter(() => Math.random() > 0.3);

        return {
            id: `train-${i}`,
            trainNumber,
            trainName,
            from,
            to,
            departure: `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`,
            arrival: `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`,
            duration: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
            durationMins,
            distance,
            classes,
            daysOfWeek: runDays.length > 0 ? runDays : ['Daily'],
            type,
            pantryAvailable: type === 'Rajdhani' || type === 'Shatabdi' || Math.random() > 0.5,
            rating: +(3.5 + Math.random() * 1.5).toFixed(1),
        };
    }).sort((a, b) => {
        const [ah, am] = a.departure.split(':').map(Number);
        const [bh, bm] = b.departure.split(':').map(Number);
        return (ah * 60 + am) - (bh * 60 + bm);
    });
}

export function getStations(): Station[] {
    return STATIONS;
}
