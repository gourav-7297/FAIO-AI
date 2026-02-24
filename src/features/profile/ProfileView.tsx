import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Settings, LogOut, MapPin, Globe, Star,
    Award, Leaf, Heart, Calendar, Camera,
    Shield, Bell, Moon, Palette, Languages,
    ChevronRight, Edit2, Compass, TrendingUp,
    Bookmark, Plane, CheckCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { useAIAgents } from '../../context/AIAgentContext';

interface Achievement {
    id: string;
    title: string;
    icon: string;
    description: string;
    earned: boolean;
    progress: number;
    total: number;
}

const ACHIEVEMENTS: Achievement[] = [
    { id: '1', title: 'First Trip', icon: '✈️', description: 'Plan your first trip', earned: true, progress: 1, total: 1 },
    { id: '2', title: 'Eco Warrior', icon: '🌿', description: 'Keep eco score above 80%', earned: true, progress: 85, total: 80 },
    { id: '3', title: 'Explorer', icon: '🧭', description: 'Visit 5 countries', earned: false, progress: 3, total: 5 },
    { id: '4', title: 'Community Star', icon: '⭐', description: 'Share 10 travel stories', earned: false, progress: 4, total: 10 },
    { id: '5', title: 'Budget Pro', icon: '💰', description: 'Stay under budget 3 trips', earned: false, progress: 1, total: 3 },
    { id: '6', title: 'Night Owl', icon: '🦉', description: 'Explore 10 nightlife spots', earned: false, progress: 2, total: 10 },
];

