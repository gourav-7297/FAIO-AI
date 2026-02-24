import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Star, Clock,
    Shield, Heart,
    Search, Award,
    Languages, Compass,
    CheckCircle, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAIAgents } from '../../context/AIAgentContext';

const SPECIALTIES = [
    { id: 'all', label: 'All Guides' },
    { id: 'culture', label: 'Culture & History' },
    { id: 'food', label: 'Food & Cuisine' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'photography', label: 'Photography' },
    { id: 'nature', label: 'Nature & Wildlife' },
    { id: 'nightlife', label: 'Nightlife' },
];

interface GuideExtended {
    id: string;
    name: string;
    avatar: string;
    specialty: string[];
    rating: number;
    reviews: number;
    price: number;
    currency: string;
    languages: string[];
    bio: string;
    yearsExp: number;
    toursCompleted: number;
    isVerified: boolean;
    isAvailableToday: boolean;
    isFavorite: boolean;
    responseTime: string;
}

const MOCK_GUIDES: GuideExtended[] = [
    {
        id: '1', name: 'Yuki Tanaka', avatar: '🇯🇵', specialty: ['culture', 'food'],
        rating: 4.9, reviews: 234, price: 80, currency: 'USD', languages: ['English', 'Japanese'],
        bio: 'Born and raised in Kyoto. I show travelers the Japan that guidebooks miss — hidden temples, secret ramen spots, and backstreet izakayas.',
        yearsExp: 8, toursCompleted: 450, isVerified: true, isAvailableToday: true, isFavorite: false, responseTime: '< 1h'
    },
    {
        id: '2', name: 'Priya Sharma', avatar: '🇮🇳', specialty: ['culture', 'photography'],
        rating: 4.8, reviews: 189, price: 45, currency: 'USD', languages: ['English', 'Hindi', 'French'],
        bio: 'Photographer & cultural storyteller. I\'ll take you through ancient streets and help you capture stunning photos. Featured in Lonely Planet.',
        yearsExp: 6, toursCompleted: 320, isVerified: true, isAvailableToday: true, isFavorite: false, responseTime: '< 2h'
    },
    {
        id: '3', name: 'Marco Silva', avatar: '🇧🇷', specialty: ['adventure', 'nature'],
        rating: 4.7, reviews: 156, price: 65, currency: 'USD', languages: ['English', 'Portuguese', 'Spanish'],
        bio: 'Adventure guide specializing in rainforest treks and off-the-beaten-path experiences. Certified wilderness first responder.',
        yearsExp: 10, toursCompleted: 580, isVerified: true, isAvailableToday: false, isFavorite: false, responseTime: '< 3h'
    },
    {
        id: '4', name: 'Aisha Ben Ali', avatar: '🇲🇦', specialty: ['food', 'culture'],
        rating: 4.9, reviews: 267, price: 55, currency: 'USD', languages: ['English', 'Arabic', 'French'],
        bio: 'Marrakech native & chef. My food tours are a feast for all senses — souks, spice markets, rooftop cooking classes, and hidden riads.',
        yearsExp: 5, toursCompleted: 290, isVerified: true, isAvailableToday: true, isFavorite: false, responseTime: '< 1h'
    },
    {
        id: '5', name: 'Liam O\'Brien', avatar: '🇮🇪', specialty: ['nightlife', 'culture'],
        rating: 4.6, reviews: 98, price: 50, currency: 'USD', languages: ['English', 'Irish'],
        bio: 'Dublin pub crawler and storyteller. I know every hidden speakeasy and live music spot. Part history tour, part pub crawl.',
        yearsExp: 4, toursCompleted: 180, isVerified: false, isAvailableToday: false, isFavorite: false, responseTime: '< 4h'
    },
];

