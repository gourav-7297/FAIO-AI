import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bus, Search, Calendar, Loader2, Clock,
    Star, MapPin, ArrowRight, Wifi, BatteryCharging,
    ChevronDown, AlertCircle, Armchair, Moon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { searchCities, searchBuses, type BusCity, type BusResult } from '../../services/busService';
import { useToast } from '../../components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function getDefaultDate(offset: number) {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
}

const TYPE_COLORS: Record<string, string> = {
    'Sleeper': 'bg-indigo-500/20 text-indigo-300',
    'AC Sleeper': 'bg-blue-500/20 text-blue-300',
    'Semi-Sleeper': 'bg-purple-500/20 text-purple-300',
    'Seater': 'bg-emerald-500/20 text-emerald-300',
    'Volvo AC': 'bg-sky-500/20 text-sky-300',
    'Non-AC Seater': 'bg-amber-500/20 text-amber-300',
};

export function BusView() {
    const { showToast } = useToast();
    const [fromQuery, setFromQuery] = useState('');
    const [toQuery, setToQuery] = useState('');
    const [fromCity, setFromCity] = useState<string | null>(null);
    const [toCity, setToCity] = useState<string | null>(null);
    const [fromSugg, setFromSugg] = useState<BusCity[]>([]);
    const [toSugg, setToSugg] = useState<BusCity[]>([]);
    const [showFrom, setShowFrom] = useState(false);
    const [showTo, setShowTo] = useState(false);
    const [date, setDate] = useState(getDefaultDate(1));
    const [buses, setBuses] = useState<BusResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [filterType, setFilterType] = useState('all');

    const ft = useRef<ReturnType<typeof setTimeout>>(undefined);
    const tt = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleFrom = useCallback((v: string) => {
        setFromQuery(v); setFromCity(null);
        clearTimeout(ft.current);
        if (v.length < 2) { setFromSugg([]); setShowFrom(false); return; }
        ft.current = setTimeout(() => { const r = searchCities(v); setFromSugg(r); setShowFrom(r.length > 0); }, 200);
    }, []);

    const handleTo = useCallback((v: string) => {
        setToQuery(v); setToCity(null);
        clearTimeout(tt.current);
        if (v.length < 2) { setToSugg([]); setShowTo(false); return; }
        tt.current = setTimeout(() => { const r = searchCities(v); setToSugg(r); setShowTo(r.length > 0); }, 200);
    }, []);

    const handleSearch = async () => {
        let f = fromCity, t = toCity;
        if (!f && fromQuery.length >= 2) { const m = searchCities(fromQuery); if (m[0]) { f = m[0].name; setFromCity(f); setFromQuery(f); } }
        if (!t && toQuery.length >= 2) { const m = searchCities(toQuery); if (m[0]) { t = m[0].name; setToCity(t); setToQuery(t); } }
        if (!f || !t) { showToast('Select both cities', 'error'); return; }
        setIsSearching(true); setHasSearched(true);
        try {
            const results = await searchBuses(f, t, date);
            setBuses(results);
            showToast(`Found ${results.length} buses`, 'success');
        } catch { showToast('Search failed', 'error'); }
        finally { setIsSearching(false); }
    };

    const filtered = filterType === 'all' ? buses : buses.filter(b => b.type === filterType);

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Bus className="w-5 h-5 text-action" />
                    <span className="text-xs text-action font-bold uppercase tracking-wider">Inter-City</span>
                </div>
                <h1 className="text-3xl font-bold">Bus Search</h1>
                <p className="text-secondary text-sm">Compare buses across 50+ operators</p>
            </motion.header>

            <GlassCard className="p-4 mb-4 space-y-3">
                {/* From */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input value={fromQuery} onChange={e => handleFrom(e.target.value)}
                        onFocus={() => fromSugg.length > 0 && setShowFrom(true)}
                        onBlur={() => setTimeout(() => setShowFrom(false), 200)}
                        placeholder="From city"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-secondary/50 outline-none focus:border-action/50" />
                    {showFrom && (
                        <div className="absolute z-30 top-full mt-1 w-full bg-surface border border-white/10 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                            {fromSugg.map(c => (
                                <button key={c.name} onClick={() => { setFromCity(c.name); setFromQuery(c.name); setShowFrom(false); }}
                                    className="w-full px-3 py-2 text-left hover:bg-white/5">
                                    <p className="text-xs text-white">{c.name}</p>
                                    <p className="text-[10px] text-secondary">{c.state}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {/* To */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                    <input value={toQuery} onChange={e => handleTo(e.target.value)}
                        onFocus={() => toSugg.length > 0 && setShowTo(true)}
                        onBlur={() => setTimeout(() => setShowTo(false), 200)}
                        placeholder="To city"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-secondary/50 outline-none focus:border-action/50" />
                    {showTo && (
                        <div className="absolute z-30 top-full mt-1 w-full bg-surface border border-white/10 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                            {toSugg.map(c => (
                                <button key={c.name} onClick={() => { setToCity(c.name); setToQuery(c.name); setShowTo(false); }}
                                    className="w-full px-3 py-2 text-left hover:bg-white/5">
                                    <p className="text-xs text-white">{c.name}</p>
                                    <p className="text-[10px] text-secondary">{c.state}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {/* Date */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-action/50" />
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSearch} disabled={isSearching}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-action to-purple-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {isSearching ? 'Searching...' : 'Search Buses'}
                </motion.button>
            </GlassCard>

            {/* Type filter */}
            {hasSearched && buses.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                    {['all', 'Volvo AC', 'AC Sleeper', 'Sleeper', 'Semi-Sleeper', 'Seater'].map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap flex-shrink-0 transition-all",
                                filterType === t ? "bg-action text-white" : "bg-white/5 text-secondary hover:text-white")}>
                            {t === 'all' ? 'All Types' : t}
                        </button>
                    ))}
                </div>
            )}

            {isSearching && (
                <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 text-action animate-spin mx-auto mb-3" />
                    <p className="text-secondary text-sm">Finding best buses...</p>
                </div>
            )}

            {hasSearched && !isSearching && (
                <AnimatePresence mode="wait">
                    <motion.div key={filterType} variants={container} initial="hidden" animate="show" className="space-y-3">
                        {filtered.length === 0 ? (
                            <GlassCard className="p-8 text-center">
                                <AlertCircle className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                                <p className="text-secondary text-sm">No buses found</p>
                            </GlassCard>
                        ) : filtered.map(bus => <BusCard key={bus.id} bus={bus} />)}
                    </motion.div>
                </AnimatePresence>
            )}

            {!hasSearched && !isSearching && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <motion.div animate={{ x: [-3, 3, -3] }} transition={{ duration: 3, repeat: Infinity }}>
                        <Bus className="w-16 h-16 text-action/20 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-secondary text-sm">Search for buses to get started</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {[{ l: 'Mumbai → Pune', f: 'Mumbai', t: 'Pune' }, { l: 'Bangalore → Goa', f: 'Bangalore', t: 'Goa' }, { l: 'Delhi → Jaipur', f: 'Delhi', t: 'Jaipur' }].map(r => (
                            <button key={r.l} onClick={() => { setFromCity(r.f); setFromQuery(r.f); setToCity(r.t); setToQuery(r.t); }}
                                className="px-3 py-1.5 rounded-full bg-white/5 text-xs text-secondary border border-white/10 hover:text-white hover:border-action/30 transition-colors">
                                {r.l}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function BusCard({ bus }: { bus: BusResult }) {
    const [expanded, setExpanded] = useState(false);
    const amenityIcon = (a: string) => {
        if (a === 'WiFi') return <Wifi className="w-2.5 h-2.5" />;
        if (a === 'Charging') return <BatteryCharging className="w-2.5 h-2.5" />;
        if (a.includes('Blanket') || a.includes('Snack')) return <Moon className="w-2.5 h-2.5" />;
        return <Armchair className="w-2.5 h-2.5" />;
    };

    return (
        <motion.div variants={item}>
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold", TYPE_COLORS[bus.type] || 'bg-white/10 text-white')}>
                                {bus.type}
                            </span>
                            {bus.isAC && <span className="text-[9px] text-sky-400 font-bold">❄ AC</span>}
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] text-secondary">{bus.rating} ({bus.totalRatings})</span>
                        </div>
                    </div>

                    <p className="text-sm font-bold text-white mb-2">{bus.operator}</p>

                    <div className="flex items-center gap-3">
                        <div className="text-center">
                            <p className="text-lg font-bold text-white">{bus.departure}</p>
                            <p className="text-[9px] text-secondary">{bus.from}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-1 px-2">
                            <div className="flex-1 h-px bg-white/20" />
                            <div className="flex flex-col items-center">
                                <Clock className="w-3 h-3 text-secondary mb-0.5" />
                                <span className="text-[9px] text-secondary whitespace-nowrap">{bus.duration}</span>
                            </div>
                            <div className="flex-1 h-px bg-white/20" />
                            <ArrowRight className="w-3 h-3 text-action" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-white">{bus.arrival}</p>
                            <p className="text-[9px] text-secondary">{bus.to}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-1.5">
                            {bus.amenities.slice(0, 4).map(a => (
                                <span key={a} className="flex items-center gap-0.5 text-[9px] text-secondary bg-white/5 px-1.5 py-0.5 rounded">
                                    {amenityIcon(a)} {a}
                                </span>
                            ))}
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-action">₹{bus.price.toLocaleString()}</p>
                            <p className={cn("text-[9px] font-bold", bus.seatsAvailable > 10 ? "text-emerald-400" : bus.seatsAvailable > 0 ? "text-amber-400" : "text-rose-400")}>
                                {bus.seatsAvailable > 0 ? `${bus.seatsAvailable} seats` : 'Sold out'}
                            </p>
                        </div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-secondary mx-auto mt-1 transition-transform", expanded && "rotate-180")} />
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5 p-3 space-y-2">
                            <div>
                                <p className="text-[10px] text-secondary mb-1">Boarding Points</p>
                                <div className="flex flex-wrap gap-1">
                                    {bus.boardingPoints.map(p => <span key={p} className="text-[9px] bg-white/5 px-2 py-1 rounded text-white">{p}</span>)}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-secondary mb-1">Dropping Points</p>
                                <div className="flex flex-wrap gap-1">
                                    {bus.droppingPoints.map(p => <span key={p} className="text-[9px] bg-white/5 px-2 py-1 rounded text-white">{p}</span>)}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-secondary mb-1">All Amenities</p>
                                <div className="flex flex-wrap gap-1">
                                    {bus.amenities.map(a => (
                                        <span key={a} className="flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                            {amenityIcon(a)} {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.div>
    );
}
