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
                const gems = await searchHiddenGems(targetCity || 'Delhi', 15); 
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

    useEffect(() => {
        const target = tripData?.destination || 'Delhi';
        if (tripData?.destination && !hasSearched) {
            setSearchCity(tripData.destination);
            handleCitySearch(tripData.destination);
        }
        loadVibes(target);
    }, [tripData?.destination]);

    const toggleSave = (id: string) => {
        setSavedPlaces(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

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
        loadVibes(target);
    };

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
            
            setPlaces(merged);
            setHasSearched(true);
            setSearchCity('Current Location');
            setActiveTab('places');
            
            if (merged.length > 0) showToast(`Found ${merged.length} places near you!`, 'success');
            else showToast('No places found nearby', 'info');
        } catch { showToast('Failed to discover nearby places', 'error'); }
        finally { setIsLoadingNearby(false); }
    };

    const filteredVibes = vibePlaces.filter(p => {
        if (vibeCategory !== 'all' && p.category !== vibeCategory) return false;
        if (showHiddenOnly && !p.isHidden) return false;
        if (vibeSearch) {
            const q = vibeSearch.toLowerCase();
            return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
        }
        return true;
    });

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
        <div className="min-h-screen bg-white pb-32">
            {/* STICKY HEADER */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100 px-6 py-8">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Curated Intelligence</span>
                        </div>
                        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Discovery</h1>
                    </div>
                    <div className="flex gap-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={discoverNearby}
                            className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-900 hover:bg-stone-100 transition-all">
                            <Navigation className="w-5 h-5" />
                        </motion.button>
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Compass className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <p className="text-stone-400 text-sm font-medium">
                    {tripData ? `Exploring ${tripData.destination}` : 'Global hidden gems and real hotspots'}
                </p>

                {/* TAB SWITCHER */}
                <div className="mt-8 p-1.5 bg-stone-100 rounded-[24px] flex gap-2">
                    <button onClick={() => setActiveTab('vibes')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'vibes' ? "bg-white text-stone-900 shadow-soft" : "text-stone-400 hover:text-stone-600"
                        )}>
                        <Sparkles className={cn("w-4 h-4", activeTab === 'vibes' ? "text-primary" : "text-stone-400")} />
                        Local Vibes
                    </button>
                    <button onClick={() => setActiveTab('places')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'places' ? "bg-white text-stone-900 shadow-soft" : "text-stone-400 hover:text-stone-600"
                        )}>
                        <Globe className={cn("w-4 h-4", activeTab === 'places' ? "text-blue-500" : "text-stone-400")} />
                        Real Places
                    </button>
                </div>
            </div>

            <div className="px-6 mt-6">
                {/* ═══════════════════════════════════ */}
                {/* TAB 1: LOCAL VIBES                  */}
                {/* ═══════════════════════════════════ */}
                {activeTab === 'vibes' && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        {/* Search + Hidden Filter */}
                        <div className="flex gap-3">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-primary transition-colors" />
                                <input type="text" value={vibeSearch} onChange={(e) => setVibeSearch(e.target.value)}
                                    placeholder="Search the underground..."
                                    className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-[20px] text-sm font-bold focus:ring-2 ring-primary/10 placeholder:text-stone-300 text-stone-900 transition-all" />
                            </div>
                            <button onClick={() => setShowHiddenOnly(!showHiddenOnly)}
                                className={cn("px-5 rounded-[20px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                    showHiddenOnly ? "bg-stone-900 text-white shadow-lg" : "bg-white border border-stone-100 text-stone-400 hover:border-stone-200")}>
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Hidden</span>
                            </button>
                        </div>

                        {/* Category Filters */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
                            {VIBE_FILTERS.map(cat => (
                                <button key={cat.id} onClick={() => setVibeCategory(cat.id)}
                                    className={cn("flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all whitespace-nowrap flex-shrink-0 border",
                                        vibeCategory === cat.id ? "bg-stone-900 text-white border-stone-900 shadow-soft" : "bg-white text-stone-400 border-stone-100 hover:border-stone-200")}>
                                    <cat.icon className={cn("w-3.5 h-3.5", vibeCategory === cat.id ? "text-primary" : "text-stone-400")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* AI Pick of the Day */}
                        {aiPick && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group cursor-pointer" onClick={() => setSelectedVibe(aiPick)}>
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[40px] opacity-10 group-hover:opacity-20 blur-xl transition-all" />
                                <div className="relative bg-white border border-stone-100 rounded-[32px] overflow-hidden shadow-soft">
                                    <div className="absolute top-0 right-0 p-6">
                                        <div className="px-3 py-1.5 bg-primary rounded-full flex items-center gap-1.5 shadow-lg">
                                            <Sparkles className="w-3 h-3 text-white" />
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest">AI Pick</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row h-full">
                                        <div className="p-8 flex-1 flex flex-col justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Trending Underground</p>
                                                <h3 className="text-2xl font-black text-stone-900 mb-3 tracking-tight">{aiPick.name}</h3>
                                                <p className="text-sm text-stone-400 font-medium mb-6 line-clamp-2 leading-relaxed">{aiPick.description}</p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-primary fill-primary" />
                                                    <span className="text-sm font-black text-stone-900">{aiPick.rating.toFixed(1)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-emerald-400" />
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{aiPick.openNow ? 'Open Now' : 'Closed'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                                            <img src={aiPick.image} alt={aiPick.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-110 transition-all duration-700" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Hidden Gems List Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-stone-900 tracking-tight">Curation</h2>
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Verified Local Knowledge</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-4 py-2 bg-stone-50 rounded-xl flex items-center gap-2">
                                    <Gem className="w-3.5 h-3.5 text-purple-500" />
                                    <span className="text-sm font-black text-stone-900">{vibePlaces.length}</span>
                                </div>
                            </div>
                        </div>
                        
                        {isLoadingVibes ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                </div>
                                <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest">Compiling Local Intel...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredVibes.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <Compass className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                                        <p className="text-sm font-black text-stone-400 uppercase tracking-widest">No Signal Found</p>
                                    </div>
                                ) : (
                                    filteredVibes.map((place, i) => (
                                        <VibePlaceCard key={place.id} place={place} delay={i * 0.05}
                                            isSaved={savedPlaces.has(place.id)} onSave={() => toggleSave(place.id)}
                                            onClick={() => setSelectedVibe(place)} />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Switch CTA */}
                        <div className="pt-8">
                            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setActiveTab('places')}
                                className="w-full p-8 bg-stone-50 rounded-[40px] border border-stone-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Need Concrete Details?</p>
                                    <h4 className="text-xl font-black text-stone-900">Switch to Verified Entities</h4>
                                    <p className="text-xs text-stone-400 font-medium mt-1">Real hotels, confirmed restaurants & global hotspots</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-900 shadow-soft group-hover:bg-primary group-hover:text-white transition-all">
                                    <Globe className="w-5 h-5" />
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════ */}
                {/* TAB 2: REAL PLACES                  */}
                {/* ═══════════════════════════════════ */}
                {activeTab === 'places' && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        {/* City Search Bar */}
                        <div className="bg-stone-50 rounded-[32px] p-8 border border-stone-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Globe className="w-32 h-32 text-stone-900" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Global Search Engine</p>
                                <h2 className="text-2xl font-black text-stone-900 mb-6 tracking-tight">Where to next?</h2>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                        <input type="text" value={searchCity} onChange={(e) => setSearchCity(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                                            placeholder="Enter destination..."
                                            className="w-full pl-12 pr-5 py-4 bg-white border border-stone-200 rounded-[20px] text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:ring-2 ring-primary/10 transition-all" />
                                    </div>
                                    <button onClick={() => handleCitySearch()} disabled={isLoading}
                                        className="px-6 rounded-[20px] bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-stone-200 disabled:opacity-50 transition-all">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Category Filters */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
                            {REAL_FILTERS.map(cat => (
                                <button key={cat.id} onClick={() => setRealCategory(cat.id)}
                                    className={cn("flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all whitespace-nowrap flex-shrink-0 border",
                                        realCategory === cat.id ? "bg-stone-900 text-white border-stone-900 shadow-soft" : "bg-white text-stone-400 border-stone-100 hover:border-stone-200")}>
                                    <cat.icon className={cn("w-3.5 h-3.5", realCategory === cat.id ? "text-blue-500" : "text-stone-400")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Real Places Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-stone-900 tracking-tight">Verified Entities</h2>
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Sourced from Global Database</p>
                                </div>
                                <div className="px-4 py-2 bg-stone-50 rounded-xl flex items-center gap-2">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-black text-stone-900">{filteredPlaces.length}</span>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    </div>
                                    <p className="text-[11px] font-black text-stone-400 uppercase tracking-widest">Querying Real World Data...</p>
                                </div>
                            ) : !hasSearched ? (
                                <div className="py-20 text-center bg-stone-50 rounded-[40px] border-2 border-dashed border-stone-100">
                                    <Globe className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                                    <p className="text-sm font-black text-stone-400 uppercase tracking-widest">Enter a city to explore</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredPlaces.map((place, i) => (
                                        <RealPlaceCard key={place.id} place={place} delay={i * 0.03}
                                            isSaved={savedPlaces.has(place.id)} onSave={() => toggleSave(place.id)}
                                            onClick={() => setSelectedPlace(place)} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Switch CTA */}
                        <div className="pt-8">
                            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setActiveTab('vibes')}
                                className="w-full p-8 bg-stone-50 rounded-[40px] border border-stone-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Bored of the mainstream?</p>
                                    <h4 className="text-xl font-black text-stone-900">Switch to Hidden Gems</h4>
                                    <p className="text-xs text-stone-400 font-medium mt-1">Discover secret spots & local underground favorites</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-900 shadow-soft group-hover:bg-primary group-hover:text-white transition-all">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {selectedPlace && (
                    <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)}
                        isSaved={savedPlaces.has(selectedPlace.id)} onSave={() => toggleSave(selectedPlace.id)} />
                )}
                {selectedVibe && (
                    <VibeDetailModal place={selectedVibe} onClose={() => setSelectedVibe(null)}
                        isSaved={savedPlaces.has(selectedVibe.id)} onSave={() => toggleSave(selectedVibe.id)} />
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
    if (nearbyPlaces.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-black text-stone-900 tracking-tight">Proximity</h2>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Real-time Location Pulse</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowNearbyMap(!showNearbyMap)}
                        className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            showNearbyMap ? "bg-stone-900 text-white shadow-lg" : "bg-stone-50 text-stone-400")}>
                        <MapPinned className="w-3.5 h-3.5" />
                    </button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={discoverNearby} disabled={isLoadingNearby}
                        className="px-4 py-2 bg-primary rounded-xl text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-primary/20">
                        {isLoadingNearby ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Refresh'}
                    </motion.button>
                </div>
            </div>
            
            {showNearbyMap && nearbyMarkers.length > 0 && (
                <div className="mb-6 rounded-[32px] overflow-hidden border border-stone-100 shadow-soft">
                    <MapView markers={nearbyMarkers} height="280px" showUserLocation />
                </div>
            )}

            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4">
                {nearbyPlaces.slice(0, 8).map(place => (
                    <motion.div key={place.id} whileTap={{ scale: 0.98 }}
                        className="w-64 flex-shrink-0 bg-white p-4 rounded-[28px] border border-stone-100 shadow-soft flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-lg shadow-inner">
                                {place.category.split(' ')[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-stone-900 truncate">{place.name}</p>
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest truncate">{place.address || place.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                            {place.rating ? (
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-[11px] font-black text-stone-900">{place.rating.toFixed(1)}</span>
                                </div>
                            ) : <div />}
                            <div className="flex items-center gap-1 px-2 py-1 bg-stone-50 rounded-lg text-[9px] font-black text-stone-400 uppercase tracking-widest">
                                <Navigation className="w-2.5 h-2.5" />
                                {place.distance || 'Nearby'}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {/* Expedition Essentials (Utilities) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12 px-6 pb-32">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black text-stone-900 tracking-tight uppercase tracking-[0.1em]">Expedition Essentials</h2>
                            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Advanced Travel Intelligence</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Cab Booking', color: 'from-amber-400 to-amber-500', emoji: '🚖', tab: 'cabs' as any, desc: 'City Transit' },
                            { label: 'Visa Guide', color: 'from-purple-400 to-purple-500', emoji: '🛂', tab: 'visa' as any, desc: 'Global Entry' },
                            { label: 'Smart Packing', color: 'from-lime-400 to-lime-500', emoji: '🎒', tab: 'packing' as any, desc: 'Inventory' },
                            { label: 'Vault Docs', color: 'from-cyan-400 to-cyan-500', emoji: '📄', tab: 'documents' as any, desc: 'Security' },
                            { label: 'Trip Budget', color: 'from-indigo-400 to-indigo-500', emoji: '💰', tab: 'wallet' as any, desc: 'Finance' },
                            { label: 'Safety Shield', color: 'from-rose-400 to-rose-500', emoji: '🛡️', tab: 'safety' as any, desc: 'Protection' },
                        ].map((action, i) => (
                            <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="cursor-pointer">
                                <div className="p-4 rounded-[2.5rem] bg-stone-50 border border-stone-100 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${action.color} opacity-10 rounded-bl-3xl group-hover:scale-110 transition-transform`} />
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white text-xl shadow-sm`}>
                                        {action.emoji}
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-stone-900 truncate">{action.label}</span>
                                        <span className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider truncate">{action.desc}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════
// VIBE PLACE CARD
// ══════════════════════════════════════════════════
function VibePlaceCard({ place, delay, isSaved, onSave, onClick }: { place: VibePlace; delay: number; isSaved: boolean; onSave: () => void; onClick: () => void }) {
    const categoryIcons: Record<string, React.ElementType> = {
        cafe: Coffee, food: Utensils, culture: Palette, nature: TreePine,
        nightlife: Music, shopping: ShoppingBag, photo: Camera,
    };
    const Icon = categoryIcons[place.category] || Compass;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            onClick={onClick} className="group cursor-pointer bg-stone-50 rounded-[32px] border border-stone-100 shadow-sm overflow-hidden hover:border-primary/20 transition-all duration-300">
            <div className="relative aspect-[16/10] overflow-hidden">
                <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                    {place.isHidden && (
                        <div className="px-3 py-1.5 bg-stone-900/40 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-1.5">
                            <Eye className="w-3 h-3 text-primary" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Secret</span>
                        </div>
                    )}
                </div>

                <button onClick={(e) => { e.stopPropagation(); onSave(); }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all">
                    <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                </button>

                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{place.category}</p>
                        <h3 className="text-lg font-black text-white tracking-tight leading-tight">{place.name}</h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl px-3 py-1.5 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-black text-white">{place.rating}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <p className="text-xs text-stone-500 font-medium leading-relaxed line-clamp-2">{place.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Navigation className="w-3 h-3 text-stone-400" />
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{place.distance}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3 text-primary" />
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", place.openNow ? "text-emerald-500" : "text-red-500")}>
                                {place.openNow ? 'Active' : 'Locked'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{place.visitors}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ══════════════════════════════════════════════════
// REAL PLACE CARD
// ══════════════════════════════════════════════════
function RealPlaceCard({ place, delay, isSaved, onSave, onClick }: { place: DisplayPlace; delay: number; isSaved: boolean; onSave: () => void; onClick: () => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            onClick={onClick} className="group cursor-pointer bg-white rounded-[32px] border border-stone-100 shadow-soft overflow-hidden hover:border-primary/20 transition-all duration-300 flex">
            <div className="w-32 sm:w-40 relative flex-shrink-0 overflow-hidden">
                <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{place.categoryId}</p>
                        {place.rating && (
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-xs font-black text-stone-900">{place.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-base font-black text-stone-900 tracking-tight leading-tight mb-2 line-clamp-1">{place.name}</h3>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest truncate">{place.address || place.city}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                        {place.source === 'foursquare' && (
                            <div className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">
                                <Globe className="w-2.5 h-2.5" />
                                Verified
                            </div>
                        )}
                        {place.price && <span className="text-[10px] font-black text-stone-900">{place.price}</span>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onSave(); }}
                        className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all", 
                            isSaved ? "bg-primary/10 text-primary" : "bg-stone-50 text-stone-400 hover:text-stone-900")}>
                        <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ══════════════════════════════════════════════════
// PLACE DETAIL MODAL
// ══════════════════════════════════════════════════
function PlaceDetailModal({ place, onClose, isSaved, onSave }: { place: DisplayPlace; onClose: () => void; isSaved: boolean; onSave: () => void }) {
    const openGoogleMaps = () => window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`, '_blank');
    const openGoogleSearch = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(place.name + ' ' + place.city)}`, '_blank');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-end justify-center p-4 pb-0"
            onClick={onClose}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white dark:bg-stone-950 rounded-t-[48px] overflow-hidden shadow-2xl relative">
                
                <div className="relative aspect-[16/9] sm:aspect-[21/9]">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-6 left-6 right-6 flex justify-between">
                        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <button onClick={onSave} className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                        </button>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex items-center gap-3 mb-3">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{place.categoryId}</p>
                            {place.source === 'foursquare' && (
                                <span className="px-3 py-1 bg-blue-500 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-500/20">Verified Identity</span>
                            )}
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{place.name}</h2>
                        <p className="text-sm font-medium text-stone-300">{place.category}</p>
                    </div>
                </div>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                    <div className="flex flex-wrap gap-8">
                        {place.rating && (
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Aggregate Score</p>
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span className="text-2xl font-black text-stone-900">{place.rating.toFixed(1)}</span>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Monetary Scale</p>
                            <span className="text-xl font-black text-stone-900">{place.price || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Physical Address</p>
                        <div className="flex items-start gap-4 p-5 bg-stone-50 rounded-[24px]">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <div>
                                <p className="text-base font-bold text-stone-900">{place.address}</p>
                                <p className="text-xs font-black text-stone-400 uppercase tracking-widest mt-1">{place.city}</p>
                            </div>
                        </div>
                    </div>

                    {(place.phone || place.website) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {place.phone && (
                                <a href={`tel:${place.phone}`} className="flex items-center gap-4 p-5 bg-indigo-50 rounded-[24px] border border-indigo-100/50 hover:bg-indigo-100 transition-all">
                                    <Phone className="w-5 h-5 text-indigo-500" />
                                    <span className="text-sm font-black text-indigo-900">Voice Link</span>
                                </a>
                            )}
                            {place.website && (
                                <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-emerald-50 rounded-[24px] border border-emerald-100/50 hover:bg-emerald-100 transition-all overflow-hidden">
                                    <ExternalLink className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <span className="text-sm font-black text-emerald-900 truncate">Digital Portal</span>
                                </a>
                            )}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 pb-12">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={openGoogleMaps}
                            className="flex-1 py-5 bg-stone-900 rounded-[24px] text-white font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl">
                            <Navigation className="w-4 h-4" />
                            Route Intel
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={openGoogleSearch}
                            className="flex-1 py-5 bg-stone-50 rounded-[24px] text-stone-900 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-stone-100">
                            <Search className="w-4 h-4" />
                            Extended Data
                        </motion.button>
                    </div>
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
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-end justify-center p-4 pb-0"
            onClick={onClose}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-white dark:bg-stone-950 rounded-t-[48px] overflow-hidden shadow-2xl relative">
                
                <div className="relative aspect-[16/9] sm:aspect-[21/9]">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
                    
                    <div className="absolute top-6 left-6 right-6 flex justify-between">
                        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <button onClick={onSave} className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                        </button>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex items-center gap-3 mb-3">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{place.category}</p>
                            {place.isHidden && (
                                <span className="px-3 py-1 bg-purple-500 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg shadow-purple-500/20">Secret Intel</span>
                            )}
                            <div className={cn("px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest", place.openNow ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20 shadow-lg")}>
                                {place.openNow ? 'Active Now' : 'Locked'}
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{place.name}</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-black text-white">{place.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-xs font-medium text-stone-300">{place.price} Scale</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                    <div className="p-8 bg-stone-900 rounded-[32px] text-white">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Why locals love it</p>
                        <p className="text-lg font-medium text-stone-300 leading-relaxed italic">"{place.description}"</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Semantic Metadata</p>
                        <div className="flex flex-wrap gap-2">
                            {place.tags.map((tag, i) => (
                                <span key={i} className="px-5 py-2.5 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-black text-stone-900 uppercase tracking-widest">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-stone-50 rounded-[32px]">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            <div>
                                <p className="text-base font-black text-stone-900">{place.visitors}</p>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Monthly Footfall</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-stone-200" />
                        <div className="flex items-center gap-3">
                            <Navigation className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-base font-black text-stone-900">{place.distance}</p>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Radial Range</p>
                            </div>
                        </div>
                    </div>

                    <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`, '_blank')}
                        className="w-full py-5 bg-primary rounded-[24px] text-white font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 mb-12">
                        <Navigation className="w-4 h-4" />
                        Acquire Directions
                    </motion.button>
                    
                    <div className="pb-12" />
                </div>
            </motion.div>
        </motion.div>
    );
}
