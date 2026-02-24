import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Heart, MessageCircle, Share2, BookOpen,
    MapPin, Calendar, Star, Globe, UserPlus,
    Camera, Award, Compass,
    Plus, Search, Filter, Send
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { communityService, type TravelStory } from '../../services/communityService';

interface GroupTrip {
    id: string;
    title: string;
    destination: string;
    dates: string;
    members: number;
    maxMembers: number;
    price: string;
    organizer: string;
    avatar: string;
    tags: string[];
    description: string;
}

const MOCK_GROUPS: GroupTrip[] = [
    { id: '1', title: 'Backpacking Southeast Asia', destination: 'Thailand → Vietnam → Cambodia', dates: 'Mar 15-30', members: 4, maxMembers: 8, price: '$900', organizer: 'Alex T.', avatar: '🧳', tags: ['Budget', 'Adventure', 'Culture'], description: 'Two weeks exploring temples, beaches, and street food!' },
    { id: '2', title: 'Women-Only Japan Trip', destination: 'Tokyo → Kyoto → Osaka', dates: 'Apr 1-10', members: 6, maxMembers: 10, price: '$1500', organizer: 'Mia K.', avatar: '🌸', tags: ['Women Only', 'Culture', 'Food'], description: 'Safe, fun group trip with focus on local experiences.' },
    { id: '3', title: 'Eco Retreat Bali', destination: 'Ubud → Seminyak', dates: 'Apr 5-12', members: 3, maxMembers: 6, price: '$700', organizer: 'Sam L.', avatar: '🌿', tags: ['Eco', 'Wellness', 'Yoga'], description: 'Sustainable living, yoga retreats, and rice terrace hikes.' },
];

const COMMUNITY_STATS = {
    travelers: '12.4K',
    stories: '3.2K',
    trips: '890',
    countries: '147',
};

