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
        <div className="space-y-4 pb-24">
            {/* Header */}
            <div className="text-center pt-2 pb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3">
                    <Bus className="w-4 h-4 text-indigo-400" />
                    <span className="text-indigo-300 text-sm font-medium">Bus Booking</span>
                </div>
                <h2 className="text-xl font-bold text-white">Search & Book Buses</h2>
                <p className="text-white/50 text-sm mt-1">
                    Find the best deals from top platforms
                </p>
            </div>

            {/* Search Form */}
            <GlassCard className="p-4 space-y-3">
                {/* From */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                    <input
                        ref={fromRef}
                        value={from}
                        onChange={e => handleFromChange(e.target.value)}
                        placeholder="From city..."
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30"
                    />
                    <AnimatePresence>
                        {fromSuggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 left-0 right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                            >
                                {fromSuggestions.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => { setFrom(c.name); setFromSuggestions([]); toRef.current?.focus(); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 transition-colors flex justify-between"
                                    >
                                        <span>{c.name}</span>
                                        <span className="text-white/30">{c.state}</span>
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

                {/* To */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                    <input
                        ref={toRef}
                        value={to}
                        onChange={e => handleToChange(e.target.value)}
                        placeholder="To city..."
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30"
                    />
                    <AnimatePresence>
                        {toSuggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute z-20 left-0 right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                            >
                                {toSuggestions.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => { setTo(c.name); setToSuggestions([]); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 transition-colors flex justify-between"
                                    >
                                        <span>{c.name}</span>
                                        <span className="text-white/30">{c.state}</span>
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
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
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
                        className="space-y-3"
                    >
                        {/* Route Summary */}
                        <div className="flex items-center justify-center gap-2 text-white/60 text-sm py-1">
                            <span className="font-medium text-white">{from}</span>
                            <ArrowRight className="w-4 h-4" />
                            <span className="font-medium text-white">{to}</span>
                        </div>

                        <p className="text-white/40 text-xs px-1">
                            Book on any of these trusted platforms:
                        </p>

                        {BUS_PARTNERS.map(partner => (
                            <motion.div key={partner.name} variants={item}>
                                <GlassCard className="p-4 hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                                style={{ backgroundColor: partner.color + '20' }}
                                            >
                                                {partner.logo}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold">{partner.name}</h3>
                                                <p className="text-white/40 text-xs">{partner.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openPartnerBooking(partner, from, to, date)}
                                        className="w-full mt-3 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors text-white"
                                        style={{ backgroundColor: partner.color }}
                                    >
                                        Book on {partner.name}
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </GlassCard>
                            </motion.div>
                        ))}

                        {/* Info Note */}
                        <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-white/40 text-xs text-center">
                                💡 You'll be redirected to the partner app/website. Prices and availability are live.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
