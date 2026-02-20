import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Settings, LogOut, Heart, MapPin, Calendar,
    ChevronRight, Sparkles, Edit2, Camera, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { AuthModal } from '../../components/ui/AuthModal';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import type { Itinerary } from '../../types/database.types';
import { cn } from '../../lib/utils';

export function ProfileView() {
    const { user, profile, signOut, isLoading: authLoading } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
    const [isLoadingTrips, setIsLoadingTrips] = useState(false);
    const [activeTab, setActiveTab] = useState<'trips' | 'favorites' | 'settings'>('trips');

    // Fetch saved trips
    useEffect(() => {
        if (user) {
            fetchSavedTrips();
        }
    }, [user]);

    const fetchSavedTrips = async () => {
        if (!user || !isSupabaseAvailable || !supabase) return;
        setIsLoadingTrips(true);
        try {
            const { data, error } = await supabase
                .from('itineraries')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setSavedTrips(data);
            }
        } catch (err) {
            console.error('Error fetching trips:', err);
        } finally {
            setIsLoadingTrips(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        setSavedTrips([]);
    };

    // Loading state
    if (authLoading) {
        return (
            <div className="p-5 pt-12 min-h-screen pb-32 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-action animate-spin" />
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <div className="p-5 pt-12 min-h-screen pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-action/20 to-purple-500/20 flex items-center justify-center">
                        <User className="w-12 h-12 text-action" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Sign in to FAIO</h2>
                    <p className="text-secondary mb-8 max-w-xs mx-auto">
                        Create an account to save your trips, discover local secrets, and connect with other travelers
                    </p>

                    <div className="space-y-3 max-w-xs mx-auto">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAuthModal(true)}
                            className="w-full py-4 bg-gradient-to-r from-action to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-action/30"
                        >
                            Sign In / Sign Up
                        </motion.button>
                    </div>

                    {/* Features preview */}
                    <div className="mt-12 space-y-4 max-w-sm mx-auto">
                        <h3 className="font-bold text-sm text-secondary uppercase tracking-wider">What you get</h3>
                        {[
                            { icon: Heart, text: 'Save unlimited trips' },
                            { icon: MapPin, text: 'Submit local secrets' },
                            { icon: Sparkles, text: 'Personalized recommendations' },
                        ].map((item, i) => (
                            <GlassCard key={i} className="p-4 flex items-center gap-4" hover={false}>
                                <div className="w-10 h-10 rounded-xl bg-action/10 flex items-center justify-center">
                                    <item.icon className="w-5 h-5 text-action" />
                                </div>
                                <span className="font-medium">{item.text}</span>
                            </GlassCard>
                        ))}
                    </div>
                </motion.div>

                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
            </div>
        );
    }

    // Logged in view
    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-action to-purple-500 flex items-center justify-center ring-4 ring-action/20">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.username || 'User'}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-white">
                                    {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'T'}
                                </span>
                            )}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-surface border border-slate-700 rounded-full flex items-center justify-center hover:border-action transition-colors">
                            <Camera className="w-4 h-4 text-secondary" />
                        </button>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{profile?.username || 'Traveler'}</h1>
                        <p className="text-secondary text-sm">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-action/20 text-action text-xs font-bold rounded">
                                Explorer
                            </span>
                        </div>
                    </div>
                    <button className="p-3 bg-surface/50 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors">
                        <Edit2 className="w-5 h-5 text-secondary" />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <GlassCard className="p-3 text-center" hover={false}>
                        <p className="text-2xl font-bold text-action">{savedTrips.length}</p>
                        <p className="text-xs text-secondary">Trips</p>
                    </GlassCard>
                    <GlassCard className="p-3 text-center" hover={false}>
                        <p className="text-2xl font-bold text-purple-400">0</p>
                        <p className="text-xs text-secondary">Secrets</p>
                    </GlassCard>
                    <GlassCard className="p-3 text-center" hover={false}>
                        <p className="text-2xl font-bold text-emerald-400">0</p>
                        <p className="text-xs text-secondary">Reviews</p>
                    </GlassCard>
                </div>
            </motion.header>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'trips', label: 'My Trips', icon: MapPin },
                    { id: 'favorites', label: 'Favorites', icon: Heart },
                    { id: 'settings', label: 'Settings', icon: Settings },
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
                {activeTab === 'trips' && (
                    <motion.div
                        key="trips"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        {isLoadingTrips ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-6 h-6 mx-auto text-action animate-spin" />
                            </div>
                        ) : savedTrips.length > 0 ? (
                            savedTrips.map((trip, i) => (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <GlassCard className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-action to-purple-500 flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold">{trip.destination}</h4>
                                                <div className="flex items-center gap-2 text-xs text-secondary">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{trip.start_date} - {trip.end_date}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-secondary" />
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface/50 flex items-center justify-center">
                                    <MapPin className="w-8 h-8 text-secondary" />
                                </div>
                                <p className="text-secondary mb-4">No saved trips yet</p>
                                <p className="text-sm text-secondary">Plan your first adventure!</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'favorites' && (
                    <motion.div
                        key="favorites"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="py-12 text-center"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface/50 flex items-center justify-center">
                            <Heart className="w-8 h-8 text-secondary" />
                        </div>
                        <p className="text-secondary">Your favorite places will appear here</p>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        <GlassCard className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-secondary" />
                                <span>Edit Profile</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-secondary" />
                        </GlassCard>
                        <GlassCard className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-secondary" />
                                <span>Preferences</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-secondary" />
                        </GlassCard>
                        <button onClick={handleSignOut} className="w-full">
                            <GlassCard className="p-4 flex items-center gap-3 text-red-400 hover:bg-red-500/10 border-red-500/20">
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </GlassCard>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
