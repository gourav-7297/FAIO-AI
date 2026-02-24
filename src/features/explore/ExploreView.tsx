import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Compass, MapPin, Star, Navigation,
    Coffee, Camera, Utensils, TreePine, Music,
    Palette, ShoppingBag, Sparkles,
    Search, Bookmark,
    Clock, TrendingUp, Eye, Gem, Loader2, MapPinned
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAIAgents } from '../../context/AIAgentContext';
import { secretsService } from '../../services/secretsService';
import type { LocalSecret } from '../../types/database.types';
import { searchNearbyPlaces, getCurrentLocation, type RealPlace } from '../../services/placesService';
import { MapView, type MapMarker } from '../../components/ui/MapView';
import { useToast } from '../../components/ui/Toast';

const CATEGORY_FILTERS = [
    { id: 'all', label: 'All', icon: Compass },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'cafe', label: 'Cafés', icon: Coffee },
    { id: 'culture', label: 'Culture', icon: Palette },
    { id: 'nature', label: 'Nature', icon: TreePine },
    { id: 'nightlife', label: 'Nightlife', icon: Music },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'photo', label: 'Photography', icon: Camera },
];

interface Place {
    id: string;
    name: string;
    category: string;
    rating: number;
    distance: string;
    description: string;
    tags: string[];
    visitors: number;
    isHidden: boolean;
    openNow: boolean;
    image?: string;
    price: '$' | '$$' | '$$$';
}

const MOCK_PLACES: Place[] = [
    { id: '1', name: 'Secret Garden Café', category: 'cafe', rating: 4.8, distance: '350m', description: 'Hidden rooftop café with the best matcha in town. Locals only know about this place.', tags: ['WiFi', 'Quiet', 'Rooftop'], visitors: 128, isHidden: true, openNow: true, price: '$$' },
    { id: '2', name: 'Temple of Golden Light', category: 'culture', rating: 4.9, distance: '1.2km', description: 'Ancient temple away from tourist crowds. Beautiful at sunrise with mist over the mountains.', tags: ['Sunrise', 'Temple', 'Free'], visitors: 456, isHidden: false, openNow: true, price: '$' },
    { id: '3', name: 'Night Ramen Alley', category: 'food', rating: 4.7, distance: '800m', description: 'Best late-night ramen from a 70-year-old chef. Cash only, no English menu - that\'s the charm.', tags: ['Late Night', 'Authentic', 'Cash Only'], visitors: 892, isHidden: true, openNow: false, price: '$' },
    { id: '4', name: 'Bamboo Forest Trail', category: 'nature', rating: 4.6, distance: '2.5km', description: 'Quiet path through towering bamboo. Far from the tourist bamboo groves, this one the locals love.', tags: ['Hiking', 'Peaceful', 'Free'], visitors: 234, isHidden: true, openNow: true, price: '$' },
    { id: '5', name: 'Vinyl Underground', category: 'nightlife', rating: 4.5, distance: '600m', description: 'Jazz bar in a renovated sake brewery. Live music every night, amazing cocktails.', tags: ['Live Music', 'Jazz', 'Cocktails'], visitors: 567, isHidden: true, openNow: false, price: '$$$' },
    { id: '6', name: 'Artisan Market Square', category: 'shopping', rating: 4.4, distance: '1.5km', description: 'Local crafts, vintage finds, and handmade goods. Only on weekends. Support local artisans.', tags: ['Weekends', 'Handmade', 'Crafts'], visitors: 345, isHidden: false, openNow: false, price: '$$' },
    { id: '7', name: 'Sunset Bridge Viewpoint', category: 'photo', rating: 4.9, distance: '900m', description: 'The best sunset photography spot. Face west for the golden hour reflecting on the river.', tags: ['Golden Hour', 'Free', 'Scenic'], visitors: 678, isHidden: true, openNow: true, price: '$' },
];

