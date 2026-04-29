import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bus, Search, Calendar, MapPin, ArrowRight,
    ExternalLink, ChevronDown
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { searchCities, type BusCity, BUS_PARTNERS, openPartnerBooking } from '../../services/busService';
import { useToast } from '../../components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function getDefaultDate(offset: number) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
}

export default function BusView() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState(getDefaultDate(1));
    const [fromSuggestions, setFromSuggestions] = useState<BusCity[]>([]);
    const [toSuggestions, setToSuggestions] = useState<BusCity[]>([]);
    const [showPartners, setShowPartners] = useState(false);
    const fromRef = useRef<HTMLInputElement>(null);
    const toRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleFromChange = useCallback((value: string) => {
        setFrom(value);
        setFromSuggestions(searchCities(value));
    }, []);

    const handleToChange = useCallback((value: string) => {
        setTo(value);
        setToSuggestions(searchCities(value));
    }, []);

    const handleSearch = () => {
        if (!from.trim() || !to.trim()) {
            showToast('Please enter both cities', 'error');
            return;
        }
        if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
            showToast('From and To cities must be different', 'error');
            return;
        }
        setShowPartners(true);
    };

    return (
        <div className="space-y-6 pb-24 p-5">
            {/* Header */}
            <div className="text-center pt-8 pb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                    <Bus className="w-4 h-4 text-indigo-600" />
                    <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Bus Booking</span>
                </div>
                <h2 className="text-3xl font-black text-stone-900 tracking-tighter">Search & Book Buses</h2>
                <p className="text-stone-500 text-sm mt-1 font-medium">
                    Find the best deals from top platforms
                </p>
            </div>

            {/* Search Form */}
            <GlassCard className="p-6 space-y-4 border border-stone-100 shadow-soft">
                {/* From */}
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input
                        ref={fromRef}
                        value={from}
                        onChange={e => handleFromChange(e.target.value)}
                        placeholder="From city..."
                        className="w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 font-bold placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    <AnimatePresence>
                        {fromSuggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 left-0 right-0 top-full mt-2 bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-2xl"
                            >
                                {fromSuggestions.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => { setFrom(c.name); setFromSuggestions([]); toRef.current?.focus(); }}
                                        className="w-full text-left px-5 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors flex justify-between border-b border-stone-50 last:border-0"
                                    >
                                        <span className="font-bold">{c.name}</span>
                                        <span className="text-stone-400 text-[10px] font-black uppercase">{c.state}</span>
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

                {/* To */}
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    <input
                        ref={toRef}
                        value={to}
                        onChange={e => handleToChange(e.target.value)}
                        placeholder="To city..."
                        className="w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 font-bold placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    <AnimatePresence>
                        {toSuggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 left-0 right-0 top-full mt-2 bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-2xl"
                            >
                                {toSuggestions.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => { setTo(c.name); setToSuggestions([]); }}
                                        className="w-full text-left px-5 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors flex justify-between border-b border-stone-50 last:border-0"
                                    >
                                        <span className="font-bold">{c.name}</span>
                                        <span className="text-stone-400 text-[10px] font-black uppercase">{c.state}</span>
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
                    Find Buses
                </button>
            </GlassCard>

            {/* Partner Results */}
            <AnimatePresence>
                {showPartners && (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                    >
                        {/* Route Summary */}
                        <div className="flex items-center justify-center gap-3 text-stone-500 text-sm py-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <span className="font-black text-stone-900">{from}</span>
                            <ArrowRight className="w-4 h-4 text-stone-300" />
                            <span className="font-black text-stone-900">{to}</span>
                        </div>

                        <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest px-1">
                            Available Booking Nodes
                        </p>

                        {BUS_PARTNERS.map(partner => (
                            <motion.div key={partner.name} variants={item}>
                                <GlassCard className="p-6 hover:bg-white transition-all border border-stone-100 shadow-soft group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner"
                                                style={{ backgroundColor: partner.color + '10' }}
                                            >
                                                {partner.logo}
                                            </div>
                                            <div>
                                                <h3 className="text-stone-900 font-black tracking-tight">{partner.name}</h3>
                                                <p className="text-stone-400 text-[11px] font-medium leading-relaxed">{partner.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openPartnerBooking(partner, from, to, date)}
                                        className="w-full mt-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-white shadow-lg group-hover:scale-[1.02]"
                                        style={{ backgroundColor: partner.color }}
                                    >
                                        Book on {partner.name}
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </GlassCard>
                            </motion.div>
                        ))}

                        {/* Info Note */}
                        <div className="px-6 py-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <p className="text-stone-400 text-[10px] font-bold text-center leading-relaxed">
                                💡 You'll be redirected to the partner app/website. Prices and availability are live.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
