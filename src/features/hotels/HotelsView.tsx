import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Star, MapPin, Wifi, Coffee, Car,
    Utensils, Dumbbell, Waves, Shield, Search,
    Heart, Sparkles, Leaf,
    CheckCircle, Loader2,
    MapPinned, Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAIAgents } from '../../context/AIAgentContext';
import { searchRealHotels } from '../../services/realHotelService';
import { searchDestinations, searchHotels as searchBookingHotels } from '../../services/bookingService';
import { MapView, type MapMarker } from '../../components/ui/MapView';
import { useToast } from '../../components/ui/Toast';

interface Hotel {
    id: string;
    name: string;
    rating: number;
    reviews: number;
    price: number;
    originalPrice: number;
    currency: string;
    distance: string;
    image: string;
    amenities: string[];
    type: string;
    ecoRating: number;
    isBookmarked: boolean;
    isFeatured: boolean;
    cancellation: string;
    description: string;
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
    'WiFi': Wifi, 'Pool': Waves, 'Gym': Dumbbell, 'Restaurant': Utensils,
    'Parking': Car, 'Breakfast': Coffee, 'Spa': Sparkles, 'Security': Shield,
};

const HOTEL_TYPES = ['All', 'Hotel', 'Hostel', 'Boutique', 'Resort', 'Villa'];

const MOCK_HOTELS: Hotel[] = [
    {
        id: '1', name: 'Sakura Grand Hotel', rating: 4.8, reviews: 1234, price: 145, originalPrice: 195,
        currency: 'USD', distance: '0.3km from center', image: '🏨',
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
        type: 'Hotel', ecoRating: 92, isBookmarked: false, isFeatured: true,
        cancellation: 'Free cancellation', description: 'Luxury in the heart of the city with rooftop pool and mountain views.'
    },
    {
        id: '2', name: 'Bamboo Eco Lodge', rating: 4.9, reviews: 876, price: 89, originalPrice: 89,
        currency: 'USD', distance: '1.2km from center', image: '🌿',
        amenities: ['WiFi', 'Breakfast', 'Security'],
        type: 'Boutique', ecoRating: 98, isBookmarked: false, isFeatured: false,
        cancellation: 'Free cancellation', description: 'Award-winning sustainable lodge built with local bamboo. Solar powered.'
    },
    {
        id: '3', name: 'Nomad Backpackers', rating: 4.5, reviews: 2345, price: 28, originalPrice: 35,
        currency: 'USD', distance: '0.5km from center', image: '🎒',
        amenities: ['WiFi', 'Breakfast', 'Security'],
        type: 'Hostel', ecoRating: 75, isBookmarked: false, isFeatured: false,
        cancellation: 'Cancel up to 24h before', description: 'Social hostel with rooftop bar. Perfect for solo travelers.'
    },
    {
        id: '4', name: 'Ocean Breeze Resort', rating: 4.7, reviews: 654, price: 220, originalPrice: 280,
        currency: 'USD', distance: '3.5km from center', image: '🏖️',
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking'],
        type: 'Resort', ecoRating: 85, isBookmarked: false, isFeatured: true,
        cancellation: 'Free cancellation', description: 'Beachfront resort with private beach access and sunset yoga sessions.'
    },
    {
        id: '5', name: 'Heritage Villa Kyoto', rating: 4.9, reviews: 432, price: 310, originalPrice: 310,
        currency: 'USD', distance: '2.0km from center', image: '🏯',
        amenities: ['WiFi', 'Breakfast', 'Parking', 'Security'],
        type: 'Villa', ecoRating: 90, isBookmarked: false, isFeatured: false,
        cancellation: 'Cancel up to 48h before', description: 'Traditional Japanese villa with private garden, tatami rooms, and tea ceremony.'
    },
];

