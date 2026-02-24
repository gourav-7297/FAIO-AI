/**
 * Trip Documents Service
 * Store & manage travel documents with expiry alerts.
 */

export type DocType = 'Passport' | 'Visa' | 'Ticket' | 'Insurance' | 'Hotel Booking' | 'ID Card' | 'Vaccination' | 'Other';

export interface TravelDocument {
    id: string;
    type: DocType;
    title: string;
    number: string;
    issueDate?: string;
    expiryDate?: string;
    notes: string;
    createdAt: string;
}

const STORAGE_KEY = 'faio_documents';

export function loadDocuments(): TravelDocument[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
}

function save(docs: TravelDocument[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function addDocument(doc: Omit<TravelDocument, 'id' | 'createdAt'>): TravelDocument[] {
    const docs = loadDocuments();
    docs.push({ ...doc, id: `doc-${Date.now()}`, createdAt: new Date().toISOString() });
    save(docs);
    return docs;
}

export function updateDocument(id: string, updates: Partial<TravelDocument>): TravelDocument[] {
    const docs = loadDocuments().map(d => d.id === id ? { ...d, ...updates } : d);
    save(docs);
    return docs;
}

export function deleteDocument(id: string): TravelDocument[] {
    const docs = loadDocuments().filter(d => d.id !== id);
    save(docs);
    return docs;
}

export function getExpiringDocuments(withinDays: number = 30): TravelDocument[] {
    const now = Date.now();
    const threshold = now + withinDays * 24 * 60 * 60 * 1000;
    return loadDocuments().filter(d => {
        if (!d.expiryDate) return false;
        const expiry = new Date(d.expiryDate).getTime();
        return expiry > now && expiry <= threshold;
    });
}

export function getExpiredDocuments(): TravelDocument[] {
    const now = Date.now();
    return loadDocuments().filter(d => {
        if (!d.expiryDate) return false;
        return new Date(d.expiryDate).getTime() < now;
    });
}

export function getDaysUntilExpiry(expiryDate: string): number {
    return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export const DOC_TYPES: DocType[] = ['Passport', 'Visa', 'Ticket', 'Insurance', 'Hotel Booking', 'ID Card', 'Vaccination', 'Other'];

export const DOC_EMOJIS: Record<DocType, string> = {
    Passport: '🛂', Visa: '📋', Ticket: '🎫', Insurance: '🛡️',
    'Hotel Booking': '🏨', 'ID Card': '🪪', Vaccination: '💉', Other: '📎',
};

export const DOC_COLORS: Record<DocType, string> = {
    Passport: 'from-blue-500 to-indigo-500',
    Visa: 'from-emerald-500 to-teal-500',
    Ticket: 'from-amber-500 to-orange-500',
    Insurance: 'from-rose-500 to-pink-500',
    'Hotel Booking': 'from-purple-500 to-violet-500',
    'ID Card': 'from-cyan-500 to-blue-500',
    Vaccination: 'from-green-500 to-emerald-500',
    Other: 'from-slate-500 to-gray-500',
};