export function GuidesView() {
    const { tripData } = useAIAgents();
    const [activeSpecialty, setActiveSpecialty] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGuide, setSelectedGuide] = useState<GuideExtended | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const filteredGuides = MOCK_GUIDES
        .filter(g => {
            if (activeSpecialty !== 'all' && !g.specialty.includes(activeSpecialty)) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return g.name.toLowerCase().includes(q) || g.bio.toLowerCase().includes(q) || g.languages.some(l => l.toLowerCase().includes(q));
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'price') return a.price - b.price;
            return b.reviews - a.reviews;
        });

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Compass className="w-5 h-5 text-action" />
                    <span className="text-xs text-action font-bold uppercase tracking-wider">Trusted Locals</span>
                </div>
                <h1 className="text-3xl font-bold">Local Guides</h1>
                <p className="text-secondary text-sm">
                    {tripData ? `Expert guides for ${tripData.destination}` : 'Handpicked local experts'}
                </p>
            </motion.header>

            {/* Search + Sort */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, language..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-action placeholder:text-slate-500"
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm text-secondary focus:outline-none appearance-none cursor-pointer"
                >
                    <option value="rating">⭐ Rating</option>
                    <option value="price">💰 Price</option>
                    <option value="reviews">💬 Reviews</option>
                </select>
            </div>

            {/* Specialty Filters */}
            <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
                {SPECIALTIES.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSpecialty(s.id)}
                        className={cn(
                            "px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                            activeSpecialty === s.id ? "bg-action text-white" : "bg-surface/50 text-secondary hover:text-white"
                        )}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                <GlassCard className="p-2.5 text-center">
                    <Users className="w-4 h-4 mx-auto text-action mb-1" />
                    <p className="text-sm font-bold">{MOCK_GUIDES.length}</p>
                    <p className="text-[9px] text-secondary">Guides</p>
                </GlassCard>
                <GlassCard className="p-2.5 text-center">
                    <Shield className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                    <p className="text-sm font-bold">{MOCK_GUIDES.filter(g => g.isVerified).length}</p>
                    <p className="text-[9px] text-secondary">Verified</p>
                </GlassCard>
                <GlassCard className="p-2.5 text-center">
                    <CheckCircle className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <p className="text-sm font-bold">{MOCK_GUIDES.filter(g => g.isAvailableToday).length}</p>
                    <p className="text-[9px] text-secondary">Available</p>
                </GlassCard>
            </div>

            {/* Guide Cards */}
            <div className="space-y-3">
                {filteredGuides.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                        <Users className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                        <p className="text-secondary text-sm">No guides match your filters</p>
                    </GlassCard>
                ) : (
                    filteredGuides.map((guide, i) => (
                        <GuideCard
                            key={guide.id}
                            guide={guide}
                            delay={i * 0.05}
                            isFavorite={favorites.has(guide.id)}
                            onFavorite={() => toggleFavorite(guide.id)}
                            onBook={() => setSelectedGuide(guide)}
                        />
                    ))
                )}
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedGuide && (
                    <BookingModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================
// GUIDE CARD
// ============================
function GuideCard({ guide, delay, isFavorite, onFavorite, onBook }: {
    guide: GuideExtended; delay: number; isFavorite: boolean; onFavorite: () => void; onBook: () => void
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <GlassCard className="p-4">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-action/20 to-purple-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                        {guide.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold">{guide.name}</h3>
                            {guide.isVerified && (
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-0.5 text-xs">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="font-bold">{guide.rating}</span>
                            </span>
                            <span className="text-xs text-secondary">({guide.reviews} reviews)</span>
                            {guide.isAvailableToday && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded">TODAY</span>
                            )}
                        </div>
                    </div>
                    <button onClick={onFavorite} className="flex-shrink-0 p-1">
                        <Heart className={cn("w-5 h-5 transition-colors", isFavorite ? "text-red-400 fill-red-400" : "text-secondary")} />
                    </button>
                </div>

                <p className="text-xs text-secondary leading-relaxed line-clamp-2 mb-3">{guide.bio}</p>

                {/* Tags Row */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {guide.languages.map((lang, i) => (
                        <span key={i} className="px-2 py-0.5 bg-action/10 text-action text-[10px] rounded-full flex items-center gap-0.5">
                            <Languages className="w-2.5 h-2.5" /> {lang}
                        </span>
                    ))}
                    {guide.specialty.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-surface/80 text-secondary text-[10px] rounded-full capitalize">{s}</span>
                    ))}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-xs text-secondary mb-3">
                    <span className="flex items-center gap-1"><Award className="w-3 h-3 text-amber-400" /> {guide.yearsExp}y exp</span>
                    <span className="flex items-center gap-1"><Compass className="w-3 h-3 text-action" /> {guide.toursCompleted} tours</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-400" /> Reply {guide.responseTime}</span>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                    <div>
                        <span className="text-xl font-bold text-white">${guide.price}</span>
                        <span className="text-xs text-secondary">/hour</span>
                    </div>
                    <button
                        onClick={onBook}
                        className="px-5 py-2.5 bg-gradient-to-r from-action to-purple-500 text-white rounded-xl text-sm font-bold"
                    >
                        Book Now
                    </button>
                </div>
            </GlassCard>
        </motion.div>
    );
}

// ============================
// BOOKING MODAL
// ============================
function BookingModal({ guide, onClose }: { guide: GuideExtended; onClose: () => void }) {
    const [date, setDate] = useState('');
    const [hours, setHours] = useState(2);
    const [message, setMessage] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [booked, setBooked] = useState(false);

    const total = guide.price * hours;

    const handleBook = async () => {
        setIsBooking(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsBooking(false);
        setBooked(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">
                        {booked ? '🎉 Booking Confirmed!' : `Book ${guide.name}`}
                    </h3>
                    <button onClick={onClose} className="text-secondary hover:text-white">✕</button>
                </div>

                {booked ? (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className="text-lg font-bold mb-2">You're all set!</p>
                        <p className="text-sm text-secondary mb-4">{guide.name} will confirm within {guide.responseTime}</p>
                        <button onClick={onClose} className="px-6 py-3 bg-action rounded-xl text-white font-bold">Done</button>
                    </div>
                ) : (
                    <>
                        {/* Guide Summary */}
                        <GlassCard className="p-3 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-action/20 to-purple-500/20 flex items-center justify-center text-2xl">
                                {guide.avatar}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold">{guide.name}</p>
                                <p className="text-xs text-secondary flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {guide.rating} • ${guide.price}/hr
                                </p>
                            </div>
                        </GlassCard>

                        {/* Date */}
                        <div>
                            <p className="text-xs text-secondary mb-2 uppercase tracking-wider">Date</p>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-action text-white"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <p className="text-xs text-secondary mb-2 uppercase tracking-wider">Duration (hours)</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 6, 8].map(h => (
                                    <button
                                        key={h}
                                        onClick={() => setHours(h)}
                                        className={cn(
                                            "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                                            hours === h ? "bg-action text-white" : "bg-surface/50 text-secondary"
                                        )}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <p className="text-xs text-secondary mb-2 uppercase tracking-wider">Message (optional)</p>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell the guide what you'd like to see..."
                                rows={2}
                                className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-action text-white text-sm resize-none"
                            />
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between p-4 bg-surface/50 rounded-xl">
                            <span className="text-secondary">Total</span>
                            <span className="text-2xl font-bold">${total}</span>
                        </div>

                        <button
                            onClick={handleBook}
                            disabled={!date || isBooking}
                            className="w-full py-4 bg-gradient-to-r from-action to-purple-500 rounded-xl text-white font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isBooking ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</>
                            ) : (
                                `Confirm Booking — $${total}`
                            )}
                        </button>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
