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
        if (!originAirport || !destAirport) {
            showToast('Please select both origin and destination', 'error');
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            const originNav = originAirport.navigation?.relevantFlightParams;
            const destNav = destAirport.navigation?.relevantFlightParams;

            const result = await searchFlights(
                originNav?.skyId || originAirport.skyId,
                destNav?.skyId || destAirport.skyId,
                originNav?.entityId || originAirport.entityId,
                destNav?.entityId || destAirport.entityId,
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
        <div className="p-4 space-y-4 pb-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Plane className="w-6 h-6 text-action" />
                        Flights
                    </h1>
                    <p className="text-secondary text-sm mt-0.5">Search real-time flight prices</p>
                </div>
                {!isFlightConfigured() && (
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">Mock Mode</span>
                )}
            </motion.div>

            {/* Search Card */}
            <GlassCard className="p-4 space-y-3">
                {/* Trip type toggle */}
                <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                    {[
                        { value: 'oneWay' as TripType, label: 'One Way' },
                        { value: 'roundTrip' as TripType, label: 'Round Trip' },
                    ].map(t => (
                        <button
                            key={t.value}
                            onClick={() => setTripType(t.value)}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                tripType === t.value
                                    ? "bg-action text-white shadow-lg shadow-action/30"
                                    : "text-secondary hover:text-white"
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Origin / Destination */}
                <div className="relative space-y-2">
                    {/* Origin */}
                    <div className="relative">
                        <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-action rotate-45" />
                        <input
                            type="text"
                            placeholder="From — City or Airport"
                            value={originQuery}
                            onChange={e => handleOriginInput(e.target.value)}
                            onFocus={() => originSuggestions.length > 0 && setShowOriginDropdown(true)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-secondary/50 outline-none focus:border-action/50 text-sm"
                        />
                        {originQuery && (
                            <button onClick={() => { setOriginQuery(''); setOriginAirport(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <AirportDropdown airports={originSuggestions} show={showOriginDropdown} onSelect={selectOrigin} onClose={() => setShowOriginDropdown(false)} />
                    </div>

                    {/* Swap button */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        <motion.button
                            whileTap={{ rotate: 180 }}
                            onClick={swapAirports}
                            className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-secondary hover:text-action transition-colors"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                        </motion.button>
                    </div>

                    {/* Destination */}
                    <div className="relative">
                        <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 -rotate-45" />
                        <input
                            type="text"
                            placeholder="To — City or Airport"
                            value={destQuery}
                            onChange={e => handleDestInput(e.target.value)}
                            onFocus={() => destSuggestions.length > 0 && setShowDestDropdown(true)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-secondary/50 outline-none focus:border-action/50 text-sm"
                        />
                        {destQuery && (
                            <button onClick={() => { setDestQuery(''); setDestAirport(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <AirportDropdown airports={destSuggestions} show={showDestDropdown} onSelect={selectDest} onClose={() => setShowDestDropdown(false)} />
                    </div>
                </div>

                {/* Date + Passengers row */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <input
                            type="date"
                            value={departDate}
                            onChange={e => setDepartDate(e.target.value)}
                            min={getDefaultDate(0)}
                            className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-action/50 [color-scheme:dark]"
                        />
                    </div>
                    {tripType === 'roundTrip' ? (
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                            <input
                                type="date"
                                value={returnDate}
                                onChange={e => setReturnDate(e.target.value)}
                                min={departDate}
                                className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-action/50 [color-scheme:dark]"
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                            <select
                                value={passengers}
                                onChange={e => setPassengers(Number(e.target.value))}
                                className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-action/50 appearance-none [color-scheme:dark]"
                            >
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <option key={n} value={n} className="bg-background">{n} Passenger{n > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Passengers row for round trip */}
                {tripType === 'roundTrip' && (
                    <div className="relative w-1/2">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <select
                            value={passengers}
                            onChange={e => setPassengers(Number(e.target.value))}
                            className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-action/50 appearance-none [color-scheme:dark]"
                        >
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <option key={n} value={n} className="bg-background">{n} Passenger{n > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none" />
                    </div>
                )}

                {/* Search button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-action to-purple-500 text-white font-bold text-sm shadow-lg shadow-action/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSearching ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching flights...
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            Search Flights
                        </>
                    )}
                </motion.button>
            </GlassCard>

            {/* Results */}
            {hasSearched && !isSearching && (
                <>
                    {/* Sort pills */}
                    {flights.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <Filter className="w-4 h-4 text-secondary flex-shrink-0" />
                            {[
                                { value: 'price' as SortBy, label: 'Cheapest', icon: TrendingDown },
                                { value: 'duration' as SortBy, label: 'Fastest', icon: Clock },
                                { value: 'departure' as SortBy, label: 'Earliest', icon: Calendar },
                            ].map(s => (
                                <button
                                    key={s.value}
                                    onClick={() => setSortBy(s.value)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                                        sortBy === s.value
                                            ? "bg-action/20 text-action border border-action/30"
                                            : "bg-white/5 text-secondary border border-white/10"
                                    )}
                                >
                                    <s.icon className="w-3 h-3" />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Flight cards */}
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                        {sortedFlights.length === 0 ? (
                            <GlassCard className="p-8 text-center">
                                <Plane className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                                <p className="text-white font-bold">No flights found</p>
                                <p className="text-secondary text-sm mt-1">Try different dates or destinations</p>
                            </GlassCard>
                        ) : (
                            sortedFlights.map(flight => (
                                <FlightCard key={flight.id} flight={flight} isCheapest={flight.price.raw === cheapest} />
                            ))
                        )}
                    </motion.div>
                </>
            )}

            {/* Initial state */}
            {!hasSearched && !isSearching && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Plane className="w-16 h-16 text-action/20 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-secondary text-sm">Search for flights to get started</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
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
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden max-h-60 overflow-y-auto"
        >
            {airports.slice(0, 6).map((airport, i) => (
                <button
                    key={i}
                    onClick={() => { onSelect(airport); onClose(); }}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-center gap-3"
                >
                    <Plane className="w-4 h-4 text-action flex-shrink-0" />
                    <div>
                        <p className="text-sm text-white font-medium">{airport.presentation.title}</p>
                        <p className="text-xs text-secondary">{airport.presentation.subtitle}</p>
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
            <GlassCard className="p-4 relative overflow-hidden">
                {isCheapest && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl">
                        CHEAPEST
                    </div>
                )}

                {/* Airline + Price */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {airline?.logoUrl ? (
                            <img src={airline.logoUrl} alt={airline.name} className="w-8 h-8 rounded-lg object-contain bg-white/10 p-1" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-action/20 flex items-center justify-center">
                                <Plane className="w-4 h-4 text-action" />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-bold text-white">{airline?.name || 'Unknown Airline'}</p>
                            <p className="text-[10px] text-secondary">{leg.stopCount === 0 ? 'Non-stop' : `${leg.stopCount} stop${leg.stopCount > 1 ? 's' : ''}`}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-white">{flight.price.formatted}</p>
                        <p className="text-[10px] text-secondary">per person</p>
                    </div>
                </div>

                {/* Route visualization */}
                <div className="flex items-center gap-3">
                    <div className="text-center flex-shrink-0">
                        <p className="text-base font-bold text-white">{formatTime(leg.departure)}</p>
                        <p className="text-[10px] text-secondary font-bold">{leg.origin.displayCode}</p>
                    </div>

                    <div className="flex-1 relative py-2">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
                        <div className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 bg-action rounded-full" />
                        <div className="absolute top-1/2 right-0 w-2 h-2 -translate-y-1/2 bg-emerald-400 rounded-full" />
                        <div className="text-center relative">
                            <p className="text-[10px] text-secondary bg-surface px-2 inline-block">
                                {formatDuration(leg.durationInMinutes)}
                            </p>
                        </div>
                    </div>

                    <div className="text-center flex-shrink-0">
                        <p className="text-base font-bold text-white">{formatTime(leg.arrival)}</p>
                        <p className="text-[10px] text-secondary font-bold">{leg.destination.displayCode}</p>
                    </div>
                </div>

                {/* Footer tags */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1 text-[10px] text-secondary">
                        <Luggage className="w-3 h-3" /> Check-in bag included
                    </span>
                    {flight.score >= 9 && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 ml-auto">
                            <Star className="w-3 h-3 fill-amber-400" /> Top rated
                        </span>
                    )}
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
