import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Compass, MapPin, Star, Navigation,
    Coffee, Camera, Utensils, TreePine, Music,
    Palette, ShoppingBag, Sparkles,
    Search, Bookmark, X, Phone, ExternalLink,
    Clock, TrendingUp, Eye, Gem, Loader2, MapPinned, Hotel, Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAIAgents } from '../../context/AIAgentContext';
import { secretsService } from '../../services/secretsService';
import type { LocalSecret } from '../../types/database.types';
import { searchNearbyPlaces, getCurrentLocation, type RealPlace } from '../../services/placesService';
import {
    searchPlaces as fsqSearch,
    searchPlacesNearby as fsqSearchNearby,
    searchHiddenGems,
    isFoursquareAvailable,
    FSQ_CATEGORIES,
    type FoursquarePlace
} from '../../services/foursquareService';
import { MapView, type MapMarker } from '../../components/ui/MapView';
import { useToast } from '../../components/ui/Toast';

// ══════════════════════════════════════════════════
// SHARED TYPES & CONSTANTS
// ══════════════════════════════════════════════════

// ─── Vibe Category filters ───────────────────────
const VIBE_FILTERS = [
    { id: 'all', label: 'All', icon: Compass },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'cafe', label: 'Cafés', icon: Coffee },
    { id: 'culture', label: 'Culture', icon: Palette },
    { id: 'nature', label: 'Nature', icon: TreePine },
    { id: 'nightlife', label: 'Nightlife', icon: Music },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'photo', label: 'Photography', icon: Camera },
];

// ─── Real Places Category filters ─────────────────
const REAL_FILTERS = [
    { id: 'all',       label: 'All',           icon: Compass,     fsqCat: '' },
    { id: 'hotel',     label: 'Hotels',        icon: Hotel,       fsqCat: FSQ_CATEGORIES.hotel },
    { id: 'food',      label: 'Restaurants',   icon: Utensils,    fsqCat: FSQ_CATEGORIES.restaurant },
    { id: 'cafe',      label: 'Cafés',         icon: Coffee,      fsqCat: FSQ_CATEGORIES.cafe },
    { id: 'culture',   label: 'Museums',       icon: Palette,     fsqCat: FSQ_CATEGORIES.museum },
    { id: 'nature',    label: 'Parks',         icon: TreePine,    fsqCat: FSQ_CATEGORIES.park },
    { id: 'nightlife', label: 'Nightlife',     icon: Music,       fsqCat: FSQ_CATEGORIES.bar },
    { id: 'shopping',  label: 'Shopping',      icon: ShoppingBag, fsqCat: FSQ_CATEGORIES.mall },
    { id: 'photo',     label: 'Attractions',   icon: Camera,      fsqCat: FSQ_CATEGORIES.monument },
];

// ─── Multiple images per category for variety ───
const CATEGORY_IMAGE_POOL: Record<string, string[]> = {
    hotel: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=250&fit=crop',
    ],
    food: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&h=250&fit=crop',
    ],
    cafe: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=250&fit=crop',
    ],
    culture: [
        'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400&h=250&fit=crop',
    ],
    nature: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop',
    ],
    nightlife: [
        'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=250&fit=crop',
    ],
    shopping: [
        'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=400&h=250&fit=crop',
    ],
    photo: [
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=250&fit=crop',
    ],
    default: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=250&fit=crop',
    ],
};

// Pick a unique image based on place name so each card looks different
function getCategoryImage(category: string, placeName: string): string {
    const pool = CATEGORY_IMAGE_POOL[category] || CATEGORY_IMAGE_POOL.default;
    let hash = 0;
    for (let i = 0; i < placeName.length; i++) {
        hash = ((hash << 5) - hash) + placeName.charCodeAt(i);
        hash |= 0;
    }
    return pool[Math.abs(hash) % pool.length];
}

// ─── Vibe mock places ────────────────────────────
interface VibePlace {
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
    price: '$' | '$$' | '$$$';
    image: string;
}

