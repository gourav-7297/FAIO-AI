import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, Star, Shield, Phone, MessageCircle,
    Loader2, MapPin, ChevronDown, Search,
    ExternalLink, CheckCircle, Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { cabsService, type CabProvider } from '../../services/cabsService';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function CabBookingView() {
    const [selectedCity, setSelectedCity] = useState('');
    const [providers, setProviders] = useState<CabProvider[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const cities = cabsService.getCities();

    useEffect(() => {
        // Load all providers initially
        cabsService.getAllProviders().then(setProviders);
    }, []);

    const handleCitySelect = async (city: string) => {
        setSelectedCity(city);
        setShowCityDropdown(false);
        setLoading(true);
        const results = await cabsService.getProviders(city);
        setProviders(results);
        setLoading(false);
    };

    const handleShowAll = async () => {
        setSelectedCity('');
        setSearchQuery('');
        setLoading(true);
        const results = await cabsService.getAllProviders();
        setProviders(results);
        setLoading(false);
    };

    const filteredProviders = searchQuery
        ? cabsService.searchProviders(searchQuery, providers)
        : providers;

    return (
        <div className="space-y-4 pb-24">
            {/* Header */}
            <div className="text-center pt-2 pb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-3">
                    <Car className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm font-medium">Tourist Cab Directory</span>
                </div>
                <h2 className="text-xl font-bold text-white">Find Trusted Cab Providers</h2>
                <p className="text-white/50 text-sm mt-1">
                    Browse verified agencies • Call or WhatsApp directly
                </p>
            </div>

            {/* City Selector */}
            <GlassCard className="p-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            value={selectedCity || ''}
                            placeholder="Select a city..."
                            readOnly
                            onClick={() => setShowCityDropdown(!showCityDropdown)}
                            className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 cursor-pointer"
                        />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />

                        <AnimatePresence>
                            {showCityDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute z-20 left-0 right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-2xl"
                                >
                                    {cities.map(city => (
                                        <button
                                            key={city}
                                            onClick={() => handleCitySelect(city)}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors",
                                                selectedCity === city ? "text-yellow-400 bg-yellow-500/5" : "text-white/70"
                                            )}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {selectedCity && (
                        <button
                            onClick={handleShowAll}
                            className="px-4 py-3 text-xs text-white/50 hover:text-white/80 bg-white/5 border border-white/10 rounded-xl transition-colors"
                        >
                            All
                        </button>
                    )}
                </div>

                {/* Search within results */}
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by name, service..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30"
                    />
                </div>
            </GlassCard>

            {/* Provider Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                </div>
            ) : filteredProviders.length === 0 ? (
                <GlassCard className="p-8 text-center">
                    <Car className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50">No providers found{selectedCity ? ` in ${selectedCity}` : ''}.</p>
                    <p className="text-white/30 text-sm mt-1">Try another city or clear the search.</p>
                </GlassCard>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                    <p className="text-white/40 text-xs px-1">
                        {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
                        {selectedCity ? ` in ${selectedCity}` : ''}
                    </p>

                    {filteredProviders.map(provider => (
                        <motion.div key={provider.id} variants={item}>
                            <ProviderCard provider={provider} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Quick Alternatives */}
            <GlassCard className="p-4 mt-4">
                <p className="text-white/40 text-xs mb-3 font-medium uppercase tracking-wider">Also try</p>
                <div className="flex gap-2">
                    <a
                        href="https://www.uber.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm hover:bg-white/5 transition-colors"
                    >
                        <span>🚗</span> Uber
                        <ExternalLink className="w-3 h-3 text-white/30" />
                    </a>
                    <a
                        href="https://www.olacabs.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm hover:bg-white/5 transition-colors"
                    >
                        <span>🟢</span> Ola
                        <ExternalLink className="w-3 h-3 text-white/30" />
                    </a>
                    <a
                        href="https://www.rapido.bike"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black border border-white/10 rounded-xl text-white text-sm hover:bg-white/5 transition-colors"
                    >
                        <span>🏍️</span> Rapido
                        <ExternalLink className="w-3 h-3 text-white/30" />
                    </a>
                </div>
            </GlassCard>
        </div>
    );
}

// ============================
// PROVIDER CARD
// ============================

function ProviderCard({ provider }: { provider: CabProvider }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <GlassCard
            className="p-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
            onClick={() => setExpanded(!expanded)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-base">{provider.name}</h3>
                        {provider.verified && (
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <MapPin className="w-3 h-3 text-white/30" />
                        <span className="text-white/50 text-xs">{provider.city}</span>
                        {provider.years_in_service > 0 && (
                            <>
                                <span className="text-white/20">·</span>
                                <span className="text-white/40 text-xs">{provider.years_in_service}+ years</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-300 text-sm font-semibold">{provider.rating}</span>
                    <span className="text-white/30 text-xs">({provider.total_ratings.toLocaleString()})</span>
                </div>
            </div>

            {/* Price Range & Vehicles */}
            <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="px-2 py-0.5 bg-green-500/10 text-green-300 text-xs rounded-full font-medium">
                    {provider.price_range}
                </span>
                {provider.vehicle_types.slice(0, 3).map(v => (
                    <span key={v} className="px-2 py-0.5 bg-white/5 text-white/50 text-xs rounded-full">
                        {v}
                    </span>
                ))}
                {provider.vehicle_types.length > 3 && (
                    <span className="text-white/30 text-xs">+{provider.vehicle_types.length - 3} more</span>
                )}
            </div>

            {/* Services */}
            <div className="flex items-center gap-1.5 overflow-x-auto mt-2 pb-1 scrollbar-none">
                {provider.services.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded-full whitespace-nowrap">
                        {s}
                    </span>
                ))}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                            {/* Description */}
                            <p className="text-white/60 text-sm leading-relaxed">{provider.description}</p>

                            {/* Languages */}
                            {provider.languages.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-white/30" />
                                    <span className="text-white/40 text-xs">
                                        Speaks: {provider.languages.join(', ')}
                                    </span>
                                </div>
                            )}

                            {/* Verified Badge */}
                            {provider.verified && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/10">
                                    <Shield className="w-4 h-4 text-green-400" />
                                    <span className="text-green-300 text-xs">Verified & Trusted Provider</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-1">
                                <a
                                    href={cabsService.getCallLink(provider.phone)}
                                    onClick={e => e.stopPropagation()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium text-sm transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call Now
                                </a>
                                {provider.whatsapp && (
                                    <a
                                        href={cabsService.getWhatsAppLink(provider.whatsapp, provider.name, provider.city)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-xl font-medium text-sm transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
