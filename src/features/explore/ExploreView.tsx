import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Star, ShieldCheck, Heart, Sparkles,
    Eye, Utensils, Home, Map, Zap, Camera, Coffee,
    TreePine, Sun, Moon, DollarSign, Filter, Plus, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { SubmitSecretModal } from '../../components/SubmitSecretModal';
import { secretsService } from '../../services/secretsService';
import type { LocalSecret } from '../../types/database.types';

type Mood = 'All' | 'Calm' | 'Energetic' | 'Aesthetic' | 'Foodie' | 'Local';
type Category = 'All' | 'Viewpoints' | 'Food' | 'Stays' | 'Shortcuts' | 'Activities';

interface Place {
    id: string;
    name: string;
    type: string;
    category: Category;
    moods: Mood[];
    rating: number;
    image: string;
    isSecret?: boolean;
    distance: string;
    price?: string;
    bestTime?: string;
    aiVerified?: boolean;
    description?: string;
}

// Map Supabase LocalSecret → component Place shape
function mapSecretCategoryToCategory(type: string): Category {
    switch (type) {
        case 'viewpoint': return 'Viewpoints';
        case 'food': case 'cafe': return 'Food';
        case 'stay': return 'Stays';
        case 'shortcut': return 'Shortcuts';
        case 'activity': return 'Activities';
        default: return 'Activities';
    }
}

function mapDbSecret(db: LocalSecret): Place {
    return {
        id: db.id,
        name: db.name,
        type: db.type.charAt(0).toUpperCase() + db.type.slice(1),
        category: mapSecretCategoryToCategory(db.type),
        moods: ['Local'] as Mood[],
        rating: Math.min(5, 4.0 + (db.upvotes / 100)),
        image: db.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=500',
        isSecret: true,
        distance: db.destination || '',
        aiVerified: db.is_verified,
        description: db.description || undefined,
    };
}

// Fallback mock data for when Supabase is unavailable
const FALLBACK_PLACES: Place[] = [
    {
        id: '1',
        name: 'Hidden Alley Café',
        type: 'Café',
        category: 'Food',
        moods: ['Calm', 'Aesthetic', 'Local', 'Foodie'],
        rating: 4.8,
        distance: '0.2 km',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=500',
        isSecret: true,
        price: '$$',
        aiVerified: true,
        description: 'Cozy spot with best matcha in town'
    },
    {
        id: '2',
        name: 'Sunset Cliff Point',
        type: 'Viewpoint',
        category: 'Viewpoints',
        moods: ['Calm', 'Aesthetic', 'Local'],
        rating: 4.9,
        distance: '3.2 km',
        image: 'https://images.unsplash.com/photo-1616036740257-9449ea1f6605?auto=format&fit=crop&q=80&w=500',
        isSecret: true,
        bestTime: 'Sunset',
        aiVerified: true,
        description: 'Locals-only sunset spot, avoid weekends'
    },
    {
        id: '3',
        name: 'Street Food Market',
        type: 'Market',
        category: 'Food',
        moods: ['Foodie', 'Energetic', 'Local'],
        rating: 4.7,
        distance: '0.8 km',
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=500',
        price: '$',
        description: 'Best local street food, try the dumplings'
    },
    {
        id: '4',
        name: 'Neon Arcade Center',
        type: 'Entertainment',
        category: 'Activities',
        moods: ['Energetic', 'Local'],
        rating: 4.5,
        distance: '1.5 km',
        image: 'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80&w=500',
        price: '$$',
        bestTime: 'Evening'
    },
    {
        id: '5',
        name: 'Temple Back Route',
        type: 'Shortcut',
        category: 'Shortcuts',
        moods: ['Calm', 'Aesthetic', 'Local'],
        rating: 4.6,
        distance: '0.1 km',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=500',
        isSecret: true,
        description: 'Skip crowds, beautiful stone path'
    },
];

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
    'All': Map,
    'Viewpoints': Eye,
    'Food': Utensils,
    'Stays': Home,
    'Shortcuts': Zap,
    'Activities': TreePine,
};

const MOOD_ICONS: Record<Mood, { icon: React.ElementType; color: string }> = {
    'All': { icon: Sparkles, color: 'text-action' },
    'Calm': { icon: Coffee, color: 'text-teal-400' },
    'Energetic': { icon: Zap, color: 'text-amber-400' },
    'Aesthetic': { icon: Camera, color: 'text-pink-400' },
    'Foodie': { icon: Utensils, color: 'text-orange-400' },
    'Local': { icon: Star, color: 'text-purple-400' },
};

