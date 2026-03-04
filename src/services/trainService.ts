/**
 * Train Search Service — Aggregator Redirect
 * Station autocomplete + redirect to IRCTC/ConfirmTkt/ixigo for actual booking.
 */

export interface Station {
    code: string;
    name: string;
    city: string;
}

export interface TrainPartner {
    name: string;
    logo: string;
    color: string;
    getUrl: (fromCode: string, toCode: string, date: string) => string;
    description: string;
    isOfficial: boolean;
}

// ============================
// POPULAR STATIONS (for autocomplete)
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
    { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu' },
    { code: 'DDN', name: 'Dehradun', city: 'Dehradun' },
    { code: 'UDZ', name: 'Udaipur City', city: 'Udaipur' },
    { code: 'JU', name: 'Jodhpur Junction', city: 'Jodhpur' },
    { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar' },
    { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi' },
    { code: 'RKSH', name: 'Rishikesh', city: 'Rishikesh' },
    { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi' },
    { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram' },
    { code: 'GOA', name: 'Goa (Karmali)', city: 'Goa' },
];

// ============================
// BOOKING PARTNERS
// ============================

export const TRAIN_PARTNERS: TrainPartner[] = [
    {
        name: 'IRCTC',
        logo: '🚂',
        color: '#1565C0',
        isOfficial: true,
        description: 'Official Indian Railways booking. Real-time availability & PNR status.',
        getUrl: (_fromCode, _toCode, _date) =>
            `https://www.irctc.co.in/nget/train-search`,
    },
    {
        name: 'ConfirmTkt',
        logo: '✅',
        color: '#2E7D32',
        isOfficial: false,
        description: 'Smart prediction of waitlist confirmation. Auto-upgrade feature.',
        getUrl: (fromCode, toCode, date) =>
            `https://www.confirmtkt.com/train-between-stations/${fromCode}/${toCode}/${date}`,
    },
    {
        name: 'ixigo Trains',
        logo: '🟠',
        color: '#E65100',
        isOfficial: false,
        description: 'Compare fares, check PNR, live train status & platform number.',
        getUrl: (fromCode, toCode, date) =>
            `https://www.ixigo.com/trains/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}/?date=${date}`,
    },
    {
        name: 'RailYatri',
        logo: '🔵',
        color: '#0277BD',
        isOfficial: false,
        description: 'Live train tracking, food ordering on train, and smart alerts.',
        getUrl: (fromCode, toCode, _date) =>
            `https://www.railyatri.in/trains-between-stations?from=${fromCode}&to=${toCode}`,
    },
];

// ============================
// SERVICE
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

export function getStations(): Station[] {
    return STATIONS;
}

export function getPartners(): TrainPartner[] {
    return TRAIN_PARTNERS;
}

export function openPartnerBooking(partner: TrainPartner, fromCode: string, toCode: string, date: string): void {
    const url = partner.getUrl(fromCode, toCode, date);
    window.open(url, '_blank', 'noopener,noreferrer');
}
