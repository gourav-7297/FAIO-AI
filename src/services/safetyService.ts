// ============================
// SAFETY SERVICE
// Real APIs + GPS + Supabase backend
// ============================

import { supabaseUntyped as supabase, isSupabaseAvailable } from '../lib/supabase';
import { searchPlacesNearby, FSQ_CATEGORIES, type FoursquarePlace } from './foursquareService';
import { getEmergencyNumbers, DEFAULT_EMERGENCY, type EmergencyNumbers } from '../data/emergencyNumbers';

// ============================
// TYPES
// ============================

export interface TravelAdvisory {
    countryCode: string;
    countryName: string;
    score: number;        // 0-5 (0 = no data, 1 = low risk, 5 = extreme)
    message: string;
    source: string;
    updatedAt: string;
}

export interface UserLocation {
    lat: number;
    lon: number;
    accuracy: number;
    city?: string;
    country?: string;
    countryCode?: string;
    timestamp: number;
}

export interface SafetyAlert {
    id: string;
    user_id?: string;
    type: 'warning' | 'caution' | 'info';
    title: string;
    description: string;
    lat?: number;
    lon?: number;
    area: string;
    country_code?: string;
    created_at: string;
    distance?: number;    // km from user
}

export interface EmergencyContact {
    id: string;
    user_id?: string;
    name: string;
    phone: string;
    relation: string;
}

export interface LocationSharingSession {
    id: string;
    user_id: string;
    is_active: boolean;
    share_token: string;
    lat: number;
    lon: number;
    city?: string;
    country?: string;
    updated_at: string;
    created_at: string;
}

export interface NearbyPlace {
    id: string;
    name: string;
    type: 'hospital' | 'police' | 'pharmacy' | 'embassy' | 'fire_station';
    address: string;
    distance?: number;
    phone?: string;
    lat: number;
    lon: number;
    icon: string;
}

// ============================
// TRAVEL ADVISORY API
// Free: travel-advisory.info (no key required)
// ============================

let advisoryCache: Record<string, TravelAdvisory> | null = null;
let advisoryCacheTime = 0;
const ADVISORY_CACHE_DURATION = 3600000; // 1 hour

export async function getCountryAdvisory(countryCode: string): Promise<TravelAdvisory | null> {
    try {
        // Use cache if fresh
        if (advisoryCache && Date.now() - advisoryCacheTime < ADVISORY_CACHE_DURATION) {
            return advisoryCache[countryCode.toUpperCase()] || null;
        }

        const resp = await fetch('https://www.travel-advisory.info/api');
        if (!resp.ok) throw new Error(`Advisory API error: ${resp.status}`);

        const data = await resp.json();
        if (!data?.data) throw new Error('Invalid advisory response');

        advisoryCache = {};
        for (const [code, info] of Object.entries(data.data) as any[]) {
            advisoryCache[code] = {
                countryCode: code,
                countryName: info.name || code,
                score: info.advisory?.score ?? 0,
                message: info.advisory?.message || 'No advisory data available',
                source: info.advisory?.source || '',
                updatedAt: info.advisory?.updated || new Date().toISOString(),
            };
        }
        advisoryCacheTime = Date.now();

        return advisoryCache[countryCode.toUpperCase()] || null;
    } catch (error) {
        console.error('Travel advisory fetch error:', error);
        return null;
    }
}

export function getAdvisoryLevel(score: number): { label: string; color: string; bgColor: string } {
    if (score <= 1.5) return { label: 'Low Risk', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' };
    if (score <= 2.5) return { label: 'Moderate', color: 'text-amber-400', bgColor: 'bg-amber-500/10' };
    if (score <= 3.5) return { label: 'High Risk', color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
    if (score <= 4.5) return { label: 'Very High', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    return { label: 'Extreme', color: 'text-red-500', bgColor: 'bg-red-500/20' };
}

// ============================
// GPS & GEOLOCATION
// ============================

let watchId: number | null = null;

export function getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
        });
    });
}

export function watchUserLocation(
    onUpdate: (location: UserLocation) => void,
    onError?: (error: GeolocationPositionError) => void
): () => void {
    if (!navigator.geolocation) {
        onError?.({ code: 2, message: 'Geolocation not supported', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as any);
        return () => {};
    }

    watchId = navigator.geolocation.watchPosition(
        async (position) => {
            const loc: UserLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
            };

            // Reverse geocode (async, non-blocking)
            try {
                const geo = await reverseGeocode(loc.lat, loc.lon);
                loc.city = geo.city;
                loc.country = geo.country;
                loc.countryCode = geo.countryCode;
            } catch { /* ignore geocoding errors */ }

            onUpdate(loc);
        },
        onError,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );

    return () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
    };
}

