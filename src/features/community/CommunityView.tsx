import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Heart, MessageCircle, Share2, BookOpen,
    MapPin, Calendar, Star, Globe, UserPlus,
    Award, Compass, ImagePlus,
    Plus, Search, Send, Trash2, X,
    Clock, Check, XCircle, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { communityService, type TravelStory, type StoryComment, type GroupTrip, type JoinRequest } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// ============================
// MAIN COMMUNITY VIEW
// ============================

export function CommunityView() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'leaderboard'>('feed');
    const [stories, setStories] = useState<TravelStory[]>([]);
    const [trips, setTrips] = useState<GroupTrip[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateTrip, setShowCreateTrip] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ travelers: '—', stories: '—', trips: '—', countries: '—' });

    const loadStories = useCallback(async () => {
        setIsLoading(true);
        const { data } = await communityService.getStories(user?.id);
        setStories(data);
        setIsLoading(false);
    }, [user?.id]);

    const loadTrips = useCallback(async () => {
        const { data } = await communityService.getGroupTrips(user?.id);
        setTrips(data);
    }, [user?.id]);

    useEffect(() => {
        loadStories();
        loadTrips();
        communityService.getCommunityStats().then(setStats);
    }, [loadStories, loadTrips]);

    const handleLike = async (storyId: string) => {
        if (!user) { showToast('Sign in to like stories', 'error'); return; }
        // Optimistic update
        setStories(prev => prev.map(s =>
            s.id === storyId ? {
                ...s,
                isLikedByMe: !s.isLikedByMe,
                likes: s.isLikedByMe ? s.likes - 1 : s.likes + 1
            } : s
        ));
        await communityService.toggleLike(storyId, user.id);
    };

    const handleStoryCreated = () => {
        setShowCreatePost(false);
        loadStories();
        showToast('Story shared! 🎉', 'success');
    };

    const handleTripCreated = () => {
        setShowCreateTrip(false);
        loadTrips();
        showToast('Trip posted! Others can now join 🚀', 'success');
    };

    const handleJoinRequest = async (tripId: string, message: string) => {
        if (!user) { showToast('Sign in to join trips', 'error'); return; }
        const { error } = await communityService.requestToJoin(tripId, user.id, message);
        if (error) { showToast('Failed to send request', 'error'); return; }
        showToast('Join request sent! ✅', 'success');
        loadTrips();
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
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-action" />
                        <span className="text-xs text-action font-bold uppercase tracking-wider">Travel Network</span>
                    </div>
                    <button
                        onClick={() => activeTab === 'groups' ? setShowCreateTrip(true) : setShowCreatePost(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-action text-white rounded-xl text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        {activeTab === 'groups' ? 'Host Trip' : 'Post'}
                    </button>
                </div>
                <h1 className="text-3xl font-bold">Community</h1>
                <p className="text-secondary text-sm">Connect with travelers worldwide</p>
            </motion.header>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-2 mb-5">
                {[
                    { label: 'Travelers', value: stats.travelers, icon: Users },
                    { label: 'Stories', value: stats.stories, icon: BookOpen },
                    { label: 'Trips', value: stats.trips, icon: Compass },
                    { label: 'Countries', value: stats.countries, icon: Globe },
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
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stories, trips, people..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-action placeholder:text-slate-500"
                />
            </div>

            {/* Tabs */}
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
                            activeTab === tab.id ? "bg-action text-white" : "bg-surface/80 text-secondary"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-action animate-spin" /></div>
            ) : (
                <>
                    {activeTab === 'feed' && (
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                            {filteredStories.length === 0 ? (
                                <GlassCard className="p-8 text-center">
                                    <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                    <p className="text-white/50">No stories yet. Be the first to share!</p>
                                </GlassCard>
                            ) : (
                                filteredStories.map((story, i) => (
                                    <motion.div key={story.id} variants={item}>
                                        <StoryCard
                                            story={story}
                                            delay={i * 0.05}
                                            onLike={() => handleLike(story.id)}
                                            userId={user?.id}
                                            onDeleted={loadStories}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'groups' && (
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                            {trips.length === 0 ? (
                                <GlassCard className="p-8 text-center">
                                    <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                    <p className="text-white/50">No group trips yet. Host the first one!</p>
                                </GlassCard>
                            ) : (
                                trips.map((trip, i) => (
                                    <motion.div key={trip.id} variants={item}>
                                        <GroupTripCard
                                            trip={trip}
                                            delay={i * 0.05}
                                            userId={user?.id}
                                            onJoinRequest={handleJoinRequest}
                                            onDeleted={loadTrips}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'leaderboard' && <Leaderboard />}
                </>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showCreatePost && <CreatePostModal userId={user?.id} user={user} onClose={() => setShowCreatePost(false)} onCreated={handleStoryCreated} />}
                {showCreateTrip && <CreateTripModal userId={user?.id} user={user} onClose={() => setShowCreateTrip(false)} onCreated={handleTripCreated} />}
            </AnimatePresence>
        </div>
    );
}

// ============================
// STORY CARD
// ============================

function StoryCard({ story, delay, onLike, userId, onDeleted }: {
    story: TravelStory; delay: number; onLike: () => void;
    userId?: string; onDeleted: () => void;
}) {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<StoryComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const { showToast } = useToast();

    const loadComments = async () => {
        setLoadingComments(true);
        const { data } = await communityService.getComments(story.id);
        setComments(data);
        setLoadingComments(false);
    };

    const handleToggleComments = () => {
        if (!showComments) loadComments();
        setShowComments(!showComments);
    };

    const handleAddComment = async () => {
        if (!userId) { showToast('Sign in to comment', 'error'); return; }
        if (!newComment.trim()) return;
        await communityService.addComment(story.id, userId, newComment.trim());
        setNewComment('');
        loadComments();
    };

    const handleDelete = async () => {
        if (!userId || story.user_id !== userId) return;
        await communityService.deleteStory(story.id, userId);
        showToast('Story deleted', 'success');
        onDeleted();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: `${story.user.name}'s story from ${story.location}`, text: story.caption });
        } else {
            navigator.clipboard.writeText(story.caption);
            showToast('Copied to clipboard', 'success');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <GlassCard className="overflow-hidden">
                {/* User header */}
                <div className="p-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={story.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-action/30" />
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm">{story.user.name}</span>
                                {story.user.verified && <Check className="w-3.5 h-3.5 text-action" />}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-secondary">
                                <MapPin className="w-3 h-3" />
                                <span>{story.location}, {story.country}</span>
                                <span className="text-white/20">·</span>
                                <span>{story.postedAt}</span>
                            </div>
                        </div>
                    </div>
                    {userId && story.user_id === userId && (
                        <button onClick={handleDelete} className="text-white/30 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                    )}
                </div>

                {/* Caption */}
                <p className="px-4 py-2 text-sm leading-relaxed">{story.caption}</p>

                {/* Image */}
                {story.images.length > 0 && (
                    <img src={story.images[0]} alt={story.location} className="w-full h-56 object-cover" loading="lazy" />
                )}

                {/* Tags */}
                {story.tags.length > 0 && (
                    <div className="px-4 pt-2 flex gap-1 flex-wrap">
                        {story.tags.map(tag => (
                            <span key={tag} className="text-xs text-action bg-action/10 px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button onClick={onLike} className="flex items-center gap-1.5 group">
                            <Heart className={cn("w-5 h-5 transition-colors", story.isLikedByMe ? "text-red-500 fill-red-500" : "text-secondary group-hover:text-red-400")} />
                            <span className={cn("text-sm", story.isLikedByMe ? "text-red-400" : "text-secondary")}>{story.likes}</span>
                        </button>
                        <button onClick={handleToggleComments} className="flex items-center gap-1.5 text-secondary hover:text-action">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{story.comments}</span>
                        </button>
                        <button onClick={handleShare} className="flex items-center gap-1.5 text-secondary hover:text-action">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Comments */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                                {loadingComments ? (
                                    <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 text-action animate-spin" /></div>
                                ) : comments.length === 0 ? (
                                    <p className="text-white/30 text-xs text-center py-2">No comments yet. Be the first!</p>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className="flex gap-2">
                                            <img src={c.user.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold">{c.user.name}</span>
                                                    <span className="text-[10px] text-white/30">{formatTimeAgo(new Date(c.created_at))}</span>
                                                </div>
                                                <p className="text-xs text-white/70">{c.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {/* Add comment */}
                                <div className="flex gap-2 pt-1">
                                    <input
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                                        placeholder="Write a comment..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-action"
                                    />
                                    <button onClick={handleAddComment} disabled={!newComment.trim()} className="px-3 py-2 bg-action rounded-xl disabled:opacity-30">
                                        <Send className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.div>
    );
}

// ============================
// GROUP TRIP CARD
// ============================

function GroupTripCard({ trip, delay, userId, onJoinRequest, onDeleted }: {
    trip: GroupTrip; delay: number; userId?: string;
    onJoinRequest: (tripId: string, message: string) => void;
    onDeleted: () => void;
}) {
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');
    const [showRequests, setShowRequests] = useState(false);
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const { showToast } = useToast();
    const isHost = userId && trip.host_id === userId;
    const spotsLeft = trip.spots.total - trip.spots.filled;

    const loadRequests = async () => {
        const { data } = await communityService.getJoinRequests(trip.id);
        setRequests(data);
    };

    const handleJoin = () => {
        onJoinRequest(trip.id, joinMessage);
        setShowJoinForm(false);
        setJoinMessage('');
    };

    const handleUpdateRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
        await communityService.updateJoinRequest(requestId, status, trip.id);
        showToast(status === 'accepted' ? 'Request accepted! ✅' : 'Request rejected', 'success');
        loadRequests();
    };

    const handleDeleteTrip = async () => {
        if (!userId) return;
        await communityService.deleteTrip(trip.id, userId);
        showToast('Trip deleted', 'success');
        onDeleted();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <GlassCard className="p-4 space-y-3">
                {/* Host info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={trip.host.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-action/30" />
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm">{trip.host.name}</span>
                                {trip.host.verified && <Check className="w-3.5 h-3.5 text-action" />}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-secondary">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span>{trip.host.rating}</span>
                                {isHost && <span className="text-action ml-1">(You)</span>}
                            </div>
                        </div>
                    </div>
                    {isHost && (
                        <div className="flex gap-1">
                            <button onClick={() => { setShowRequests(!showRequests); if (!showRequests) loadRequests(); }}
                                className="px-2 py-1 text-xs bg-action/10 text-action rounded-lg">
                                Requests
                            </button>
                            <button onClick={handleDeleteTrip} className="p-1 text-white/30 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Destination */}
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-action" />
                        {trip.destination}
                    </h3>
                    {trip.description && <p className="text-xs text-white/60 mt-1">{trip.description}</p>}
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 text-xs text-secondary">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{trip.dates.start} — {trip.dates.end}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{trip.duration}</span>
                </div>

                {/* Vibes */}
                <div className="flex gap-1.5 flex-wrap">
                    {trip.vibes.map(v => (
                        <span key={v} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300">{v}</span>
                    ))}
                </div>

                {/* Spots & Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-secondary" />
                        <span className="text-sm">
                            <span className="font-semibold text-white">{trip.spots.filled}</span>
                            <span className="text-secondary">/{trip.spots.total} spots</span>
                        </span>
                        {spotsLeft <= 2 && spotsLeft > 0 && (
                            <span className="text-xs text-orange-400 font-medium">🔥 {spotsLeft} left!</span>
                        )}
                    </div>
                    <span className="text-lg font-bold text-action">
                        ${trip.price.amount} <span className="text-xs text-secondary font-normal">{trip.price.currency}</span>
                    </span>
                </div>

                {/* Includes */}
                {trip.includes.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                        {trip.includes.map(inc => (
                            <span key={inc} className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-300 flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> {inc}
                            </span>
                        ))}
                    </div>
                )}

                {/* Join Action */}
                {!isHost && (
                    <>
                        {trip.myJoinStatus === 'none' && spotsLeft > 0 && (
                            <button
                                onClick={() => setShowJoinForm(!showJoinForm)}
                                className="w-full py-2.5 bg-gradient-to-r from-action to-purple-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" /> Request to Join
                            </button>
                        )}
                        {trip.myJoinStatus === 'pending' && (
                            <div className="w-full py-2.5 bg-yellow-500/10 text-yellow-300 rounded-xl text-sm text-center font-medium flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" /> Request Pending
                            </div>
                        )}
                        {trip.myJoinStatus === 'accepted' && (
                            <div className="w-full py-2.5 bg-green-500/10 text-green-300 rounded-xl text-sm text-center font-medium flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> You're In! 🎉
                            </div>
                        )}
                        {trip.myJoinStatus === 'rejected' && (
                            <div className="w-full py-2.5 bg-red-500/10 text-red-300 rounded-xl text-sm text-center font-medium">
                                Request was declined
                            </div>
                        )}
                        {spotsLeft <= 0 && trip.myJoinStatus === 'none' && (
                            <div className="w-full py-2.5 bg-white/5 text-white/40 rounded-xl text-sm text-center font-medium">
                                Trip is Full
                            </div>
                        )}
                    </>
                )}

                {/* Join Form */}
                <AnimatePresence>
                    {showJoinForm && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="pt-2 space-y-2">
                                <textarea
                                    value={joinMessage}
                                    onChange={e => setJoinMessage(e.target.value)}
                                    placeholder="Introduce yourself! Why do you want to join?"
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none resize-none"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => setShowJoinForm(false)} className="flex-1 py-2 bg-white/5 text-white/50 rounded-xl text-sm">Cancel</button>
                                    <button onClick={handleJoin} className="flex-1 py-2 bg-action text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1">
                                        <Send className="w-3.5 h-3.5" /> Send Request
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Host: View Requests */}
                <AnimatePresence>
                    {showRequests && isHost && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="pt-2 border-t border-white/5 space-y-2">
                                <h4 className="text-xs text-white/40 font-medium uppercase">Join Requests</h4>
                                {requests.length === 0 ? (
                                    <p className="text-white/30 text-xs py-2 text-center">No requests yet</p>
                                ) : (
                                    requests.map(req => (
                                        <div key={req.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                                            <img src={req.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{req.user.name}</p>
                                                {req.message && <p className="text-xs text-white/50 truncate">{req.message}</p>}
                                            </div>
                                            {req.status === 'pending' ? (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleUpdateRequest(req.id, 'accepted')} className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleUpdateRequest(req.id, 'rejected')} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={cn("text-xs px-2 py-0.5 rounded-full",
                                                    req.status === 'accepted' ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
                                                )}>{req.status}</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </motion.div>
    );
}

// ============================
// LEADERBOARD
// ============================

function Leaderboard() {
    const leaders = [
        { rank: 1, name: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?u=priya', countries: 32, stories: 156, badge: '🏆' },
        { rank: 2, name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?u=alex', countries: 28, stories: 124, badge: '🥈' },
        { rank: 3, name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarah', countries: 25, stories: 98, badge: '🥉' },
        { rank: 4, name: 'David Park', avatar: 'https://i.pravatar.cc/150?u=david', countries: 22, stories: 87, badge: '⭐' },
        { rank: 5, name: 'Maya Patel', avatar: 'https://i.pravatar.cc/150?u=maya', countries: 19, stories: 76, badge: '⭐' },
    ];

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {leaders.map(l => (
                <motion.div key={l.rank} variants={item}>
                    <GlassCard className="p-3 flex items-center gap-3">
                        <span className="text-xl w-8 text-center">{l.badge}</span>
                        <img src={l.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{l.name}</p>
                            <p className="text-xs text-secondary">{l.countries} countries · {l.stories} stories</p>
                        </div>
                        <span className="text-xs text-secondary font-mono">#{l.rank}</span>
                    </GlassCard>
                </motion.div>
            ))}
        </motion.div>
    );
}

// ============================
// CREATE POST MODAL
// ============================

function CreatePostModal({ userId, user, onClose, onCreated }: { userId?: string; user?: any; onClose: () => void; onCreated: () => void }) {
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [country, setCountry] = useState('');
    const [tags, setTags] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Traveler';
    const displayAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image must be under 5MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!userId) { showToast('Sign in to post', 'error'); return; }
        if (!caption.trim() || !location.trim()) { showToast('Add caption and location', 'error'); return; }

        setLoading(true);
        const { error } = await communityService.createStory(userId, {
            location: location.trim(),
            country: country.trim() || location.trim(),
            caption: caption.trim(),
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            images: photoPreview ? [photoPreview] : [],
            userName: displayName,
            userAvatar: displayAvatar,
        });
        setLoading(false);

        if (error) { showToast('Failed to post: ' + error.message, 'error'); return; }
        onCreated();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6 pb-10 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Share Your Story</h3>
                    <button onClick={onClose} className="text-secondary hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <textarea
                    value={caption} onChange={(e) => setCaption(e.target.value)}
                    placeholder="What's your travel story? ✈️"
                    rows={3}
                    className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-action text-white resize-none"
                />

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                            placeholder="City" className="w-full bg-surface/50 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-action text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-secondary flex-shrink-0" />
                        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country" className="w-full bg-surface/50 border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-action text-sm" />
                    </div>
                </div>

                {/* Photo Picker */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                />

                {photoPreview ? (
                    <div className="relative rounded-xl overflow-hidden">
                        <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                        <button
                            onClick={() => { setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center gap-2 text-secondary hover:text-white hover:border-action/50 transition-colors"
                    >
                        <ImagePlus className="w-5 h-5" />
                        <span className="text-sm font-medium">Add Photo</span>
                    </button>
                )}

                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                    placeholder="Tags (comma separated: Beach, Culture, Food)"
                    className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-action text-sm" />

                <button
                    onClick={handleSubmit} disabled={loading || !caption.trim() || !location.trim()}
                    className="w-full py-3 bg-gradient-to-r from-action to-purple-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Sharing...' : 'Share Story'}
                </button>
            </motion.div>
        </motion.div>
    );
}

// ============================
// CREATE TRIP MODAL
// ============================

function CreateTripModal({ userId, user, onClose, onCreated }: { userId?: string; user?: any; onClose: () => void; onCreated: () => void }) {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [duration] = useState('');
    const [vibes, setVibes] = useState('');
    const [spotsTotal, setSpotsTotal] = useState('5');
    const [price, setPrice] = useState('');
    const [includes, setIncludes] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Host';
    const displayAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';

    const handleSubmit = async () => {
        if (!userId) { showToast('Sign in to host trips', 'error'); return; }
        if (!destination.trim() || !startDate || !endDate) { showToast('Fill in destination and dates', 'error'); return; }

        setLoading(true);
        const { error } = await communityService.createGroupTrip(userId, {
            destination: destination.trim(),
            dates: { start: startDate, end: endDate },
            duration: duration.trim() || `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)} days`,
            vibes: vibes.split(',').map(v => v.trim()).filter(Boolean),
            spotsTotal: parseInt(spotsTotal) || 5,
            priceAmount: parseFloat(price) || 0,
            priceCurrency: 'USD',
            includes: includes.split(',').map(i => i.trim()).filter(Boolean),
            description: description.trim(),
            hostName: displayName,
            hostAvatar: displayAvatar,
        });
        setLoading(false);

        if (error) { showToast('Failed: ' + error.message, 'error'); return; }
        onCreated();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6 pb-24 space-y-3 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Host a Group Trip</h3>
                    <button onClick={onClose} className="text-secondary hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <input value={destination} onChange={e => setDestination(e.target.value)}
                    placeholder="Where are you going? 🌍" className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-action" />

                <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your trip..." rows={2}
                    className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-action text-sm resize-none" />

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-secondary mb-1 block">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                            className="w-full bg-surface/50 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none" />
                    </div>
                    <div>
                        <label className="text-xs text-secondary mb-1 block">End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                            className="w-full bg-surface/50 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <input value={spotsTotal} onChange={e => setSpotsTotal(e.target.value)} type="number"
                        placeholder="Max spots" className="bg-surface/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none" />
                    <input value={price} onChange={e => setPrice(e.target.value)} type="number"
                        placeholder="Price (USD)" className="bg-surface/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none" />
                </div>

                <input value={vibes} onChange={e => setVibes(e.target.value)}
                    placeholder="Vibes: Adventure, Foodie, Budget..." className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none" />

                <input value={includes} onChange={e => setIncludes(e.target.value)}
                    placeholder="What's included: Accommodation, Transport..." className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none" />

                <button
                    onClick={handleSubmit} disabled={loading || !destination.trim() || !startDate || !endDate}
                    className="w-full py-3 bg-gradient-to-r from-action to-purple-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                    {loading ? 'Creating...' : 'Post Trip'}
                </button>
            </motion.div>
        </motion.div>
    );
}

// ============================
// HELPER
// ============================

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}
