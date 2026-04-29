/**
 * Trip Documents Service
 * Supabase-backed with localStorage fallback for guests.
 */
import { dbGetDocuments, dbAddDocument, dbDeleteDocument, isDbAvailable } from './database';

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

// ─── localStorage helpers ───────────────────────
function loadLocal(): TravelDocument[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveLocal(docs: TravelDocument[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

// ─── Async Supabase-first API ───────────────────
export async function loadDocumentsAsync(): Promise<TravelDocument[]> {
    if (isDbAvailable()) {
        try {
            const dbDocs = await dbGetDocuments();
            if (dbDocs.length > 0 || loadLocal().length === 0) {
                return dbDocs.map(d => ({
                    id: d.id, type: d.type as DocType, title: d.title,
                    number: d.doc_number, issueDate: d.issue_date || undefined,
                    expiryDate: d.expiry_date || undefined, notes: d.notes,
                    createdAt: d.created_at,
                }));
            }
        } catch (e) { console.warn('DB fetch failed, using localStorage', e); }
    }
    return loadLocal();
}

export async function addDocumentAsync(doc: Omit<TravelDocument, 'id' | 'createdAt'>): Promise<TravelDocument[]> {
    if (isDbAvailable()) {
        await dbAddDocument({
            type: doc.type, title: doc.title,
            doc_number: doc.number, issue_date: doc.issueDate || null,
            expiry_date: doc.expiryDate || null, notes: doc.notes,
        });
    }
    // Also save locally
    const all = loadLocal();
    all.push({ ...doc, id: `doc-${Date.now()}`, createdAt: new Date().toISOString() });
    saveLocal(all);
    return all;
}

export async function deleteDocumentAsync(id: string): Promise<TravelDocument[]> {
    if (isDbAvailable()) { await dbDeleteDocument(id); }
    const docs = loadLocal().filter(d => d.id !== id);
    saveLocal(docs);
    return docs;
}

// ─── Sync API (backward compat) ─────────────────
export function loadDocuments(): TravelDocument[] { return loadLocal(); }

export function addDocument(doc: Omit<TravelDocument, 'id' | 'createdAt'>): TravelDocument[] {
    const docs = loadLocal();
    const newDoc = { ...doc, id: `doc-${Date.now()}`, createdAt: new Date().toISOString() };
    docs.push(newDoc);
    saveLocal(docs);
    // Async DB save
    if (isDbAvailable()) {
        dbAddDocument({
            type: doc.type, title: doc.title,
            doc_number: doc.number, issue_date: doc.issueDate || null,
            expiry_date: doc.expiryDate || null, notes: doc.notes,
        }).catch(console.error);
    }
    return docs;
}

export function updateDocument(id: string, updates: Partial<TravelDocument>): TravelDocument[] {
    const docs = loadLocal().map(d => d.id === id ? { ...d, ...updates } : d);
    saveLocal(docs);
    return docs;
}

export function deleteDocument(id: string): TravelDocument[] {
    const docs = loadLocal().filter(d => d.id !== id);
    saveLocal(docs);
    if (isDbAvailable()) { dbDeleteDocument(id).catch(console.error); }
    return docs;
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
    Other: 'from-stone-500 to-gray-500',
};