// Throttled reverse geocoding
let lastGeocodeTime = 0;
let lastGeocodeResult: { city?: string; country?: string; countryCode?: string } = {};

export async function reverseGeocode(lat: number, lon: number): Promise<{
    city?: string;
    country?: string;
    countryCode?: string;
}> {
    // Throttle: at most once per 10 seconds
    if (Date.now() - lastGeocodeTime < 10000) {
        return lastGeocodeResult;
    }

    try {
        const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'FAIO-Travel-App' } }
        );
        const data = await resp.json();
        lastGeocodeResult = {
            city: data.address?.city || data.address?.town || data.address?.village || data.address?.state_district,
            country: data.address?.country,
            countryCode: data.address?.country_code?.toUpperCase(),
        };
        lastGeocodeTime = Date.now();
        return lastGeocodeResult;
    } catch {
        return lastGeocodeResult;
    }
}

// ============================
// NEARBY SAFE PLACES (Foursquare)
// ============================

export async function getNearbyHospitals(lat: number, lon: number): Promise<NearbyPlace[]> {
    return mapFSQToSafePlaces(
        await searchPlacesNearby(lat, lon, 'hospital', FSQ_CATEGORIES.hospital, 10, 5000),
        'hospital', '🏥'
    );
}

export async function getNearbyPoliceStations(lat: number, lon: number): Promise<NearbyPlace[]> {
    const places = await searchPlacesNearby(lat, lon, 'police station', undefined, 10, 5000);
    return mapFSQToSafePlaces(places, 'police', '🏛️');
}

export async function getNearbyPharmacies(lat: number, lon: number): Promise<NearbyPlace[]> {
    return mapFSQToSafePlaces(
        await searchPlacesNearby(lat, lon, 'pharmacy', FSQ_CATEGORIES.pharmacy, 10, 5000),
        'pharmacy', '💊'
    );
}

export async function getAllNearbySafePlaces(lat: number, lon: number): Promise<NearbyPlace[]> {
    const [hospitals, police, pharmacies] = await Promise.all([
        getNearbyHospitals(lat, lon),
        getNearbyPoliceStations(lat, lon),
        getNearbyPharmacies(lat, lon),
    ]);
    return [...hospitals, ...police, ...pharmacies]
        .sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
}

function mapFSQToSafePlaces(places: FoursquarePlace[], type: NearbyPlace['type'], icon: string): NearbyPlace[] {
    return places.map(p => ({
        id: p.id,
        name: p.name,
        type,
        address: p.address || 'Address not available',
        distance: p.distance ? Math.round(p.distance) : undefined,
        phone: p.phone,
        lat: p.lat,
        lon: p.lon,
        icon,
    }));
}

// ============================
// SUPABASE: EMERGENCY CONTACTS
// ============================

const CONTACTS_LOCAL_KEY = 'faio_emergency_contacts';

function loadContactsLocal(): EmergencyContact[] {
    try {
        const raw = localStorage.getItem(CONTACTS_LOCAL_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [
        { id: 'default-1', name: 'Mom', phone: '+1 234 567 8900', relation: 'Family' },
        { id: 'default-2', name: 'Hotel Concierge', phone: '+81 3 1234 5678', relation: 'Local' },
    ];
}

function saveContactsLocal(contacts: EmergencyContact[]) {
    try { localStorage.setItem(CONTACTS_LOCAL_KEY, JSON.stringify(contacts)); } catch { /* ignore */ }
}

export async function getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    if (!isSupabaseAvailable || !supabase) return loadContactsLocal();
    try {
        const { data, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) return loadContactsLocal();
        const contacts = data.map((r: any) => ({
            id: r.id,
            user_id: r.user_id,
            name: r.name,
            phone: r.phone,
            relation: r.relation || '',
        }));
        saveContactsLocal(contacts); // sync to local
        return contacts;
    } catch {
        return loadContactsLocal();
    }
}

export async function addEmergencyContact(userId: string, contact: { name: string; phone: string; relation: string }): Promise<EmergencyContact | null> {
    if (!isSupabaseAvailable || !supabase) {
        const local = loadContactsLocal();
        const newContact: EmergencyContact = { ...contact, id: Date.now().toString() };
        local.push(newContact);
        saveContactsLocal(local);
        return newContact;
    }
    try {
        const { data, error } = await supabase
            .from('emergency_contacts')
            .insert({ user_id: userId, name: contact.name, phone: contact.phone, relation: contact.relation } as any)
            .select()
            .single();
        if (error) throw error;
        return { id: data.id, user_id: data.user_id, name: data.name, phone: data.phone, relation: data.relation };
    } catch {
        return null;
    }
}

export async function removeEmergencyContact(contactId: string, userId: string): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) {
        const local = loadContactsLocal().filter(c => c.id !== contactId);
        saveContactsLocal(local);
        return true;
    }
    try {
        const { error } = await supabase
            .from('emergency_contacts')
            .delete()
            .eq('id', contactId)
            .eq('user_id', userId);
        return !error;
    } catch {
        return false;
    }
}

