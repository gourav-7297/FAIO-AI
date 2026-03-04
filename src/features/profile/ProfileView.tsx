import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, LogOut, MapPin, Globe,
    Award, Leaf, Calendar, Camera,
    Shield, Bell, Moon, Palette, Languages,
    ChevronRight, Compass, TrendingUp,
    Bookmark, Plane, CheckCircle, Edit3,
    X, Save, User, Heart, MessageCircle,
    Star, Clock, Hash, Sparkles, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuth } from '../../context/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────
interface Achievement {
    id: string;
    title: string;
    icon: string;
    description: string;
    earned: boolean;
    progress: number;
    total: number;
}

// ─── Constants ──────────────────────────────────────────────────────
const ACHIEVEMENTS: Achievement[] = [
    { id: '1', title: 'First Trip', icon: '✈️', description: 'Plan your first trip', earned: true, progress: 1, total: 1 },
    { id: '2', title: 'Eco Warrior', icon: '🌿', description: 'Keep eco score above 80%', earned: true, progress: 85, total: 80 },
    { id: '3', title: 'Explorer', icon: '🧭', description: 'Visit 5 countries', earned: false, progress: 3, total: 5 },
    { id: '4', title: 'Community Star', icon: '⭐', description: 'Share 10 travel stories', earned: false, progress: 4, total: 10 },
    { id: '5', title: 'Budget Pro', icon: '💰', description: 'Stay under budget 3 trips', earned: false, progress: 1, total: 3 },
    { id: '6', title: 'Night Owl', icon: '🦉', description: 'Explore 10 nightlife spots', earned: false, progress: 2, total: 10 },
    { id: '7', title: 'Photographer', icon: '📸', description: 'Share 20 photos', earned: false, progress: 5, total: 20 },
    { id: '8', title: 'Globe Trotter', icon: '🌍', description: 'Visit 3 continents', earned: false, progress: 1, total: 3 },
    { id: '9', title: 'Early Bird', icon: '🐦', description: 'Book 5 sunrise tours', earned: false, progress: 0, total: 5 },
];

const TRAVEL_STYLE_OPTIONS = [
    '🎒 Adventure', '🏛️ Culture', '🍜 Foodie', '🏖️ Beach',
    '🏔️ Mountains', '🌃 Nightlife', '🧘 Wellness', '👨‍👩‍👧 Family',
    '💼 Business', '🎨 Art', '📷 Photography', '🌿 Eco',
];

const SETTING_SECTIONS = [
    {
        title: 'Notifications',
        items: [
            { icon: Bell, label: 'Trip Alerts', sublabel: 'Reminders & updates', toggle: true, defaultOn: true },
            { icon: MessageCircle, label: 'Community', sublabel: 'Likes & comments', toggle: true, defaultOn: true },
        ],
    },
    {
        title: 'Preferences',
        items: [
            { icon: Moon, label: 'Dark Mode', sublabel: 'Always on', toggle: true, defaultOn: true },
            { icon: Languages, label: 'Language', sublabel: 'English', toggle: false },
            { icon: Palette, label: 'Theme', sublabel: 'Default', toggle: false },
            { icon: Leaf, label: 'Eco Tracking', sublabel: 'Carbon footprint', toggle: true, defaultOn: true },
        ],
    },
    {
        title: 'Account',
        items: [
            { icon: Shield, label: 'Safety Settings', sublabel: 'Emergency contacts & SOS', toggle: false },
            { icon: User, label: 'Account Info', sublabel: 'Email & password', toggle: false },
        ],
    },
];

// ─── Animated Counter ───────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 1200;
        const stepTime = Math.max(Math.floor(duration / end), 30);
        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) clearInterval(timer);
        }, stepTime);
        return () => clearInterval(timer);
    }, [value]);

    return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Toggle Switch ──────────────────────────────────────────────────
