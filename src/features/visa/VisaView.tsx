import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Globe, Search, Loader2, Shield, MapPin,
    Phone, Plug, Clock, DollarSign, Languages,
    Car, AlertTriangle, CalendarCheck, ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import {
    searchCountries, getCountryInfo, POPULAR_DESTINATIONS, VISA_STATUS_INFO,
    type CountryInfo
} from '../../services/visaService';
import { useToast } from '../../components/ui/Toast';

const VISA_COLORS = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
};

const ADVISORY_COLORS = {
    safe: 'text-emerald-600',
    caution: 'text-amber-600',
    avoid: 'text-rose-600',
};

export function VisaView() {
    const { showToast } = useToast();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<{ name: string; code: string; flag: string }[]>([]);
    const [showDrop, setShowDrop] = useState(false);
    const [country, setCountry] = useState<CountryInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleInput = useCallback((v: string) => {
        setQuery(v);
        clearTimeout(timer.current);
        if (v.length < 2) { setSuggestions([]); setShowDrop(false); return; }
        timer.current = setTimeout(async () => {
            const results = await searchCountries(v);
            setSuggestions(results);
            setShowDrop(results.length > 0);
        }, 300);
    }, []);

    const loadCountry = async (code: string, name?: string) => {
        setIsLoading(true);
        setShowDrop(false);
        if (name) setQuery(name);
        try {
            const info = await getCountryInfo(code);
            if (info) { setCountry(info); setQuery(info.name); }
            else showToast('Country not found', 'error');
        } catch { showToast('Failed to load info', 'error'); }
        finally { setIsLoading(false); }
    };

    const visaInfo = country ? VISA_STATUS_INFO[country.visaStatus] : null;

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-xs text-primary font-semibold">For Indian Passport</span>
                </div>
                <h1 className="text-3xl font-bold text-stone-800">Visa & Travel Info</h1>
                <p className="text-stone-500 text-sm">Visa requirements & essential travel info</p>
            </motion.header>

            {/* Search */}
            <GlassCard className="p-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input value={query} onChange={e => handleInput(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                        onBlur={() => setTimeout(() => setShowDrop(false), 200)}
                        placeholder="Search country..."
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-primary/50" />
                    {showDrop && (
                        <div className="absolute z-30 top-full mt-1 w-full bg-white border border-stone-200 rounded-xl overflow-hidden shadow-card-hover max-h-48 overflow-y-auto">
                            {suggestions.map(s => (
                                <button key={s.code} onClick={() => loadCountry(s.code, s.name)}
                                    className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2">
                                    <span className="text-lg">{s.flag}</span>
                                    <span className="text-xs text-stone-800">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </GlassCard>

            {isLoading && (
                <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-stone-500 text-sm">Loading country info...</p>
                </div>
            )}

            {/* Country Info */}
            {country && !isLoading && visaInfo && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    {/* Header card */}
                    <GlassCard gradient="blue" glow className="p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span className="text-4xl">{country.flag}</span>
                                <h2 className="text-2xl font-bold text-stone-800 mt-1">{country.name}</h2>
                                <p className="text-stone-500 text-sm">{country.capital} • {country.region}</p>
                            </div>
                            <div className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold border",
                                VISA_COLORS[visaInfo.color as keyof typeof VISA_COLORS])}>
                                {visaInfo.label}
                            </div>
                        </div>
                        <p className="text-xs text-stone-500">{visaInfo.description}</p>
                        <p className="text-xs text-primary mt-1 font-semibold">Duration: {country.visaDuration}</p>
                    </GlassCard>

                    {/* Travel Advisory */}
                    <GlassCard className="p-3 flex items-center gap-3">
                        <AlertTriangle className={cn("w-5 h-5", ADVISORY_COLORS[country.travelAdvisory])} />
                        <div>
                            <p className="text-xs font-semibold text-stone-800">Travel Advisory: <span className={ADVISORY_COLORS[country.travelAdvisory]}>{country.travelAdvisory.toUpperCase()}</span></p>
                            <p className="text-[10px] text-stone-500">
                                {country.travelAdvisory === 'safe' ? 'Generally safe for travelers' :
                                    country.travelAdvisory === 'caution' ? 'Exercise increased caution' : 'Avoid non-essential travel'}
                            </p>
                        </div>
                    </GlassCard>

                    {/* Essential Info Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <InfoTile icon={<DollarSign className="w-4 h-4 text-emerald-400" />} label="Currency" value={`${country.currency.symbol} ${country.currency.code}`} sub={country.currency.name} />
                        <InfoTile icon={<Languages className="w-4 h-4 text-blue-400" />} label="Languages" value={country.languages.slice(0, 2).join(', ')} sub={country.languages.length > 2 ? `+${country.languages.length - 2} more` : ''} />
                        <InfoTile icon={<Clock className="w-4 h-4 text-purple-400" />} label="Timezone" value={country.timezone} />
                        <InfoTile icon={<Phone className="w-4 h-4 text-primary" />} label="Calling Code" value={country.callingCode} />
                        <InfoTile icon={<Plug className="w-4 h-4 text-amber-400" />} label="Plug Type" value={country.plugType} />
                        <InfoTile icon={<Car className="w-4 h-4 text-rose-400" />} label="Drive Side" value={country.driveSide.charAt(0).toUpperCase() + country.driveSide.slice(1)} />
                        <InfoTile icon={<CalendarCheck className="w-4 h-4 text-teal-400" />} label="Best Months" value={country.bestMonths} />
                        <InfoTile icon={<MapPin className="w-4 h-4 text-secondary" />} label="Population" value={formatPop(country.population)} />
                    </div>

                    {/* Emergency Numbers */}
                    <GlassCard className="p-3">
                        <p className="text-[10px] text-stone-500 font-semibold mb-2 uppercase tracking-wider">Emergency Numbers</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 bg-sky-50 rounded-xl">
                                <Shield className="w-4 h-4 mx-auto text-sky-600 mb-1" />
                                <p className="text-lg font-bold text-stone-800">{country.emergencyNumbers.police}</p>
                                <p className="text-[9px] text-stone-500">Police</p>
                            </div>
                            <div className="text-center p-2 bg-rose-50 rounded-xl">
                                <Phone className="w-4 h-4 mx-auto text-rose-500 mb-1" />
                                <p className="text-lg font-bold text-stone-800">{country.emergencyNumbers.ambulance}</p>
                                <p className="text-[9px] text-stone-500">Ambulance</p>
                            </div>
                            <div className="text-center p-2 bg-amber-50 rounded-xl">
                                <AlertTriangle className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                                <p className="text-lg font-bold text-stone-800">{country.emergencyNumbers.fire}</p>
                                <p className="text-[9px] text-stone-500">Fire</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Popular Destinations */}
            {!country && !isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" /> Popular Destinations
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                        {POPULAR_DESTINATIONS.map(dest => (
                            <motion.button key={dest.code} whileTap={{ scale: 0.95 }}
                                onClick={() => loadCountry(dest.code, dest.name)}
                                className="p-3 bg-stone-50 rounded-xl text-center hover:bg-stone-100 transition-colors border border-stone-200">
                                <span className="text-2xl">{dest.flag}</span>
                                <p className="text-[10px] text-stone-700 font-medium mt-1">{dest.name}</p>
                                <ChevronRight className="w-3 h-3 text-stone-400 mx-auto mt-0.5" />
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function InfoTile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
    return (
        <GlassCard className="p-3">
            <div className="flex items-center gap-2 mb-1">{icon}<span className="text-[10px] text-stone-500">{label}</span></div>
            <p className="text-xs font-semibold text-stone-800">{value}</p>
            {sub && <p className="text-[9px] text-stone-500">{sub}</p>}
        </GlassCard>
    );
}

function formatPop(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return String(n);
}
