import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface OfflineData {
    itinerary: any | null;
    emergencyContacts: EmergencyContact[];
    downloadedMaps: string[];
    tickets: Ticket[];
    lastSyncTime: string | null;
}

interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    relation: string;
}

interface Ticket {
    id: string;
    name: string;
    type: 'flight' | 'hotel' | 'attraction' | 'transport';
    qrCode?: string;
    date: string;
    details: string;
}

interface OfflineContextType {
    isOnline: boolean;
    isOfflineMode: boolean;
    offlineData: OfflineData;
    toggleOfflineMode: () => void;
    saveItineraryOffline: (itinerary: any) => void;
    saveEmergencyContacts: (contacts: EmergencyContact[]) => void;
    addTicket: (ticket: Ticket) => void;
    removeTicket: (id: string) => void;
    clearOfflineData: () => void;
    syncData: () => Promise<void>;
    downloadMap: (region: string) => Promise<void>;
    getStorageUsage: () => { used: number; total: number };
}

const STORAGE_KEY = 'faio_offline_data';
const MAX_STORAGE_MB = 50;

const defaultOfflineData: OfflineData = {
    itinerary: null,
    emergencyContacts: [],
    downloadedMaps: [],
    tickets: [],
    lastSyncTime: null,
};

const OfflineContext = createContext<OfflineContextType | null>(null);

export function useOffline() {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within OfflineProvider');
    }
    return context;
}

export function OfflineProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [offlineData, setOfflineData] = useState<OfflineData>(defaultOfflineData);

    // Load data from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setOfflineData(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse offline data:', e);
            }
        }
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineData));
    }, [offlineData]);

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const toggleOfflineMode = () => {
        setIsOfflineMode(prev => !prev);
    };

    const saveItineraryOffline = (itinerary: any) => {
        setOfflineData(prev => ({
            ...prev,
            itinerary,
            lastSyncTime: new Date().toISOString(),
        }));
    };

    const saveEmergencyContacts = (contacts: EmergencyContact[]) => {
        setOfflineData(prev => ({
            ...prev,
            emergencyContacts: contacts,
        }));
    };

    const addTicket = (ticket: Ticket) => {
        setOfflineData(prev => ({
            ...prev,
            tickets: [...prev.tickets, ticket],
        }));
    };

    const removeTicket = (id: string) => {
        setOfflineData(prev => ({
            ...prev,
            tickets: prev.tickets.filter(t => t.id !== id),
        }));
    };

    const clearOfflineData = () => {
        setOfflineData(defaultOfflineData);
        localStorage.removeItem(STORAGE_KEY);
    };

    const syncData = async () => {
        // Simulate syncing data with server
        await new Promise(resolve => setTimeout(resolve, 1500));
        setOfflineData(prev => ({
            ...prev,
            lastSyncTime: new Date().toISOString(),
        }));
    };

    const downloadMap = async (region: string) => {
        // Simulate downloading map data
        await new Promise(resolve => setTimeout(resolve, 2000));
        setOfflineData(prev => ({
            ...prev,
            downloadedMaps: [...new Set([...prev.downloadedMaps, region])],
        }));
    };

    const getStorageUsage = () => {
        const dataStr = JSON.stringify(offlineData);
        const usedBytes = new Blob([dataStr]).size;
        const usedMB = usedBytes / (1024 * 1024);
        return {
            used: Math.round(usedMB * 100) / 100,
            total: MAX_STORAGE_MB,
        };
    };

    return (
        <OfflineContext.Provider value={{
            isOnline,
            isOfflineMode,
            offlineData,
            toggleOfflineMode,
            saveItineraryOffline,
            saveEmergencyContacts,
            addTicket,
            removeTicket,
            clearOfflineData,
            syncData,
            downloadMap,
            getStorageUsage,
        }}>
            {children}
        </OfflineContext.Provider>
    );
}