const MOCK_VIBE_PLACES: VibePlace[] = [
    { id: 'v1', name: 'Secret Garden Café', category: 'cafe', rating: 4.8, distance: '350m', description: 'Hidden rooftop café with the best matcha in town. Locals only know about this place.', tags: ['WiFi', 'Quiet', 'Rooftop'], visitors: 128, isHidden: true, openNow: true, price: '$$', image: getCategoryImage('cafe', 'Secret Garden Café') },
    { id: 'v2', name: 'Temple of Golden Light', category: 'culture', rating: 4.9, distance: '1.2km', description: 'Ancient temple away from tourist crowds. Beautiful at sunrise with mist over the mountains.', tags: ['Sunrise', 'Temple', 'Free'], visitors: 456, isHidden: false, openNow: true, price: '$', image: getCategoryImage('culture', 'Temple of Golden Light') },
    { id: 'v3', name: 'Night Ramen Alley', category: 'food', rating: 4.7, distance: '800m', description: 'Best late-night ramen from a 70-year-old chef. Cash only, no English menu - that\'s the charm.', tags: ['Late Night', 'Authentic', 'Cash Only'], visitors: 892, isHidden: true, openNow: false, price: '$', image: getCategoryImage('food', 'Night Ramen Alley') },
    { id: 'v4', name: 'Bamboo Forest Trail', category: 'nature', rating: 4.6, distance: '2.5km', description: 'Quiet path through towering bamboo. Far from the tourist bamboo groves, this one the locals love.', tags: ['Hiking', 'Peaceful', 'Free'], visitors: 234, isHidden: true, openNow: true, price: '$', image: getCategoryImage('nature', 'Bamboo Forest Trail') },
    { id: 'v5', name: 'Vinyl Underground', category: 'nightlife', rating: 4.5, distance: '600m', description: 'Jazz bar in a renovated sake brewery. Live music every night, amazing cocktails.', tags: ['Live Music', 'Jazz', 'Cocktails'], visitors: 567, isHidden: true, openNow: false, price: '$$$', image: getCategoryImage('nightlife', 'Vinyl Underground') },
    { id: 'v6', name: 'Artisan Market Square', category: 'shopping', rating: 4.4, distance: '1.5km', description: 'Local crafts, vintage finds, and handmade goods. Only on weekends. Support local artisans.', tags: ['Weekends', 'Handmade', 'Crafts'], visitors: 345, isHidden: false, openNow: false, price: '$$', image: getCategoryImage('shopping', 'Artisan Market Square') },
    { id: 'v7', name: 'Sunset Bridge Viewpoint', category: 'photo', rating: 4.9, distance: '900m', description: 'The best sunset photography spot. Face west for the golden hour reflecting on the river.', tags: ['Golden Hour', 'Free', 'Scenic'], visitors: 678, isHidden: true, openNow: true, price: '$', image: getCategoryImage('photo', 'Sunset Bridge Viewpoint') },
];

// ─── Real Places types ───────────────────────────
interface DisplayPlace {
    id: string;
    name: string;
    category: string;
    categoryId: string;
    address: string;
    city: string;
    lat: number;
    lon: number;
    distance?: string;
    phone?: string;
    website?: string;
    rating?: number;
    price?: string;
    image: string;
    source: 'foursquare' | 'overpass' | 'secret';
}

function foursquareToDisplay(p: FoursquarePlace): DisplayPlace {
    const priceLabels = ['', '$', '$$', '$$$', '$$$$'];
    const catId = mapFSQCategoryToFilter(p.category);
    return {
        id: p.id, name: p.name, category: p.category, categoryId: catId,
        address: p.address, city: p.city, lat: p.lat, lon: p.lon,
        distance: p.distance ? `${(p.distance / 1000).toFixed(1)}km` : undefined,
        phone: p.phone, website: p.website, rating: p.rating,
        price: priceLabels[p.price || 0],
        image: getCategoryImage(catId, p.name),
        source: 'foursquare',
    };
}

function foursquareToVibe(p: FoursquarePlace): VibePlace {
    const priceLabels = ['', '$', '$$', '$$$', '$$$$'];
    const catId = mapFSQCategoryToFilter(p.category);
    return {
        id: 'v_' + p.id,
        name: p.name,
        category: catId,
        rating: p.rating || (4.0 + Math.random()),
        distance: p.distance ? `${(p.distance / 1000).toFixed(1)}km` : `${(Math.random() * 2 + 0.5).toFixed(1)}km`,
        description: `A true local gem in ${p.city || 'the area'}. Highly rated by those who know it, away from the tourist crowds.`,
        tags: [p.category.split(' ')[1] || 'Hidden', 'Local Secret', 'Authentic'],
        visitors: Math.floor(Math.random() * 300) + 50,
        isHidden: true,
        openNow: true,
        price: (priceLabels[p.price || 1] || '$$') as any,
        image: getCategoryImage(catId, p.name)
    };
}

function overpassToDisplay(p: RealPlace): DisplayPlace {
    return {
        id: String(p.id), name: p.name, category: p.category, categoryId: p.type,
        address: p.tags?.['addr:street'] || '', city: p.tags?.['addr:city'] || '',
        lat: p.lat, lon: p.lon, phone: p.tags?.phone, website: p.tags?.website,
        image: getCategoryImage(p.type, p.name),
        source: 'overpass',
    };
}

function mapFSQCategoryToFilter(cat: string): string {
    const lower = cat.toLowerCase();
    if (lower.includes('hotel') || lower.includes('resort') || lower.includes('hostel')) return 'hotel';
    if (lower.includes('restaurant') || lower.includes('food')) return 'food';
    if (lower.includes('café') || lower.includes('cafe') || lower.includes('coffee')) return 'cafe';
    if (lower.includes('museum') || lower.includes('gallery')) return 'culture';
    if (lower.includes('park') || lower.includes('garden')) return 'nature';
    if (lower.includes('bar') || lower.includes('nightclub') || lower.includes('lounge')) return 'nightlife';
    if (lower.includes('mall') || lower.includes('shop')) return 'shopping';
    if (lower.includes('monument') || lower.includes('temple') || lower.includes('beach')) return 'photo';
    return 'all';
}

