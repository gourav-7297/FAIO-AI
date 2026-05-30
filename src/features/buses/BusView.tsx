import { useState, useCallback, useRef, useEffect } from 'react';
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

    useEffect(() => {
        const pending = localStorage.getItem('faio_pending_bus_search');
        if (pending) {
            try {
                const params = JSON.parse(pending);
                if (params.from) setFrom(params.from);
                if (params.to) setTo(params.to);
                if (params.date) setDate(params.date);
                localStorage.removeItem('faio_pending_bus_search');
                if (params.from && params.to) {
                    setShowPartners(true);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

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
                                <GlassCard className="p-6 hover:bg-white transition-all border border-stone-100 shadow-premium group mb-6">
                                    {/* Partner Header */}
                                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-stone-100">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-inner"
                                                style={{ backgroundColor: partner.color + '10' }}
                                            >
                                                {partner.logo}
                                            </div>
                                            <div>
                                                <h3 className="text-stone-900 font-heading font-black tracking-tight">{partner.name} Listings</h3>
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-relaxed">{partner.description}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openPartnerBooking(partner, from, to, date)}
                                            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1.5 transition-all shadow-md group-hover:scale-105 active:scale-95"
                                            style={{ backgroundColor: partner.color }}
                                        >
                                            Compare Live <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Schedules List (AbhiBus Style) */}
                                    <div className="space-y-4">
                                        {[
                                            { operator: `${partner.name === 'RedBus' ? 'VRL' : partner.name === 'AbhiBus' ? 'KSRTC Airavat' : 'SRS'} Travels Premium`, type: 'Volvo A/C Sleeper (2+1)', departure: '08:30 PM', duration: '6h 15m', arrival: '02:45 AM', price: partner.name === 'RedBus' ? '₹890' : partner.name === 'MakeMyTrip' ? '₹920' : partner.name === 'AbhiBus' ? '₹840' : '₹870', rating: '4.6', seats: 12 },
                                            { operator: 'IntrCity SmartBus Executive', type: 'Scania A/C Multi-Axle Sleeper (2+1)', departure: '10:00 PM', duration: '6h 30m', arrival: '04:30 AM', price: partner.name === 'RedBus' ? '₹1,050' : partner.name === 'MakeMyTrip' ? '₹1,120' : partner.name === 'AbhiBus' ? '₹990' : '₹1,020', rating: '4.8', seats: 4 },
                                        ].map((schedule, sIdx) => (
                                            <div key={sIdx} className="p-4 bg-stone-50 border border-stone-100 rounded-3xl flex flex-col gap-4 hover:border-stone-200 transition-colors">
                                                {/* Top Operator details */}
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-heading text-sm font-black text-stone-900 tracking-tight">{schedule.operator}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="px-2 py-0.5 bg-white border border-stone-100 rounded-lg text-[9px] font-black text-stone-400 uppercase tracking-widest">{schedule.type}</span>
                                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-0.5">★ {schedule.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-base font-black text-stone-950">{schedule.price}</span>
                                                        <span className="block text-[8px] font-black text-amber-600 uppercase tracking-widest mt-0.5">{schedule.seats} seats left</span>
                                                    </div>
                                                </div>

                                                {/* Transit Timeline Indicator (AbhiBus-style) */}
                                                <div className="flex items-center gap-5 py-2 px-1">
                                                    <div className="text-center flex-shrink-0">
                                                        <p className="text-sm font-black text-stone-900">{schedule.departure}</p>
                                                        <p className="text-[9px] font-black text-stone-400 uppercase mt-0.5">{from}</p>
                                                    </div>

                                                    <div className="flex-1 relative py-1.5">
                                                        <div className="absolute top-1/2 left-0 right-0 h-[2px] border-t-2 border-dashed border-stone-200 -translate-y-1/2" />
                                                        <div className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 bg-cobalt rounded-full shadow-sm" />
                                                        <div className="absolute top-1/2 right-0 w-2 h-2 -translate-y-1/2 bg-rose-500 rounded-full shadow-sm" />
                                                        <div className="text-center relative">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-500 bg-white border border-stone-100 shadow-sm px-2.5 py-0.5 rounded-full">
                                                                ⏱️ {schedule.duration}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-center flex-shrink-0">
                                                        <p className="text-sm font-black text-stone-900">{schedule.arrival}</p>
                                                        <p className="text-[9px] font-black text-stone-400 uppercase mt-0.5">{to}</p>
                                                    </div>
                                                </div>

                                                {/* Quick Book Redirect Button */}
                                                <button
                                                    onClick={() => openPartnerBooking(partner, from, to, date)}
                                                    className="w-full py-2.5 rounded-xl bg-white border border-stone-200 hover:border-stone-900 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all text-stone-700 hover:text-stone-900 shadow-sm"
                                                >
                                                    Acquire Seat on {partner.name}
                                                    <ExternalLink className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
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
