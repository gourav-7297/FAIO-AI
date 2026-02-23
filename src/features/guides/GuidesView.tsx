import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Star, Languages, BadgeCheck, X,
    User, ChevronRight, Calendar, Loader2
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { guidesService } from '../../services/guidesService';
import type { Guide as DbGuide } from '../../types/database.types';

// ============================
// TYPES
// ============================

interface Guide {
    id: string;
    name: string;
    avatar: string;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    hourlyRate: number;
    languages: string[];
    specialties: string[];
    bio: string;
    image: string;
}

// Map Supabase Guide → component Guide shape
function mapDbGuide(db: DbGuide): Guide {
    return {
        id: db.id,
        name: db.name,
        avatar: db.avatar_url || `https://i.pravatar.cc/150?u=${db.id}`,
        location: db.destination,
        rating: db.rating ?? 5.0,
        reviewCount: 0, // not in DB schema yet
        verified: db.is_verified,
        hourlyRate: db.price_per_day ? Math.round(db.price_per_day / 8) : 30,
        languages: db.languages || [],
        specialties: db.specialties || [],
        bio: db.bio || '',
        image: db.avatar_url || `https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=800`,
    };
}

// Fallback mock data when Supabase is unavailable
const FALLBACK_GUIDES: Guide[] = [
    {
        id: '1',
        name: 'Elena Rossi',
        avatar: 'https://i.pravatar.cc/150?u=elena',
        location: 'Venice, Italy',
        rating: 4.9,
        reviewCount: 124,
        verified: true,
        hourlyRate: 45,
        languages: ['English', 'Italian', 'French'],
        specialties: ['History', 'Art', 'Hidden Gems'],
        bio: 'Born and raised in Venice. I specialize in showing you the authentic side of the city away from the tourist crowds. Licensed art historian.',
        image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: '2',
        name: 'Kenji Tanaka',
        avatar: 'https://i.pravatar.cc/150?u=kenji',
        location: 'Kyoto, Japan',
        rating: 5.0,
        reviewCount: 89,
        verified: true,
        hourlyRate: 55,
        languages: ['English', 'Japanese'],
        specialties: ['Photography', 'Foodie', 'Culture'],
        bio: 'Professional photographer and food lover. Let me take you to the best photo spots and hidden izakayas that only locals know about.',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800'
    },
];

// ============================
// COMPONENTS
// ============================

export function GuidesView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadGuides() {
            setIsLoading(true);
            const { data, error } = await guidesService.getGuides();
            if (error || data.length === 0) {
                // Use fallback when DB is empty or unavailable
                setGuides(FALLBACK_GUIDES);
            } else {
                setGuides(data.map(mapDbGuide));
            }
            setIsLoading(false);
        }
        loadGuides();
    }, []);

    const filteredGuides = guides.filter(guide =>
        guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="pt-12 px-5 pb-6">
                <div className="flex items-center gap-2 mb-1">
                    <BadgeCheck className="w-4 h-4 text-action" />
                    <span className="text-xs font-bold text-action tracking-wider uppercase font-heading">
                        Verified Experts
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-white font-heading mb-2">
                    Trusted Local Guides
                </h1>
                <p className="text-secondary text-sm mb-6">
                    Connect with certified locals for authentic experiences.
                </p>

                {/* Search */}
                <GlassCard className="p-3 flex items-center gap-3">
                    <Search className="w-5 h-5 text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by city, name, or interest..."
                        className="bg-transparent text-white placeholder:text-secondary/50 flex-1 outline-none font-sans"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </GlassCard>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-action animate-spin mb-3" />
                    <p className="text-secondary text-sm">Loading guides...</p>
                </div>
            )}

            {/* Guides Grid */}
            {!isLoading && (
                <div className="px-5 space-y-4">
                    {filteredGuides.map((guide, index) => (
                        <motion.div
                            key={guide.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedGuide(guide)}
                        >
                            <GuideCard guide={guide} />
                        </motion.div>
                    ))}

                    {filteredGuides.length === 0 && (
                        <div className="text-center py-10">
                            <User className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
                            <p className="text-secondary">No guides found matching your search.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedGuide && (
                    <BookingModal
                        guide={selectedGuide}
                        onClose={() => setSelectedGuide(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function GuideCard({ guide }: { guide: Guide }) {
    return (
        <GlassCard className="p-0 overflow-hidden cursor-pointer group hover:bg-white/5 transition-colors">
            <div className="flex">
                {/* Image Section */}
                <div className="w-32 relative">
                    <img
                        src={guide.image}
                        alt={guide.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                </div>

                {/* Info Section */}
                <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center gap-1">
                                <h3 className="font-bold text-white font-heading">{guide.name}</h3>
                                {guide.verified && <BadgeCheck className="w-3 h-3 text-action" />}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-secondary">
                                <MapPin className="w-3 h-3" />
                                {guide.location}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-xs font-bold text-white">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {guide.rating}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                        {guide.specialties.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-surface rounded-full text-secondary">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-action font-bold">${guide.hourlyRate}/hr</span>
                        <ChevronRight className="w-4 h-4 text-secondary group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}

function BookingModal({ guide, onClose }: { guide: Guide; onClose: () => void }) {
    const [step, setStep] = useState(1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm bg-background/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Image */}
                <div className="relative h-48">
                    <img
                        src={guide.image}
                        alt={guide.name}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-10 left-6">
                        <img
                            src={guide.avatar}
                            alt={guide.name}
                            className="w-20 h-20 rounded-full border-4 border-background object-cover"
                        />
                    </div>
                </div>

                <div className="pt-12 px-6 pb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h2 className="text-xl font-bold text-white font-heading">{guide.name}</h2>
                                {guide.verified && <BadgeCheck className="w-4 h-4 text-action" />}
                            </div>
                            <p className="text-secondary text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {guide.location}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold text-action font-heading">${guide.hourlyRate}</span>
                            <span className="text-xs text-secondary">per hour</span>
                        </div>
                    </div>

                    {step === 1 ? (
                        <>
                            <div className="flex items-center gap-4 mb-6 text-sm text-secondary">
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    {guide.rating} ({guide.reviewCount} reviews)
                                </span>
                                <span className="flex items-center gap-1">
                                    <Languages className="w-4 h-4" />
                                    {guide.languages.join(', ')}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-white mb-2">About</h3>
                                <p className="text-sm text-secondary leading-relaxed">{guide.bio}</p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-white mb-2">Specialties</h3>
                                <div className="flex flex-wrap gap-2">
                                    {guide.specialties.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-surface rounded-full text-xs text-white">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => onClose()}
                                    className="flex-1 py-3 bg-surface rounded-xl font-bold text-white border border-white/5 hover:bg-surface/80"
                                >
                                    Message
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-[2] py-3 bg-action rounded-xl font-bold text-white shadow-lg shadow-action/20 hover:scale-[1.02] transition-transform"
                                >
                                    Check Availability
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-action/20 rounded-full flex items-center justify-center mx-auto mb-4 text-action">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
                            <p className="text-secondary text-sm mb-6">
                                {guide.name} typically responds within 1 hour. We've sent you a confirmation email.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
