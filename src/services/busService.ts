/**
 * Bus Search Service — Aggregator Redirect
 * Shows search form, then redirects to RedBus/MakeMyTrip/AbhiBus for actual booking.
 */

export interface BusCity {
    name: string;
    state: string;
}

export interface BusPartner {
    name: string;
    logo: string;
    color: string;
    getUrl: (from: string, to: string, date: string) => string;
    getAppLink: (from: string, to: string) => string;
    description: string;
}

// ============================
// CITIES (for autocomplete)
// ============================

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
    { name: 'Chandigarh', state: 'Chandigarh' },
    { name: 'Bhopal', state: 'Madhya Pradesh' },
    { name: 'Thiruvananthapuram', state: 'Kerala' },
    { name: 'Varanasi', state: 'Uttar Pradesh' },
    { name: 'Agra', state: 'Uttar Pradesh' },
    { name: 'Rishikesh', state: 'Uttarakhand' },
    { name: 'Manali', state: 'Himachal Pradesh' },
    { name: 'Shimla', state: 'Himachal Pradesh' },
    { name: 'Amritsar', state: 'Punjab' },
    { name: 'Jodhpur', state: 'Rajasthan' },
];

// ============================
// BOOKING PARTNERS
// ============================

function formatCityForUrl(city: string): string {
    return city.toLowerCase().replace(/\s+/g, '-');
}

export const BUS_PARTNERS: BusPartner[] = [
    {
        name: 'RedBus',
        logo: '🔴',
        color: '#D32F2F',
        description: 'India\'s largest bus booking platform. 3500+ operators, 100K+ routes.',
        getUrl: (from, to, date) =>
            `https://www.redbus.in/bus-tickets/${formatCityForUrl(from)}-to-${formatCityForUrl(to)}?date=${date}`,
        getAppLink: (from, to) =>
            `https://www.redbus.in/bus-tickets/${formatCityForUrl(from)}-to-${formatCityForUrl(to)}`,
    },
    {
        name: 'MakeMyTrip',
        logo: '🔵',
        color: '#0770E3',
        description: 'Book buses along with flights and hotels. Combo deals available.',
        getUrl: (from, to, date) =>
            `https://www.makemytrip.com/bus-tickets/${formatCityForUrl(from)}-${formatCityForUrl(to)}-${date}.html`,
        getAppLink: (from, to) =>
            `https://www.makemytrip.com/bus-tickets/${formatCityForUrl(from)}-${formatCityForUrl(to)}.html`,
    },
    {
        name: 'AbhiBus',
        logo: '🟢',
        color: '#2E7D32',
        description: 'Trusted bus booking across India. Government & private operators.',
        getUrl: (from, to, date) =>
            `https://www.abhibus.com/bus-booking/${formatCityForUrl(from)}-to-${formatCityForUrl(to)}?date=${date}`,
        getAppLink: (from, to) =>
            `https://www.abhibus.com/bus-booking/${formatCityForUrl(from)}-to-${formatCityForUrl(to)}`,
    },
    {
        name: 'ixigo',
        logo: '🟠',
        color: '#E65100',
        description: 'Compare bus fares across platforms. Best price guarantee.',
        getUrl: (from, to, date) =>
            `https://www.ixigo.com/bus-tickets/${formatCityForUrl(from)}-to-${formatCityForUrl(to)}-${date}`,
        getAppLink: (from, to) =>
            `https://www.ixigo.com/bus-tickets/${formatCityForUrl(from)}-to-${formatCityForUrl(to)}`,
    },
];

// ============================
// SERVICE FUNCTIONS
// ============================

export function searchCities(query: string): BusCity[] {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return CITIES.filter(c =>
        c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
    ).slice(0, 8);
}

export function getCities(): BusCity[] {
    return CITIES;
}

export function getPartners(): BusPartner[] {
    return BUS_PARTNERS;
}

export function openPartnerBooking(partner: BusPartner, from: string, to: string, date: string): void {
    const url = partner.getUrl(from, to, date);
    window.open(url, '_blank', 'noopener,noreferrer');
}
