import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Star, Sparkles, Calendar, Users,
    ArrowRight, Plus, Globe, MessageCircle, Heart, Share2,
    Bookmark, MoreHorizontal, BadgeCheck, Clock, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { communityService } from '../../services/communityService';
import type { TravelStory, GroupTrip as ServiceGroupTrip } from '../../services/communityService';

// ============================
// TYPES (GroupTrip extends the service type with view-specific fields)
// ============================

interface GroupTrip {
    id: string;
    host: {
        name: string;
        avatar: string;
        verified: boolean;
        rating: number;
        tripsHosted: number;
    };
    destination: string;
    country: string;
    image: string;
    title: string;
    description: string;
    dates: { start: string; end: string };
    duration: string;
    vibes: string[];
    spots: { filled: number; total: number };
    price: { amount: number; currency: string };
    includes: string[];
}

// Map service GroupTrip to view GroupTrip
function mapServiceTrip(st: ServiceGroupTrip): GroupTrip {
    return {
        ...st,
        country: '',
        image: `https://images.unsplash.com/photo-1557750255-c76072a7bbca?q=80&w=800`,
        title: `Trip to ${st.destination}`,
        description: `Join a group trip to ${st.destination}`,
    };
}

// ============================
// UTILITY FUNCTIONS
// ============================