export function CommunityView() {
    const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'leaderboard'>('feed');
    const [stories, setStories] = useState<TravelStory[]>([]);
    const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            const { data } = await communityService.getStories();
            setStories(data);
            setIsLoading(false);
        }
        load();
    }, []);

    const toggleLike = (id: string) => {
        setLikedStories(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const filteredStories = searchQuery
        ? stories.filter(s =>
            s.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.user.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : stories;

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5"
            >
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-action" />
                        <span className="text-xs text-action font-bold uppercase tracking-wider">Travel Network</span>
                    </div>
                    <button
                        onClick={() => setShowCreatePost(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-action text-white rounded-xl text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Post
                    </button>
                </div>
                <h1 className="text-3xl font-bold">Community</h1>
                <p className="text-secondary text-sm">Connect with travelers worldwide</p>
            </motion.header>

            {/* Community Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-4 gap-2 mb-5"
            >
                {[
                    { label: 'Travelers', value: COMMUNITY_STATS.travelers, icon: Users },
                    { label: 'Stories', value: COMMUNITY_STATS.stories, icon: BookOpen },
                    { label: 'Trips', value: COMMUNITY_STATS.trips, icon: Compass },
                    { label: 'Countries', value: COMMUNITY_STATS.countries, icon: Globe },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-2.5 text-center">
                        <stat.icon className="w-4 h-4 mx-auto text-action mb-1" />
                        <p className="text-sm font-bold">{stat.value}</p>
                        <p className="text-[9px] text-secondary">{stat.label}</p>
                    </GlassCard>
                ))}
            </motion.div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stories, trips, people..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-action placeholder:text-slate-500"
                />
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'feed', label: 'Feed', icon: BookOpen },
                    { id: 'groups', label: 'Group Trips', icon: Users },
                    { id: 'leaderboard', label: 'Top Travelers', icon: Award },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-action text-white"
                                : "bg-surface/50 text-secondary hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'feed' && (
                    <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-6 h-6 border-2 border-action border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredStories.length === 0 ? (
                            <GlassCard className="p-8 text-center">
                                <BookOpen className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                                <p className="text-secondary text-sm">No stories found</p>
                            </GlassCard>
                        ) : (
                            filteredStories.map((story, i) => (
                                <StoryCard
                                    key={story.id}
                                    story={story}
                                    delay={i * 0.05}
                                    isLiked={likedStories.has(story.id)}
                                    onLike={() => toggleLike(story.id)}
                                />
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'groups' && (
                    <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        {MOCK_GROUPS.map((trip, i) => (
                            <GroupTripCard key={trip.id} trip={trip} delay={i * 0.05} />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'leaderboard' && (
                    <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        <Leaderboard />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
            </AnimatePresence>
        </div>
    );
}

// ============================
// STORY CARD
// ============================
function StoryCard({ story, delay, isLiked, onLike }: { story: TravelStory; delay: number; isLiked: boolean; onLike: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <GlassCard className="overflow-hidden">
                {/* Author Row */}
                <div className="p-4 pb-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-action to-purple-500 flex items-center justify-center text-sm font-bold">
                        {story.user.name[0]}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm">{story.user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-secondary">
                            <MapPin className="w-3 h-3" />
                            <span>{story.location}</span>
                            <span>•</span>
                            <span>{story.postedAt || '2d ago'}</span>
                        </div>
                    </div>
                    {story.user.verified && (
                        <span className="px-2 py-0.5 bg-action/10 text-action text-[10px] font-bold rounded-full">✓ Verified</span>
                    )}
                </div>

                {/* Image Placeholder */}
                <div className="aspect-[16/9] bg-gradient-to-br from-action/20 to-purple-500/20 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-white/20" />
                </div>

                {/* Content */}
                <div className="p-4 pt-3">
                    <h3 className="font-bold mb-1">{story.location}, {story.country}</h3>
                    <p className="text-sm text-secondary leading-relaxed line-clamp-2">{story.caption}</p>

                    {/* Tags */}
                    {story.tags && story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {story.tags.map((tag: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-surface/80 text-secondary text-[10px] rounded-full">#{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Interaction Row */}
                    <div className="flex items-center gap-6 mt-3 pt-3 border-t border-slate-800">
                        <button onClick={onLike} className="flex items-center gap-1.5 text-sm">
                            <Heart className={cn("w-4 h-4 transition-colors", isLiked ? "text-red-400 fill-red-400" : "text-secondary")} />
                            <span className={cn(isLiked ? "text-red-400" : "text-secondary")}>{(story.likes || 0) + (isLiked ? 1 : 0)}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-secondary">
                            <MessageCircle className="w-4 h-4" />
                            <span>{story.comments || 0}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-secondary ml-auto">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

// ============================
// GROUP TRIP CARD
// ============================
function GroupTripCard({ trip, delay }: { trip: GroupTrip; delay: number }) {
    const spotsLeft = trip.maxMembers - trip.members;
    const fillPercent = (trip.members / trip.maxMembers) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <GlassCard className="p-4">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-action/20 to-purple-500/20 flex items-center justify-center text-2xl">
                        {trip.avatar}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold">{trip.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-secondary">
                            <MapPin className="w-3 h-3" />
                            <span>{trip.destination}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-action">{trip.price}</p>
                        <p className="text-[10px] text-secondary">/person</p>
                    </div>
                </div>

                <p className="text-sm text-secondary mb-3">{trip.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {trip.tags.map((tag, i) => (
                        <span key={i} className={cn(
                            "px-2 py-0.5 text-[10px] font-medium rounded-full",
                            tag === 'Women Only' ? 'bg-pink-500/10 text-pink-400' :
                                tag === 'Eco' ? 'bg-emerald-500/10 text-emerald-400' :
                                    'bg-action/10 text-action'
                        )}>{tag}</span>
                    ))}
                </div>

                {/* Members */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 text-xs text-secondary">
                            <Users className="w-3 h-3" />
                            <span>{trip.members}/{trip.maxMembers} members</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-secondary">
                            <Calendar className="w-3 h-3" />
                            <span>{trip.dates}</span>
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fillPercent}%` }}
                            className={cn("h-full rounded-full", spotsLeft <= 2 ? "bg-amber-400" : "bg-action")}
                        />
                    </div>
                    {spotsLeft <= 2 && (
                        <p className="text-[10px] text-amber-400 mt-1 font-bold">Only {spotsLeft} spots left!</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-action text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
                        <UserPlus className="w-4 h-4" />
                        Join Trip
                    </button>
                    <button className="px-4 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm">
                        Details
                    </button>
                </div>
            </GlassCard>
        </motion.div>
    );
}

// ============================
// LEADERBOARD
// ============================
function Leaderboard() {
    const travelers = [
        { rank: 1, name: 'Sarah M.', countries: 42, trips: 28, eco: 95, badge: '🌟' },
        { rank: 2, name: 'James L.', countries: 38, trips: 25, eco: 88, badge: '🌍' },
        { rank: 3, name: 'Yuki T.', countries: 35, trips: 22, eco: 92, badge: '🏆' },
        { rank: 4, name: 'Priya S.', countries: 31, trips: 19, eco: 97, badge: '🌿' },
        { rank: 5, name: 'Carlos R.', countries: 29, trips: 17, eco: 85, badge: '✈️' },
    ];

    return (
        <div className="space-y-3">
            <GlassCard gradient="purple" glow className="p-5 text-center mb-2">
                <Award className="w-10 h-10 mx-auto text-amber-400 mb-2" />
                <h3 className="font-bold text-xl text-white">Top Travelers</h3>
                <p className="text-sm text-white/70">This month's most active explorers</p>
            </GlassCard>

            {travelers.map((t, i) => (
                <motion.div
                    key={t.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                >
                    <GlassCard className={cn(
                        "p-4 flex items-center gap-3",
                        t.rank <= 3 ? "border-amber-500/20" : ""
                    )}>
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                            t.rank === 1 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" :
                                t.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white" :
                                    t.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
                                        "bg-surface/80 text-secondary"
                        )}>
                            {t.rank <= 3 ? t.badge : t.rank}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">{t.name}</p>
                            <div className="flex items-center gap-3 text-xs text-secondary">
                                <span>{t.countries} countries</span>
                                <span>{t.trips} trips</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-bold">{t.eco}</span>
                            </div>
                            <p className="text-[9px] text-secondary">Eco Score</p>
                        </div>
                    </GlassCard>
                </motion.div>
            ))}
        </div>
    );
}

// ============================
// CREATE POST MODAL
// ============================
function CreatePostModal({ onClose }: { onClose: () => void }) {
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');

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
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6 space-y-4"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Share Your Story</h3>
                    <button onClick={onClose} className="text-secondary hover:text-white">✕</button>
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's your travel story?"
                    rows={4}
                    className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-action text-white resize-none"
                />

                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Add location"
                        className="flex-1 bg-surface/50 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-action text-sm"
                    />
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-surface/50 border border-slate-700 rounded-xl text-sm flex items-center gap-1">
                        <Camera className="w-4 h-4" /> Photo
                    </button>
                    <button className="px-4 py-2 bg-surface/50 border border-slate-700 rounded-xl text-sm flex items-center gap-1">
                        <Filter className="w-4 h-4" /> Tags
                    </button>
                </div>

                <button
                    onClick={onClose}
                    disabled={!content.trim()}
                    className="w-full py-3 bg-gradient-to-r from-action to-purple-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Send className="w-4 h-4" /> Share Story
                </button>
            </motion.div>
        </motion.div>
    );
}