export function ExploreView() {
    const { tripData } = useAIAgents();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());
    const [_secrets, setSecrets] = useState<LocalSecret[]>([]);
    const [showHiddenOnly, setShowHiddenOnly] = useState(false);

    // Real nearby places
    const { showToast } = useToast();
    const [nearbyPlaces, setNearbyPlaces] = useState<RealPlace[]>([]);
    const [isLoadingNearby, setIsLoadingNearby] = useState(false);
    const [showNearbyMap, setShowNearbyMap] = useState(false);

    useEffect(() => {
        async function load() {
            const { data } = await secretsService.getSecrets();
            setSecrets(data);
        }
        load();
    }, []);

    const discoverNearby = async () => {
        setIsLoadingNearby(true);
        try {
            const loc = await getCurrentLocation();
            if (!loc) {
                showToast('Location access denied', 'error');
                setIsLoadingNearby(false);
                return;
            }
            const places = await searchNearbyPlaces(loc.lat, loc.lon, 2000);
            setNearbyPlaces(places);
            if (places.length > 0) {
                showToast(`Found ${places.length} places nearby!`, 'success');
            } else {
                showToast('No places found nearby', 'info');
            }
        } catch {
            showToast('Failed to discover nearby places', 'error');
        } finally {
            setIsLoadingNearby(false);
        }
    };

    const nearbyMarkers: MapMarker[] = nearbyPlaces.map(p => ({
        id: p.id,
        lat: p.lat,
        lon: p.lon,
        label: p.name,
        emoji: p.category.split(' ')[0] || '📍',
        popup: `${p.name} • ${p.category}`,
    }));

    const toggleSave = (id: string) => {
        setSavedPlaces(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const filteredPlaces = MOCK_PLACES.filter(p => {
        if (activeCategory !== 'all' && p.category !== activeCategory) return false;
        if (showHiddenOnly && !p.isHidden) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
        }
        return true;
    });

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5"
            >
                <div className="flex items-center gap-2 mb-1">
                    <Gem className="w-5 h-5 text-action" />
                    <span className="text-xs text-action font-bold uppercase tracking-wider">Local Secrets</span>
                </div>
                <h1 className="text-3xl font-bold">Explore</h1>
                <p className="text-secondary text-sm">
                    {tripData ? `Hidden gems in ${tripData.destination}` : 'Discover places only locals know'}
                </p>
            </motion.header>

            {/* Search + Filter */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search places…"
                        className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-action placeholder:text-slate-500"
                    />
                </div>
                <button
                    onClick={() => setShowHiddenOnly(!showHiddenOnly)}
                    className={cn(
                        "px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-1 transition-all",
                        showHiddenOnly ? "bg-action text-white border-action" : "bg-surface/80 border-slate-700 text-secondary hover:text-white"
                    )}
                >
                    <Eye className="w-4 h-4" />
                    Hidden
                </button>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
                {CATEGORY_FILTERS.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap flex-shrink-0",
                            activeCategory === cat.id
                                ? "bg-action text-white"
                                : "bg-surface/50 text-secondary hover:text-white"
                        )}
                    >
                        <cat.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                <GlassCard className="p-2.5 text-center">
                    <Compass className="w-4 h-4 mx-auto text-action mb-1" />
                    <p className="text-sm font-bold">{MOCK_PLACES.length}</p>
                    <p className="text-[9px] text-secondary">Places</p>
                </GlassCard>
                <GlassCard className="p-2.5 text-center">
                    <Eye className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                    <p className="text-sm font-bold">{MOCK_PLACES.filter(p => p.isHidden).length}</p>
                    <p className="text-[9px] text-secondary">Hidden</p>
                </GlassCard>
                <GlassCard className="p-2.5 text-center">
                    <Bookmark className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <p className="text-sm font-bold">{savedPlaces.size}</p>
                    <p className="text-[9px] text-secondary">Saved</p>
                </GlassCard>
            </div>

            {/* Featured Secret */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-5"
            >
                <GlassCard gradient="purple" glow className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                        <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">AI Pick of the Day</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Sunset Bridge Viewpoint</h3>
                    <p className="text-sm text-white/80 mb-3">The best sunset photography spot. Face west for the golden hour reflecting on the river.</p>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-white/70">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 4.9
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/70">
                            <MapPin className="w-3 h-3" /> 900m away
                        </span>
                        <span className="flex items-center gap-1 text-xs text-emerald-300">
                            <Clock className="w-3 h-3" /> Open Now
                        </span>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Nearby Real Places */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-sm flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-blue-400" />
                        Nearby Places
                    </h2>
                    <div className="flex gap-1.5">
                        {nearbyPlaces.length > 0 && (
                            <button
                                onClick={() => setShowNearbyMap(!showNearbyMap)}
                                className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
                                    showNearbyMap ? "bg-action/20 text-action" : "bg-white/5 text-secondary"
                                )}
                            >
                                <MapPinned className="w-3 h-3" />
                                Map
                            </button>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={discoverNearby}
                            disabled={isLoadingNearby}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-action/20 text-action text-[10px] font-bold disabled:opacity-50"
                        >
                            {isLoadingNearby ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                            {nearbyPlaces.length > 0 ? 'Refresh' : 'Discover'}
                        </motion.button>
                    </div>
                </div>

                {showNearbyMap && nearbyMarkers.length > 0 && (
                    <div className="mb-3">
                        <MapView markers={nearbyMarkers} height="220px" showUserLocation />
                    </div>
                )}

                {nearbyPlaces.length > 0 && (
                    <div className="grid gap-2">
                        {nearbyPlaces.slice(0, 10).map(place => (
                            <GlassCard key={place.id} className="p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                                    {place.category.split(' ')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{place.name}</p>
                                    <p className="text-[10px] text-secondary">{place.category}</p>
                                </div>
                                <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                            </GlassCard>
                        ))}
                    </div>
                )}

                {nearbyPlaces.length === 0 && !isLoadingNearby && (
                    <GlassCard className="p-4 text-center">
                        <p className="text-xs text-secondary">Tap <span className="text-action font-bold">Discover</span> to find real places near you</p>
                    </GlassCard>
                )}
            </div>

            {/* Places Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory + showHiddenOnly + searchQuery}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                >
                    {filteredPlaces.length === 0 ? (
                        <GlassCard className="p-8 text-center">
                            <Compass className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                            <p className="text-secondary text-sm">No places match your filters</p>
                        </GlassCard>
                    ) : (
                        filteredPlaces.map((place, i) => (
                            <PlaceCard
                                key={place.id}
                                place={place}
                                delay={i * 0.05}
                                isSaved={savedPlaces.has(place.id)}
                                onSave={() => toggleSave(place.id)}
                            />
                        ))
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ============================
// PLACE CARD
// ============================
function PlaceCard({ place, delay, isSaved, onSave }: { place: Place; delay: number; isSaved: boolean; onSave: () => void }) {
    const categoryIcons: Record<string, React.ElementType> = {
        cafe: Coffee,
        food: Utensils,
        culture: Palette,
        nature: TreePine,
        nightlife: Music,
        shopping: ShoppingBag,
        photo: Camera,
    };

    const Icon = categoryIcons[place.category] || Compass;

    const categoryColors: Record<string, string> = {
        cafe: 'from-amber-500 to-orange-500',
        food: 'from-red-500 to-pink-500',
        culture: 'from-purple-500 to-indigo-500',
        nature: 'from-emerald-500 to-teal-500',
        nightlife: 'from-violet-500 to-purple-500',
        shopping: 'from-rose-500 to-pink-500',
        photo: 'from-cyan-500 to-blue-500',
    };

    const gradient = categoryColors[place.category] || 'from-gray-500 to-gray-600';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <GlassCard className="p-4">
                <div className="flex items-start gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br flex-shrink-0", gradient)}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm">{place.name}</h3>
                                    {place.isHidden && (
                                        <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-bold rounded">SECRET</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-0.5 text-xs">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span className="font-bold">{place.rating}</span>
                                    </span>
                                    <span className="text-xs text-secondary">{place.distance}</span>
                                    <span className="text-xs text-secondary">{place.price}</span>
                                    <span className={cn("text-[10px] font-bold", place.openNow ? "text-emerald-400" : "text-red-400")}>
                                        {place.openNow ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={onSave} className="flex-shrink-0 p-1">
                                <Bookmark className={cn("w-5 h-5 transition-colors", isSaved ? "text-amber-400 fill-amber-400" : "text-secondary")} />
                            </button>
                        </div>

                        <p className="text-xs text-secondary mt-1.5 line-clamp-2 leading-relaxed">{place.description}</p>

                        {/* Tags */}
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                            {place.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-surface/80 text-secondary text-[10px] rounded-full">{tag}</span>
                            ))}
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                            <div className="flex items-center gap-1 text-xs text-secondary">
                                <TrendingUp className="w-3 h-3" />
                                <span>{place.visitors} visitors</span>
                            </div>
                            <button className="flex items-center gap-1 text-xs text-action font-medium">
                                <Navigation className="w-3 h-3" />
                                Directions
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