const getVibeColor = (vibe: string): string => {
    const colors: Record<string, string> = {
        adventure: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        foodie: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        budget: 'bg-green-500/20 text-green-400 border-green-500/30',
        nature: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        culture: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        city: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        hiking: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        challenging: 'bg-red-500/20 text-red-400 border-red-500/30',
        photography: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colors[vibe.toLowerCase()] || 'bg-slate-700/50 text-slate-300 border-slate-600';
};

const formatNumber = (num: number): string => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

// ============================
// MAIN COMPONENT
// ============================

export function CommunityView() {
    const [activeTab, setActiveTab] = useState<'stories' | 'trips'>('stories');
    const [likedPosts, setLikedPosts] = useState<string[]>([]);
    const [savedPosts, setSavedPosts] = useState<string[]>([]);
    const [stories, setStories] = useState<TravelStory[]>([]);
    const [trips, setTrips] = useState<GroupTrip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            const [storiesRes, tripsRes] = await Promise.all([
                communityService.getStories(),
                communityService.getGroupTrips(),
            ]);
            setStories(storiesRes.data);
            setTrips(tripsRes.data.map(mapServiceTrip));
            setIsLoading(false);
        }
        load();
    }, []);

    const toggleLike = (id: string) => {
        setLikedPosts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
        communityService.toggleLike(id); // fire-and-forget
    };

    const toggleSave = (id: string) => {
        setSavedPosts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5">
                <div className="pt-12 px-5 pb-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Globe className="w-4 h-4 text-action" />
                                <span className="text-xs font-bold text-action tracking-wider uppercase font-heading">
                                    Community
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-white font-heading">
                                Travel Together
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-white/10 hover:bg-surface/80 transition-colors">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-action to-purple-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Toggle */}
                    <div className="bg-surface p-1 rounded-xl flex relative h-12 border border-white/5">
                        <div
                            className={cn(
                                "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-lg transition-all duration-300 ease-out",
                                activeTab === 'stories'
                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 translate-x-0 shadow-pink-500/20"
                                    : "bg-gradient-to-r from-action to-cyan-500 translate-x-[calc(100%+4px)] shadow-action/20"
                            )}
                        />
                        <button
                            onClick={() => setActiveTab('stories')}
                            className={cn(
                                "flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors font-heading",
                                activeTab === 'stories' ? "text-white" : "text-secondary hover:text-white"
                            )}
                        >
                            <Sparkles className="w-4 h-4" /> Travel Tales
                        </button>
                        <button
                            onClick={() => setActiveTab('trips')}
                            className={cn(
                                "flex-1 relative z-10 flex items-center justify-center gap-2 text-sm font-bold transition-colors font-heading",
                                activeTab === 'trips' ? "text-white" : "text-secondary hover:text-white"
                            )}
                        >
                            <Users className="w-4 h-4" /> Join a Trip
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-5 pt-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-action animate-spin mb-3" />
                        <p className="text-secondary text-sm">Loading community...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'stories' ? (
                            <motion.div
                                key="stories"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                {stories.map((story, i) => (
                                    <StoryCard
                                        key={story.id}
                                        story={story}
                                        index={i}
                                        isLiked={likedPosts.includes(story.id)}
                                        isSaved={savedPosts.includes(story.id)}
                                        onLike={() => toggleLike(story.id)}
                                        onSave={() => toggleSave(story.id)}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="trips"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                {/* Quick Stats */}
                                <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
                                    <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
                                        <span className="text-2xl font-bold text-emerald-400 font-heading">{trips.length}</span>
                                        <p className="text-xs text-secondary">Open trips</p>
                                    </div>
                                    <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-action/10 to-cyan-500/10 border border-action/20 rounded-xl">
                                        <span className="text-2xl font-bold text-action font-heading">{trips.reduce((sum, t) => sum + t.spots.filled, 0)}</span>
                                        <p className="text-xs text-secondary">Travelers</p>
                                    </div>
                                    <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                                        <span className="text-2xl font-bold text-purple-400 font-heading">{new Set(trips.map(t => t.destination)).size}</span>
                                        <p className="text-xs text-secondary">Destinations</p>
                                    </div>
                                </div>

                                {trips.map((trip, i) => (
                                    <TripCard key={trip.id} trip={trip} index={i} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Create FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "fixed bottom-24 right-5 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 transition-all",
                    activeTab === 'stories'
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/40"
                        : "bg-gradient-to-r from-action to-cyan-500 shadow-action/40"
                )}
            >
                <Plus className="w-6 h-6 text-white" />
            </motion.button>
        </div>
    );
}

// ============================
// STORY CARD COMPONENT
// ============================

interface StoryCardProps {
    story: TravelStory;
    index: number;
    isLiked: boolean;
    isSaved: boolean;
    onLike: () => void;
    onSave: () => void;
}

function StoryCard({ story, index, isLiked, isSaved, onLike, onSave }: StoryCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <GlassCard className="p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={story.user.avatar}
                                alt={story.user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                            />
                            {story.user.verified && (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-action rounded-full p-0.5 border border-background">
                                    <BadgeCheck className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm font-heading">{story.user.name}</h4>
                            <div className="flex items-center gap-1 text-xs text-secondary">
                                <MapPin className="w-3 h-3" />
                                <span>{story.location}, {story.country}</span>
                            </div>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-secondary" />
                    </button>
                </div>

                {/* Image */}
                <div className="relative aspect-[4/3] bg-surface">
                    <img
                        src={story.images[0]}
                        alt={story.caption}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Actions */}
                <div className="p-4 pt-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onLike}
                                className="flex items-center gap-1.5 group"
                            >
                                <Heart className={cn(
                                    "w-6 h-6 transition-all",
                                    isLiked
                                        ? "text-red-500 fill-red-500 scale-110"
                                        : "text-white group-hover:text-red-400"
                                )} />
                                <span className="text-sm font-medium text-secondary">
                                    {formatNumber(story.likes + (isLiked ? 1 : 0))}
                                </span>
                            </button>
                            <button className="flex items-center gap-1.5 group">
                                <MessageCircle className="w-6 h-6 text-white group-hover:text-action transition-colors" />
                                <span className="text-sm font-medium text-secondary">{story.comments}</span>
                            </button>
                            <button className="group">
                                <Share2 className="w-5 h-5 text-white group-hover:text-action transition-colors" />
                            </button>
                        </div>
                        <button onClick={onSave}>
                            <Bookmark className={cn(
                                "w-6 h-6 transition-all",
                                isSaved
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-white hover:text-amber-400"
                            )} />
                        </button>
                    </div>

                    {/* Caption */}
                    <p className="text-sm text-white/90 leading-relaxed mb-2">
                        <span className="font-bold text-white">{story.user.name.split(' ')[0]}</span>{' '}
                        {story.caption}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {story.tags.map(tag => (
                            <span key={tag} className="text-xs text-action font-medium">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <span className="text-xs text-secondary">{story.postedAt}</span>
                </div>
            </GlassCard>
        </motion.div>
    );
}

// ============================
// TRIP CARD COMPONENT
// ============================

interface TripCardProps {
    trip: GroupTrip;
    index: number;
}

function TripCard({ trip, index }: TripCardProps) {
    const spotsLeft = trip.spots.total - trip.spots.filled;
    const progress = (trip.spots.filled / trip.spots.total) * 100;
    const isAlmostFull = spotsLeft <= 2;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <GlassCard className="p-0 overflow-hidden">
                {/* Image Header */}
                <div className="relative h-44">
                    <img
                        src={trip.image}
                        alt={trip.destination}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Host Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full py-1.5 px-3">
                        <img
                            src={trip.host.avatar}
                            alt={trip.host.name}
                            className="w-7 h-7 rounded-full border border-white/30"
                        />
                        <div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-white">{trip.host.name}</span>
                                {trip.host.verified && <BadgeCheck className="w-3 h-3 text-action" />}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-white/70">
                                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                <span>{trip.host.rating}</span>
                                <span>•</span>
                                <span>{trip.host.tripsHosted} trips</span>
                            </div>
                        </div>
                    </div>

                    {/* Urgency Badge */}
                    {isAlmostFull && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-500/90 backdrop-blur-sm rounded-full">
                            <span className="text-[10px] font-bold text-white">🔥 {spotsLeft} spots left!</span>
                        </div>
                    )}

                    {/* Location */}
                    <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-xl font-bold text-white font-heading mb-1 drop-shadow-lg">
                            {trip.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-white/90">
                            <MapPin className="w-3 h-3" />
                            <span>{trip.destination}, {trip.country}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Description */}
                    <p className="text-sm text-secondary leading-relaxed mb-4 line-clamp-2">
                        {trip.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-white">
                            <Calendar className="w-4 h-4 text-action" />
                            <span>{trip.dates.start} - {trip.dates.end}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span>{trip.duration}</span>
                        </div>
                    </div>

                    {/* Vibes */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {trip.vibes.map(vibe => (
                            <span
                                key={vibe}
                                className={cn(
                                    "px-2.5 py-1 rounded-full text-[11px] font-bold border",
                                    getVibeColor(vibe)
                                )}
                            >
                                #{vibe}
                            </span>
                        ))}
                    </div>

                    {/* Includes */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {trip.includes.slice(0, 3).map(item => (
                            <span
                                key={item}
                                className="px-2 py-0.5 bg-surface rounded text-[10px] text-secondary"
                            >
                                ✓ {item}
                            </span>
                        ))}
                        {trip.includes.length > 3 && (
                            <span className="px-2 py-0.5 bg-surface rounded text-[10px] text-action">
                                +{trip.includes.length - 3} more
                            </span>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-white font-heading">
                                    ${trip.price.amount}
                                </span>
                                <span className="text-xs text-secondary">/ person</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden w-20">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            isAlmostFull
                                                ? "bg-gradient-to-r from-red-500 to-orange-400"
                                                : "bg-gradient-to-r from-emerald-500 to-green-400"
                                        )}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-secondary">
                                    {trip.spots.filled}/{trip.spots.total} joined
                                </span>
                            </div>
                        </div>

                        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
                            Request to Join
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
