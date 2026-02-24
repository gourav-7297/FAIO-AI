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
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-action" />
                    <span className="text-xs text-action font-bold uppercase tracking-wider">Verified Stays</span>
                </div>
                <h1 className="text-3xl font-bold">Hotels</h1>
                <p className="text-secondary text-sm">
                    {tripData ? `Best stays in ${tripData.destination}` : 'Handpicked accommodations'}
                </p>
            </motion.header>

            {/* City Search for Real Hotels */}
            <GlassCard className="p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-action" />
                    <span className="text-xs font-bold text-action uppercase tracking-wider">Search Real Hotels</span>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                        <input
                            type="text"
                            value={citySearch}
                            onChange={e => setCitySearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
                            placeholder="Search destination (e.g. Mumbai, Goa)"
                            className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-secondary/50 outline-none focus:border-action/50"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                            <p className="text-[10px] text-secondary mb-1 ml-1">Check-in</p>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={e => setCheckIn(e.target.value)}
                                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white outline-none"
                            />
                        </div>
                        <div className="col-span-1">
                            <p className="text-[10px] text-secondary mb-1 ml-1">Check-out</p>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={e => setCheckOut(e.target.value)}
                                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white outline-none"
                            />
                        </div>
                        <div className="col-span-1">
                            <p className="text-[10px] text-secondary mb-1 ml-1">Guests</p>
                            <select
                                value={adults}
                                onChange={e => setAdults(Number(e.target.value))}
                                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white outline-none appearance-none"
                            >
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <option key={n} value={n} className="bg-slate-900">{n} Adults</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCitySearch}
                        disabled={isSearchingCity}
                        className="w-full py-3 rounded-xl bg-action text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSearchingCity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Search Real-Time Deals
                    </motion.button>
                </div>
            </GlassCard>

            {/* Real Hotel Results */}
            {hasSearchedCity && (
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-sm flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-rose-400" />
                            Real Hotels {realHotels.length > 0 && <span className="text-secondary">({realHotels.length})</span>}
                        </h2>
                        {realHotels.length > 0 && (
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                                    showMap ? "bg-action/20 text-action" : "bg-white/5 text-secondary"
                                )}
                            >
                                <MapPinned className="w-3 h-3" />
                                {showMap ? 'Hide Map' : 'Show Map'}
                            </button>
                        )}
                    </div>

                    {/* Map View */}
                    {showMap && hotelMarkers.length > 0 && (
                        <div className="mb-3">
                            <MapView markers={hotelMarkers} height="250px" showUserLocation />
                        </div>
                    )}

                    {isSearchingCity ? (
                        <GlassCard className="p-6 text-center">
                            <Loader2 className="w-8 h-8 text-action animate-spin mx-auto mb-2" />
                            <p className="text-sm text-secondary">Searching hotels in {citySearch}...</p>
                        </GlassCard>
                    ) : realHotels.length === 0 ? (
                        <GlassCard className="p-6 text-center">
                            <Building2 className="w-8 h-8 text-secondary/30 mx-auto mb-2" />
                            <p className="text-sm text-secondary">No hotels found. Try a different city.</p>
                        </GlassCard>
                    ) : (
                        <div className="grid gap-2">
                            {realHotels.map(rh => (
                                <GlassCard key={rh.hotel_id || rh.id} className="p-3 flex gap-3">
                                    <img src={rh.main_photo_url || rh.imageUrl} alt={rh.hotel_name || rh.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold text-white truncate pr-2">{rh.hotel_name || rh.name}</p>
                                            {(rh.review_score || rh.stars) && (
                                                <div className="flex items-center gap-1 bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">
                                                    <Star className="w-2.5 h-2.5 fill-emerald-400" />
                                                    <span className="text-[10px] font-bold">{rh.review_score || rh.stars}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-[10px] text-secondary truncate mt-0.5">{rh.address || rh.city}</p>

                                        <div className="flex items-center gap-2 mt-2">
                                            {rh.review_nr > 0 && <span className="text-[9px] text-secondary">{rh.review_nr} reviews</span>}
                                            {rh.accommodation_type_name && <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-secondary capitalize">{rh.accommodation_type_name}</span>}
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                            <div>
                                                <p className="text-action font-bold text-sm">₹{(rh.min_total_price || rh.estimatedPricePerNight).toLocaleString()}</p>
                                                <p className="text-[9px] text-secondary">total for {adults} guests</p>
                                            </div>
                                            <button
                                                onClick={() => window.open(`https://www.booking.com/hotel/country/${rh.hotel_id}.html`, '_blank')}
                                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white transition-colors"
                                            >
                                                View Deal
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Divider between real and curated */}
            {hasSearchedCity && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] text-secondary uppercase tracking-wider">Curated Picks</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>
            )}

            {/* Search + Sort */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search hotels..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-action placeholder:text-slate-500"
                    />
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm text-secondary focus:outline-none appearance-none cursor-pointer"
                >
                    <option value="rating">⭐ Rating</option>
                    <option value="price">💰 Price</option>
                    <option value="eco">🌿 Eco</option>
                </select>
            </div>

            {/* Type Filters */}
            <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
                {HOTEL_TYPES.map(type => (
                    <button key={type} onClick={() => setActiveType(type)}
                        className={cn(
                            "px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all",
                            activeType === type ? "bg-action text-white" : "bg-surface/50 text-secondary hover:text-white"
                        )}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                <GlassCard className="p-2.5 text-center">
                    <Building2 className="w-4 h-4 mx-auto text-action mb-1" />
                    <p className="text-sm font-bold">{MOCK_HOTELS.length}</p>
                    <p className="text-[9px] text-secondary">Properties</p>
                </GlassCard>
                <GlassCard className="p-2.5 text-center">
                    <Leaf className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                    <p className="text-sm font-bold">{MOCK_HOTELS.filter(h => h.ecoRating >= 90).length}</p>
                    <p className="text-[9px] text-secondary">Eco Stays</p>
                </GlassCard>
                <GlassCard className="p-2.5 text-center">
                    <Sparkles className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <p className="text-sm font-bold">{MOCK_HOTELS.filter(h => h.isFeatured).length}</p>
                    <p className="text-[9px] text-secondary">Featured</p>
                </GlassCard>
            </div>

            {/* Hotel Cards */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                        <Building2 className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                        <p className="text-secondary text-sm">No hotels match your filters</p>
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
            <GlassCard className={cn("overflow-hidden", hotel.isFeatured && "border-action/30")}>
                {/* Image Header */}
                <div className="h-36 bg-gradient-to-br from-action/20 to-purple-500/20 flex items-center justify-center relative">
                    <span className="text-5xl">{hotel.image}</span>
                    <button onClick={onFavorite} className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm rounded-full">
                        <Heart className={cn("w-4 h-4", isFavorite ? "text-red-400 fill-red-400" : "text-white")} />
                    </button>
                    {hotel.isFeatured && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-action text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Featured
                        </span>
                    )}
                    {discount > 0 && (
                        <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                            -{discount}%
                        </span>
                    )}
                    {hotel.ecoRating >= 90 && (
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-emerald-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                            <Leaf className="w-3 h-3" /> Eco {hotel.ecoRating}
                        </span>
                    )}
                </div>

                <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h3 className="font-bold">{hotel.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-secondary">
                                <MapPin className="w-3 h-3" />
                                <span>{hotel.distance}</span>
                                <span className="px-1.5 py-0.5 bg-surface/80 rounded text-[10px]">{hotel.type}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            {discount > 0 && (
                                <span className="text-xs text-secondary line-through">${hotel.originalPrice}</span>
                            )}
                            <p className="text-xl font-bold text-action">${hotel.price}</p>
                            <p className="text-[10px] text-secondary">/night</p>
                        </div>
                    </div>

                    <p className="text-xs text-secondary mt-1 line-clamp-1">{hotel.description}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-bold">{hotel.rating}</span>
                        </div>
                        <span className="text-xs text-secondary">({hotel.reviews} reviews)</span>
                        <span className="text-xs text-emerald-400 ml-auto">{hotel.cancellation}</span>
                    </div>

                    {/* Amenities */}
                    <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                        {hotel.amenities.slice(0, 5).map((amenity, i) => {
                            const Icon = AMENITY_ICONS[amenity] || CheckCircle;
                            return (
                                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-surface/80 rounded-lg text-[10px] text-secondary whitespace-nowrap">
                                    <Icon className="w-3 h-3" /> {amenity}
                                </span>
                            );
                        })}
                    </div>

                    <button onClick={onBook}
                        className="w-full mt-3 py-2.5 bg-gradient-to-r from-action to-purple-500 text-white rounded-xl text-sm font-bold"
                    >
                        Book Now
                    </button>
                </div>
            </GlassCard>
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{booked ? '🎉 Booking Confirmed!' : `Book ${hotel.name}`}</h3>
                    <button onClick={onClose} className="text-secondary hover:text-white">✕</button>
                </div>

                {booked ? (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className="text-lg font-bold mb-2">You're all set!</p>
                        <p className="text-sm text-secondary mb-4">{nights} night{nights > 1 ? 's' : ''} • {guests} guest{guests > 1 ? 's' : ''}</p>
                        <button onClick={onClose} className="px-6 py-3 bg-action rounded-xl text-white font-bold">Done</button>
                    </div>
                ) : (
                    <>
                        <GlassCard className="p-3 flex items-center gap-3">
                            <span className="text-3xl">{hotel.image}</span>
                            <div className="flex-1">
                                <p className="font-bold">{hotel.name}</p>
                                <p className="text-xs text-secondary flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {hotel.rating} • ${hotel.price}/night
                                </p>
                            </div>
                        </GlassCard>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-secondary mb-1 uppercase tracking-wider">Check-in</p>
                                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                                    className="w-full bg-surface/50 border border-slate-700 rounded-xl px-3 py-3 outline-none focus:border-action text-white text-sm" />
                            </div>
                            <div>
                                <p className="text-xs text-secondary mb-1 uppercase tracking-wider">Check-out</p>
                                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                                    className="w-full bg-surface/50 border border-slate-700 rounded-xl px-3 py-3 outline-none focus:border-action text-white text-sm" />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-secondary mb-2 uppercase tracking-wider">Guests</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(g => (
                                    <button key={g} onClick={() => setGuests(g)}
                                        className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                                            guests === g ? "bg-action text-white" : "bg-surface/50 text-secondary"
                                        )}
                                    >{g}</button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-surface/50 rounded-xl space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-secondary">${hotel.price} × {nights} night{nights > 1 ? 's' : ''}</span><span>${total}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-secondary">Taxes & fees</span><span>${Math.round(total * 0.12)}</span></div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-700"><span>Total</span><span>${total + Math.round(total * 0.12)}</span></div>
                        </div>

                        <button onClick={handleBook} disabled={!checkIn || !checkOut || isBooking}
                            className="w-full py-4 bg-gradient-to-r from-action to-purple-500 rounded-xl text-white font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isBooking ? <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</> : `Book — $${total + Math.round(total * 0.12)}`}
                        </button>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