export function HotelsView() {
    const { tripData } = useAIAgents();
    const { showToast } = useToast();
    const [activeType, setActiveType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'price' | 'rating' | 'eco'>('rating');
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

    // Real hotel search state
    const [citySearch, setCitySearch] = useState('');
    const [realHotels, setRealHotels] = useState<any[]>([]);
    const [isSearchingCity, setIsSearchingCity] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [hasSearchedCity, setHasSearchedCity] = useState(false);

    // Booking.com specific state
    const [checkIn, setCheckIn] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Tomorrow
    const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]); // 3 days from now
    const [adults, setAdults] = useState(2);

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    // Real hotel city search (Booking.com)
    const handleCitySearch = async () => {
        if (!citySearch.trim()) return;
        setIsSearchingCity(true);
        setHasSearchedCity(true);
        try {
            console.log('HotelsView: Starting search for:', citySearch.trim());

            // Step 1: Search for destination ID
            const locations = await searchDestinations(citySearch.trim());
            console.log('HotelsView: Locations result:', locations);

            if (!locations || locations.length === 0) {
                showToast(`City "${citySearch}" not found or API error`, 'info');
                setIsSearchingCity(false);
                return;
            }

            const bestMatch = locations[0];
            const dest_id = bestMatch.dest_id || bestMatch.destId;
            const dest_type = bestMatch.dest_type || bestMatch.search_type || 'city';

            console.log('HotelsView: Best match found:', { dest_id, dest_type, name: bestMatch.label || bestMatch.name });

            // Step 2: Search for hotels
            const results = await searchBookingHotels({
                dest_id,
                dest_type,
                checkin_date: checkIn,
                checkout_date: checkOut,
                adults_number: adults,
                currency: 'INR'
            });

            console.log('HotelsView: Hotel search results:', results?.length || 0);

            setRealHotels(results);
            if (results && results.length > 0) {
                showToast(`Found ${results.length} live hotels in ${citySearch}!`, 'success');
            } else {
                showToast(`No availability found in ${citySearch} for these dates`, 'info');
            }
        } catch (error) {
            console.error('HotelsView: Booking search error:', error);
            showToast('Failed to connect to Booking.com API', 'error');

            // Fallback to Overpass if Booking.com fails
            console.log('HotelsView: Falling back to Overpass API...');
            const fallbackResults = await searchRealHotels(citySearch.trim());
            setRealHotels(fallbackResults);
        } finally {
            setIsSearchingCity(false);
        }
    };

    // Map markers from real hotels
    const hotelMarkers: MapMarker[] = realHotels.map(h => ({
        id: h.hotel_id || h.id,
        lat: h.latitude || h.lat,
        lon: h.longitude || h.lon,
        label: h.hotel_name || h.name,
        emoji: '🏨',
        color: '#f43f5e',
        popup: `${h.hotel_name || h.name} • ₹${(h.min_total_price || h.estimatedPricePerNight).toLocaleString()}`,
    }));

    const filtered = MOCK_HOTELS
        .filter(h => {
            if (activeType !== 'All' && h.type !== activeType) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q);
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'price') return a.price - b.price;
            if (sortBy === 'eco') return b.ecoRating - a.ecoRating;
            return b.rating - a.rating;
        });

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-primary">
                        <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Verified Stays</span>
                </div>
                <h1 className="text-4xl font-black text-stone-900 tracking-tight leading-none mb-2">Hotels</h1>
                <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">
                    {tripData ? `Premium inventory in ${tripData.destination}` : 'Curated architectural stays'}
                </p>
            </motion.header>

            {/* City Search for Real Hotels */}
            <div className="p-6 mb-8 bg-white rounded-[40px] border border-stone-100 shadow-premium">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Global Inventory Pulse</span>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <MapPinned className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            value={citySearch}
                            onChange={e => setCitySearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
                            placeholder="Enter destination..."
                            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-black text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-200 transition-all shadow-inner"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Arrival</p>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={e => setCheckIn(e.target.value)}
                                className="w-full px-3 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-black text-stone-900 outline-none shadow-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Departure</p>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={e => setCheckOut(e.target.value)}
                                className="w-full px-3 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-black text-stone-900 outline-none shadow-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Occupancy</p>
                            <select
                                value={adults}
                                onChange={e => setAdults(Number(e.target.value))}
                                className="w-full px-3 py-3 bg-stone-50 border border-stone-100 rounded-xl text-[11px] font-black text-stone-900 outline-none appearance-none shadow-sm"
                            >
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCitySearch}
                        disabled={isSearchingCity}
                        className="w-full py-4 rounded-2xl bg-stone-900 text-white text-[11px] font-black uppercase tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-3 shadow-premium transition-all hover:bg-stone-800"
                    >
                        {isSearchingCity ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Search className="w-4 h-4 text-blue-400" />}
                        Acquire Live Deals
                    </motion.button>
                </div>
            </div>

            {/* Real Hotel Results */}
            {hasSearchedCity && (
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-black text-stone-900 tracking-tight">Real-Time Data</h2>
                        {realHotels.length > 0 && (
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    showMap ? "bg-stone-900 text-white shadow-lg" : "bg-stone-50 text-stone-400"
                                )}
                            >
                                <MapPinned className="w-3.5 h-3.5" />
                                {showMap ? 'Hide Map' : 'Show Map'}
                            </button>
                        )}
                    </div>

                    {/* Map View */}
                    {showMap && hotelMarkers.length > 0 && (
                        <div className="mb-6 rounded-[32px] overflow-hidden border border-stone-100 shadow-soft">
                            <MapView markers={hotelMarkers} height="280px" showUserLocation />
                        </div>
                    )}

                    {isSearchingCity ? (
                        <GlassCard className="p-6 text-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                            <p className="text-sm text-stone-500">Searching hotels in {citySearch}...</p>
                        </GlassCard>
                    ) : realHotels.length === 0 ? (
                        <GlassCard className="p-6 text-center">
                            <Building2 className="w-8 h-8 text-stone-500/30 mx-auto mb-2" />
                            <p className="text-sm text-stone-500">No hotels found. Try a different city.</p>
                        </GlassCard>
                    ) : (
                        <div className="grid gap-2">
                            {realHotels.map(rh => (
                                <div key={rh.hotel_id || rh.id} className="p-4 bg-white rounded-[32px] border border-stone-100 shadow-soft flex gap-4">
                                    <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0">
                                        <img src={rh.main_photo_url || rh.imageUrl} alt={rh.hotel_name || rh.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-black text-stone-900 truncate pr-2 leading-tight">{rh.hotel_name || rh.name}</p>
                                                {(rh.review_score || rh.stars) && (
                                                    <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg text-emerald-700">
                                                        <Star className="w-2.5 h-2.5 fill-emerald-700" />
                                                        <span className="text-[10px] font-black">{rh.review_score || rh.stars}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest truncate mt-1">{rh.address || rh.city}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-50">
                                            <div>
                                                <p className="text-stone-900 font-black text-base leading-none">₹{(rh.min_total_price || rh.estimatedPricePerNight).toLocaleString()}</p>
                                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Net Total</p>
                                            </div>
                                            <button
                                                onClick={() => window.open(`https://www.booking.com/hotel/country/${rh.hotel_id}.html`, '_blank')}
                                                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all"
                                            >
                                                Acquire
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Divider between real and curated */}
            {hasSearchedCity && (
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-stone-100" />
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Curated Intelligence</span>
                    <div className="flex-1 h-px bg-stone-100" />
                </div>
            )}

            {/* Search + Sort */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search curation..."
                        className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-black text-stone-900 focus:outline-none focus:border-stone-200 placeholder:text-stone-400 shadow-inner"
                    />
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-xs font-black text-stone-900 focus:outline-none appearance-none cursor-pointer shadow-sm"
                >
                    <option value="rating">⭐ RATING</option>
                    <option value="price">💰 PRICE</option>
                    <option value="eco">🌿 ECO</option>
                </select>
            </div>

            {/* Type Filters */}
            <div className="flex gap-2.5 mb-8 overflow-x-auto no-scrollbar pb-2">
                {HOTEL_TYPES.map(type => (
                    <button key={type} onClick={() => setActiveType(type)}
                        className={cn(
                            "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 border",
                            activeType === type ? "bg-stone-900 text-white border-stone-900 shadow-soft" : "bg-white text-stone-400 border-stone-100 hover:border-stone-200"
                        )}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="p-4 bg-white rounded-3xl border border-stone-100 shadow-soft text-center">
                    <Building2 className="w-5 h-5 mx-auto text-blue-500 mb-2" />
                    <p className="text-lg font-black text-stone-900 leading-none mb-1">{MOCK_HOTELS.length}</p>
                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Inventory</p>
                </div>
                <div className="p-4 bg-white rounded-3xl border border-stone-100 shadow-soft text-center">
                    <Leaf className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
                    <p className="text-lg font-black text-stone-900 leading-none mb-1">{MOCK_HOTELS.filter(h => h.ecoRating >= 90).length}</p>
                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Organic</p>
                </div>
                <div className="p-4 bg-white rounded-3xl border border-stone-100 shadow-soft text-center">
                    <Sparkles className="w-5 h-5 mx-auto text-amber-500 mb-2" />
                    <p className="text-lg font-black text-stone-900 leading-none mb-1">{MOCK_HOTELS.filter(h => h.isFeatured).length}</p>
                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Premier</p>
                </div>
            </div>
            </div>

            {/* Hotel Cards */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                        <Building2 className="w-10 h-10 text-stone-500/30 mx-auto mb-3" />
                        <p className="text-stone-500 text-sm">No hotels match your filters</p>
                    </GlassCard>
                ) : (
                    filtered.map((hotel, i) => (
                        <HotelCard
                            key={hotel.id}
                            hotel={hotel}
                            delay={i * 0.05}
                            isFavorite={favorites.has(hotel.id)}
                            onFavorite={() => toggleFavorite(hotel.id)}
                            onBook={() => setSelectedHotel(hotel)}
                        />
                    ))
                )}
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedHotel && <HotelBookingModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} />}
            </AnimatePresence>
        </div>
    );
}

// ============================
// HOTEL CARD
// ============================
function HotelCard({ hotel, delay, isFavorite, onFavorite, onBook }: {
    hotel: Hotel; delay: number; isFavorite: boolean; onFavorite: () => void; onBook: () => void
}) {
    const discount = hotel.originalPrice > hotel.price
        ? Math.round(((hotel.originalPrice - hotel.price) / hotel.originalPrice) * 100)
        : 0;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <div className={cn("bg-white rounded-[40px] border border-stone-100 shadow-premium overflow-hidden group", hotel.isFeatured && "ring-1 ring-stone-900/5")}>
                {/* Image Header */}
                <div className="h-48 bg-stone-50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-100/50 to-transparent" />
                    <span className="text-6xl transition-transform duration-500 group-hover:scale-110 z-10">{hotel.image}</span>
                    
                    <button onClick={onFavorite} className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-soft z-20 transition-all hover:bg-white active:scale-90">
                        <Heart className={cn("w-4 h-4 transition-colors", isFavorite ? "text-red-500 fill-red-500" : "text-stone-400")} />
                    </button>

                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                        {hotel.isFeatured && (
                            <div className="px-3 py-1 bg-stone-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                                <Sparkles className="w-3 h-3 text-amber-400" /> Premier
                            </div>
                        )}
                        {discount > 0 && (
                            <div className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                -{discount}% Yield
                            </div>
                        )}
                    </div>

                    {hotel.ecoRating >= 90 && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-soft z-20">
                            <Leaf className="w-3 h-3" /> Earth {hotel.ecoRating}
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0">
                            <h3 className="text-xl font-black text-stone-900 tracking-tight leading-tight mb-1 truncate">{hotel.name}</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-stone-400" />
                                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{hotel.distance}</span>
                                </div>
                                <span className="px-2 py-0.5 bg-stone-50 rounded-lg text-[9px] font-black text-stone-400 uppercase tracking-widest border border-stone-100">{hotel.type}</span>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                            <div className="flex flex-col items-end">
                                {discount > 0 && (
                                    <span className="text-[10px] font-black text-stone-300 line-through tracking-widest">${hotel.originalPrice}</span>
                                )}
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-stone-900">${hotel.price}</span>
                                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">/nr</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs font-medium text-stone-500 mb-6 leading-relaxed line-clamp-2">{hotel.description}</p>

                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-stone-50">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-stone-900 leading-none">{hotel.rating}</p>
                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Index</p>
                                </div>
                            </div>
                            <div className="h-6 w-px bg-stone-100" />
                            <div>
                                <p className="text-sm font-black text-stone-900 leading-none">{hotel.reviews}</p>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Audits</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{hotel.cancellation}</span>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                        {hotel.amenities.slice(0, 5).map((amenity, i) => {
                            const Icon = AMENITY_ICONS[amenity] || CheckCircle;
                            return (
                                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100 text-[10px] font-black text-stone-500 uppercase tracking-widest whitespace-nowrap">
                                    <Icon className="w-3 h-3 text-stone-400" /> {amenity}
                                </div>
                            );
                        })}
                    </div>

                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        onClick={onBook}
                        className="w-full py-4 bg-stone-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] shadow-premium transition-all hover:bg-stone-800"
                    >
                        Initiate Booking
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

// ============================
// HOTEL BOOKING MODAL
// ============================
function HotelBookingModal({ hotel, onClose }: { hotel: Hotel; onClose: () => void }) {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [isBooking, setIsBooking] = useState(false);
    const [booked, setBooked] = useState(false);

    const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))) : 1;
    const total = hotel.price * nights;

    const handleBook = async () => {
        setIsBooking(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsBooking(false);
        setBooked(true);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-end justify-center sm:items-center sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className="w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-premium border border-stone-100"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-stone-900 tracking-tight">{booked ? 'Reservation Secured' : 'Acquisition Protocol'}</h3>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">{booked ? 'System confirmation active' : `Target: ${hotel.name}`}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
                        <span className="text-xl leading-none">&times;</span>
                    </button>
                </div>

                {booked ? (
                    <div className="text-center py-12 space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-[32px] bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black text-stone-900 tracking-tight">Booking Authenticated</p>
                            <p className="text-sm font-medium text-stone-500 leading-relaxed">Your stay at <span className="text-stone-900 font-bold">{hotel.name}</span> has been successfully logged into our verified inventory.</p>
                        </div>
                        <div className="flex items-center justify-center gap-6 py-4 border-y border-stone-50">
                            <div className="text-center">
                                <p className="text-sm font-black text-stone-900 leading-none">{nights}</p>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Nights</p>
                            </div>
                            <div className="h-8 w-px bg-stone-100" />
                            <div className="text-center">
                                <p className="text-sm font-black text-stone-900 leading-none">{guests}</p>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">Guests</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-full py-4 bg-stone-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] shadow-premium">Return to Dashboard</button>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-stone-50 rounded-[32px] border border-stone-100 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-3xl shadow-sm">
                                {hotel.image}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-stone-900 truncate leading-tight">{hotel.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{hotel.rating} Rating</span>
                                    <span className="w-1 h-1 rounded-full bg-stone-200" />
                                    <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">${hotel.price}/nr</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Check-in</p>
                                <div className="relative">
                                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-4 outline-none focus:border-stone-200 text-stone-900 text-[11px] font-black shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Check-out</p>
                                <div className="relative">
                                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-4 outline-none focus:border-stone-200 text-stone-900 text-[11px] font-black shadow-inner" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Guest Configuration</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(g => (
                                    <button key={g} onClick={() => setGuests(g)}
                                        className={cn("flex-1 py-3 rounded-2xl text-[10px] font-black transition-all border",
                                            guests === g ? "bg-stone-900 text-white border-stone-900 shadow-soft" : "bg-white text-stone-400 border-stone-100"
                                        )}
                                    >{g}</button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-stone-50 rounded-[32px] border border-stone-100 space-y-3 shadow-inner">
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                                <span className="text-stone-400">${hotel.price} &times; {nights} nr</span>
                                <span className="text-stone-900">${total}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                                <span className="text-stone-400">Protocol Fees</span>
                                <span className="text-stone-900">${Math.round(total * 0.12)}</span>
                            </div>
                            <div className="pt-4 border-t border-stone-200 flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Valuation</p>
                                    <p className="text-3xl font-black text-stone-900 leading-none">${total + Math.round(total * 0.12)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Tax Included</span>
                                </div>
                            </div>
                        </div>

                        <motion.button 
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBook} 
                            disabled={!checkIn || !checkOut || isBooking}
                            className="w-full py-5 bg-stone-900 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-premium disabled:opacity-30 flex items-center justify-center gap-3 transition-all hover:bg-stone-800"
                        >
                            {isBooking ? <><Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Processing...</> : `Confirm Reservation`}
                        </motion.button>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
