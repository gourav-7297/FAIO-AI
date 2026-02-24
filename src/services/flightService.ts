const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}/api`;
export interface Airport {
    skyId: string;
    entityId: string;
    presentation: {
        title: string;
        subtitle: string;
        suggestionTitle: string;
    };
    navigation: {
        entityType: string;
        relevantFlightParams: {
            skyId: string;
            entityId: string;
        };
    };
}

export interface FlightLeg {
    id: string;
    origin: { name: string; displayCode: string; city: string };
    destination: { name: string; displayCode: string; city: string };
    departure: string;
    arrival: string;
    durationInMinutes: number;
    stopCount: number;
    carriers: { marketing: { name: string; logoUrl: string }[] };
}

export interface FlightResult {
    id: string;
    price: { raw: number; formatted: string };
    legs: FlightLeg[];
    score: number;
    isSelfTransfer: boolean;
}

export interface FlightSearchResponse {
    flights: FlightResult[];
    status: string;
    sessionId?: string;
}
function getHeaders() {
    return {
        'x-rapidapi-key': RAPIDAPI_KEY || '',
        'x-rapidapi-host': RAPIDAPI_HOST,
    };
}

// ============================
// SEARCH AIRPORTS (Auto-suggest)
// ============================

export async function searchAirports(query: string): Promise<Airport[]> {
    if (query.length < 2) return [];

    // Try real API first
    if (RAPIDAPI_KEY) {
        try {
            const response = await fetch(
                `${BASE_URL}/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=en-US`,
                { headers: getHeaders() }
            );

            if (!response.ok) throw new Error(`Airport search failed: ${response.status}`);

            const data = await response.json();
            const results = data?.data || [];
            if (results.length > 0) return results;
        } catch (error) {
            console.error('Airport search error:', error);
        }
    }

    // Fallback: mock airports filtered by query
    return getMockAirports().filter(a =>
        a.presentation.title.toLowerCase().includes(query.toLowerCase()) ||
        a.presentation.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        a.skyId.toLowerCase().includes(query.toLowerCase())
    );
}

function getMockAirports(): Airport[] {
    return [
        { skyId: 'DEL', entityId: '95673320', presentation: { title: 'Delhi', subtitle: 'Indira Gandhi International Airport, India', suggestionTitle: 'Delhi (DEL)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'DEL', entityId: '95673320' } } },
        { skyId: 'BOM', entityId: '95673529', presentation: { title: 'Mumbai', subtitle: 'Chhatrapati Shivaji Maharaj International, India', suggestionTitle: 'Mumbai (BOM)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'BOM', entityId: '95673529' } } },
        { skyId: 'BLR', entityId: '95673635', presentation: { title: 'Bangalore', subtitle: 'Kempegowda International Airport, India', suggestionTitle: 'Bangalore (BLR)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'BLR', entityId: '95673635' } } },
        { skyId: 'MAA', entityId: '95673736', presentation: { title: 'Chennai', subtitle: 'Chennai International Airport, India', suggestionTitle: 'Chennai (MAA)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'MAA', entityId: '95673736' } } },
        { skyId: 'CCU', entityId: '95673837', presentation: { title: 'Kolkata', subtitle: 'Netaji Subhash Chandra Bose Intl, India', suggestionTitle: 'Kolkata (CCU)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'CCU', entityId: '95673837' } } },
        { skyId: 'HYD', entityId: '95673938', presentation: { title: 'Hyderabad', subtitle: 'Rajiv Gandhi International Airport, India', suggestionTitle: 'Hyderabad (HYD)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'HYD', entityId: '95673938' } } },
        { skyId: 'GOI', entityId: '95674039', presentation: { title: 'Goa', subtitle: 'Goa International Airport, India', suggestionTitle: 'Goa (GOI)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'GOI', entityId: '95674039' } } },
        { skyId: 'DXB', entityId: '95674140', presentation: { title: 'Dubai', subtitle: 'Dubai International Airport, UAE', suggestionTitle: 'Dubai (DXB)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'DXB', entityId: '95674140' } } },
        { skyId: 'SIN', entityId: '95674241', presentation: { title: 'Singapore', subtitle: 'Changi Airport, Singapore', suggestionTitle: 'Singapore (SIN)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'SIN', entityId: '95674241' } } },
        { skyId: 'LHR', entityId: '95674342', presentation: { title: 'London', subtitle: 'Heathrow Airport, United Kingdom', suggestionTitle: 'London (LHR)' }, navigation: { entityType: 'AIRPORT', relevantFlightParams: { skyId: 'LHR', entityId: '95674342' } } },
    ];
}

// ============================
// SEARCH FLIGHTS
// ============================

export async function searchFlights(
    originSkyId: string,
    destinationSkyId: string,
    originEntityId: string,
    destinationEntityId: string,
    date: string,           // YYYY-MM-DD
    returnDate?: string,    // YYYY-MM-DD for round trip
    adults: number = 1,
    cabinClass: string = 'economy',
    currency: string = 'INR'
): Promise<FlightSearchResponse> {
    if (!RAPIDAPI_KEY) {
        return { flights: getMockFlights(), status: 'mock' };
    }

    try {
        let url = `${BASE_URL}/v2/flights/searchFlightsComplete?originSkyId=${originSkyId}&destinationSkyId=${destinationSkyId}&originEntityId=${originEntityId}&destinationEntityId=${destinationEntityId}&date=${date}&adults=${adults}&cabinClass=${cabinClass}&currency=${currency}&market=en-US&countryCode=IN`;

        if (returnDate) {
            url += `&returnDate=${returnDate}`;
        }

        const response = await fetch(url, { headers: getHeaders() });

        if (!response.ok) throw new Error(`Flight search failed: ${response.status}`);

        const data = await response.json();

        // Extract itineraries from the response
        const itineraries = data?.data?.itineraries || [];
        const flights: FlightResult[] = itineraries.map((itin: any) => ({
            id: itin.id,
            price: itin.price || { raw: 0, formatted: '₹0' },
            legs: (itin.legs || []).map((leg: any) => ({
                id: leg.id,
                origin: {
                    name: leg.origin?.name || '',
                    displayCode: leg.origin?.displayCode || '',
                    city: leg.origin?.city || '',
                },
                destination: {
                    name: leg.destination?.name || '',
                    displayCode: leg.destination?.displayCode || '',
                    city: leg.destination?.city || '',
                },
                departure: leg.departure || '',
                arrival: leg.arrival || '',
                durationInMinutes: leg.durationInMinutes || 0,
                stopCount: leg.stopCount || 0,
                carriers: {
                    marketing: (leg.carriers?.marketing || []).map((c: any) => ({
                        name: c.name || '',
                        logoUrl: c.logoUrl || '',
                    })),
                },
            })),
            score: itin.score || 0,
            isSelfTransfer: itin.isSelfTransfer || false,
        }));

        return {
            flights,
            status: data?.data?.context?.status || 'complete',
            sessionId: data?.data?.context?.sessionId,
        };
    } catch (error) {
        console.error('Flight search error:', error);
        return { flights: getMockFlights(), status: 'error' };
    }
}

// ============================
// HELPERS
// ============================

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

export function formatTime(isoDate: string): string {
    try {
        const date = new Date(isoDate);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
        return isoDate;
    }
}

export function formatDate(isoDate: string): string {
    try {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
        return isoDate;
    }
}

export function isFlightConfigured(): boolean {
    return !!RAPIDAPI_KEY;
}

// ============================
// MOCK DATA (fallback)
// ============================

function getMockFlights(): FlightResult[] {
    return [
        {
            id: 'mock-1',
            price: { raw: 4599, formatted: '₹4,599' },
            legs: [{
                id: 'leg-1',
                origin: { name: 'Indira Gandhi Intl', displayCode: 'DEL', city: 'New Delhi' },
                destination: { name: 'Chhatrapati Shivaji Intl', displayCode: 'BOM', city: 'Mumbai' },
                departure: new Date(Date.now() + 86400000).toISOString(),
                arrival: new Date(Date.now() + 86400000 + 7200000).toISOString(),
                durationInMinutes: 130,
                stopCount: 0,
                carriers: { marketing: [{ name: 'IndiGo', logoUrl: '' }] },
            }],
            score: 9.2,
            isSelfTransfer: false,
        },
        {
            id: 'mock-2',
            price: { raw: 3899, formatted: '₹3,899' },
            legs: [{
                id: 'leg-2',
                origin: { name: 'Indira Gandhi Intl', displayCode: 'DEL', city: 'New Delhi' },
                destination: { name: 'Chhatrapati Shivaji Intl', displayCode: 'BOM', city: 'Mumbai' },
                departure: new Date(Date.now() + 86400000 + 14400000).toISOString(),
                arrival: new Date(Date.now() + 86400000 + 21600000).toISOString(),
                durationInMinutes: 135,
                stopCount: 0,
                carriers: { marketing: [{ name: 'SpiceJet', logoUrl: '' }] },
            }],
            score: 8.5,
            isSelfTransfer: false,
        },
        {
            id: 'mock-3',
            price: { raw: 6299, formatted: '₹6,299' },
            legs: [{
                id: 'leg-3',
                origin: { name: 'Indira Gandhi Intl', displayCode: 'DEL', city: 'New Delhi' },
                destination: { name: 'Chhatrapati Shivaji Intl', displayCode: 'BOM', city: 'Mumbai' },
                departure: new Date(Date.now() + 86400000 + 28800000).toISOString(),
                arrival: new Date(Date.now() + 86400000 + 36000000).toISOString(),
                durationInMinutes: 125,
                stopCount: 0,
                carriers: { marketing: [{ name: 'Air India', logoUrl: '' }] },
            }],
            score: 9.5,
            isSelfTransfer: false,
        },
    ];
}
