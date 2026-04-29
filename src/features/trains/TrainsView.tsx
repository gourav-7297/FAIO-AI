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
        <div className="space-y-6 pb-24 p-5">
            {/* Header */}
            <div className="text-center pt-8 pb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
                    <Train className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Train Booking</span>
                </div>
                <h2 className="text-3xl font-black text-stone-900 tracking-tighter">Search & Book Trains</h2>
                <p className="text-stone-500 text-sm mt-1 font-medium">
                    Find trains via IRCTC and trusted platforms
                </p>
            </div>

            {/* Search Form */}
            <GlassCard className="p-6 space-y-4 border border-stone-100 shadow-soft">
                {/* From Station */}
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input
                        value={fromStation ? `${fromStation.name} (${fromStation.code})` : fromQuery}
                        onChange={e => handleFromChange(e.target.value)}
                        placeholder="From station..."
                        className="w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 font-bold placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    <AnimatePresence>
                        {fromSuggestions.length > 0 && !fromStation && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 left-0 right-0 top-full mt-2 bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-2xl"
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
                                        className="w-full text-left px-5 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">{s.name}</span>
                                            <span className="text-stone-400 font-black text-[10px] uppercase">{s.code}</span>
                                        </div>
                                        <span className="text-stone-400 text-[10px] font-bold">{s.city}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Arrow */}
                <div className="flex justify-center -my-2 relative z-10">
                    <div className="p-2 rounded-2xl bg-white border border-stone-100 shadow-sm">
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                    </div>
                </div>

                {/* To Station */}
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    <input
                        ref={toRef}
                        value={toStation ? `${toStation.name} (${toStation.code})` : toQuery}
                        onChange={e => handleToChange(e.target.value)}
                        placeholder="To station..."
                        className="w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 font-bold placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    <AnimatePresence>
                        {toSuggestions.length > 0 && !toStation && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 left-0 right-0 top-full mt-2 bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-2xl"
                            >
                                {toSuggestions.map(s => (
                                    <button
                                        key={s.code}
                                        onClick={() => {
                                            setToStation(s);
                                            setToQuery('');
                                            setToSuggestions([]);
                                        }}
                                        className="w-full text-left px-5 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">{s.name}</span>
                                            <span className="text-stone-400 font-black text-[10px] uppercase">{s.code}</span>
                                        </div>
                                        <span className="text-stone-400 text-[10px] font-bold">{s.city}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Date */}
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="date"
                        value={date}
                        min={getDefaultDate(0)}
                        onChange={e => setDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 font-bold focus:outline-none focus:border-stone-900 transition-colors"
                    />
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="w-full py-5 bg-stone-900 hover:bg-stone-800 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-stone-900/10 transition-all"
                >
                    <Search className="w-4 h-4" />
                    Commence Search
                </button>
            </GlassCard>

            {/* Partner Results */}
            <AnimatePresence>
                {showPartners && fromStation && toStation && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                    >
                        {/* Route Summary */}
                        <div className="flex items-center justify-center gap-3 text-stone-500 text-sm py-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <div className="text-center">
                                <span className="font-black text-stone-900">{fromStation.name}</span>
                                <span className="text-stone-400 text-[10px] font-black ml-1 uppercase">{fromStation.code}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-stone-300" />
                            <div className="text-center">
                                <span className="font-black text-stone-900">{toStation.name}</span>
                                <span className="text-stone-400 text-[10px] font-black ml-1 uppercase">{toStation.code}</span>
                            </div>
                        </div>

                        <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest px-1">
                            Available Booking Nodes
                        </p>

                        {TRAIN_PARTNERS.map(partner => (
                            <motion.div key={partner.name} variants={item}>
                                <GlassCard className="p-6 hover:bg-white transition-all border border-stone-100 shadow-soft group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner"
                                                style={{ backgroundColor: partner.color + '10' }}
                                            >
                                                {partner.logo}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-stone-900 font-black tracking-tight">{partner.name}</h3>
                                                    {partner.isOfficial && (
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] rounded-full font-black uppercase tracking-tighter flex items-center gap-1">
                                                            <Shield className="w-2.5 h-2.5" /> Official
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-stone-400 text-[11px] font-medium leading-relaxed">{partner.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openPartnerBooking(partner, fromStation.code, toStation.code, date)}
                                        className="w-full mt-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-white shadow-lg group-hover:scale-[1.02]"
                                        style={{ backgroundColor: partner.color }}
                                    >
                                        {partner.isOfficial ? 'Book on IRCTC' : `Check on ${partner.name}`}
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </GlassCard>
                            </motion.div>
                        ))}

                        {/* Info Note */}
                        <div className="px-6 py-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <p className="text-stone-400 text-[10px] font-bold text-center leading-relaxed">
                                IRCTC is the official Indian Railways platform. Other platforms may offer additional features like waitlist prediction and live tracking.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