function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
    const [isOn, setIsOn] = useState(defaultOn);
    return (
        <button
            onClick={(e) => { e.stopPropagation(); setIsOn(!isOn); }}
            className={cn(
                "w-11 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0",
                isOn ? "bg-action" : "bg-slate-700"
            )}
        >
            <motion.div
                animate={{ x: isOn ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md"
            />
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export function ProfileView() {
    const { user, profile, signOut, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity' | 'settings'>('overview');
    const [savedTrips, setSavedTrips] = useState<any[]>([]);
    const [showEditDrawer, setShowEditDrawer] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editStyles, setEditStyles] = useState<string[]>([]);

    // Load saved trips
    useEffect(() => {
        try {
            const raw = localStorage.getItem('faio_saved_trips');
            if (raw) setSavedTrips(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    // Derive user display values
    const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url || null;
    const displayName = profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Traveler';
    const email = user?.email || 'explorer@faio.ai';
    const bio = (profile as any)?.bio || 'Adventure awaits! ✨';
    const travelStyles: string[] = (profile as any)?.travel_styles || ['🎒 Adventure', '🍜 Foodie'];

    const stats = {
        tripsPlanned: savedTrips.length || 3,
        countriesVisited: 5,
        placesExplored: 28,
        ecoScore: 87,
        totalDays: 42,
        photosShared: 15,
    };

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Mar 2026';

    // Open edit drawer
    const openEdit = () => {
        setEditName(displayName);
        setEditBio(bio);
        setEditStyles([...travelStyles]);
        setShowEditDrawer(true);
    };

    // Save profile edits
    const saveProfile = async () => {
        await updateProfile({
            username: editName,
            bio: editBio as any,
            travel_styles: editStyles as any,
        } as any);
        setShowEditDrawer(false);
    };

    const toggleStyle = (style: string) => {
        setEditStyles(prev =>
            prev.includes(style)
                ? prev.filter(s => s !== style)
                : [...prev, style]
        );
    };

    // ─── Render ─────────────────────────────────────────────────────
    return (
        <div className="min-h-screen pb-32 relative">
            {/* ── Hero Profile Header ─────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
            >
                {/* Cover gradient */}
                <div className="h-44 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-action via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.3),transparent_50%)]" />
                    {/* Floating decorative dots */}
                    <motion.div
                        animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-6 right-8 w-3 h-3 bg-white/30 rounded-full blur-[1px]"
                    />
                    <motion.div
                        animate={{ y: [0, 6, 0], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="absolute top-12 left-12 w-2 h-2 bg-white/20 rounded-full blur-[1px]"
                    />
                    <motion.div
                        animate={{ y: [0, -5, 0], opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                        className="absolute bottom-8 right-24 w-2.5 h-2.5 bg-pink-300/30 rounded-full blur-[1px]"
                    />
                </div>

                {/* Avatar + info (overlaps cover) */}
                <div className="px-5 -mt-16 relative z-10">
                    <div className="flex items-end gap-4">
                        {/* Avatar */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="relative flex-shrink-0"
                        >
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-action to-purple-500 p-[3px] shadow-xl shadow-action/30">
                                <div className="w-full h-full rounded-[13px] overflow-hidden bg-surface flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-white bg-gradient-to-br from-action to-purple-500 w-full h-full flex items-center justify-center">
                                            {displayName[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-[3px] border-background" />
                        </motion.div>

                        {/* Name + meta */}
                        <div className="flex-1 pb-1 min-w-0">
                            <motion.h1
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-xl font-bold text-white truncate"
                            >
                                {displayName}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm text-white/50 truncate"
                            >
                                {email}
                            </motion.p>
                        </div>

                        {/* Edit button */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            onClick={openEdit}
                            className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <Edit3 className="w-4 h-4 text-white" />
                        </motion.button>
                    </div>

                    {/* Bio */}
                    <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm text-secondary mt-3"
                    >
                        {bio}
                    </motion.p>

                    {/* Travel styles */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="flex flex-wrap gap-1.5 mt-2.5"
                    >
                        {travelStyles.map(style => (
                            <span key={style} className="px-2.5 py-1 bg-white/8 border border-white/10 rounded-lg text-[11px] text-white/70">
                                {style}
                            </span>
                        ))}
                        <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white/40 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Since {memberSince}
                        </span>
                    </motion.div>

                    {/* Quick stats strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-3 mt-4"
                    >
                        {[
                            { value: stats.tripsPlanned, label: 'Trips', icon: Plane, color: 'text-action' },
                            { value: stats.countriesVisited, label: 'Countries', icon: Globe, color: 'text-purple-400' },
                            { value: stats.ecoScore, label: 'Eco Score', icon: Leaf, color: 'text-emerald-400', suffix: '%' },
                        ].map((s, i) => (
                            <div key={i} className="flex-1 text-center py-2.5 bg-surface/60 backdrop-blur-sm rounded-xl border border-white/5">
                                <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.color)} />
                                <p className="text-lg font-bold leading-none">
                                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                                </p>
                                <p className="text-[10px] text-secondary mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Travel Level / XP Bar ────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="px-5 mt-5"
            >
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Award className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <span className="font-bold text-sm">Explorer Level 5</span>
                                <p className="text-[10px] text-secondary">280 XP to Level 6</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-gradient-to-r from-action to-purple-400 bg-clip-text text-transparent">720 / 1000 XP</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '72%' }}
                            transition={{ delay: 0.9, duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-action via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </motion.div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* ── Tab Navigation ───────────────────────────────────────── */}
            <div className="px-5 mt-5">
                <div className="flex gap-1.5 p-1 bg-surface/80 rounded-2xl border border-white/5">
                    {[
                        { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
                        { id: 'achievements' as const, label: 'Badges', icon: Award },
                        { id: 'activity' as const, label: 'Activity', icon: Clock },
                        { id: 'settings' as const, label: 'Settings', icon: Settings },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all text-xs font-semibold",
                                activeTab === tab.id
                                    ? "bg-action text-white shadow-lg shadow-action/20"
                                    : "text-secondary hover:text-white"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ──────────────────────────────────────────── */}
            <div className="px-5 mt-4">
                <AnimatePresence mode="wait">
                    {/* ──── OVERVIEW TAB ──────────────────────────────── */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2.5">
                                {[
                                    { label: 'Trips', value: stats.tripsPlanned, icon: Plane, color: 'text-action', bg: 'bg-action/10' },
                                    { label: 'Countries', value: stats.countriesVisited, icon: Globe, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                                    { label: 'Places', value: stats.placesExplored, icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                                    { label: 'Days', value: stats.totalDays, icon: Calendar, color: 'text-teal-400', bg: 'bg-teal-500/10' },
                                    { label: 'Eco Score', value: stats.ecoScore, icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10', suffix: '%' },
                                    { label: 'Photos', value: stats.photosShared, icon: Camera, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.06 }}
                                    >
                                        <GlassCard className="p-3.5 text-center" hover={false}>
                                            <div className={cn("w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center", stat.bg)}>
                                                <stat.icon className={cn("w-4.5 h-4.5", stat.color)} />
                                            </div>
                                            <p className="text-xl font-bold leading-none">
                                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                            </p>
                                            <p className="text-[10px] text-secondary mt-1">{stat.label}</p>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Saved Trips */}
                            <div>
                                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                                    <Bookmark className="w-4 h-4 text-action" />
                                    Saved Trips
                                </h3>
                                {savedTrips.length === 0 ? (
                                    <GlassCard className="p-6 text-center" hover={false}>
                                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-action/10 flex items-center justify-center">
                                            <Compass className="w-7 h-7 text-action/40" />
                                        </div>
                                        <p className="text-sm font-medium text-white/60">No saved trips yet</p>
                                        <p className="text-xs text-secondary mt-1">Plan your first trip to see it here!</p>
                                    </GlassCard>
                                ) : (
                                    <div className="space-y-2">
                                        {savedTrips.slice(0, 4).map((trip, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <GlassCard className="p-3 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-action/10 flex items-center justify-center">
                                                        <MapPin className="w-5 h-5 text-action" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm truncate">{trip.destination || 'Trip'}</p>
                                                        <p className="text-xs text-secondary">{trip.duration || '—'}</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-secondary flex-shrink-0" />
                                                </GlassCard>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ──── ACHIEVEMENTS TAB ──────────────────────────── */}
                    {activeTab === 'achievements' && (
                        <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            {/* Summary */}
                            <GlassCard className="p-4" hover={false}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Sparkles className="w-5 h-5 text-amber-400" />
                                            <span className="font-bold text-lg">{ACHIEVEMENTS.filter(a => a.earned).length}</span>
                                            <span className="text-secondary text-sm">/ {ACHIEVEMENTS.length} unlocked</span>
                                        </div>
                                        <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(ACHIEVEMENTS.filter(a => a.earned).length / ACHIEVEMENTS.length) * 100}%` }}
                                                transition={{ delay: 0.3, duration: 0.8 }}
                                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex -space-x-1.5">
                                        {ACHIEVEMENTS.filter(a => a.earned).map(a => (
                                            <motion.span
                                                key={a.id}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2, type: 'spring' }}
                                                className="text-xl inline-block"
                                            >
                                                {a.icon}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Badge Grid */}
                            <div className="grid grid-cols-3 gap-2.5">
                                {ACHIEVEMENTS.map((achievement, i) => (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <GlassCard
                                            className={cn(
                                                "p-3 text-center relative",
                                                achievement.earned
                                                    ? "border-amber-500/20"
                                                    : "opacity-50"
                                            )}
                                            hover={false}
                                        >
                                            {achievement.earned && (
                                                <div className="absolute top-1.5 right-1.5">
                                                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                                                </div>
                                            )}
                                            <div className={cn(
                                                "text-3xl mb-1.5",
                                                !achievement.earned && "grayscale opacity-60"
                                            )}>
                                                {achievement.icon}
                                            </div>
                                            <p className="text-[11px] font-bold leading-tight">{achievement.title}</p>
                                            <p className="text-[9px] text-secondary mt-0.5 leading-tight">{achievement.description}</p>
                                            {!achievement.earned && (
                                                <div className="mt-2">
                                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-action/60 rounded-full"
                                                            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[8px] text-secondary mt-0.5">{achievement.progress}/{achievement.total}</p>
                                                </div>
                                            )}
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ──── ACTIVITY TAB ──────────────────────────────── */}
                    {activeTab === 'activity' && (
                        <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                            {savedTrips.length > 0 ? (
                                <>
                                    <p className="text-xs text-secondary flex items-center gap-1.5">
                                        <Hash className="w-3.5 h-3.5" /> Recent Activity
                                    </p>
                                    {savedTrips.slice(0, 5).map((trip, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                        >
                                            <GlassCard className="p-3.5 flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-action/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Plane className="w-4 h-4 text-action" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">
                                                        Planned trip to {trip.destination || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-secondary mt-0.5">
                                                        {trip.duration || '—'} • {trip.budget ? `₹${trip.budget}` : 'No budget set'}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[10px] text-secondary flex items-center gap-1">
                                                            <Heart className="w-3 h-3" /> Saved
                                                        </span>
                                                        <span className="text-[10px] text-secondary flex items-center gap-1">
                                                            <Star className="w-3 h-3" /> {trip.styles?.length || 0} styles
                                                        </span>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    ))}
                                </>
                            ) : (
                                <GlassCard className="p-8 text-center" hover={false}>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-action/10 to-purple-500/10 flex items-center justify-center">
                                            <Zap className="w-8 h-8 text-action/30" />
                                        </div>
                                        <p className="font-semibold text-white/60">No activity yet</p>
                                        <p className="text-xs text-secondary mt-1">
                                            Start planning trips to see your activity here!
                                        </p>
                                    </motion.div>
                                </GlassCard>
                            )}
                        </motion.div>
                    )}

                    {/* ──── SETTINGS TAB ──────────────────────────────── */}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                            {SETTING_SECTIONS.map((section, si) => (
                                <motion.div
                                    key={si}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: si * 0.1 }}
                                >
                                    <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2 px-1">
                                        {section.title}
                                    </p>
                                    <div className="space-y-1.5">
                                        {section.items.map((item, ii) => (
                                            <GlassCard key={ii} className="p-3.5 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-action/10 flex items-center justify-center flex-shrink-0">
                                                    <item.icon className="w-4.5 h-4.5 text-action" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm">{item.label}</p>
                                                    <p className="text-[11px] text-secondary">{item.sublabel}</p>
                                                </div>
                                                {item.toggle ? (
                                                    <ToggleSwitch defaultOn={item.defaultOn} />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-secondary flex-shrink-0" />
                                                )}
                                            </GlassCard>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}

                            {/* About */}
                            <GlassCard className="p-4 text-center" hover={false}>
                                <p className="text-sm font-bold faio-logo inline-block">FAIO AI</p>
                                <p className="text-xs text-secondary mt-0.5">v2.0 • AI-Powered Travel Companion</p>
                            </GlassCard>

                            {/* Sign Out */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={signOut}
                                className="w-full py-3.5 border border-red-500/20 bg-red-500/5 text-red-400 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Edit Profile Drawer ──────────────────────────────────── */}
            <AnimatePresence>
                {showEditDrawer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditDrawer(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[60] max-w-md mx-auto"
                        >
                            <div className="bg-surface border-t border-white/10 rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto">
                                {/* Drawer handle */}
                                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold">Edit Profile</h2>
                                    <button
                                        onClick={() => setShowEditDrawer(false)}
                                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Avatar preview */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-action to-purple-500 p-[2px]">
                                        <div className="w-full h-full rounded-[14px] overflow-hidden bg-surface flex items-center justify-center">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-white bg-gradient-to-br from-action to-purple-500 w-full h-full flex items-center justify-center">
                                                    {editName[0]?.toUpperCase() || '?'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Display Name */}
                                <div className="mb-4">
                                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5 block">Display Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-action/50 transition-colors"
                                        placeholder="Your display name"
                                    />
                                </div>

                                {/* Bio */}
                                <div className="mb-4">
                                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5 block">Bio</label>
                                    <textarea
                                        value={editBio}
                                        onChange={e => setEditBio(e.target.value)}
                                        rows={3}
                                        maxLength={160}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-action/50 transition-colors resize-none"
                                        placeholder="Tell travelers about yourself..."
                                    />
                                    <p className="text-[10px] text-secondary text-right mt-0.5">{editBio.length}/160</p>
                                </div>

                                {/* Travel Styles */}
                                <div className="mb-6">
                                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">Travel Styles</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TRAVEL_STYLE_OPTIONS.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => toggleStyle(style)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border",
                                                    editStyles.includes(style)
                                                        ? "bg-action/20 border-action/40 text-white"
                                                        : "bg-white/5 border-white/10 text-white/50 hover:text-white/70"
                                                )}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Save button */}
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={saveProfile}
                                    className="w-full py-3.5 bg-action hover:bg-action-hover rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-action/30 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