// ============================
// SUPABASE: LOCATION SHARING
// ============================

function generateShareToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function startLocationSharing(userId: string, lat: number, lon: number, city?: string, country?: string): Promise<LocationSharingSession | null> {
    if (!isSupabaseAvailable || !supabase) return null;
    try {
        const token = generateShareToken();
        const { data, error } = await supabase
            .from('location_sharing_sessions')
            .insert({
                user_id: userId,
                is_active: true,
                share_token: token,
                lat, lon,
                city: city || '',
                country: country || '',
            } as any)
            .select()
            .single();
        if (error) throw error;
        return data as any;
    } catch (err) {
        console.error('Start sharing error:', err);
        return null;
    }
}

export async function updateSharingLocation(sessionId: string, lat: number, lon: number, city?: string, country?: string): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) return false;
    try {
        const { error } = await supabase
            .from('location_sharing_sessions')
            .update({
                lat, lon,
                city: city || '',
                country: country || '',
                updated_at: new Date().toISOString(),
            } as any)
            .eq('id', sessionId);
        return !error;
    } catch { return false; }
}

export async function stopLocationSharing(sessionId: string): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) return false;
    try {
        const { error } = await supabase
            .from('location_sharing_sessions')
            .update({ is_active: false, updated_at: new Date().toISOString() } as any)
            .eq('id', sessionId);
        return !error;
    } catch { return false; }
}

export async function getActiveSession(userId: string): Promise<LocationSharingSession | null> {
    if (!isSupabaseAvailable || !supabase) return null;
    try {
        const { data, error } = await supabase
            .from('location_sharing_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (error || !data) return null;
        return data as any;
    } catch { return null; }
}

// ============================
// SUPABASE: COMMUNITY SAFETY ALERTS
// ============================

export async function getCommunityAlerts(lat?: number, lon?: number, countryCode?: string): Promise<SafetyAlert[]> {
    if (!isSupabaseAvailable || !supabase) return getFallbackAlerts();
    try {
        let query = supabase
            .from('safety_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (countryCode) {
            query = query.eq('country_code', countryCode.toUpperCase());
        }

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) return getFallbackAlerts();

        return data.map((row: any) => {
            const alert: SafetyAlert = {
                id: row.id,
                user_id: row.user_id,
                type: row.type || 'info',
                title: row.title,
                description: row.description || '',
                lat: row.lat,
                lon: row.lon,
                area: row.area || '',
                country_code: row.country_code,
                created_at: row.created_at,
            };

            // Calculate distance if user location provided
            if (lat && lon && row.lat && row.lon) {
                alert.distance = haversineDistance(lat, lon, row.lat, row.lon);
            }

            return alert;
        }).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    } catch {
        return getFallbackAlerts();
    }
}

export async function reportSafetyAlert(userId: string, alert: {
    type: 'warning' | 'caution' | 'info';
    title: string;
    description: string;
    lat?: number;
    lon?: number;
    area: string;
    countryCode?: string;
}): Promise<boolean> {
    if (!isSupabaseAvailable || !supabase) return false;
    try {
        const { error } = await supabase
            .from('safety_alerts')
            .insert({
                user_id: userId,
                type: alert.type,
                title: alert.title,
                description: alert.description,
                lat: alert.lat,
                lon: alert.lon,
                area: alert.area,
                country_code: alert.countryCode?.toUpperCase() || '',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
            } as any);
        return !error;
    } catch { return false; }
}

// ============================
// HELPERS
// ============================

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getFallbackAlerts(): SafetyAlert[] {
    return [
        { id: 'fb-1', type: 'warning', title: 'Pickpocketing Hotspot', description: 'Increased reports in tourist areas', area: 'Tourist District', created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: 'fb-2', type: 'caution', title: 'Night Safety Advisory', description: 'Stick to main roads after 10 PM', area: 'Market Area', created_at: new Date(Date.now() - 18000000).toISOString() },
        { id: 'fb-3', type: 'info', title: 'Safe Zone Verified', description: 'This area is community verified as safe', area: 'City Center', created_at: new Date(Date.now() - 86400000).toISOString() },
    ];
}

export function formatTimeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function formatDistance(meters?: number): string {
    if (!meters) return '';
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
}

// Re-export emergency numbers
export { getEmergencyNumbers, DEFAULT_EMERGENCY, type EmergencyNumbers };