// ══════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════
export function ExploreView() {
    const { tripData } = useAIAgents();
    const { showToast } = useToast();

    // Tab state
    const [activeTab, setActiveTab] = useState<'vibes' | 'places'>('vibes');

    // Shared
    const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());
    const [_secrets, setSecrets] = useState<LocalSecret[]>([]);

    // Vibe tab state
    const [vibePlaces, setVibePlaces] = useState<VibePlace[]>(MOCK_VIBE_PLACES);
    const [isLoadingVibes, setIsLoadingVibes] = useState(false);
    const [vibeCategory, setVibeCategory] = useState('all');
    const [vibeSearch, setVibeSearch] = useState('');
    const [showHiddenOnly, setShowHiddenOnly] = useState(false);

    // Real places tab state
    const [realCategory, setRealCategory] = useState('all');
    const [realSearch, setRealSearch] = useState('');
    const [searchCity, setSearchCity] = useState(tripData?.destination || '');
    const [places, setPlaces] = useState<DisplayPlace[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<DisplayPlace | null>(null);
    const [selectedVibe, setSelectedVibe] = useState<VibePlace | null>(null);

    // Nearby (shared)
    const [nearbyPlaces, _setNearbyPlaces] = useState<DisplayPlace[]>([]);
    const [isLoadingNearby, setIsLoadingNearby] = useState(false);
    const [showNearbyMap, setShowNearbyMap] = useState(false);

    useEffect(() => {
        async function load() {
            const { data } = await secretsService.getSecrets();
            setSecrets(data);
        }
        load();
    }, []);

    // Load vibes initially
    const loadVibes = async (targetCity: string) => {
        setIsLoadingVibes(true);
        try {
            if (isFoursquareAvailable()) {
                const gems = await searchHiddenGems(targetCity || 'Delhi', 15); // Fallback to a major city if none
                if (gems.length > 0) {
                    setVibePlaces(gems.map(foursquareToVibe));
                } else {
                    setVibePlaces(MOCK_VIBE_PLACES);
                }
            }
        } catch {
            setVibePlaces(MOCK_VIBE_PLACES);
        } finally {
            setIsLoadingVibes(false);
        }
    };

    // Auto-search on Real Places tab if trip destination set
    useEffect(() => {
        const target = tripData?.destination || 'Delhi'; // Fallback city
        if (tripData?.destination && !hasSearched) {
            setSearchCity(tripData.destination);
            handleCitySearch(tripData.destination);
        }
        
        // Always load vibes on mount
        loadVibes(target);
    }, [tripData?.destination]);

    const toggleSave = (id: string) => {
        setSavedPlaces(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    // ─── Real Places: Search by city ─────────────
    const handleCitySearch = async (city?: string) => {
        const target = city || searchCity;
        if (!target.trim()) { showToast('Enter a city name to explore', 'info'); return; }
        setIsLoading(true);
        setHasSearched(true);
        try {
            if (isFoursquareAvailable()) {
                const [hotels, restaurants, cafes, attractions, bars] = await Promise.all([
                    fsqSearch(target, 'hotel', FSQ_CATEGORIES.hotel, 10),
                    fsqSearch(target, 'restaurant', FSQ_CATEGORIES.restaurant, 10),
                    fsqSearch(target, 'cafe', FSQ_CATEGORIES.cafe, 10),
                    fsqSearch(target, '', FSQ_CATEGORIES.museum, 5),
                    fsqSearch(target, '', FSQ_CATEGORIES.bar, 5),
                ]);
                const all = [...hotels, ...restaurants, ...cafes, ...attractions, ...bars];
                setPlaces(all.map(foursquareToDisplay));
                showToast(`Found ${all.length} real places in ${target}!`, 'success');
            } else {
                const geocodeResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(target)}&limit=1`);
                const geocodeData = await geocodeResp.json();
                if (geocodeData.length > 0) {
                    const { lat, lon } = geocodeData[0];
                    const results = await searchNearbyPlaces(parseFloat(lat), parseFloat(lon), 5000);
                    setPlaces(results.map(overpassToDisplay));
                    showToast(`Found ${results.length} places in ${target}`, 'success');
                } else {
                    showToast('City not found', 'error');
                }
            }
        } catch { showToast('Failed to search places', 'error'); }
        finally { setIsLoading(false); }

        // Also fetch Hidden Gems for Local Vibes tab
        loadVibes(target);
    };

    // ─── Discover nearby ─────────────────────────
    const discoverNearby = async () => {
        setIsLoadingNearby(true);
        try {
            const loc = await getCurrentLocation();
            if (!loc) { showToast('Location access denied', 'error'); setIsLoadingNearby(false); return; }
            let results: DisplayPlace[] = [];
            if (isFoursquareAvailable()) {
                const fsqResults = await fsqSearchNearby(loc.lat, loc.lon, '', undefined, 20, 3000);
                results = fsqResults.map(foursquareToDisplay);
            }
            const overpassResults = await searchNearbyPlaces(loc.lat, loc.lon, 2000);
            const overpassDisplay = overpassResults.map(overpassToDisplay);
            const fsqNames = new Set(results.map(r => r.name.toLowerCase()));
            const merged = [...results, ...overpassDisplay.filter(p => !fsqNames.has(p.name.toLowerCase()))];
            
            // Set these as the main places grid so the user sees a full list!
            setPlaces(merged);
            setHasSearched(true);
            setSearchCity('Current Location');
            setActiveTab('places'); // Ensure they are on the places tab to see them
            
            if (merged.length > 0) showToast(`Found ${merged.length} places near you!`, 'success');
            else showToast('No places found nearby', 'info');
        } catch { showToast('Failed to discover nearby places', 'error'); }
        finally { setIsLoadingNearby(false); }
    };

    // ─── Filtered lists ──────────────────────────
    const filteredVibes = vibePlaces.filter(p => {
        if (vibeCategory !== 'all' && p.category !== vibeCategory) return false;
        if (showHiddenOnly && !p.isHidden) return false;
        if (vibeSearch) {
            const q = vibeSearch.toLowerCase();
            return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
        }
        return true;
    });

    // Pick top vibe place for AI Pick
    const aiPick = vibePlaces.length > 0 ? vibePlaces.reduce((prev, current) => (prev.rating > current.rating) ? prev : current) : null;

    const filteredPlaces = places.filter(p => {
        if (realCategory !== 'all' && p.categoryId !== realCategory) return false;
        if (realSearch) {
            const q = realSearch.toLowerCase();
            return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        }
        return true;
    });

    const nearbyMarkers: MapMarker[] = nearbyPlaces.map(p => ({
        id: p.id, lat: p.lat, lon: p.lon, label: p.name,
        emoji: p.category.split(' ')[0] || '📍', popup: `${p.name} • ${p.category}`,
    }));

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            {/* Header */}
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Gem className="w-5 h-5 text-action" />
                    <span className="text-xs text-action font-bold uppercase tracking-wider">Discover</span>
                </div>
                <h1 className="text-3xl font-bold">Explore</h1>
                <p className="text-secondary text-sm">
                    {tripData ? `Discover ${tripData.destination}` : 'Find hidden gems & real places worldwide'}
                </p>
            </motion.header>

            {/* ═══ TAB SWITCHER ═══ */}
            <div className="flex gap-1 mb-5 p-1 bg-surface/80 rounded-2xl border border-slate-700/50">
                <button
                    onClick={() => setActiveTab('vibes')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                        activeTab === 'vibes'
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                            : "text-secondary hover:text-white"
                    )}
                >
                    <Sparkles className="w-4 h-4" />
                    Local Vibes
                </button>
                <button
                    onClick={() => setActiveTab('places')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                        activeTab === 'places'
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                            : "text-secondary hover:text-white"
                    )}
                >
                    <Globe className="w-4 h-4" />
                    Real Places
                </button>
            </div>

            {/* ═══════════════════════════════════ */}
            {/* TAB 1: LOCAL VIBES                  */}
            {/* ═══════════════════════════════════ */}
            {activeTab === 'vibes' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                    {/* Search + Hidden Filter */}
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                            <input type="text" value={vibeSearch} onChange={(e) => setVibeSearch(e.target.value)}
                                placeholder="Search places…"
                                className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-action placeholder:text-slate-500" />
                        </div>
                        <button onClick={() => setShowHiddenOnly(!showHiddenOnly)}
                            className={cn("px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-1 transition-all",
                                showHiddenOnly ? "bg-action text-white border-action" : "bg-surface/80 border-slate-700 text-secondary hover:text-white")}>
                            <Eye className="w-4 h-4" /> Hidden
                        </button>
                    </div>

                    {/* Category Filters */}
                    <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
                        {VIBE_FILTERS.map(cat => (
                            <button key={cat.id} onClick={() => setVibeCategory(cat.id)}
                                className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap flex-shrink-0",
                                    vibeCategory === cat.id ? "bg-action text-white" : "bg-surface/50 text-secondary hover:text-white")}>
                                <cat.icon className="w-4 h-4" />
                                <span className="text-xs font-medium">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                        <GlassCard className="p-2.5 text-center">
                            <Compass className="w-4 h-4 mx-auto text-action mb-1" />
                            <p className="text-sm font-bold">{vibePlaces.length}</p>
                            <p className="text-[9px] text-secondary">Places</p>
                        </GlassCard>
                        <GlassCard className="p-2.5 text-center">
                            <Eye className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                            <p className="text-sm font-bold">{vibePlaces.filter(p => p.isHidden).length}</p>
                            <p className="text-[9px] text-secondary">Hidden</p>
                        </GlassCard>
                        <GlassCard className="p-2.5 text-center">
                            <Bookmark className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                            <p className="text-sm font-bold">{savedPlaces.size}</p>
                            <p className="text-[9px] text-secondary">Saved</p>
                        </GlassCard>
                    </div>

                    {/* AI Pick of the Day */}
                    {aiPick && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
                            <GlassCard gradient="purple" glow className="p-5 cursor-pointer" onClick={() => setSelectedVibe(aiPick)}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-amber-300" />
                                    <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">AI Pick of the Day</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{aiPick.name}</h3>
                                        <p className="text-sm text-white/80 mb-3 line-clamp-2">{aiPick.description}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-xs text-white/70"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {aiPick.rating.toFixed(1)}</span>
                                            <span className="flex items-center gap-1 text-xs text-emerald-300"><Clock className="w-3 h-3" /> {aiPick.openNow ? 'Open Now' : 'Closed'}</span>
                                        </div>
                                    </div>
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                                        <img src={aiPick.image} alt={aiPick.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* Nearby Places */}
                    <NearbySection
                        nearbyPlaces={nearbyPlaces} isLoadingNearby={isLoadingNearby}
                        showNearbyMap={showNearbyMap} setShowNearbyMap={setShowNearbyMap}
                        discoverNearby={discoverNearby} nearbyMarkers={nearbyMarkers}
                    />

                    <h2 className="font-bold text-sm flex items-center gap-1.5 mb-3">
                        <Gem className="w-4 h-4 text-purple-400" />
                        Hidden Gems & Local Secrets
                    </h2>
                    
                    {isLoadingVibes ? (
                        <div className="flex flex-col items-center justify-center p-10 text-secondary">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-action" />
                            <p className="text-sm">Finding local hidden gems in {searchCity || 'your area'}...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div key={vibeCategory + showHiddenOnly + vibeSearch}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-3">
                                {filteredVibes.length === 0 ? (
                                    <GlassCard className="p-8 text-center">
                                    <Compass className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                                    <p className="text-secondary text-sm">No places match your filters</p>
                                </GlassCard>
                            ) : (
                                filteredVibes.map((place, i) => (
                                    <VibePlaceCard key={place.id} place={place} delay={i * 0.05}
                                        isSaved={savedPlaces.has(place.id)} onSave={() => toggleSave(place.id)}
                                        onClick={() => setSelectedVibe(place)} />
                                ))
                            )}
                        </motion.div>
                    </AnimatePresence>
                    )}

                    {/* Vibe Detail Modal */}
                    <AnimatePresence>
                        {selectedVibe && (
                            <VibeDetailModal place={selectedVibe} onClose={() => setSelectedVibe(null)}
                                isSaved={savedPlaces.has(selectedVibe.id)} onSave={() => toggleSave(selectedVibe.id)} />
                        )}
                    </AnimatePresence>

                    {/* CTA to switch */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5">
                        <GlassCard gradient="blue" className="p-4 text-center cursor-pointer" onClick={() => setActiveTab('places')}>
                            <Globe className="w-6 h-6 mx-auto text-cyan-300 mb-2" />
                            <p className="text-sm font-bold text-white">Want real hotels, restaurants & cafés?</p>
                            <p className="text-xs text-cyan-200 mt-1">Switch to Real Places →</p>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════ */}
            {/* TAB 2: REAL PLACES (Foursquare)     */}
            {/* ═══════════════════════════════════ */}
            {activeTab === 'places' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                    {/* City Search */}
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                            <input type="text" value={searchCity} onChange={(e) => setSearchCity(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                                placeholder="City (Mumbai, Paris)…"
                                className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-action placeholder:text-slate-500" />
                        </div>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCitySearch()} disabled={isLoading}
                            className="px-4 py-2.5 rounded-xl bg-action text-white text-sm font-bold flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Explore
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={discoverNearby} disabled={isLoadingNearby}
                            className="px-3 py-2.5 rounded-xl bg-surface border border-slate-700 text-secondary hover:text-white flex items-center justify-center flex-shrink-0"
                            title="Find places near my GPS location">
                            {isLoadingNearby ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                        </motion.button>
                    </div>

                    {/* Quick filter */}
                    {hasSearched && (
                        <div className="flex gap-2 mb-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                                <input type="text" value={realSearch} onChange={(e) => setRealSearch(e.target.value)}
                                    placeholder="Filter results…"
                                    className="w-full pl-10 pr-4 py-2 bg-surface/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-action placeholder:text-slate-500" />
                            </div>
                        </div>
                    )}

                    {/* Category Filters */}
                    <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
                        {REAL_FILTERS.map(cat => (
                            <button key={cat.id} onClick={() => setRealCategory(cat.id)}
                                className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap flex-shrink-0",
                                    realCategory === cat.id ? "bg-action text-white" : "bg-surface/50 text-secondary hover:text-white")}>
                                <cat.icon className="w-4 h-4" />
                                <span className="text-xs font-medium">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Stats */}
                    {hasSearched && (
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            <GlassCard className="p-2.5 text-center">
                                <Compass className="w-4 h-4 mx-auto text-action mb-1" />
                                <p className="text-sm font-bold">{places.length}</p>
                                <p className="text-[9px] text-secondary">Found</p>
                            </GlassCard>
                            <GlassCard className="p-2.5 text-center">
                                <Eye className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                                <p className="text-sm font-bold">{filteredPlaces.length}</p>
                                <p className="text-[9px] text-secondary">Showing</p>
                            </GlassCard>
                            <GlassCard className="p-2.5 text-center">
                                <Bookmark className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                                <p className="text-sm font-bold">{savedPlaces.size}</p>
                                <p className="text-[9px] text-secondary">Saved</p>
                            </GlassCard>
                        </div>
                    )}

                    {hasSearched && (
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] text-secondary/60 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Powered by Foursquare — real, verified places
                            </span>
                        </div>
                    )}

                    {/* Nearby */}
                    <NearbySection
                        nearbyPlaces={nearbyPlaces} isLoadingNearby={isLoadingNearby}
                        showNearbyMap={showNearbyMap} setShowNearbyMap={setShowNearbyMap}
                        discoverNearby={discoverNearby} nearbyMarkers={nearbyMarkers}
                    />

                    {/* Real Places Grid */}
                    <AnimatePresence mode="wait">
                        <motion.div key={realCategory + realSearch}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-3">
                            {!hasSearched ? (
                                <GlassCard gradient="blue" glow className="p-6 text-center">
                                    <Globe className="w-12 h-12 text-cyan-300 mx-auto mb-3 opacity-60" />
                                    <h3 className="text-lg font-bold text-white mb-2">Explore Any City</h3>
                                    <p className="text-sm text-white/70 mb-1">Search for real hotels, restaurants, cafés, and attractions</p>
                                    <p className="text-xs text-white/50">Powered by Foursquare</p>
                                </GlassCard>
                            ) : isLoading ? (
                                <GlassCard className="p-8 text-center">
                                    <Loader2 className="w-8 h-8 text-action mx-auto animate-spin mb-3" />
                                    <p className="text-sm text-secondary">Searching real places in {searchCity}...</p>
                                </GlassCard>
                            ) : filteredPlaces.length === 0 ? (
                                <GlassCard className="p-8 text-center">
                                    <Compass className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                                    <p className="text-secondary text-sm">No places match your filters</p>
                                </GlassCard>
                            ) : (
                                filteredPlaces.map((place, i) => (
                                    <RealPlaceCard key={place.id} place={place} delay={i * 0.03}
                                        isSaved={savedPlaces.has(place.id)} onSave={() => toggleSave(place.id)}
                                        onClick={() => setSelectedPlace(place)} />
                                ))
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* CTA to switch */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5">
                        <GlassCard gradient="purple" className="p-4 text-center cursor-pointer" onClick={() => setActiveTab('vibes')}>
                            <Sparkles className="w-6 h-6 mx-auto text-amber-300 mb-2" />
                            <p className="text-sm font-bold text-white">Discover hidden gems & local secrets</p>
                            <p className="text-xs text-purple-200 mt-1">Switch to Local Vibes →</p>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedPlace && (
                    <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)}
                        isSaved={savedPlaces.has(selectedPlace.id)} onSave={() => toggleSave(selectedPlace.id)} />
                )}
            </AnimatePresence>
        </div>
    );
}

// ══════════════════════════════════════════════════
// SHARED: NEARBY SECTION (Map & Quick List)
// ══════════════════════════════════════════════════
function NearbySection({ nearbyPlaces, isLoadingNearby, showNearbyMap, setShowNearbyMap, discoverNearby, nearbyMarkers }: {
    nearbyPlaces: DisplayPlace[]; isLoadingNearby: boolean; showNearbyMap: boolean;
    setShowNearbyMap: (v: boolean) => void; discoverNearby: () => void; nearbyMarkers: MapMarker[];
}) {
    if (nearbyPlaces.length === 0) return null; // Don't show if empty, we use the main grid now

    return (
        <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-sm flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-400" /> Nearby Places
                </h2>
                <div className="flex gap-1.5">
                    {nearbyPlaces.length > 0 && (
                        <button onClick={() => setShowNearbyMap(!showNearbyMap)}
                            className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
                                showNearbyMap ? "bg-action/20 text-action" : "bg-white/5 text-secondary")}>
                            <MapPinned className="w-3 h-3" /> Map
                        </button>
                    )}
                    <motion.button whileTap={{ scale: 0.95 }} onClick={discoverNearby} disabled={isLoadingNearby}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-action/20 text-action text-[10px] font-bold disabled:opacity-50">
                        {isLoadingNearby ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                        {nearbyPlaces.length > 0 ? 'Refresh' : 'Discover'}
                    </motion.button>
                </div>
            </div>
            {showNearbyMap && nearbyMarkers.length > 0 && (
                <div className="mb-3"><MapView markers={nearbyMarkers} height="220px" showUserLocation /></div>
            )}
            {nearbyPlaces.length > 0 && (
                <div className="grid gap-2">
                    {nearbyPlaces.slice(0, 8).map(place => (
                        <GlassCard key={place.id} className="p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                                {place.category.split(' ')[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{place.name}</p>
                                <p className="text-[10px] text-secondary truncate">{place.address || place.category}</p>
                            </div>
                            {place.rating && (
                                <span className="flex items-center gap-0.5 text-xs text-amber-400">
                                    <Star className="w-3 h-3 fill-amber-400" />{place.rating.toFixed(1)}
                                </span>
                            )}
                            <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════
// VIBE PLACE CARD (original style)
// ══════════════════════════════════════════════════
function VibePlaceCard({ place, delay, isSaved, onSave, onClick }: { place: VibePlace; delay: number; isSaved: boolean; onSave: () => void; onClick: () => void }) {
    const categoryIcons: Record<string, React.ElementType> = {
        cafe: Coffee, food: Utensils, culture: Palette, nature: TreePine,
        nightlife: Music, shopping: ShoppingBag, photo: Camera,
    };
    const categoryColors: Record<string, string> = {
        cafe: 'from-amber-500 to-orange-500', food: 'from-red-500 to-pink-500',
        culture: 'from-purple-500 to-indigo-500', nature: 'from-emerald-500 to-teal-500',
        nightlife: 'from-violet-500 to-purple-500', shopping: 'from-rose-500 to-pink-500',
        photo: 'from-cyan-500 to-blue-500',
    };
    const Icon = categoryIcons[place.category] || Compass;
    const gradient = categoryColors[place.category] || 'from-gray-500 to-gray-600';

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            onClick={onClick} className="cursor-pointer">
            <GlassCard className="overflow-hidden">
                <div className="relative h-32 overflow-hidden">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {place.isHidden && (
                        <div className="absolute top-2 left-2">
                            <span className="px-1.5 py-0.5 bg-purple-500/90 backdrop-blur-sm text-white text-[9px] font-bold rounded">SECRET</span>
                        </div>
                    )}
                    <button onClick={onSave} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <Bookmark className={cn("w-4 h-4 transition-colors", isSaved ? "text-amber-400 fill-amber-400" : "text-white")} />
                    </button>
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                        <h3 className="font-bold text-sm text-white drop-shadow-md truncate max-w-[70%]">{place.name}</h3>
                        <div className="flex flex-col items-end">
                            <span className="flex items-center gap-0.5 text-xs text-white">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> <span className="font-bold">{place.rating}</span>
                            </span>
                            <span className="text-[10px] text-white/80">{place.distance} • {place.price}</span>
                        </div>
                    </div>
                </div>

                <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br flex-shrink-0", gradient)}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className={cn("text-[10px] font-bold", place.openNow ? "text-emerald-400" : "text-red-400")}>
                            {place.openNow ? 'Open Now' : 'Closed'}
                        </span>
                    </div>
                    
                    <p className="text-xs text-secondary line-clamp-2 leading-relaxed mb-2">{place.description}</p>
                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                        {place.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-surface/80 text-secondary text-[10px] rounded-full border border-slate-700/50">{tag}</span>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                        <div className="flex items-center gap-1 text-[10px] text-secondary">
                            <TrendingUp className="w-3 h-3 text-action" /><span>{place.visitors} visitors</span>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`, '_blank');
                            }}
                            className="flex items-center gap-1 text-[10px] text-action font-bold">
                            <Navigation className="w-3 h-3" /> Directions
                        </button>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

// ══════════════════════════════════════════════════
// REAL PLACE CARD (with photo)
// ══════════════════════════════════════════════════
function RealPlaceCard({ place, delay, isSaved, onSave, onClick }: { place: DisplayPlace; delay: number; isSaved: boolean; onSave: () => void; onClick: () => void }) {
    const categoryColors: Record<string, string> = {
        hotel: 'from-blue-500 to-indigo-500', food: 'from-red-500 to-pink-500',
        cafe: 'from-amber-500 to-orange-500', culture: 'from-purple-500 to-indigo-500',
        nature: 'from-emerald-500 to-teal-500', nightlife: 'from-violet-500 to-purple-500',
        shopping: 'from-rose-500 to-pink-500', photo: 'from-cyan-500 to-blue-500',
    };
    const gradient = categoryColors[place.categoryId] || 'from-gray-500 to-gray-600';

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            onClick={onClick} className="cursor-pointer">
            <GlassCard className="overflow-hidden">
                <div className="relative h-36 overflow-hidden">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                        {place.source === 'foursquare' && (
                            <span className="px-2 py-0.5 bg-blue-500/90 text-white text-[9px] font-bold rounded-full backdrop-blur-sm">✓ VERIFIED</span>
                        )}
                        {place.price && (
                            <span className="px-2 py-0.5 bg-emerald-500/90 text-white text-[9px] font-bold rounded-full backdrop-blur-sm">{place.price}</span>
                        )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onSave(); }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <Bookmark className={cn("w-4 h-4 transition-colors", isSaved ? "text-amber-400 fill-amber-400" : "text-white")} />
                    </button>
                    <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="font-bold text-sm text-white drop-shadow-lg truncate">{place.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            {place.rating && (
                                <span className="flex items-center gap-0.5 text-xs text-white">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="font-bold">{place.rating.toFixed(1)}</span>
                                </span>
                            )}
                            <span className="text-[10px] text-white/80">{place.category}</span>
                            {place.distance && <span className="text-[10px] text-white/70">{place.distance}</span>}
                        </div>
                    </div>
                </div>
                <div className="p-3">
                    {place.address && (
                        <p className="text-xs text-secondary truncate mb-2">
                            <MapPin className="w-3 h-3 inline mr-1" />{place.address}
                        </p>
                    )}
                    <div className="flex items-center justify-between">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r text-white", gradient)}>
                            {place.category.split(' ')[0]} {place.categoryId.charAt(0).toUpperCase() + place.categoryId.slice(1)}
                        </span>
                        <span className="text-[10px] text-action font-medium">Tap for details →</span>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

// ══════════════════════════════════════════════════
// PLACE DETAIL MODAL
// ══════════════════════════════════════════════════
function PlaceDetailModal({ place, onClose, isSaved, onSave }: { place: DisplayPlace; onClose: () => void; isSaved: boolean; onSave: () => void }) {
    const openGoogleMaps = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`, '_blank');
    };
    const openGoogleSearch = () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(place.name + ' ' + place.city)}`, '_blank');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md bg-surface border border-slate-700 rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="relative h-52">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={onSave} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Bookmark className={cn("w-5 h-5", isSaved ? "text-amber-400 fill-amber-400" : "text-white")} />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-1">
                            {place.source === 'foursquare' && <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">✓ VERIFIED</span>}
                            {place.price && <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">{place.price}</span>}
                        </div>
                        <h2 className="text-xl font-bold text-white drop-shadow-lg">{place.name}</h2>
                        <p className="text-sm text-white/80">{place.category}</p>
                    </div>
                </div>
                <div className="p-5 space-y-4">
                    {place.rating && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 rounded-xl">
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                <span className="text-lg font-bold text-amber-400">{place.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-secondary">out of 5.0</span>
                        </div>
                    )}
                    {place.address && (
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-action flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-white">{place.address}</p>
                                {place.city && <p className="text-xs text-secondary">{place.city}</p>}
                            </div>
                        </div>
                    )}
                    {place.phone && (
                        <a href={`tel:${place.phone}`} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
                            <Phone className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm font-medium text-white">{place.phone}</span>
                        </a>
                    )}
                    {place.website && (
                        <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
                            <ExternalLink className="w-5 h-5 text-blue-400" />
                            <span className="text-sm font-medium text-white truncate">{place.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                    )}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={openGoogleMaps}
                            className="flex items-center justify-center gap-2 p-3 bg-action rounded-xl text-white font-bold text-sm">
                            <Navigation className="w-4 h-4" /> Directions
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={openGoogleSearch}
                            className="flex items-center justify-center gap-2 p-3 bg-white/10 rounded-xl text-white font-bold text-sm">
                            <Search className="w-4 h-4" /> More Info
                        </motion.button>
                    </div>
                    <p className="text-[10px] text-center text-secondary/50">
                        Data from {place.source === 'foursquare' ? 'Foursquare' : 'OpenStreetMap'} • Lat: {place.lat.toFixed(4)}, Lon: {place.lon.toFixed(4)}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ══════════════════════════════════════════════════
// VIBE DETAIL MODAL
// ══════════════════════════════════════════════════
function VibeDetailModal({ place, onClose, isSaved, onSave }: { place: VibePlace; onClose: () => void; isSaved: boolean; onSave: () => void }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md bg-surface border border-slate-700 rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="relative h-56">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={onSave} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Bookmark className={cn("w-5 h-5", isSaved ? "text-amber-400 fill-amber-400" : "text-white")} />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            {place.isHidden && <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">SECRET</span>}
                            <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full", place.openNow ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                                {place.openNow ? 'Open Now' : 'Closed'}
                            </span>
                            <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full backdrop-blur-md">{place.price}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white drop-shadow-lg leading-tight mb-1">{place.name}</h2>
                        <p className="text-sm text-white/80 capitalize">{place.category}</p>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 rounded-xl">
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                <span className="text-lg font-bold text-amber-400">{place.rating.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-secondary font-medium px-3 py-1.5 bg-white/5 rounded-xl">
                            <TrendingUp className="w-4 h-4 text-action" /> {place.visitors} visitors
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" /> Why locals love it
                        </h4>
                        <p className="text-sm text-secondary leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                            {place.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {place.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-surface/80 border border-slate-700 rounded-lg text-xs font-medium text-secondary">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`, '_blank')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-action rounded-xl text-white font-bold text-sm shadow-lg shadow-action/20">
                        <Navigation className="w-4 h-4" /> Get Directions ({place.distance})
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
