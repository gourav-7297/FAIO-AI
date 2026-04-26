import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import {
    Shield, Phone, AlertTriangle, Heart, ShieldCheck,
    MapPin, Moon, Car, User, Plus, X, Navigation,
    Bell, Eye, CheckCircle, Clock, PhoneCall, Share2,
    Zap, Wifi, Volume2, List, Landmark, BatteryCharging,
    Loader2, PhoneOutgoing, Flame, Siren, Globe, AlertCircle
} from 'lucide-react';
import { useEnvironment } from '../../context/EnvironmentContext';
import { useAIAgents } from '../../context/AIAgentContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { TravelMap } from '../../components/map/TravelMap';
import type { MapMarker } from '../../components/map/TravelMap';
import {
    getCountryAdvisory, getAdvisoryLevel, getCurrentLocation, watchUserLocation,
    reverseGeocode, getAllNearbySafePlaces, getEmergencyContacts, addEmergencyContact,
    removeEmergencyContact, startLocationSharing, updateSharingLocation, stopLocationSharing,
    getActiveSession, getCommunityAlerts, reportSafetyAlert, formatTimeAgo, formatDistance,
    getEmergencyNumbers, type TravelAdvisory, type UserLocation, type SafetyAlert,
    type EmergencyContact, type LocationSharingSession, type NearbyPlace, type EmergencyNumbers
} from '../../services/safetyService';

// ── Checklist persistence ──
const CHECKLIST_KEY = 'faio_safety_checklist';
const DEFAULT_CHECKLIST = [
    { id: '1', text: 'Share hotel address with family', done: false },
    { id: '2', text: 'Download offline maps', done: false },
    { id: '3', text: 'Save local emergency numbers', done: false },
    { id: '4', text: 'Register with embassy', done: false },
    { id: '5', text: 'Get travel insurance', done: false },
    { id: '6', text: 'Copy passport & IDs', done: false },
];
function loadChecklist() { try { const r = localStorage.getItem(CHECKLIST_KEY); if (r) return JSON.parse(r); } catch {} return DEFAULT_CHECKLIST; }
function saveChecklist(list: typeof DEFAULT_CHECKLIST) { try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(list)); } catch {} }

