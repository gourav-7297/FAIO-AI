import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wifi, WifiOff, Download, Trash2, Cloud, CloudOff,
    Map, Ticket, Phone, Calendar, RefreshCw, Check,
    ChevronRight, HardDrive, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOffline } from '../../context/OfflineContext';
import { GlassCard } from './GlassCard';

interface OfflineManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OfflineManager({ isOpen, onClose }: OfflineManagerProps) {
    const {
        isOnline,
        isOfflineMode,
        offlineData,
        toggleOfflineMode,
        saveItineraryOffline,
        clearOfflineData,
        syncData,
        downloadMap,
        getStorageUsage,
    } = useOffline();

    const [isSyncing, setIsSyncing] = useState(false);
    const [downloadingMap, setDownloadingMap] = useState<string | null>(null);

    const storage = getStorageUsage();
    const storagePercent = (storage.used / storage.total) * 100;

    const handleSync = async () => {
        setIsSyncing(true);
        await syncData();
        setIsSyncing(false);
    };

    const handleDownloadMap = async (region: string) => {
        setDownloadingMap(region);
        await downloadMap(region);
        setDownloadingMap(null);
    };

    const availableMaps = [
        { id: 'tokyo', name: 'Tokyo, Japan', size: '12 MB' },
        { id: 'kyoto', name: 'Kyoto, Japan', size: '8 MB' },
        { id: 'osaka', name: 'Osaka, Japan', size: '6 MB' },
        { id: 'paris', name: 'Paris, France', size: '15 MB' },
        { id: 'london', name: 'London, UK', size: '14 MB' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end justify-center"
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="relative w-full max-w-md bg-surface rounded-t-3xl max-h-[85vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-surface/95 backdrop-blur-xl border-b border-slate-800 p-4 z-10">
                            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isOnline ? (
                                        <Wifi className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <WifiOff className="w-5 h-5 text-amber-400" />
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold">Offline Mode</h2>
                                        <p className="text-xs text-secondary">
                                            {isOnline ? 'Connected' : 'No internet'} • {storage.used} MB used
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh] pb-safe">
                            {/* Offline Mode Toggle */}
                            <GlassCard className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {isOfflineMode ? (
                                            <CloudOff className="w-5 h-5 text-amber-400" />
                                        ) : (
                                            <Cloud className="w-5 h-5 text-action" />
                                        )}
                                        <div>
                                            <p className="font-bold">Offline Mode</p>
                                            <p className="text-xs text-secondary">Use downloaded data only</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleOfflineMode}
                                        className={cn(
                                            "w-12 h-6 rounded-full p-1 transition-colors",
                                            isOfflineMode ? "bg-amber-500" : "bg-slate-700"
                                        )}
                                    >
                                        <motion.div
                                            className="w-4 h-4 bg-white rounded-full"
                                            animate={{ x: isOfflineMode ? 24 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>
                            </GlassCard>

                            {/* Storage Usage */}
                            <GlassCard className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <HardDrive className="w-5 h-5 text-secondary" />
                                    <p className="font-bold">Storage Usage</p>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${storagePercent}%` }}
                                        className={cn(
                                            "h-full rounded-full",
                                            storagePercent > 80 ? "bg-red-500" :
                                                storagePercent > 50 ? "bg-amber-500" : "bg-emerald-500"
                                        )}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-secondary">
                                    <span>{storage.used} MB used</span>
                                    <span>{storage.total} MB total</span>
                                </div>
                            </GlassCard>

                            {/* Saved Data */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider px-1">
                                    Saved Data
                                </h3>

                                {/* Itinerary */}
                                <GlassCard className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-action" />
                                            <div>
                                                <p className="font-medium">Itinerary</p>
                                                <p className="text-xs text-secondary">
                                                    {offlineData.itinerary ? 'Saved' : 'Not saved'}
                                                </p>
                                            </div>
                                        </div>
                                        {offlineData.itinerary ? (
                                            <Check className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <button
                                                onClick={() => saveItineraryOffline({ demo: true })}
                                                className="px-3 py-1 bg-action/20 text-action rounded-lg text-sm"
                                            >
                                                Save
                                            </button>
                                        )}
                                    </div>
                                </GlassCard>

                                {/* Emergency Contacts */}
                                <GlassCard className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-pink-400" />
                                            <div>
                                                <p className="font-medium">Emergency Contacts</p>
                                                <p className="text-xs text-secondary">
                                                    {offlineData.emergencyContacts.length} contacts saved
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-secondary" />
                                    </div>
                                </GlassCard>

                                {/* Tickets */}
                                <GlassCard className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Ticket className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <p className="font-medium">Tickets & Passes</p>
                                                <p className="text-xs text-secondary">
                                                    {offlineData.tickets.length} items saved
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-secondary" />
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Downloadable Maps */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider px-1">
                                    Offline Maps
                                </h3>
                                {availableMaps.map(map => {
                                    const isDownloaded = offlineData.downloadedMaps.includes(map.id);
                                    const isDownloading = downloadingMap === map.id;

                                    return (
                                        <GlassCard key={map.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Map className="w-5 h-5 text-teal-400" />
                                                    <div>
                                                        <p className="font-medium">{map.name}</p>
                                                        <p className="text-xs text-secondary">{map.size}</p>
                                                    </div>
                                                </div>
                                                {isDownloaded ? (
                                                    <Check className="w-5 h-5 text-emerald-400" />
                                                ) : isDownloading ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                    >
                                                        <RefreshCw className="w-5 h-5 text-action" />
                                                    </motion.div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDownloadMap(map.id)}
                                                        className="p-2 bg-action/20 text-action rounded-lg"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </GlassCard>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing || !isOnline}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2",
                                        isOnline ? "bg-action text-white" : "bg-slate-800 text-slate-500"
                                    )}
                                >
                                    {isSyncing ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </motion.div>
                                    ) : (
                                        <RefreshCw className="w-5 h-5" />
                                    )}
                                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                                </button>
                                <button
                                    onClick={clearOfflineData}
                                    className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl font-bold flex items-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {offlineData.lastSyncTime && (
                                <p className="text-center text-xs text-secondary">
                                    Last synced: {new Date(offlineData.lastSyncTime).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Offline indicator for the status bar
export function OfflineIndicator() {
    const { isOnline, isOfflineMode } = useOffline();

    if (isOnline && !isOfflineMode) return null;

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 py-2 text-center text-xs font-bold",
                !isOnline ? "bg-red-500 text-white" : "bg-amber-500 text-black"
            )}
        >
            {!isOnline ? (
                <span className="flex items-center justify-center gap-2">
                    <WifiOff className="w-3 h-3" /> No Internet Connection
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <CloudOff className="w-3 h-3" /> Offline Mode Active
                </span>
            )}
        </motion.div>
    );
}
