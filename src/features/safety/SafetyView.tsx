import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import {
    Shield, Phone, AlertTriangle, Heart, ShieldCheck,
    MapPin, Moon, Car, User, Plus, X, Navigation,
    Bell, Eye, CheckCircle, Clock
} from 'lucide-react';
import { useEnvironment } from '../../context/EnvironmentContext';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { TravelMap } from '../../components/map/TravelMap';

interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    relation: string;
}

interface SafetyAlert {
    id: string;
    type: 'warning' | 'caution' | 'info';
    title: string;
    description: string;
    area: string;
    time: string;
}

const MOCK_ALERTS: SafetyAlert[] = [
    { id: '1', type: 'warning', title: 'Pickpocketing Hotspot', description: 'Increased reports in tourist areas', area: 'Temple District', time: '2h ago' },
    { id: '2', type: 'caution', title: 'Night Safety Advisory', description: 'Stick to main roads after 10 PM', area: 'Market Area', time: '5h ago' },
    { id: '3', type: 'info', title: 'Safe Zone Verified', description: 'This hotel area is community verified', area: 'City Center', time: '1d ago' },
];

export function SafetyView() {
    const { isEmergency, toggleEmergency } = useEnvironment();
    const [holding, setHolding] = useState(false);
    const [showContacts, setShowContacts] = useState(false);
    const [activeTab, setActiveTab] = useState<'alerts' | 'zones' | 'tips'>('alerts');
    const controls = useAnimation();
    const timeoutRef = useRef<any>(null);

    const [contacts, setContacts] = useState<EmergencyContact[]>([
        { id: '1', name: 'Mom', phone: '+1 234 567 8900', relation: 'Family' },
        { id: '2', name: 'Hotel Concierge', phone: '+81 3 1234 5678', relation: 'Local' },
    ]);

    const startHold = () => {
        if (isEmergency) return;
        setHolding(true);
        controls.start({
            strokeDashoffset: 0,
            transition: { duration: 3, ease: "linear" }
        });

        timeoutRef.current = setTimeout(() => {
            toggleEmergency();
            setHolding(false);
        }, 3000);
    };

    const endHold = () => {
        if (isEmergency) return;
        setHolding(false);
        clearTimeout(timeoutRef.current);
        controls.start({
            strokeDashoffset: 283,
            transition: { duration: 0.2 }
        });
    };

    useEffect(() => {
        if (!isEmergency) {
            controls.set({ strokeDashoffset: 283 });
        }
    }, [isEmergency, controls]);

    if (isEmergency) {
        return <EmergencyScreen onCancel={toggleEmergency} contacts={contacts} />;
    }

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex justify-between items-start"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-safety" />
                        <span className="text-xs text-safety font-bold uppercase tracking-wider">AI Protected</span>
                    </div>
                    <h1 className="text-3xl font-bold">Safety Layer</h1>
                    <p className="text-secondary text-sm">Real-time risk monitoring</p>
                </div>
                <button
                    onClick={() => setShowContacts(true)}
                    className="p-3 bg-surface/50 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors"
                >
                    <User className="w-5 h-5 text-secondary" />
                </button>
            </motion.header>

            {/* SOS Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 mb-6"
            >
                <div className="relative">
                    <svg className="w-44 h-44 transform -rotate-90 pointer-events-none">
                        <circle
                            cx="88"
                            cy="88"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-slate-800"
                        />
                        <motion.circle
                            cx="88"
                            cy="88"
                            r="45"
                            stroke="#EF4444"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray="283"
                            strokeDashoffset="283"
                            animate={controls}
                            className="drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                        />
                    </svg>

                    <button
                        onPointerDown={startHold}
                        onPointerUp={endHold}
                        onContextMenu={(e) => e.preventDefault()}
                        onMouseLeave={endHold}
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full",
                            "bg-gradient-to-br from-surface to-slate-900 border-4 border-slate-700",
                            "flex flex-col items-center justify-center shadow-2xl transition-all duration-200",
                            "active:scale-95 select-none",
                            holding ? "border-safety shadow-safety/30" : "hover:border-slate-500"
                        )}
                    >
                        <div className="bg-gradient-to-br from-safety to-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-1 shadow-lg">
                            <span className="font-black text-xl">SOS</span>
                        </div>
                        <span className="text-[10px] text-secondary font-medium uppercase tracking-widest">Hold 3s</span>
                    </button>
                </div>
                <p className="text-sm text-secondary mt-3 animate-pulse opacity-60">Long press for emergency mode</p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <GlassCard className="p-3 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-lg font-bold">Moderate</p>
                    <p className="text-[10px] text-secondary">Risk Level</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-pink-500/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-pink-400" />
                    </div>
                    <p className="text-lg font-bold">8.5/10</p>
                    <p className="text-[10px] text-secondary">Women Safety</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-lg font-bold">12</p>
                    <p className="text-[10px] text-secondary">Verified Stays</p>
                </GlassCard>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'alerts', label: 'Alerts', icon: Bell },
                    { id: 'zones', label: 'Safe Zones', icon: MapPin },
                    { id: 'tips', label: 'Night Tips', icon: Moon },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-action text-white"
                                : "bg-surface/50 text-secondary hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'alerts' && (
                    <motion.div
                        key="alerts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        {MOCK_ALERTS.map((alert, i) => (
                            <AlertCard key={alert.id} alert={alert} delay={i * 0.05} />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'zones' && (
                    <motion.div
                        key="zones"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <GlassCard className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Eye className="w-5 h-5 text-pink-400" />
                                <h3 className="font-bold">Women Safety Heatmap</h3>
                            </div>
                            <TravelMap
                                center={[35.6762, 139.6503]} // Tokyo
                                zoom={13}
                                height="180px"
                                safetyZones={[
                                    { center: [35.6812, 139.7671], radius: 500, type: 'safe' as const, name: 'Station Area' },
                                    { center: [35.6595, 139.7006], radius: 400, type: 'safe' as const, name: 'Shopping District' },
                                    { center: [35.6684, 139.7025], radius: 300, type: 'caution' as const, name: 'Night Market' },
                                    { center: [35.6528, 139.7108], radius: 250, type: 'danger' as const, name: 'Industrial Area' },
                                ]}
                            />
                            <p className="text-xs text-secondary mt-2">
                                🟢 Safe • 🟡 Caution • 🔴 Avoid at night
                            </p>
                        </GlassCard>

                        <GlassCard className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    <h3 className="font-bold">Verified Transport</h3>
                                </div>
                                <span className="text-xs text-emerald-400">Active</span>
                            </div>
                            <p className="text-sm text-secondary mb-3">Only showing AI-verified safe taxis and rides</p>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">Official Taxis</span>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">Hotel Shuttles</span>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {activeTab === 'tips' && (
                    <motion.div
                        key="tips"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        {[
                            { icon: Moon, tip: 'Stick to well-lit main roads after 10 PM', type: 'essential' },
                            { icon: Car, tip: 'Use only official taxis or hotel-arranged transport', type: 'transport' },
                            { icon: MapPin, tip: 'Share live location with emergency contacts', type: 'location' },
                            { icon: Phone, tip: 'Keep local emergency numbers saved offline', type: 'contacts' },
                        ].map((item, i) => (
                            <GlassCard key={i} className="p-4 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-action/10 flex items-center justify-center flex-shrink-0">
                                    <item.icon className="w-5 h-5 text-action" />
                                </div>
                                <div>
                                    <p className="font-medium">{item.tip}</p>
                                    <span className="text-xs text-secondary capitalize">{item.type}</span>
                                </div>
                            </GlassCard>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Emergency Contacts Modal */}
            <AnimatePresence>
                {showContacts && (
                    <EmergencyContactsModal
                        contacts={contacts}
                        onClose={() => setShowContacts(false)}
                        onAdd={(contact) => setContacts([...contacts, contact])}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function AlertCard({ alert, delay }: { alert: SafetyAlert; delay: number }) {
    const colors = {
        warning: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400' },
        caution: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400' },
        info: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
    };
    const style = colors[alert.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
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
                            <span className="text-[10px] text-secondary flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {alert.time}
                            </span>
                        </div>
                        <p className="text-sm text-secondary mb-2">{alert.description}</p>
                        <div className="flex items-center gap-1 text-xs text-secondary">
                            <MapPin className="w-3 h-3" /> {alert.area}
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

function EmergencyScreen({ onCancel, contacts }: { onCancel: () => void; contacts: EmergencyContact[] }) {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-red-900 to-red-600 flex flex-col p-6"
        >
            <div className="flex-1 flex flex-col items-center justify-center text-white text-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <AlertTriangle className="w-24 h-24 mb-6" />
                </motion.div>
                <h1 className="text-4xl font-bold mb-2">SOS ACTIVE</h1>
                <p className="text-xl opacity-90 mb-8">Broadcasting Location...</p>

                <GlassCard className="w-full max-w-sm p-4 bg-white/10 border-white/20 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Navigation className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Sharing with {contacts.length} contacts</p>
                            <p className="text-sm opacity-80">Location updated every 30s</p>
                        </div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 10 }}
                            className="h-full bg-white"
                        />
                    </div>
                </GlassCard>

                <div className="flex gap-3 mb-8">
                    {contacts.slice(0, 2).map(contact => (
                        <div key={contact.id} className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
                                {contact.name[0]}
                            </div>
                            <span className="text-sm">{contact.name}</span>
                            <CheckCircle className="w-4 h-4 text-emerald-300" />
                        </div>
                    ))}
                </div>

                <p className="text-sm opacity-70 mb-4">
                    Auto-calling emergency services in {countdown}s
                </p>
            </div>

            <button
                onClick={onCancel}
                className="w-full py-4 bg-white text-red-600 font-bold rounded-2xl shadow-xl"
            >
                CANCEL EMERGENCY
            </button>
        </motion.div>
    );
}

function EmergencyContactsModal({
    contacts,
    onClose,
    onAdd
}: {
    contacts: EmergencyContact[];
    onClose: () => void;
    onAdd: (contact: EmergencyContact) => void;
}) {
    const [showForm, setShowForm] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

    const handleAdd = () => {
        if (newContact.name && newContact.phone) {
            onAdd({ ...newContact, id: Date.now().toString() });
            setNewContact({ name: '', phone: '', relation: '' });
            setShowForm(false);
        }
    };

    return (
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
                className="relative w-full max-w-md bg-surface rounded-t-3xl p-6 pb-safe"
            >
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Emergency Contacts</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    {contacts.map(contact => (
                        <GlassCard key={contact.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-action/10 flex items-center justify-center">
                                    <span className="font-bold text-action">{contact.name[0]}</span>
                                </div>
                                <div>
                                    <p className="font-bold">{contact.name}</p>
                                    <p className="text-xs text-secondary">{contact.phone}</p>
                                </div>
                            </div>
                            <span className="text-xs text-secondary px-2 py-1 bg-surface rounded-full">{contact.relation}</span>
                        </GlassCard>
                    ))}
                </div>

                <AnimatePresence>
                    {showForm ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 mb-4"
                        >
                            <input
                                type="text"
                                placeholder="Name"
                                value={newContact.name}
                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                className="w-full p-3 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-action"
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                className="w-full p-3 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-action"
                            />
                            <input
                                type="text"
                                placeholder="Relation (Family, Friend, Local)"
                                value={newContact.relation}
                                onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                                className="w-full p-3 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-action"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-3 bg-slate-800 rounded-xl font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 py-3 bg-action rounded-xl font-bold"
                                >
                                    Add Contact
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForm(true)}
                            className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-secondary hover:border-action hover:text-action transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Emergency Contact
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