export function ProfileView() {
    const { user, signOut } = useAuth();
    const { tripData } = useAIAgents();
    const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'settings'>('stats');
    const [savedTrips, setSavedTrips] = useState<any[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('faio_saved_trips');
            if (raw) setSavedTrips(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    const stats = {
        tripsPlanned: savedTrips.length || 3,
        countriesVisited: 5,
        placesExplored: 28,
        ecoScore: 87,
        totalDays: 42,
        photosShared: 15,
    };

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <GlassCard gradient="purple" glow className="p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-action/20 via-purple-500/20 to-pink-500/20" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-action to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-action/30">
                            {user?.email?.[0]?.toUpperCase() || 'T'}
                        </div>
                        <h1 className="text-2xl font-bold text-white">{user?.email?.split('@')[0] || 'Traveler'}</h1>
                        <p className="text-sm text-white/70 mb-3">{user?.email || 'explorer@faio.ai'}</p>

                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                                <Globe className="w-3 h-3" />
                                <span>{stats.countriesVisited} countries</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                                <Plane className="w-3 h-3" />
                                <span>{stats.tripsPlanned} trips</span>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-400/20 rounded-full text-xs text-emerald-300">
                                <Leaf className="w-3 h-3" />
                                <span>{stats.ecoScore}%</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Travel Level */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" />
                            <span className="font-bold text-sm">Explorer Level 5</span>
                        </div>
                        <span className="text-xs text-action font-bold">720 / 1000 XP</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '72%' }}
                            className="h-full bg-gradient-to-r from-action to-purple-500 rounded-full" />
                    </div>
                    <p className="text-[10px] text-secondary mt-1">280 XP to Level 6</p>
                </GlassCard>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'stats', label: 'Stats', icon: TrendingUp },
                    { id: 'achievements', label: 'Achievements', icon: Award },
                    { id: 'settings', label: 'Settings', icon: Settings },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap",
                            activeTab === tab.id ? "bg-action text-white" : "bg-surface/50 text-secondary hover:text-white"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'stats' && (
                    <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Trips Planned', value: stats.tripsPlanned, icon: Plane, color: 'text-action' },
                                { label: 'Countries', value: stats.countriesVisited, icon: Globe, color: 'text-purple-400' },
                                { label: 'Places Explored', value: stats.placesExplored, icon: MapPin, color: 'text-amber-400' },
                                { label: 'Total Days', value: stats.totalDays, icon: Calendar, color: 'text-teal-400' },
                                { label: 'Eco Score', value: `${stats.ecoScore}%`, icon: Leaf, color: 'text-emerald-400' },
                                { label: 'Photos Shared', value: stats.photosShared, icon: Camera, color: 'text-pink-400' },
                            ].map((stat, i) => (
                                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                                    <GlassCard className="p-4">
                                        <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-secondary">{stat.label}</p>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>

                        {/* Saved Trips */}
                        <div>
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <Bookmark className="w-4 h-4 text-action" />
                                Saved Trips
                            </h3>
                            {savedTrips.length === 0 ? (
                                <GlassCard className="p-6 text-center">
                                    <Compass className="w-8 h-8 text-secondary/30 mx-auto mb-2" />
                                    <p className="text-sm text-secondary">No saved trips yet</p>
                                    <p className="text-xs text-secondary">Plan your first trip to see it here!</p>
                                </GlassCard>
                            ) : (
                                <div className="space-y-2">
                                    {savedTrips.slice(0, 3).map((trip, i) => (
                                        <GlassCard key={i} className="p-3 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-action/10 flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-action" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{trip.destination || 'Trip'}</p>
                                                <p className="text-xs text-secondary">{trip.duration || '—'}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-secondary" />
                                        </GlassCard>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'achievements' && (
                    <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        <GlassCard className="p-4 flex items-center justify-between">
                            <div>
                                <p className="font-bold">{ACHIEVEMENTS.filter(a => a.earned).length} / {ACHIEVEMENTS.length}</p>
                                <p className="text-xs text-secondary">Achievements unlocked</p>
                            </div>
                            <div className="flex -space-x-2">
                                {ACHIEVEMENTS.filter(a => a.earned).map(a => (
                                    <span key={a.id} className="text-lg">{a.icon}</span>
                                ))}
                            </div>
                        </GlassCard>

                        {ACHIEVEMENTS.map((achievement, i) => (
                            <motion.div key={achievement.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <GlassCard className={cn(
                                    "p-4 flex items-center gap-3",
                                    achievement.earned ? "border-amber-500/20" : "opacity-70"
                                )}>
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                                        achievement.earned ? "bg-amber-500/10" : "bg-surface/50"
                                    )}>
                                        {achievement.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm">{achievement.title}</p>
                                            {achievement.earned && <CheckCircle className="w-4 h-4 text-amber-400" />}
                                        </div>
                                        <p className="text-xs text-secondary">{achievement.description}</p>
                                        {!achievement.earned && (
                                            <div className="mt-1.5">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-[10px] text-secondary">{achievement.progress}/{achievement.total}</span>
                                                </div>
                                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-action rounded-full" style={{ width: `${(achievement.progress / achievement.total) * 100}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        {[
                            { icon: Bell, label: 'Notifications', sublabel: 'Trip alerts & reminders', action: 'On' },
                            { icon: Shield, label: 'Safety Settings', sublabel: 'Emergency contacts & SOS', action: '→' },
                            { icon: Moon, label: 'Dark Mode', sublabel: 'Always on', action: 'On' },
                            { icon: Languages, label: 'Language', sublabel: 'App language', action: 'English' },
                            { icon: Palette, label: 'Theme', sublabel: 'Color scheme', action: 'Default' },
                            { icon: Leaf, label: 'Eco Preferences', sublabel: 'Carbon tracking', action: 'Active' },
                        ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                <GlassCard className="p-4 flex items-center gap-3 cursor-pointer hover:border-slate-600 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-action/10 flex items-center justify-center">
                                        <item.icon className="w-5 h-5 text-action" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{item.label}</p>
                                        <p className="text-xs text-secondary">{item.sublabel}</p>
                                    </div>
                                    <span className="text-xs text-secondary">{item.action}</span>
                                    <ChevronRight className="w-4 h-4 text-secondary" />
                                </GlassCard>
                            </motion.div>
                        ))}

                        {/* About */}
                        <GlassCard className="p-4 text-center mt-4">
                            <p className="text-sm font-bold">FAIO AI</p>
                            <p className="text-xs text-secondary">v2.0 • AI-Powered Travel Companion</p>
                        </GlassCard>

                        {/* Sign Out */}
                        <button
                            onClick={signOut}
                            className="w-full py-3 border border-red-500/30 text-red-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
