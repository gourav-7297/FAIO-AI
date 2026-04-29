import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Plane, Search, Calendar, Users, Loader2, ArrowUpDown,
    Clock, Luggage, Filter, ChevronDown, Star, TrendingDown, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import {
    searchAirports, searchFlights, formatDuration, formatTime, isFlightConfigured,
    type Airport, type FlightResult
} from '../../services/flightService';
import { useToast } from '../../components/ui/Toast';

type TripType = 'oneWay' | 'roundTrip';
type SortBy = 'price' | 'duration' | 'departure';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export function FlightsView() {
    const { showToast } = useToast();
    const [tripType, setTripType] = useState<TripType>('oneWay');

    // Search state
    const [originQuery, setOriginQuery] = useState('');
    const [destQuery, setDestQuery] = useState('');
    const [originAirport, setOriginAirport] = useState<Airport | null>(null);
    const [destAirport, setDestAirport] = useState<Airport | null>(null);
    const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
    const [destSuggestions, setDestSuggestions] = useState<Airport[]>([]);
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);

    const [departDate, setDepartDate] = useState(getDefaultDate(1));
    const [returnDate, setReturnDate] = useState(getDefaultDate(5));
    const [passengers, setPassengers] = useState(1);

    // Results
    const [flights, setFlights] = useState<FlightResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [sortBy, setSortBy] = useState<SortBy>('price');

    // Debounce refs
    const originTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const destTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Airport auto-suggest
    const handleOriginInput = useCallback((value: string) => {
        setOriginQuery(value);
        setOriginAirport(null);
        clearTimeout(originTimer.current);
        if (value.length >= 2) {
            originTimer.current = setTimeout(async () => {
                const results = await searchAirports(value);
                setOriginSuggestions(results);
                setShowOriginDropdown(true);
            }, 300);
        } else {
            setOriginSuggestions([]);
            setShowOriginDropdown(false);
        }
    }, []);

    const handleDestInput = useCallback((value: string) => {
        setDestQuery(value);
        setDestAirport(null);
        clearTimeout(destTimer.current);
        if (value.length >= 2) {
            destTimer.current = setTimeout(async () => {
                const results = await searchAirports(value);
                setDestSuggestions(results);
                setShowDestDropdown(true);
            }, 300);
        } else {
            setDestSuggestions([]);
            setShowDestDropdown(false);
        }
    }, []);

    const selectOrigin = (airport: Airport) => {
        setOriginAirport(airport);
        setOriginQuery(airport.presentation.suggestionTitle || airport.presentation.title);
        setShowOriginDropdown(false);
    };

    const selectDest = (airport: Airport) => {
        setDestAirport(airport);
        setDestQuery(airport.presentation.suggestionTitle || airport.presentation.title);
        setShowDestDropdown(false);
    };

    // Swap origin/dest
    const swapAirports = () => {
        const tmpAirport = originAirport;
        const tmpQuery = originQuery;
        setOriginAirport(destAirport);
        setOriginQuery(destQuery);
        setDestAirport(tmpAirport);
        setDestQuery(tmpQuery);
    };

    // Search
    const handleSearch = async () => {
        let finalOrigin = originAirport;
        let finalDest = destAirport;

        setIsSearching(true);

        try {
            // Auto-resolve origin if user typed but didn't click dropdown
            if (!finalOrigin && originQuery) {
                let suggestions = originSuggestions;
                if (suggestions.length === 0) {
                    suggestions = await searchAirports(originQuery);
                }
                if (suggestions.length > 0) {
                    finalOrigin = suggestions[0];
                    setOriginAirport(finalOrigin);
                    setOriginQuery(finalOrigin.presentation.suggestionTitle || finalOrigin.presentation.title);
                }
            }

            // Auto-resolve dest if user typed but didn't click dropdown
            if (!finalDest && destQuery) {
                let suggestions = destSuggestions;
                if (suggestions.length === 0) {
                    suggestions = await searchAirports(destQuery);
                }
                if (suggestions.length > 0) {
                    finalDest = suggestions[0];
                    setDestAirport(finalDest);
                    setDestQuery(finalDest.presentation.suggestionTitle || finalDest.presentation.title);
                }
            }

            if (!finalOrigin || !finalDest) {
                showToast('Please select both origin and destination', 'error');
                setIsSearching(false);
                return;
            }

            setHasSearched(true);

            const originNav = finalOrigin.navigation?.relevantFlightParams;
            const destNav = finalDest.navigation?.relevantFlightParams;

            const result = await searchFlights(
                originNav?.skyId || finalOrigin.skyId,
                destNav?.skyId || finalDest.skyId,
                originNav?.entityId || finalOrigin.entityId,
                destNav?.entityId || finalDest.entityId,
                departDate,
                tripType === 'roundTrip' ? returnDate : undefined,
                passengers
            );

            setFlights(result.flights);

            if (result.flights.length > 0) {
                showToast(`Found ${result.flights.length} flights!`, 'success');
            } else {
                showToast('No flights found for this route', 'info');
            }
        } catch (error) {
            console.error('Flight search error:', error);
            showToast('Failed to search flights', 'error');
        } finally {
            setIsSearching(false);
        }
    };

    // Sort flights
    const sortedFlights = [...flights].sort((a, b) => {
        if (sortBy === 'price') return a.price.raw - b.price.raw;
        if (sortBy === 'duration') return (a.legs[0]?.durationInMinutes || 0) - (b.legs[0]?.durationInMinutes || 0);
        if (sortBy === 'departure') return new Date(a.legs[0]?.departure || 0).getTime() - new Date(b.legs[0]?.departure || 0).getTime();
        return 0;
    });

    const cheapest = flights.length > 0 ? Math.min(...flights.map(f => f.price.raw)) : 0;

    return (
        <div className="p-5 pt-8 space-y-6 pb-32">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
                    <Plane className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Global Airways</span>
                </div>
                <h1 className="text-3xl font-black text-stone-900 tracking-tighter">
                    Search Flights
                </h1>
                <p className="text-stone-500 text-sm mt-1 font-medium">Search real-time flight prices worldwide</p>
                {!isFlightConfigured() && (
                    <span className="inline-block mt-3 text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-black uppercase tracking-widest">Neural Mode Active</span>
                )}
            </motion.div>

            {/* Search Card */}
            <GlassCard className="p-6 space-y-5 border border-stone-100 shadow-soft">
                {/* Trip type toggle */}
                <div className="flex bg-stone-100 rounded-2xl p-1 gap-1">
                    {[
                        { value: 'oneWay' as TripType, label: 'One Way' },
                        { value: 'roundTrip' as TripType, label: 'Round Trip' },
                    ].map(t => (
                        <button
                            key={t.value}
                            onClick={() => setTripType(t.value)}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                tripType === t.value
                                    ? "bg-white text-stone-900 shadow-sm"
                                    : "text-stone-400 hover:text-stone-600"
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Origin / Destination */}
                <div className="relative space-y-3">
                    {/* Origin */}
                    <div className="relative">
                        <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 rotate-45" />
                        <input
                            type="text"
                            placeholder="Origin City / Airport"
                            value={originQuery}
                            onChange={e => handleOriginInput(e.target.value)}
                            onFocus={() => originSuggestions.length > 0 && setShowOriginDropdown(true)}
                            className="w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 font-bold placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                        />
                        {originQuery && (
                            <button onClick={() => { setOriginQuery(''); setOriginAirport(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <AirportDropdown airports={originSuggestions} show={showOriginDropdown} onSelect={selectOrigin} onClose={() => setShowOriginDropdown(false)} />
                    </div>

                    {/* Swap button */}
                    <div className="flex justify-center -my-4 relative z-10">
                        <motion.button
                            whileTap={{ rotate: 180 }}
                            onClick={swapAirports}
                            className="w-10 h-10 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 shadow-sm transition-colors"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Destination */}
                    <div className="relative">
                        <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 -rotate-45" />
                        <input
                            type="text"
                            placeholder="Destination City / Airport"
                            value={destQuery}
                            onChange={e => handleDestInput(e.target.value)}
                            onFocus={() => destSuggestions.length > 0 && setShowDestDropdown(true)}
                            className="w-full pl-11 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 font-bold placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                        />
                        {destQuery && (
                            <button onClick={() => { setDestQuery(''); setDestAirport(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <AirportDropdown airports={destSuggestions} show={showDestDropdown} onSelect={selectDest} onClose={() => setShowDestDropdown(false)} />
                    </div>
                </div>

                {/* Date + Passengers row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="date"
                            value={departDate}
                            onChange={e => setDepartDate(e.target.value)}
                            min={getDefaultDate(0)}
                            className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 text-xs font-bold focus:outline-none focus:border-stone-900 transition-colors"
                        />
                    </div>
                    {tripType === 'roundTrip' ? (
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input
                                type="date"
                                value={returnDate}
                                onChange={e => setReturnDate(e.target.value)}
                                min={departDate}
                                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 text-xs font-bold focus:outline-none focus:border-stone-900 transition-colors"
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <select
                                value={passengers}
                                onChange={e => setPassengers(Number(e.target.value))}
                                className="w-full pl-11 pr-8 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 text-xs font-bold focus:outline-none focus:border-stone-900 appearance-none transition-colors"
                            >
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Passengers row for round trip */}
                {tripType === 'roundTrip' && (
                    <div className="relative w-1/2">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <select
                            value={passengers}
                            onChange={e => setPassengers(Number(e.target.value))}
                            className="w-full pl-11 pr-8 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 text-xs font-bold focus:outline-none focus:border-stone-900 appearance-none transition-colors"
                        >
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
                    </div>
                )}

                {/* Search button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full py-5 rounded-[2rem] bg-stone-900 hover:bg-stone-800 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-stone-900/10 flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
                >
                    {isSearching ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Neural Processing...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            Commence Flight Search
                        </>
                    )}
                </motion.button>
            </GlassCard>

            {/* Results */}
            {hasSearched && !isSearching && (
                <div className="space-y-6">
                    {/* Sort pills */}
                    {flights.length > 0 && (
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                            <div className="p-2 bg-stone-50 rounded-xl border border-stone-100">
                                <Filter className="w-4 h-4 text-stone-400 flex-shrink-0" />
                            </div>
                            {[
                                { value: 'price' as SortBy, label: 'Cheapest', icon: TrendingDown },
                                { value: 'duration' as SortBy, label: 'Fastest', icon: Clock },
                                { value: 'departure' as SortBy, label: 'Earliest', icon: Calendar },
                            ].map(s => (
                                <button
                                    key={s.value}
                                    onClick={() => setSortBy(s.value)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                                        sortBy === s.value
                                            ? "bg-stone-900 text-white border-stone-900 shadow-md"
                                            : "bg-white text-stone-400 border-stone-100 hover:text-stone-900 hover:border-stone-200"
                                    )}
                                >
                                    <s.icon className="w-3.5 h-3.5" />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Flight cards */}
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                        {sortedFlights.length === 0 ? (
                            <GlassCard className="p-12 text-center border border-stone-100 shadow-soft">
                                <Plane className="w-16 h-16 text-stone-100 mx-auto mb-6" />
                                <p className="text-stone-900 font-black text-xl tracking-tight">No Routes Found</p>
                                <p className="text-stone-400 text-sm mt-1 font-medium">Try alternative dates or coordinate nodes</p>
                            </GlassCard>
                        ) : (
                            sortedFlights.map(flight => (
                                <FlightCard key={flight.id} flight={flight} isCheapest={flight.price.raw === cheapest} />
                            ))
                        )}
                    </motion.div>
                </div>
            )}

            {/* Initial state */}
            {!hasSearched && !isSearching && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Plane className="w-20 h-20 text-stone-100 mx-auto mb-6" />
                    </motion.div>
                    <p className="text-stone-400 text-sm font-black uppercase tracking-[0.2em]">Select Destination Node</p>
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        {[
                            { label: 'Delhi → Mumbai', from: 'DEL', to: 'BOM' },
                            { label: 'Bangalore → Goa', from: 'BLR', to: 'GOI' },
                            { label: 'Mumbai → Dubai', from: 'BOM', to: 'DXB' },
                        ].map(route => (
                            <button
                                key={route.label}
                                onClick={async () => {
                                    const airports = await searchAirports(route.from);
                                    const destAirports = await searchAirports(route.to);
                                    const from = airports.find(a => a.skyId === route.from) || airports[0];
                                    const to = destAirports.find(a => a.skyId === route.to) || destAirports[0];
                                    if (from && to) {
                                        setOriginAirport(from);
                                        setOriginQuery(from.presentation.suggestionTitle || from.presentation.title);
                                        setDestAirport(to);
                                        setDestQuery(to.presentation.suggestionTitle || to.presentation.title);
                                    }
                                }}
                                className="px-5 py-3 rounded-2xl bg-stone-50 text-[10px] font-black uppercase tracking-widest text-stone-400 border border-stone-100 hover:text-stone-900 hover:border-stone-900 transition-all shadow-sm"
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
// SUB-COMPONENTS
// ============================

function AirportDropdown({ airports, show, onSelect, onClose }: {
    airports: Airport[];
    show: boolean;
    onSelect: (a: Airport) => void;
    onClose: () => void;
}) {
    if (!show || airports.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-stone-100 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
        >
            {airports.slice(0, 6).map((airport, i) => (
                <button
                    key={i}
                    onClick={() => { onSelect(airport); onClose(); }}
                    className="w-full px-5 py-4 text-left hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 flex items-center gap-4"
                >
                    <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center">
                        <Plane className="w-5 h-5 text-stone-900" />
                    </div>
                    <div>
                        <p className="text-sm text-stone-900 font-black tracking-tight">{airport.presentation.title}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{airport.presentation.subtitle}</p>
                    </div>
                </button>
            ))}
        </motion.div>
    );
}

function FlightCard({ flight, isCheapest }: { flight: FlightResult; isCheapest: boolean }) {
    const leg = flight.legs[0];
    if (!leg) return null;

    const airline = leg.carriers.marketing[0];

    return (
        <motion.div variants={item}>
            <GlassCard className="p-6 relative overflow-hidden border border-stone-100 shadow-soft group hover:shadow-lg transition-all">
                {isCheapest && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm">
                        Optimum Value
                    </div>
                )}

                {/* Airline + Price */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {airline?.logoUrl ? (
                            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-50 p-2 shadow-inner flex items-center justify-center">
                                <img src={airline.logoUrl} alt={airline.name} className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center shadow-inner">
                                <Plane className="w-5 h-5 text-stone-900" />
                            </div>
                        )}
                        <div>
                            <p className="text-base font-black text-stone-900 tracking-tight">{airline?.name || 'Unknown Carrier'}</p>
                            <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">{leg.stopCount === 0 ? 'Direct Route' : `${leg.stopCount} Connection${leg.stopCount > 1 ? 's' : ''}`}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-stone-900 tracking-tighter">{flight.price.formatted}</p>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">per traveler</p>
                    </div>
                </div>

                {/* Route visualization */}
                <div className="flex items-center gap-6 py-4 bg-stone-50/50 rounded-[2rem] px-6 mb-6">
                    <div className="text-center flex-shrink-0">
                        <p className="text-xl font-black text-stone-900 tracking-tighter">{formatTime(leg.departure)}</p>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-0.5">{leg.origin.displayCode}</p>
                    </div>

                    <div className="flex-1 relative py-2">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-100" />
                        <div className="absolute top-1/2 left-0 w-2.5 h-2.5 -translate-y-1/2 bg-stone-900 rounded-full shadow-sm" />
                        <div className="absolute top-1/2 right-0 w-2.5 h-2.5 -translate-y-1/2 bg-emerald-500 rounded-full shadow-sm" />
                        <div className="text-center relative">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-stone-100 inline-block">
                                {formatDuration(leg.durationInMinutes)}
                            </p>
                        </div>
                    </div>

                    <div className="text-center flex-shrink-0">
                        <p className="text-xl font-black text-stone-900 tracking-tighter">{formatTime(leg.arrival)}</p>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-0.5">{leg.destination.displayCode}</p>
                    </div>
                </div>

                {/* Footer tags */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-stone-400">
                            <Luggage className="w-3.5 h-3.5" /> Checked Baggage
                        </span>
                        {flight.score >= 9 && (
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                <Star className="w-3.5 h-3.5 fill-amber-500" /> Premium Node
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => alert(`Initiating secure booking node for ${airline?.name} at ${flight.price.formatted}...`)}
                        className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95"
                    >
                        Secure Seat
                    </button>
                </div>
            </GlassCard>
        </motion.div>
    );
}

// ============================
// UTILS
// ============================

function getDefaultDate(daysFromNow: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
}