export function SafetyView() {
    const { isEmergency, toggleEmergency } = useEnvironment();
    const { tripData } = useAIAgents();
    const { user } = useAuth();
    const { showToast } = useToast();

    // SOS state
    const [holding, setHolding] = useState(false);
    const [showContacts, setShowContacts] = useState(false);
    const [activeTab, setActiveTab] = useState<'alerts' | 'zones' | 'checklist' | 'tips'>('alerts');
    const [showFakeCall, setShowFakeCall] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const controls = useAnimation();
    const timeoutRef = useRef<any>(null);

    // Real data state
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [advisory, setAdvisory] = useState<TravelAdvisory | null>(null);
    const [emergencyNums, setEmergencyNums] = useState<EmergencyNumbers>(getEmergencyNumbers('IN'));
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
    const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
    const [checklist, setChecklist] = useState(loadChecklist);
    const [isLoading, setIsLoading] = useState(true);

    // Live sharing
    const [liveSharing, setLiveSharing] = useState(false);
    const [sharingSession, setSharingSession] = useState<LocationSharingSession | null>(null);
    const stopWatchRef = useRef<(() => void) | null>(null);

    useEffect(() => { saveChecklist(checklist); }, [checklist]);

    // ── Load all real data on mount ──
    useEffect(() => {
        let cancelled = false;
        async function init() {
            setIsLoading(true);
            try {
                // Get GPS
                let loc: UserLocation | null = null;
                try {
                    const pos = await getCurrentLocation();
                    const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                    loc = { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp, ...geo };
                } catch { /* GPS denied, use trip or default */ }

                if (cancelled) return;

                const countryCode = loc?.countryCode || (tripData?.destination ? guessCountryCode(tripData.destination) : 'IN');

                // Set location & emergency nums
                if (loc) setUserLocation(loc);
                setEmergencyNums(getEmergencyNumbers(countryCode));

                // Parallel fetches
                const [advisoryData, contactsData, alertsData] = await Promise.all([
                    getCountryAdvisory(countryCode),
                    user ? getEmergencyContacts(user.id) : Promise.resolve([]),
                    getCommunityAlerts(loc?.lat, loc?.lon, countryCode),
                ]);

                if (cancelled) return;
                if (advisoryData) setAdvisory(advisoryData);
                if (contactsData.length > 0) setContacts(contactsData);
                else setContacts([{ id: 'default-1', name: 'Mom', phone: '+1 234 567 8900', relation: 'Family' }]);
                setAlerts(alertsData);

                // Nearby places (needs GPS)
                if (loc) {
                    const places = await getAllNearbySafePlaces(loc.lat, loc.lon);
                    if (!cancelled) setNearbyPlaces(places);
                }

                // Check active sharing session
                if (user) {
                    const session = await getActiveSession(user.id);
                    if (session && !cancelled) { setSharingSession(session); setLiveSharing(true); }
                }
            } catch (err) { console.error('Safety init error:', err); }
            finally { if (!cancelled) setIsLoading(false); }
        }
        init();
        return () => { cancelled = true; };
    }, [user, tripData?.destination]);

    // ── Live sharing GPS watch ──
    const toggleLiveSharing = useCallback(async () => {
        if (!user) { showToast('Sign in to share location', 'error'); return; }
        if (liveSharing && sharingSession) {
            await stopLocationSharing(sharingSession.id);
            stopWatchRef.current?.();
            setSharingSession(null); setLiveSharing(false);
            showToast('Location sharing stopped', 'success');
        } else {
            try {
                const pos = await getCurrentLocation();
                const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                const session = await startLocationSharing(user.id, pos.coords.latitude, pos.coords.longitude, geo.city, geo.country);
                if (session) {
                    setSharingSession(session); setLiveSharing(true);
                    // Start watching
                    const stop = watchUserLocation(async (loc) => {
                        setUserLocation(loc);
                        if (session) await updateSharingLocation(session.id, loc.lat, loc.lon, loc.city, loc.country);
                    });
                    stopWatchRef.current = stop;
                    showToast('Live location sharing active!', 'success');
                }
            } catch { showToast('GPS permission required', 'error'); }
        }
    }, [liveSharing, sharingSession, user, showToast]);

    // Contact handlers
    const handleAddContact = async (contact: { name: string; phone: string; relation: string }) => {
        const userId = user?.id || 'anonymous';
        const result = await addEmergencyContact(userId, contact);
        if (result) setContacts(prev => [...prev, result]);
    };
    const handleRemoveContact = async (id: string) => {
        const userId = user?.id || 'anonymous';
        await removeEmergencyContact(id, userId);
        setContacts(prev => prev.filter(c => c.id !== id));
    };

    const toggleChecklistItem = (id: string) => {
        setChecklist((prev: typeof DEFAULT_CHECKLIST) => prev.map((item: typeof DEFAULT_CHECKLIST[0]) =>
            item.id === id ? { ...item, done: !item.done } : item
        ));
    };
    const checklistDone = checklist.filter((c: typeof DEFAULT_CHECKLIST[0]) => c.done).length;
    const checklistPercent = (checklistDone / checklist.length) * 100;

    // SOS handlers
    const startHold = () => { if (isEmergency) return; setHolding(true); controls.start({ strokeDashoffset: 0, transition: { duration: 3, ease: "linear" } }); timeoutRef.current = setTimeout(() => { toggleEmergency(); setHolding(false); }, 3000); };
    const endHold = () => { if (isEmergency) return; setHolding(false); clearTimeout(timeoutRef.current); controls.start({ strokeDashoffset: 283, transition: { duration: 0.2 } }); };
    useEffect(() => { if (!isEmergency) controls.set({ strokeDashoffset: 283 }); }, [isEmergency, controls]);

    if (isEmergency) return <EmergencyScreen onCancel={toggleEmergency} contacts={contacts} emergencyNums={emergencyNums} />;

    const advisoryLevel = advisory ? getAdvisoryLevel(advisory.score) : null;
    const mapCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lon] : [28.7041, 77.1025];
    const mapMarkers: MapMarker[] = nearbyPlaces.map(p => ({ id: p.id, position: [p.lat, p.lon] as [number, number], type: p.type === 'hospital' ? 'safe' : p.type === 'police' ? 'safe' : 'attraction', title: `${p.icon} ${p.name}`, description: `${formatDistance(p.distance)} · ${p.address}` }));

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-safety" />
                        <span className="text-xs text-safety font-bold uppercase tracking-wider">AI Protected</span>
                        {advisoryLevel && (
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", advisoryLevel.bgColor, advisoryLevel.color)}>
                                {advisoryLevel.label}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold">Safety Hub</h1>
                    <p className="text-secondary text-sm">
                        {userLocation?.city ? `📍 ${userLocation.city}, ${userLocation.country}` : tripData ? `Protection active for ${tripData.destination}` : 'Real-time risk monitoring'}
                    </p>
                </div>
                <button onClick={() => setShowContacts(true)} className="p-3 bg-surface/50 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors">
                    <User className="w-5 h-5 text-secondary" />
                </button>
            </motion.header>

            {/* Emergency Numbers Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <GlassCard gradient="none" className="p-4 mb-4 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{emergencyNums.flag}</span>
                        <div>
                            <h3 className="font-bold text-sm">{emergencyNums.countryName} Emergency</h3>
                            <p className="text-[10px] text-secondary">Tap to call instantly</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Police', num: emergencyNums.police, icon: <Siren className="w-4 h-4" />, color: 'text-blue-400 bg-blue-500/10' },
                            { label: 'Ambulance', num: emergencyNums.ambulance, icon: <Heart className="w-4 h-4" />, color: 'text-red-400 bg-red-500/10' },
                            { label: 'Fire', num: emergencyNums.fire, icon: <Flame className="w-4 h-4" />, color: 'text-orange-400 bg-orange-500/10' },
                        ].map(item => (
                            <a key={item.label} href={`tel:${item.num}`} className={cn("flex flex-col items-center gap-1 p-2.5 rounded-xl border border-white/5 transition-all hover:scale-105", item.color)}>
                                {item.icon}
                                <span className="text-[10px] font-bold text-white">{item.num}</span>
                                <span className="text-[9px] text-secondary">{item.label}</span>
                            </a>
                        ))}
                    </div>
                    {emergencyNums.touristPolice && (
                        <a href={`tel:${emergencyNums.touristPolice}`} className="mt-2 w-full flex items-center justify-center gap-2 p-2 bg-purple-500/10 rounded-lg text-purple-400 text-xs font-medium">
                            <Globe className="w-3.5 h-3.5" /> Tourist Police: {emergencyNums.touristPolice}
                        </a>
                    )}
                </GlassCard>
            </motion.div>

            {/* SOS Button */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-4 mb-4">
                <div className="relative">
                    <svg className="w-36 h-36 transform -rotate-90 pointer-events-none">
                        <circle cx="72" cy="72" r="42" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-800" />
                        <motion.circle cx="72" cy="72" r="42" stroke="#EF4444" strokeWidth="5" fill="transparent" strokeDasharray="264" strokeDashoffset="264" animate={controls} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    </svg>
                    <button onPointerDown={startHold} onPointerUp={endHold} onContextMenu={e => e.preventDefault()} onMouseLeave={endHold}
                        className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full", "bg-gradient-to-br from-surface to-slate-900 border-4 border-slate-700", "flex flex-col items-center justify-center shadow-2xl transition-all duration-200", "active:scale-95 select-none", holding ? "border-safety shadow-safety/30" : "hover:border-slate-500")}>
                        <div className="bg-gradient-to-br from-safety to-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center mb-1 shadow-lg">
                            <span className="font-black text-base">SOS</span>
                        </div>
                        <span className="text-[8px] text-secondary font-medium uppercase tracking-widest">Hold 3s</span>
                    </button>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <button onClick={() => setShowFakeCall(true)} className="p-3 bg-surface/80 border border-slate-700 rounded-xl flex flex-col items-center gap-1.5 hover:border-action transition-colors">
                    <PhoneCall className="w-5 h-5 text-amber-400" /><span className="text-[10px] font-medium text-secondary">Fake Call</span>
                </button>
                <button onClick={toggleLiveSharing} className={cn("p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-colors", liveSharing ? "bg-emerald-500/10 border-emerald-500/30" : "bg-surface/80 border-slate-700 hover:border-action")}>
                    <Share2 className={cn("w-5 h-5", liveSharing ? "text-emerald-400" : "text-secondary")} />
                    <span className="text-[10px] font-medium text-secondary">{liveSharing ? 'Sharing ON' : 'Share GPS'}</span>
                </button>
                <button onClick={() => { if (navigator.share) navigator.share({ title: 'My Location - FAIO Safety', text: userLocation ? `I'm at ${userLocation.city || 'this location'}. Shared via FAIO AI Safety.` : 'Shared via FAIO AI Safety.', url: userLocation ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lon}` : 'https://maps.google.com' }); }}
                    className="p-3 bg-surface/80 border border-slate-700 rounded-xl flex flex-col items-center gap-1.5 hover:border-action transition-colors">
                    <Navigation className="w-5 h-5 text-blue-400" /><span className="text-[10px] font-medium text-secondary">Send Location</span>
                </button>
            </div>

            {/* Live Sharing Banner */}
            <AnimatePresence>
                {liveSharing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-emerald-400">Live Location Active</p>
                                <p className="text-[10px] text-secondary">GPS updating every 30s · Accuracy: {userLocation ? `${Math.round(userLocation.accuracy)}m` : '...'}</p>
                            </div>
                            <button onClick={toggleLiveSharing} className="text-xs text-emerald-400 font-bold">Stop</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <GlassCard className="p-3 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        {isLoading ? <Loader2 className="w-5 h-5 text-amber-400 animate-spin" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    </div>
                    <p className={cn("text-lg font-bold", advisoryLevel?.color)}>{advisory ? advisory.score.toFixed(1) : '...'}</p>
                    <p className="text-[10px] text-secondary">Risk Score</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-lg font-bold">{nearbyPlaces.length}</p>
                    <p className="text-[10px] text-secondary">Safe Places</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-lg font-bold">{checklistDone}/{checklist.length}</p>
                    <p className="text-[10px] text-secondary">Checklist</p>
                </GlassCard>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'alerts', label: 'Alerts', icon: Bell },
                    { id: 'zones', label: 'Safe Zones', icon: MapPin },
                    { id: 'checklist', label: 'Checklist', icon: List },
                    { id: 'tips', label: 'Night Tips', icon: Moon },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap", activeTab === tab.id ? "bg-action text-white" : "bg-surface/50 text-secondary hover:text-white")}>
                        <tab.icon className="w-4 h-4" /><span className="text-sm font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'alerts' && (
                    <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        {/* Advisory banner */}
                        {advisory && advisoryLevel && (
                            <GlassCard className={cn("p-4 border", advisory.score > 3 ? "border-red-500/20" : "border-amber-500/20")}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Globe className={cn("w-5 h-5", advisoryLevel.color)} />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm">{advisory.countryName} Travel Advisory</h4>
                                        <p className="text-[10px] text-secondary">Score: {advisory.score.toFixed(1)}/5 · Updated {formatTimeAgo(advisory.updatedAt)}</p>
                                    </div>
                                    <span className={cn("px-2 py-1 rounded-full text-xs font-bold", advisoryLevel.bgColor, advisoryLevel.color)}>{advisoryLevel.label}</span>
                                </div>
                                <p className="text-xs text-secondary">{advisory.message}</p>
                            </GlassCard>
                        )}
                        {/* Community alerts */}
                        {alerts.map((alert, i) => <AlertCard key={alert.id} alert={alert} delay={i * 0.05} />)}
                        {/* Report button */}
                        {user && (
                            <button onClick={() => setShowReportModal(true)} className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-secondary hover:border-action hover:text-action transition-colors">
                                <AlertCircle className="w-5 h-5" /> Report Safety Alert
                            </button>
                        )}
                    </motion.div>
                )}

                {activeTab === 'zones' && (
                    <motion.div key="zones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <GlassCard className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Eye className="w-5 h-5 text-pink-400" />
                                <h3 className="font-bold">Nearby Safe Places</h3>
                                {userLocation && <span className="text-[10px] text-emerald-400 ml-auto">📍 Live GPS</span>}
                            </div>
                            <TravelMap center={mapCenter} zoom={14} height="200px" markers={mapMarkers} />
                            <p className="text-xs text-secondary mt-2">🏥 Hospital · 🏛️ Police · 💊 Pharmacy</p>
                        </GlassCard>
                        {/* Place list */}
                        <GlassCard className="p-4">
                            <h3 className="font-bold mb-3 flex items-center gap-2"><Landmark className="w-5 h-5 text-action" />Places ({nearbyPlaces.length})</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {nearbyPlaces.length === 0 && <p className="text-sm text-secondary">No GPS data. Enable location for real results.</p>}
                                {nearbyPlaces.slice(0, 10).map(place => (
                                    <div key={place.id} className="flex items-center justify-between p-2 bg-surface/50 rounded-lg">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="text-lg">{place.icon}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{place.name}</p>
                                                <p className="text-[10px] text-secondary truncate">{place.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {place.distance && <span className="text-xs text-action">{formatDistance(place.distance)}</span>}
                                            {place.phone && <a href={`tel:${place.phone}`} className="p-1.5 bg-emerald-500/10 rounded-lg"><Phone className="w-3.5 h-3.5 text-emerald-400" /></a>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'checklist' && (
                    <motion.div key="checklist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <GlassCard gradient="green" className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-white">Safety Readiness</span>
                                <span className="text-sm font-bold text-white">{checklistPercent.toFixed(0)}%</span>
                            </div>
                            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${checklistPercent}%` }} className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                            </div>
                            <p className="text-xs text-white/70 mt-2">{checklistDone} of {checklist.length} completed</p>
                        </GlassCard>
                        <div className="space-y-2">
                            {checklist.map((item: typeof DEFAULT_CHECKLIST[0], i: number) => (
                                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                    <button onClick={() => toggleChecklistItem(item.id)} className="w-full text-left">
                                        <GlassCard className={cn("p-4 flex items-center gap-3 transition-all", item.done ? "border-emerald-500/20 bg-emerald-500/5" : "")}>
                                            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0", item.done ? "border-emerald-400 bg-emerald-400" : "border-slate-600")}>
                                                {item.done && <CheckCircle className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className={cn("text-sm font-medium transition-all", item.done ? "text-secondary line-through" : "text-white")}>{item.text}</span>
                                        </GlassCard>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'tips' && (
                    <motion.div key="tips" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        {[
                            { icon: Moon, tip: 'Stick to well-lit main roads after 10 PM', severity: 'high' as const },
                            { icon: Car, tip: 'Use only official taxis or hotel-arranged transport', severity: 'high' as const },
                            { icon: MapPin, tip: 'Share live location with emergency contacts', severity: 'medium' as const },
                            { icon: Phone, tip: 'Keep local emergency numbers saved offline', severity: 'medium' as const },
                            { icon: Wifi, tip: 'Avoid public WiFi for banking or personal info', severity: 'medium' as const },
                            { icon: Volume2, tip: 'Stay alert — avoid headphones in unfamiliar areas', severity: 'high' as const },
                            { icon: BatteryCharging, tip: 'Keep phone charged above 20% when out', severity: 'low' as const },
                        ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                <GlassCard className="p-4 flex items-start gap-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", item.severity === 'high' ? "bg-red-500/10" : item.severity === 'medium' ? "bg-amber-500/10" : "bg-action/10")}>
                                        <item.icon className={cn("w-5 h-5", item.severity === 'high' ? "text-red-400" : item.severity === 'medium' ? "text-amber-400" : "text-action")} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.tip}</p>
                                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold mt-1 inline-block", item.severity === 'high' ? "bg-red-500/10 text-red-400" : item.severity === 'medium' ? "bg-amber-500/10 text-amber-400" : "bg-action/10 text-action")}>{item.severity.toUpperCase()}</span>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {showContacts && <EmergencyContactsModal contacts={contacts} onClose={() => setShowContacts(false)} onAdd={handleAddContact} onRemove={handleRemoveContact} />}
            </AnimatePresence>
            <AnimatePresence>
                {showFakeCall && <FakeCallScreen onEnd={() => setShowFakeCall(false)} />}
            </AnimatePresence>
            <AnimatePresence>
                {showReportModal && <ReportAlertModal userLocation={userLocation} onClose={() => setShowReportModal(false)} onSubmit={async (alert) => { const ok = await reportSafetyAlert(user!.id, alert); if (ok) { showToast('Alert reported!', 'success'); setShowReportModal(false); const updated = await getCommunityAlerts(userLocation?.lat, userLocation?.lon, userLocation?.countryCode); setAlerts(updated); } else { showToast('Failed to report', 'error'); } }} />}
            </AnimatePresence>
        </div>
    );
}

// ── Helper ──
function guessCountryCode(destination: string): string {
    const map: Record<string, string> = { 'india': 'IN', 'japan': 'JP', 'tokyo': 'JP', 'paris': 'FR', 'france': 'FR', 'usa': 'US', 'london': 'GB', 'uk': 'GB', 'dubai': 'AE', 'singapore': 'SG', 'thailand': 'TH', 'bangkok': 'TH', 'vietnam': 'VN', 'korea': 'KR', 'seoul': 'KR', 'australia': 'AU', 'sydney': 'AU', 'germany': 'DE', 'italy': 'IT', 'spain': 'ES', 'brazil': 'BR', 'mexico': 'MX', 'canada': 'CA', 'china': 'CN', 'indonesia': 'ID', 'bali': 'ID', 'delhi': 'IN', 'mumbai': 'IN', 'new york': 'US', 'egypt': 'EG', 'turkey': 'TR', 'greece': 'GR', 'nepal': 'NP', 'sri lanka': 'LK', 'malaysia': 'MY' };
    const lower = destination.toLowerCase();
    for (const [key, code] of Object.entries(map)) { if (lower.includes(key)) return code; }
    return 'IN';
}

// ── Sub-components ──

function AlertCard({ alert, delay }: { alert: SafetyAlert; delay: number }) {
    const colors = { warning: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400' }, caution: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400' }, info: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' } };
    const style = colors[alert.type];
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
            <GlassCard className={cn("p-4 border", style.border, style.bg)}>
                <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", style.bg)}>
                        {alert.type === 'warning' && <AlertTriangle className={cn("w-5 h-5", style.icon)} />}
                        {alert.type === 'caution' && <Eye className={cn("w-5 h-5", style.icon)} />}
                        {alert.type === 'info' && <CheckCircle className={cn("w-5 h-5", style.icon)} />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold">{alert.title}</h4>
                            <span className="text-[10px] text-secondary flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(alert.created_at)}</span>
                        </div>
                        <p className="text-sm text-secondary mb-2">{alert.description}</p>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-secondary"><MapPin className="w-3 h-3" /> {alert.area}</div>
                            {alert.distance !== undefined && <span className="text-[10px] text-action">{alert.distance.toFixed(1)}km away</span>}
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

function FakeCallScreen({ onEnd }: { onEnd: () => void }) {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => { const t = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(t); }, []);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-between p-8">
            <div className="flex-1 flex flex-col items-center justify-center text-white text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30"><Phone className="w-12 h-12" /></div>
                <h1 className="text-2xl font-bold mb-1">Hotel Reception</h1>
                <p className="text-secondary mb-2">+81 3 1234 5678</p>
                <div className="flex items-center gap-2 text-emerald-400">
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}><Zap className="w-4 h-4" /></motion.div>
                    <span className="text-sm font-medium">{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span>
                </div>
            </div>
            <button onClick={onEnd} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 mb-8"><Phone className="w-8 h-8 text-white rotate-[135deg]" /></button>
        </motion.div>
    );
}

function EmergencyScreen({ onCancel, contacts, emergencyNums }: { onCancel: () => void; contacts: EmergencyContact[]; emergencyNums: EmergencyNumbers }) {
    const [countdown, setCountdown] = useState(10);
    useEffect(() => { const t = setInterval(() => setCountdown(p => p > 0 ? p - 1 : 0), 1000); return () => clearInterval(t); }, []);
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-gradient-to-b from-red-900 to-red-600 flex flex-col p-6">
            <div className="flex-1 flex flex-col items-center justify-center text-white text-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}><AlertTriangle className="w-24 h-24 mb-6" /></motion.div>
                <h1 className="text-4xl font-bold mb-2">SOS ACTIVE</h1>
                <p className="text-xl opacity-90 mb-4">Broadcasting Location...</p>
                {/* One-tap emergency call */}
                <a href={`tel:${emergencyNums.general || emergencyNums.police}`} className="w-full max-w-sm py-4 bg-white/20 rounded-2xl flex items-center justify-center gap-3 mb-6 font-bold text-lg">
                    <PhoneOutgoing className="w-6 h-6" /> Call {emergencyNums.general || emergencyNums.police} ({emergencyNums.countryName})
                </a>
                <GlassCard className="w-full max-w-sm p-4 bg-white/10 border-white/20 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Navigation className="w-6 h-6" /></div>
                        <div className="text-left"><p className="font-bold">Sharing with {contacts.length} contacts</p><p className="text-sm opacity-80">Location updated every 30s</p></div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 10 }} className="h-full bg-white" /></div>
                </GlassCard>
                <div className="flex gap-3 mb-8">
                    {contacts.slice(0, 2).map(c => (
                        <div key={c.id} className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">{c.name[0]}</div>
                            <span className="text-sm">{c.name}</span><CheckCircle className="w-4 h-4 text-emerald-300" />
                        </div>
                    ))}
                </div>
                <p className="text-sm opacity-70 mb-4">Auto-calling emergency services in {countdown}s</p>
            </div>
            <button onClick={onCancel} className="w-full py-4 bg-white text-red-600 font-bold rounded-2xl shadow-xl">CANCEL EMERGENCY</button>
        </motion.div>
    );
}

function EmergencyContactsModal({ contacts, onClose, onAdd, onRemove }: { contacts: EmergencyContact[]; onClose: () => void; onAdd: (c: { name: string; phone: string; relation: string }) => void; onRemove: (id: string) => void }) {
    const [showForm, setShowForm] = useState(false);
    const [nc, setNc] = useState({ name: '', phone: '', relation: '' });
    const handleAdd = () => { if (nc.name && nc.phone) { onAdd(nc); setNc({ name: '', phone: '', relation: '' }); setShowForm(false); } };
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-surface rounded-t-3xl p-6 pb-safe">
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Emergency Contacts</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3 mb-6">
                    {contacts.map(c => (
                        <GlassCard key={c.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-action/10 flex items-center justify-center"><span className="font-bold text-action">{c.name[0]}</span></div>
                                <div><p className="font-bold">{c.name}</p><p className="text-xs text-secondary">{c.phone}</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={`tel:${c.phone}`} className="p-1.5 bg-emerald-500/10 rounded-lg"><PhoneCall className="w-4 h-4 text-emerald-400" /></a>
                                <span className="text-xs text-secondary px-2 py-1 bg-surface rounded-full">{c.relation}</span>
                                <button onClick={() => onRemove(c.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"><X className="w-4 h-4 text-red-400" /></button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
                <AnimatePresence>
                    {showForm ? (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 mb-4">
                            <input type="text" placeholder="Name" value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} className="w-full p-3 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-action" />
                            <input type="tel" placeholder="Phone Number" value={nc.phone} onChange={e => setNc({ ...nc, phone: e.target.value })} className="w-full p-3 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-action" />
                            <input type="text" placeholder="Relation (Family, Friend, Local)" value={nc.relation} onChange={e => setNc({ ...nc, relation: e.target.value })} className="w-full p-3 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-action" />
                            <div className="flex gap-2">
                                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-800 rounded-xl font-bold">Cancel</button>
                                <button onClick={handleAdd} className="flex-1 py-3 bg-action rounded-xl font-bold">Add Contact</button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(true)} className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-secondary hover:border-action hover:text-action transition-colors">
                            <Plus className="w-5 h-5" /> Add Emergency Contact
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

function ReportAlertModal({ userLocation, onClose, onSubmit }: { userLocation: UserLocation | null; onClose: () => void; onSubmit: (alert: { type: 'warning' | 'caution' | 'info'; title: string; description: string; lat?: number; lon?: number; area: string; countryCode?: string }) => void }) {
    const [type, setType] = useState<'warning' | 'caution' | 'info'>('caution');
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [area, setArea] = useState(userLocation?.city || '');
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative w-full max-w-md bg-surface rounded-t-3xl p-6">
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6" />
                <h2 className="text-xl font-bold mb-4">Report Safety Alert</h2>
                <div className="flex gap-2 mb-4">
                    {(['warning', 'caution', 'info'] as const).map(t => (
                        <button key={t} onClick={() => setType(t)} className={cn("flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all", type === t ? (t === 'warning' ? 'bg-red-500/20 text-red-400' : t === 'caution' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400') : 'bg-surface/50 text-secondary')}>{t}</button>
                    ))}
                </div>
                <input type="text" placeholder="Alert title..." value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 bg-slate-800 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-action" />
                <textarea placeholder="Describe the safety concern..." value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full p-3 bg-slate-800 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-action resize-none" />
                <input type="text" placeholder="Area name" value={area} onChange={e => setArea(e.target.value)} className="w-full p-3 bg-slate-800 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-action" />
                {userLocation && <p className="text-xs text-secondary mb-4">📍 GPS: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}</p>}
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-800 rounded-xl font-bold">Cancel</button>
                    <button onClick={() => { if (title) onSubmit({ type, title, description: desc, lat: userLocation?.lat, lon: userLocation?.lon, area, countryCode: userLocation?.countryCode }); }} disabled={!title} className="flex-1 py-3 bg-action rounded-xl font-bold disabled:opacity-50">Report</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
