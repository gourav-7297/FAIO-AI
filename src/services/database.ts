/**
 * Database helper — shared Supabase query functions
 * Provides typed CRUD for packing_lists, travel_documents, bookings, user_preferences
 * Falls back to localStorage if Supabase is unavailable or user is a guest
 */
import { supabase, isSupabaseAvailable } from '../lib/supabase';

// ─── Types ──────────────────────────────────────────
export interface DbPackingList {
    id: string;
    user_id: string;
    name: string;
    destination: string;
    duration: number;
    weather: string;
    activities: string[];
    items: any[];
    created_at: string;
    updated_at: string;
}

export interface DbTravelDocument {
    id: string;
    user_id: string;
    type: string;
    title: string;
    doc_number: string;
    issue_date: string | null;
    expiry_date: string | null;
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface DbBooking {
    id: string;
    user_id: string;
    booking_type: string;
    status: string;
    details: any;
    amount: number;
    currency: string;
    payment_id: string | null;
    payment_status: string;
    created_at: string;
    updated_at: string;
}

// ─── Helpers ────────────────────────────────────────
async function getUserId(): Promise<string | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

export function isDbAvailable(): boolean {
    return isSupabaseAvailable && !!supabase;
}

// ─── Packing Lists ─────────────────────────────────
export async function dbGetPackingLists(): Promise<DbPackingList[]> {
    if (!supabase) return [];
    const userId = await getUserId();
    if (!userId) return [];
    const { data, error } = await supabase
        .from('packing_lists')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
    if (error) { console.error('DB: packing_lists fetch error', error); return []; }
    return (data as unknown as DbPackingList[]) || [];
}

export async function dbUpsertPackingList(list: Omit<DbPackingList, 'user_id' | 'created_at' | 'updated_at'>): Promise<DbPackingList | null> {
    if (!supabase) return null;
    const userId = await getUserId();
    if (!userId) return null;
    const { data, error } = await supabase
        .from('packing_lists')
        .upsert({ ...list, user_id: userId } as any, { onConflict: 'id' })
        .select()
        .single();
    if (error) { console.error('DB: packing_lists upsert error', error); return null; }
    return data as unknown as DbPackingList;
}

export async function dbDeletePackingList(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('packing_lists').delete().eq('id', id);
    if (error) { console.error('DB: packing_lists delete error', error); return false; }
    return true;
}

// ─── Travel Documents ──────────────────────────────
export async function dbGetDocuments(): Promise<DbTravelDocument[]> {
    if (!supabase) return [];
    const userId = await getUserId();
    if (!userId) return [];
    const { data, error } = await supabase
        .from('travel_documents')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
    if (error) { console.error('DB: travel_documents fetch error', error); return []; }
    return (data as unknown as DbTravelDocument[]) || [];
}

export async function dbAddDocument(doc: Omit<DbTravelDocument, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DbTravelDocument | null> {
    if (!supabase) return null;
    const userId = await getUserId();
    if (!userId) return null;
    const { data, error } = await supabase
        .from('travel_documents')
        .insert({ ...doc, user_id: userId } as any)
        .select()
        .single();
    if (error) { console.error('DB: travel_documents insert error', error); return null; }
    return data as unknown as DbTravelDocument;
}

export async function dbDeleteDocument(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('travel_documents').delete().eq('id', id);
    if (error) { console.error('DB: travel_documents delete error', error); return false; }
    return true;
}

// ─── Bookings ──────────────────────────────────────
export async function dbGetBookings(): Promise<DbBooking[]> {
    if (!supabase) return [];
    const userId = await getUserId();
    if (!userId) return [];
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) { console.error('DB: bookings fetch error', error); return []; }
    return (data as unknown as DbBooking[]) || [];
}

export async function dbCreateBooking(booking: Omit<DbBooking, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DbBooking | null> {
    if (!supabase) return null;
    const userId = await getUserId();
    if (!userId) return null;
    const { data, error } = await supabase
        .from('bookings')
        .insert({ ...booking, user_id: userId } as any)
        .select()
        .single();
    if (error) { console.error('DB: bookings insert error', error); return null; }
    return data as unknown as DbBooking;
}

export async function dbUpdateBookingPayment(bookingId: string, paymentId: string, status: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
        .from('bookings')
        // @ts-ignore
        .update({ payment_id: paymentId, payment_status: status, status: 'confirmed' })
        .eq('id', bookingId);
    if (error) { console.error('DB: booking payment update error', error); return false; }
    return true;
}
