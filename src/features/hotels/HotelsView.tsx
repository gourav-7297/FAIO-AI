import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Star, ShieldCheck, Leaf, Heart,
    Filter, Hotel, Home, Tent, ChevronRight
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { hotelsService } from '../../services/hotelsService';
import type { Hotel as HotelType } from '../../types/database.types';
import { cn } from '../../lib/utils';

type HotelTypeFilter = 'all' | 'hotel' | 'hostel' | 'eco-stay' | 'homestay';

// Mock data for when Supabase tables don't exist yet
const mockHotels: HotelType[] = [
    {
        id: '1', destination: 'Tokyo', name: 'Sakura Inn', type: 'hotel',
        price_per_night: 120, rating: 4.8, safety_verified: true, women_friendly: true,
        eco_certified: true, amenities: ['WiFi', 'Breakfast', 'AC'],
        image_url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=400',
        location: null
    },
    {
        id: '2', destination: 'Tokyo', name: 'Shibuya Hostel', type: 'hostel',
        price_per_night: 45, rating: 4.5, safety_verified: true, women_friendly: true,
        eco_certified: false, amenities: ['WiFi', 'Locker', 'Common Kitchen'],
        image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
        location: null
    },
    {
        id: '3', destination: 'Tokyo', name: 'Zen Garden Stay', type: 'eco-stay',
        price_per_night: 180, rating: 4.9, safety_verified: true, women_friendly: true,
        eco_certified: true, amenities: ['WiFi', 'Breakfast', 'Garden', 'Onsen'],
        image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400',
        location: null
    },
    {
        id: '4', destination: 'Bali', name: 'Ubud Eco Resort', type: 'eco-stay',
        price_per_night: 95, rating: 4.9, safety_verified: true, women_friendly: true,
        eco_certified: true, amenities: ['Pool', 'Yoga', 'Organic Food'],
        image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
        location: null
    },
    {
        id: '5', destination: 'Paris', name: 'Le Petit Hotel', type: 'hotel',
        price_per_night: 150, rating: 4.7, safety_verified: true, women_friendly: true,
        eco_certified: false, amenities: ['WiFi', 'Breakfast', 'City View'],
        image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        location: null
    },
];

export function HotelsView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [hotels, setHotels] = useState<HotelType[]>(mockHotels);
    const [, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedType, setSelectedType] = useState<HotelTypeFilter>('all');
    const [filters, setFilters] = useState({
        safetyVerified: false,
        womenFriendly: false,
        ecoCertified: false,
    });

    // Load hotels from database
    useEffect(() => {
        loadHotels();
    }, []);

    const loadHotels = async () => {
        setIsLoading(true);
        const { data, error } = await hotelsService.searchHotels();
        if (!error && data.length > 0) {
            setHotels(data);
        } else {
            // Use mock data if no real data
            setHotels(mockHotels);
        }
        setIsLoading(false);
    };

    // Filter hotels
    const filteredHotels = hotels.filter(hotel => {
        if (searchQuery && !hotel.destination.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !hotel.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (selectedType !== 'all' && hotel.type !== selectedType) return false;
        if (filters.safetyVerified && !hotel.safety_verified) return false;
        if (filters.womenFriendly && !hotel.women_friendly) return false;
        if (filters.ecoCertified && !hotel.eco_certified) return false;
        return true;
    });

    const typeFilters: { id: HotelTypeFilter; label: string; icon: any }[] = [
        { id: 'all', label: 'All', icon: Hotel },
        { id: 'hotel', label: 'Hotel', icon: Hotel },
        { id: 'hostel', label: 'Hostel', icon: Home },
        { id: 'eco-stay', label: 'Eco Stay', icon: Leaf },
        { id: 'homestay', label: 'Homestay', icon: Tent },
    ];

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-2xl font-bold mb-1">Hotels & Stays</h1>
                <p className="text-secondary text-sm">Find verified, safe accommodations</p>
            </motion.header>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
            >
                <div className="relative flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by destination..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-action transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "p-3 rounded-xl border transition-all",
                            showFilters ? "bg-action border-action" : "bg-surface/50 border-slate-700"
                        )}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {/* Type Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {typeFilters.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all",
                            selectedType === type.id
                                ? "bg-action text-white"
                                : "bg-surface/50 text-secondary border border-slate-700"
                        )}
                    >
                        <type.icon className="w-4 h-4" />
                        <span className="text-sm">{type.label}</span>
                    </button>
                ))}
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <GlassCard className="p-4" hover={false}>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { key: 'safetyVerified', label: 'Safety Verified', icon: ShieldCheck, color: 'text-emerald-400' },
                                    { key: 'womenFriendly', label: 'Women Friendly', icon: Heart, color: 'text-pink-400' },
                                    { key: 'ecoCertified', label: 'Eco Certified', icon: Leaf, color: 'text-green-400' },
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setFilters(prev => ({ ...prev, [filter.key]: !prev[filter.key as keyof typeof prev] }))}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                                            filters[filter.key as keyof typeof filters]
                                                ? `bg-white/10 border-white/30 ${filter.color}`
                                                : "border-slate-700 text-secondary"
                                        )}
                                    >
                                        <filter.icon className="w-4 h-4" />
                                        <span className="text-sm">{filter.label}</span>
                                    </button>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hotels List */}
            <div className="space-y-4">
                {filteredHotels.map((hotel, index) => (
                    <motion.div
                        key={hotel.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="overflow-hidden">
                            {/* Image */}
                            <div className="relative h-40">
                                <img
                                    src={hotel.image_url || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    {hotel.safety_verified && (
                                        <span className="px-2 py-1 bg-emerald-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Verified
                                        </span>
                                    )}
                                    {hotel.eco_certified && (
                                        <span className="px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <Leaf className="w-3 h-3" /> Eco
                                        </span>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 rounded-lg backdrop-blur-sm">
                                    <span className="text-white font-bold">${hotel.price_per_night}</span>
                                    <span className="text-white/70 text-xs">/night</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{hotel.name}</h3>
                                        <div className="flex items-center gap-1 text-secondary text-sm">
                                            <MapPin className="w-3 h-3" />
                                            {hotel.destination}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-lg">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="font-bold text-amber-400">{hotel.rating}</span>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {hotel.amenities?.slice(0, 4).map((amenity, i) => (
                                        <span key={i} className="px-2 py-1 bg-white/5 text-secondary text-xs rounded-md">
                                            {amenity}
                                        </span>
                                    ))}
                                </div>

                                {/* Women Friendly Badge */}
                                {hotel.women_friendly && (
                                    <div className="flex items-center gap-2 text-pink-400 text-sm">
                                        <Heart className="w-4 h-4" />
                                        <span>Women-safety verified</span>
                                    </div>
                                )}

                                {/* Book Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full mt-4 py-3 bg-action text-white font-bold rounded-xl flex items-center justify-center gap-2"
                                >
                                    View Details
                                    <ChevronRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}

                {filteredHotels.length === 0 && (
                    <div className="py-12 text-center">
                        <Hotel className="w-12 h-12 mx-auto text-secondary mb-4" />
                        <p className="text-secondary">No hotels found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}
