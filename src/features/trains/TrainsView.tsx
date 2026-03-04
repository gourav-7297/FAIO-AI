import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Train, Search, Calendar, MapPin,
    ArrowRight, ExternalLink, ChevronDown, Shield
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { searchStations, type Station, TRAIN_PARTNERS, openPartnerBooking } from '../../services/trainService';
import { useToast } from '../../components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function getDefaultDate(offsetDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
}

export default function TrainsView() {
    const [fromStation, setFromStation] = useState<Station | null>(null);
    const [toStation, setToStation] = useState<Station | null>(null);
    const [fromQuery, setFromQuery] = useState('');
    const [toQuery, setToQuery] = useState('');
    const [date, setDate] = useState(getDefaultDate(1));
    const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);
    const [toSuggestions, setToSuggestions] = useState<Station[]>([]);
    const [showPartners, setShowPartners] = useState(false);
    const toRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleFromChange = useCallback((value: string) => {
        setFromQuery(value);
        setFromStation(null);
        setFromSuggestions(searchStations(value));
    }, []);

    const handleToChange = useCallback((value: string) => {
        setToQuery(value);
        setToStation(null);
        setToSuggestions(searchStations(value));
    }, []);

    const handleSearch = () => {
        if (!fromStation || !toStation) {
            showToast('Please select both stations', 'error');
            return;
        }
        if (fromStation.code === toStation.code) {
            showToast('From and To stations must be different', 'error');
            return;
        }
        setShowPartners(true);
    };

    return (
        <div className="space-y-4 pb-24">
            {/* Header */}
            <div className="text-center pt-2 pb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
                    <Train className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">Train Booking</span>
                </div>
                <h2 className="text-xl font-bold text-white">Search & Book Trains</h2>
                <p className="text-white/50 text-sm mt-1">
                    Find trains via IRCTC and trusted platforms
                </p>
            </div>

            {/* Search Form */}
            <GlassCard className="p-4 space-y-3">
                {/* From Station */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                    <input
                        value={fromStation ? `${fromStation.name} (${fromStation.code})` : fromQuery}
                        onChange={e => handleFromChange(e.target.value)}
                        placeholder="From station..."
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30"
                    />
                    <AnimatePresence>
                        {fromSuggestions.length > 0 && !fromStation && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 left-0 right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                            >
                                {fromSuggestions.map(s => (
                                    <button
                                        key={s.code}
                                        onClick={() => {
                                            setFromStation(s);
                                            setFromQuery('');
                                            setFromSuggestions([]);
                                            toRef.current?.focus();
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{s.name}</span>
                                            <span className="text-white/30 font-mono text-xs">{s.code}</span>
                                        </div>
                                        <span className="text-white/30 text-xs">{s.city}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                    <div className="p-1.5 rounded-full bg-white/5 border border-white/10">
                        <ChevronDown className="w-4 h-4 text-white/30" />
                    </div>
                </div>

                {/* To Station */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                    <input
                        ref={toRef}
                        value={toStation ? `${toStation.name} (${toStation.code})` : toQuery}
                        onChange={e => handleToChange(e.target.value)}
                        placeholder="To station..."
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30"
                    />
                    <AnimatePresence>
                        {toSuggestions.length > 0 && !toStation && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 left-0 right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                            >
                                {toSuggestions.map(s => (
                                    <button
                                        key={s.code}
                                        onClick={() => {
                                            setToStation(s);
                                            setToQuery('');
                                            setToSuggestions([]);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{s.name}</span>
                                            <span className="text-white/30 font-mono text-xs">{s.code}</span>
                                        </div>
                                        <span className="text-white/30 text-xs">{s.city}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Date */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="date"
                        value={date}
                        min={getDefaultDate(0)}
                        onChange={e => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                >
                    <Search className="w-4 h-4" />
                    Find Trains
                </button>
            </GlassCard>

            {/* Partner Results */}
            <AnimatePresence>
                {showPartners && fromStation && toStation && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                    >
                        {/* Route Summary */}
                        <div className="flex items-center justify-center gap-2 text-white/60 text-sm py-1">
                            <div className="text-center">
                                <span className="font-medium text-white">{fromStation.name}</span>
                                <span className="text-white/30 text-xs ml-1">({fromStation.code})</span>
                            </div>
                            <ArrowRight className="w-4 h-4 flex-shrink-0" />
                            <div className="text-center">
                                <span className="font-medium text-white">{toStation.name}</span>
                                <span className="text-white/30 text-xs ml-1">({toStation.code})</span>
                            </div>
                        </div>

                        <p className="text-white/40 text-xs px-1">
                            Book on any of these trusted platforms:
                        </p>

                        {TRAIN_PARTNERS.map(partner => (
                            <motion.div key={partner.name} variants={item}>
                                <GlassCard className="p-4 hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                                style={{ backgroundColor: partner.color + '20' }}
                                            >
                                                {partner.logo}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-white font-semibold">{partner.name}</h3>
                                                    {partner.isOfficial && (
                                                        <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] rounded-full font-medium flex items-center gap-0.5">
                                                            <Shield className="w-2.5 h-2.5" /> Official
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-white/40 text-xs">{partner.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openPartnerBooking(partner, fromStation.code, toStation.code, date)}
                                        className="w-full mt-3 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors text-white"
                                        style={{ backgroundColor: partner.color }}
                                    >
                                        {partner.isOfficial ? 'Book on IRCTC' : `Check on ${partner.name}`}
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </GlassCard>
                            </motion.div>
                        ))}

                        {/* Info Note */}
                        <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-white/40 text-xs text-center">
                                🚂 IRCTC is the official Indian Railways platform. Other platforms may offer additional features like waitlist prediction and live tracking.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