export function ExploreView() {
    const [activeMood, setActiveMood] = useState<Mood>('All');
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadSecrets = async () => {
        setIsLoading(true);
        const { data, error } = await secretsService.getSecrets();
        if (error || data.length === 0) {
            setPlaces(FALLBACK_PLACES);
        } else {
            setPlaces(data.map(mapDbSecret));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadSecrets();
    }, []);

    const filteredPlaces = places.filter(p =>
        (activeMood === 'All' || p.moods.includes(activeMood)) &&
        (activeCategory === 'All' || p.category === activeCategory) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleSaved = (id: string) => {
        setSavedPlaces(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const secretCount = filteredPlaces.filter(p => p.isSecret).length;

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">AI-Powered Discovery</span>
                </div>
                <h1 className="text-3xl font-bold text-gradient-green mb-1">
                    Local Secrets
                </h1>
                <p className="text-secondary text-sm">Hidden gems curated by locals & AI</p>
            </motion.header>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <GlassCard className="p-1 mb-5">
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-secondary ml-3" />
                        <input
                            type="text"
                            placeholder="Search hidden spots..."
                            className="flex-1 bg-transparent py-3 focus:outline-none placeholder:text-slate-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "p-2 rounded-lg mr-1 transition-colors",
                                showFilters ? "bg-action text-white" : "text-secondary hover:text-white"
                            )}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Category Filter */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                    >
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {(Object.keys(CATEGORY_ICONS) as Category[]).map((category) => {
                                const Icon = CATEGORY_ICONS[category];
                                return (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                                            activeCategory === category
                                                ? "bg-action text-white"
                                                : "bg-surface/50 border border-slate-800 text-secondary hover:border-slate-600"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{category}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mood Selector */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2 overflow-x-auto pb-4 no-scrollbar"
            >
                {(Object.keys(MOOD_ICONS) as Mood[]).map((mood) => {
                    const { icon: Icon, color } = MOOD_ICONS[mood];
                    return (
                        <motion.button
                            key={mood}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveMood(mood)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 font-medium",
                                activeMood === mood
                                    ? "bg-white text-black shadow-lg shadow-white/10"
                                    : "bg-surface/50 border border-slate-800 text-secondary hover:border-slate-600"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", activeMood === mood ? "text-black" : color)} />
                            {mood}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold">
                        {activeMood === 'All' && activeCategory === 'All'
                            ? 'All Hidden Gems'
                            : activeCategory !== 'All'
                                ? `${activeCategory}`
                                : `${activeMood} Vibes`}
                    </h3>
                    <p className="text-xs text-secondary">
                        {filteredPlaces.length} spots • {secretCount} secrets
                    </p>
                </div>
                {secretCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-bold">{secretCount} Secrets</span>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-action animate-spin mb-3" />
                    <p className="text-secondary text-sm">Discovering hidden gems...</p>
                </div>
            )}

            {/* Places Grid */}
            {!isLoading && (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredPlaces.map((place, i) => (
                            <motion.div
                                layout
                                key={place.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <PlaceCard
                                    place={place}
                                    isSaved={savedPlaces.includes(place.id)}
                                    onToggleSave={() => toggleSaved(place.id)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredPlaces.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-20 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface/50 flex items-center justify-center">
                                <Search className="w-8 h-8 text-secondary" />
                            </div>
                            <p className="text-secondary mb-2">No spots found for this vibe</p>
                            <button
                                onClick={() => { setActiveMood('All'); setActiveCategory('All'); }}
                                className="text-action hover:underline"
                            >
                                Clear filters
                            </button>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Submit Secret FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSubmitModal(true)}
                className="fixed bottom-24 left-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg shadow-purple-500/30 flex items-center gap-2 z-40"
            >
                <Plus className="w-5 h-5" />
                <span className="text-sm">Share Secret</span>
            </motion.button>

            {/* Submit Secret Modal */}
            <SubmitSecretModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onSuccess={() => {
                    loadSecrets(); // Refresh after new submission
                }}
            />
        </div>
    );
}

interface PlaceCardProps {
    place: Place;
    isSaved: boolean;
    onToggleSave: () => void;
}

function PlaceCard({ place, isSaved, onToggleSave }: PlaceCardProps) {
    return (
        <GlassCard className="overflow-hidden group cursor-pointer">
            <div className="relative aspect-[16/9]">
                <img
                    src={place.image}
                    alt={place.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <div className="flex gap-2">
                        {place.isSecret && (
                            <div className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md rounded-full flex items-center gap-1 shadow-lg">
                                <ShieldCheck className="w-3 h-3 text-white" />
                                <span className="text-[10px] font-bold text-white">SECRET</span>
                            </div>
                        )}
                        {place.aiVerified && (
                            <div className="px-2.5 py-1 bg-purple-500/90 backdrop-blur-md rounded-full flex items-center gap-1 shadow-lg">
                                <Sparkles className="w-3 h-3 text-white" />
                                <span className="text-[10px] font-bold text-white">AI VERIFIED</span>
                            </div>
                        )}
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <Heart className={cn(
                            "w-5 h-5 transition-colors",
                            isSaved ? "text-red-500 fill-red-500" : "text-white"
                        )} />
                    </motion.button>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h4 className="text-xl font-bold text-white mb-0.5">{place.name}</h4>
                            {place.description && (
                                <p className="text-white/70 text-sm line-clamp-1">{place.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur rounded-lg">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-white">{place.rating.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-white/80 flex-wrap">
                        {place.distance && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {place.distance}
                            </span>
                        )}
                        {place.distance && <span className="w-1 h-1 rounded-full bg-white/40" />}
                        <span>{place.type}</span>
                        {place.price && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-white/40" />
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> {place.price}
                                </span>
                            </>
                        )}
                        {place.bestTime && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-white/40" />
                                <span className="flex items-center gap-1">
                                    {place.bestTime === 'Morning' && <Sun className="w-3 h-3" />}
                                    {place.bestTime === 'Evening' && <Moon className="w-3 h-3" />}
                                    {place.bestTime === 'Sunset' && <Sun className="w-3 h-3 text-orange-400" />}
                                    {place.bestTime === 'Golden Hour' && <Camera className="w-3 h-3 text-amber-400" />}
                                    {place.bestTime}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mood Tags */}
            <div className="p-3 flex gap-2 overflow-x-auto no-scrollbar">
                {place.moods.filter(m => m !== 'All').slice(0, 3).map(mood => {
                    const { color } = MOOD_ICONS[mood];
                    return (
                        <span
                            key={mood}
                            className={cn("px-2 py-1 bg-surface/80 rounded-full text-xs font-medium", color)}
                        >
                            {mood}
                        </span>
                    );
                })}
            </div>
        </GlassCard>
    );
}
