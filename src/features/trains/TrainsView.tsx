import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Train, Search, Calendar, Loader2, Clock,
    Star, MapPin, ArrowRight, Coffee, Users,
    ChevronDown, AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import {
    searchStations, searchTrains,
    type Station, type TrainResult, type TrainClass
} from '../../services/trainService';
import { useToast } from '../../components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function getDefaultDate(offsetDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
}

const TYPE_COLORS: Record<string, string> = {
    Rajdhani: 'bg-rose-500/20 text-rose-300',
    Shatabdi: 'bg-blue-500/20 text-blue-300',
    Duronto: 'bg-purple-500/20 text-purple-300',
    Express: 'bg-emerald-500/20 text-emerald-300',
    Superfast: 'bg-amber-500/20 text-amber-300',
    Local: 'bg-slate-500/20 text-slate-300',
};

export function TrainsView() {
    const { showToast } = useToast();

    // Station search state
    const [fromQuery, setFromQuery] = useState('');
    const [toQuery, setToQuery] = useState('');
    const [fromStation, setFromStation] = useState<Station | null>(null);
    const [toStation, setToStation] = useState<Station | null>(null);
    const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);
    const [toSuggestions, setToSuggestions] = useState<Station[]>([]);
    const [showFromDrop, setShowFromDrop] = useState(false);
    const [showToDrop, setShowToDrop] = useState(false);

    const [travelDate, setTravelDate] = useState(getDefaultDate(1));

    // Results
    const [trains, setTrains] = useState<TrainResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string>('all');

    // Debounce
    const fromTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const toTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleFromInput = useCallback((value: string) => {
        setFromQuery(value);
        setFromStation(null);
        clearTimeout(fromTimer.current);
        if (value.length < 2) { setFromSuggestions([]); setShowFromDrop(false); return; }
        fromTimer.current = setTimeout(() => {
            const results = searchStations(value);
            setFromSuggestions(results);
            setShowFromDrop(results.length > 0);
        }, 200);
    }, []);

    const handleToInput = useCallback((value: string) => {
        setToQuery(value);
        setToStation(null);
        clearTimeout(toTimer.current);
        if (value.length < 2) { setToSuggestions([]); setShowToDrop(false); return; }
        toTimer.current = setTimeout(() => {
            const results = searchStations(value);
            setToSuggestions(results);
            setShowToDrop(results.length > 0);
        }, 200);
    }, []);

    const handleSearch = async () => {
        // Auto-match typed text if user didn't click a suggestion
        let resolvedFrom = fromStation;
        let resolvedTo = toStation;

        if (!resolvedFrom && fromQuery.length >= 2) {
            const matches = searchStations(fromQuery);
            if (matches.length > 0) {
                resolvedFrom = matches[0];
                setFromStation(matches[0]);
                setFromQuery(`${matches[0].name} (${matches[0].code})`);
            }
        }
        if (!resolvedTo && toQuery.length >= 2) {
            const matches = searchStations(toQuery);
            if (matches.length > 0) {
                resolvedTo = matches[0];
                setToStation(matches[0]);
                setToQuery(`${matches[0].name} (${matches[0].code})`);
            }
        }

        if (!resolvedFrom || !resolvedTo) {
            showToast('Select both stations', 'error');
            return;
        }
        setIsSearching(true);
        setHasSearched(true);
        try {
            const results = await searchTrains(resolvedFrom.code, resolvedTo.code, travelDate);
            setTrains(results);
            showToast(`Found ${results.length} trains`, 'success');
        } catch {
            showToast('Search failed', 'error');
        } finally {
            setIsSearching(false);
        }
    };

    const filteredTrains = selectedClass === 'all'
        ? trains
        : trains.filter(t => t.classes.some(c => c.code === selectedClass));

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            {/* Header */}
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Train className="w-5 h-5 text-action" />
                    <span className="text-xs text-action font-bold uppercase tracking-wider">Indian Railways</span>
                </div>
                <h1 className="text-3xl font-bold">Trains</h1>
                <p className="text-secondary text-sm">Search trains across 70,000+ routes</p>
            </motion.header>

            {/* Search Card */}
            <GlassCard className="p-4 mb-4 space-y-3">
                {/* From */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input
                        value={fromQuery}
                        onChange={e => handleFromInput(e.target.value)}
                        onFocus={() => fromSuggestions.length > 0 && setShowFromDrop(true)}
                        onBlur={() => setTimeout(() => setShowFromDrop(false), 200)}
                        placeholder="From station"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-secondary/50 outline-none focus:border-action/50"
                    />
                    {showFromDrop && (
                        <div className="absolute z-30 top-full mt-1 w-full bg-surface border border-white/10 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                            {fromSuggestions.map(s => (
                                <button key={s.code} onClick={() => { setFromStation(s); setFromQuery(`${s.name} (${s.code})`); setShowFromDrop(false); }}
                                    className="w-full px-3 py-2 text-left hover:bg-white/5 flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-action">{s.code}</span>
                                    <div>
                                        <p className="text-xs text-white">{s.name}</p>
                                        <p className="text-[10px] text-secondary">{s.city}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* To */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                    <input
                        value={toQuery}
                        onChange={e => handleToInput(e.target.value)}
                        onFocus={() => toSuggestions.length > 0 && setShowToDrop(true)}
                        onBlur={() => setTimeout(() => setShowToDrop(false), 200)}
                        placeholder="To station"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-secondary/50 outline-none focus:border-action/50"
                    />
                    {showToDrop && (
                        <div className="absolute z-30 top-full mt-1 w-full bg-surface border border-white/10 rounded-xl overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                            {toSuggestions.map(s => (
                                <button key={s.code} onClick={() => { setToStation(s); setToQuery(`${s.name} (${s.code})`); setShowToDrop(false); }}
                                    className="w-full px-3 py-2 text-left hover:bg-white/5 flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-action">{s.code}</span>
                                    <div>
                                        <p className="text-xs text-white">{s.name}</p>
                                        <p className="text-[10px] text-secondary">{s.city}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-action/50"
                    />
                </div>

                {/* Search Button */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSearch} disabled={isSearching}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-action to-purple-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {isSearching ? 'Searching...' : 'Search Trains'}
                </motion.button>
            </GlassCard>

            {/* Class Filter */}
            {hasSearched && trains.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                    {['all', '1A', '2A', '3A', 'SL', 'CC', 'EC'].map(cls => (
                        <button key={cls} onClick={() => setSelectedClass(cls)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap flex-shrink-0 transition-all",
                                selectedClass === cls ? "bg-action text-white" : "bg-white/5 text-secondary hover:text-white"
                            )}
                        >
                            {cls === 'all' ? 'All Classes' : cls}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading */}
            {isSearching && (
                <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 text-action animate-spin mx-auto mb-3" />
                    <p className="text-secondary text-sm">Searching trains...</p>
                </div>
            )}

            {/* Results */}
            {hasSearched && !isSearching && (
                <AnimatePresence mode="wait">
                    <motion.div key={selectedClass} variants={container} initial="hidden" animate="show" className="space-y-3">
                        {filteredTrains.length === 0 ? (
                            <GlassCard className="p-8 text-center">
                                <AlertCircle className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                                <p className="text-secondary text-sm">No trains found for this class</p>
                            </GlassCard>
                        ) : (
                            filteredTrains.map((train) => (
                                <TrainCard key={train.id} train={train} />
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Initial state */}
            {!hasSearched && !isSearching && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <motion.div animate={{ x: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}>
                        <Train className="w-16 h-16 text-action/20 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-secondary text-sm">Search for trains to get started</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {[
                            { label: 'Delhi → Mumbai', from: 'NDLS', to: 'BCT' },
                            { label: 'Kolkata → Delhi', from: 'HWH', to: 'NDLS' },
                            { label: 'Bangalore → Chennai', from: 'SBC', to: 'MAS' },
                        ].map(route => (
                            <button key={route.label}
                                onClick={() => {
                                    const fromS = searchStations(route.from);
                                    const toS = searchStations(route.to);
                                    if (fromS[0]) { setFromStation(fromS[0]); setFromQuery(`${fromS[0].name} (${fromS[0].code})`); }
                                    if (toS[0]) { setToStation(toS[0]); setToQuery(`${toS[0].name} (${toS[0].code})`); }
                                }}
                                className="px-3 py-1.5 rounded-full bg-white/5 text-xs text-secondary border border-white/10 hover:text-white hover:border-action/30 transition-colors"
                            >
                                {route.label}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// ============================
// TRAIN CARD
// ============================

function TrainCard({ train }: { train: TrainResult }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div variants={item}>
            <GlassCard className="p-0 overflow-hidden">
                {/* Main info */}
                <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold", TYPE_COLORS[train.type])}>
                                {train.type}
                            </span>
                            <span className="text-[10px] text-secondary font-mono">#{train.trainNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] text-secondary">{train.rating}</span>
                        </div>
                    </div>

                    <p className="text-sm font-bold text-white mb-2">{train.trainName}</p>

                    <div className="flex items-center gap-3">
                        <div className="text-center">
                            <p className="text-lg font-bold text-white">{train.departure}</p>
                            <p className="text-[9px] text-secondary">{train.from.code}</p>
                        </div>

                        <div className="flex-1 flex items-center gap-1 px-2">
                            <div className="flex-1 h-px bg-white/20" />
                            <div className="flex flex-col items-center">
                                <Clock className="w-3 h-3 text-secondary mb-0.5" />
                                <span className="text-[9px] text-secondary whitespace-nowrap">{train.duration}</span>
                            </div>
                            <div className="flex-1 h-px bg-white/20" />
                            <ArrowRight className="w-3 h-3 text-action" />
                        </div>

                        <div className="text-center">
                            <p className="text-lg font-bold text-white">{train.arrival}</p>
                            <p className="text-[9px] text-secondary">{train.to.code}</p>
                        </div>
                    </div>

                    {/* Quick class prices */}
                    <div className="flex gap-2 mt-2">
                        {train.classes.slice(0, 3).map(cls => (
                            <div key={cls.code} className="flex items-center gap-1">
                                <span className="text-[9px] font-bold text-secondary">{cls.code}</span>
                                <span className="text-[10px] text-action font-bold">₹{cls.price.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] text-secondary flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {train.distance} km
                        </span>
                        {train.pantryAvailable && (
                            <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                                <Coffee className="w-2.5 h-2.5" /> Pantry
                            </span>
                        )}
                        <span className="text-[9px] text-secondary flex items-center gap-0.5">
                            <ChevronDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} />
                        </span>
                    </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5"
                        >
                            <div className="p-3 space-y-2">
                                {/* Running days */}
                                <div>
                                    <p className="text-[10px] text-secondary mb-1">Running Days</p>
                                    <div className="flex gap-1">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <span key={day} className={cn(
                                                "w-7 h-7 rounded-lg text-[9px] font-bold flex items-center justify-center",
                                                train.daysOfWeek.includes(day) || train.daysOfWeek.includes('Daily')
                                                    ? "bg-action/20 text-action"
                                                    : "bg-white/5 text-secondary/40"
                                            )}>
                                                {day.charAt(0)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Class details */}
                                <div>
                                    <p className="text-[10px] text-secondary mb-1">Available Classes</p>
                                    <div className="grid gap-1.5">
                                        {train.classes.map(cls => (
                                            <ClassRow key={cls.code} cls={cls} />
                                        ))}
                                    </div>
                                </div>

                                {/* Route */}
                                <div className="flex items-center gap-2 text-[10px] text-secondary">
                                    <span>{train.from.name}</span>
                                    <ArrowRight className="w-3 h-3 text-action" />
                                    <span>{train.to.name}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.div>
    );
}

function ClassRow({ cls }: { cls: TrainClass }) {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white bg-action/20 px-1.5 py-0.5 rounded">{cls.code}</span>
                <span className="text-[10px] text-secondary">{cls.name}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className={cn(
                    "text-[9px] font-bold flex items-center gap-0.5",
                    cls.available > 10 ? "text-emerald-400" : cls.available > 0 ? "text-amber-400" : "text-rose-400"
                )}>
                    <Users className="w-2.5 h-2.5" />
                    {cls.available > 0 ? `${cls.available} avl` : `WL ${cls.waitlist || 0}`}
                </span>
                <span className="text-sm font-bold text-action">₹{cls.price.toLocaleString()}</span>
            </div>
        </div>
    );
}
