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
                isOn ? "bg-emerald-500" : "bg-stone-200"
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
        <div className="min-h-screen pb-32 relative bg-stone-50">
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
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700 p-[3px] shadow-xl shadow-stone-900/20">
                                <div className="w-full h-full rounded-[13px] overflow-hidden bg-white flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-white bg-gradient-to-br from-stone-900 to-stone-700 w-full h-full flex items-center justify-center">
                                            {displayName[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-[3px] border-stone-50" />
                        </motion.div>

                        {/* Name + meta */}
                        <div className="flex-1 pb-1 min-w-0">
                            <motion.h1
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-black text-white tracking-tight truncate"
                            >
                                {displayName}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xs font-black text-white/60 uppercase tracking-widest truncate"
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
                        className="text-sm font-black text-stone-500 mt-4 leading-relaxed tracking-tight"
                    >
                        {bio}
                    </motion.p>

                    {/* Travel styles */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="flex flex-wrap gap-2 mt-4"
                    >
                        {travelStyles.map(style => (
                            <span key={style} className="px-3 py-1 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                {style}
                            </span>
                        ))}
                        <span className="px-3 py-1 bg-white border border-stone-100 rounded-xl text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> EST. {memberSince}
                        </span>
                    </motion.div>

                    {/* Quick stats strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-3 gap-3 mt-6"
                    >
                        {[
                            { value: stats.tripsPlanned, label: 'Trips', icon: Plane, color: 'text-primary' },
                            { value: stats.countriesVisited, label: 'Lands', icon: Globe, color: 'text-purple-500' },
                            { value: stats.ecoScore, label: 'Eco', icon: Leaf, color: 'text-emerald-500', suffix: '%' },
                        ].map((s, i) => (
                            <div key={i} className="text-center py-4 bg-white border border-stone-100 rounded-3xl shadow-soft">
                                <s.icon className={cn("w-4 h-4 mx-auto mb-2", s.color)} />
                                <p className="text-xl font-black text-stone-900 leading-none">
                                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                                </p>
                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em] mt-1.5">{s.label}</p>
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
                <div className="p-6 bg-white border border-stone-100 rounded-[2.5rem] shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <Award className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <span className="font-black text-sm text-stone-900 tracking-tight uppercase">Explorer Level 5</span>
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">280 XP to Level 6</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-stone-900 tracking-widest bg-stone-100 px-3 py-1 rounded-full">720 / 1000 XP</span>
                    </div>
                    <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '72%' }}
                            transition={{ delay: 0.9, duration: 1, ease: 'easeOut' }}
                            className="h-full bg-stone-900 rounded-full relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Tab Navigation */}
            <div className="px-5 mt-8">
                <div className="flex gap-2 p-1.5 bg-white border border-stone-100 rounded-[2rem] shadow-soft">
                    {[
                        { id: 'overview' as const, label: 'CORE', icon: TrendingUp },
                        { id: 'achievements' as const, label: 'BADGES', icon: Award },
                        { id: 'activity' as const, label: 'RECORDS', icon: Clock },
                        { id: 'settings' as const, label: 'CONFIG', icon: Settings },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all text-[9px] font-black uppercase tracking-widest",
                                activeTab === tab.id
                                    ? "bg-stone-900 text-white shadow-lg"
                                    : "text-stone-400 hover:text-stone-900"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
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
                                        <div className="p-4 bg-white border border-stone-100 rounded-[2rem] shadow-soft text-center">
                                            <div className={cn("w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center", stat.bg)}>
                                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                                            </div>
                                            <p className="text-xl font-black text-stone-900 leading-none">
                                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                            </p>
                                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-2">{stat.label}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Saved Trips */}
                            <div>
                                <h3 className="font-black text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Bookmark className="w-4 h-4 text-stone-900" />
                                    Saved Trips
                                </h3>
                                {savedTrips.length === 0 ? (
                                    <div className="p-8 text-center bg-white border border-stone-100 rounded-[2.5rem] shadow-soft">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-stone-50 flex items-center justify-center">
                                            <Compass className="w-8 h-8 text-stone-200" />
                                        </div>
                                        <p className="text-sm font-black text-stone-900 uppercase tracking-tight">No saved trips yet</p>
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Plan your first trip to see it here!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {savedTrips.slice(0, 4).map((trip, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <div className="p-4 bg-white border border-stone-100 rounded-[2rem] shadow-soft flex items-center gap-4 group hover:border-stone-900 transition-all">
                                                    <div className="w-12 h-12 rounded-[1.25rem] bg-stone-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <MapPin className="w-6 h-6 text-stone-900" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-sm text-stone-900 uppercase tracking-tight truncate">{trip.destination || 'Trip'}</p>
                                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">{trip.duration || '—'}</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors flex-shrink-0" />
                                                </div>
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
                            <div className="p-6 bg-white border border-stone-100 rounded-[2.5rem] shadow-soft flex items-center justify-between overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                <div className="relative z-10">
                                     <div className="flex items-center gap-3 mb-2">
                                         <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                             <Sparkles className="w-6 h-6 text-amber-500" />
                                         </div>
                                         <div className="flex items-baseline gap-1">
                                             <span className="font-black text-2xl text-stone-900">{ACHIEVEMENTS.filter(a => a.earned).length}</span>
                                             <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">/ {ACHIEVEMENTS.length} BADGES</span>
                                         </div>
                                     </div>
                                     <div className="h-1.5 w-32 bg-stone-100 rounded-full overflow-hidden">
                                         <motion.div
                                             initial={{ width: 0 }}
                                             animate={{ width: `${(ACHIEVEMENTS.filter(a => a.earned).length / ACHIEVEMENTS.length) * 100}%` }}
                                             transition={{ delay: 0.3, duration: 0.8 }}
                                             className="h-full bg-amber-500 rounded-full"
                                         />
                                     </div>
                                </div>
                                <div className="flex -space-x-2 relative z-10">
                                    {ACHIEVEMENTS.filter(a => a.earned).slice(0, 4).map(a => (
                                        <div key={a.id} className="w-10 h-10 rounded-full bg-white border-2 border-stone-50 flex items-center justify-center shadow-sm text-xl">
                                            {a.icon}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Badge Grid */}
                            <div className="grid grid-cols-3 gap-2.5">
                                {ACHIEVEMENTS.map((achievement, i) => (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div
                                            className={cn(
                                                "p-4 bg-white border border-stone-100 rounded-[2rem] shadow-soft text-center relative overflow-hidden group",
                                                !achievement.earned && "opacity-40"
                                            )}
                                        >
                                            {achievement.earned && (
                                                <div className="absolute top-2 right-2">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className={cn(
                                                "text-3xl mb-3 transition-transform group-hover:scale-110",
                                                !achievement.earned && "grayscale"
                                            )}>
                                                {achievement.icon}
                                            </div>
                                            <p className="text-[10px] font-black text-stone-900 uppercase tracking-tight leading-tight mb-1">{achievement.title}</p>
                                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest leading-tight">{achievement.description}</p>
                                            {!achievement.earned && (
                                                <div className="mt-3">
                                                    <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-stone-900 rounded-full"
                                                            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest mt-1">{achievement.progress}/{achievement.total}</p>
                                                </div>
                                            )}
                                        </div>
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
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                                        <Hash className="w-3.5 h-3.5 text-stone-900" /> Recent Activity
                                    </p>
                                    {savedTrips.slice(0, 5).map((trip, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                        >
                                            <div className="p-4 bg-white border border-stone-100 rounded-[2rem] shadow-soft flex items-start gap-4 group">
                                                <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                                    <Plane className="w-5 h-5 text-stone-900" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-stone-900 uppercase tracking-tight truncate">
                                                        Planned trip to {trip.destination || 'Unknown'}
                                                    </p>
                                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">
                                                        {trip.duration || '—'} • {trip.budget ? `₹${trip.budget}` : 'No budget set'}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Heart className="w-3.5 h-3.5 text-pink-500" /> Saved
                                                        </span>
                                                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Star className="w-3.5 h-3.5 text-amber-500" /> {trip.styles?.length || 0} styles
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </>
                            ) : (
                                <div className="p-10 text-center bg-white border border-stone-100 rounded-[2.5rem] shadow-soft">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-stone-50 flex items-center justify-center">
                                            <Zap className="w-10 h-10 text-stone-200" />
                                        </div>
                                        <p className="font-black text-sm text-stone-900 uppercase tracking-tight">No activity yet</p>
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-2">
                                            Start planning trips to see your activity here!
                                        </p>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ──── SETTINGS TAB ──────────────────────────────── */}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            {SETTING_SECTIONS.map((section, si) => (
                                <motion.div
                                    key={si}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: si * 0.1 }}
                                >
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 px-2">
                                        {section.title}
                                    </p>
                                    <div className="space-y-2">
                                        {section.items.map((item, ii) => (
                                            <div key={ii} className="p-4 bg-white border border-stone-100 rounded-3xl shadow-soft flex items-center gap-4 group hover:border-stone-900 transition-all">
                                                <div className="w-11 h-11 rounded-2xl bg-stone-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    <item.icon className="w-5 h-5 text-stone-900" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-sm text-stone-900 uppercase tracking-tight">{item.label}</p>
                                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-0.5">{item.sublabel}</p>
                                                </div>
                                                {item.toggle ? (
                                                    <ToggleSwitch defaultOn={item.defaultOn} />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}

                            {/* About */}
                            <div className="p-8 text-center bg-white border border-stone-100 rounded-[2.5rem] shadow-soft">
                                <p className="text-xl font-black text-stone-900 tracking-tighter">FAIO AI <span className="text-emerald-500">v2.1</span></p>
                                <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mt-1.5">NEURAL ENGINE ACTIVE</p>
                            </div>

                            {/* Sign Out */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={signOut}
                                className="w-full py-5 bg-red-50 border border-red-100 text-red-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                            >
                                <LogOut className="w-4 h-4" />
                                Terminate Session
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
                            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60]"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[60] max-w-md mx-auto"
                        >
                            <div className="bg-white border-t border-stone-100 rounded-t-[3rem] p-8 pb-12 max-h-[90vh] overflow-y-auto shadow-2xl">
                                {/* Drawer handle */}
                                <div className="w-12 h-1.5 bg-stone-100 rounded-full mx-auto mb-8" />

                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">Edit Profile</h2>
                                    <button
                                        onClick={() => setShowEditDrawer(false)}
                                        className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center hover:bg-stone-100 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-stone-900" />
                                    </button>
                                </div>

                                {/* Avatar preview */}
                                <div className="flex justify-center mb-8">
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-700 p-[3px] shadow-xl shadow-stone-900/20">
                                        <div className="w-full h-full rounded-[21px] overflow-hidden bg-white flex items-center justify-center">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-black text-white bg-gradient-to-br from-stone-900 to-stone-700 w-full h-full flex items-center justify-center">
                                                    {editName[0]?.toUpperCase() || '?'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Display Name */}
                                <div className="mb-6">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">Display Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-sm font-black text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                                        placeholder="Your display name"
                                    />
                                </div>

                                {/* Bio */}
                                <div className="mb-6">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">Bio</label>
                                    <textarea
                                        value={editBio}
                                        onChange={e => setEditBio(e.target.value)}
                                        rows={3}
                                        maxLength={160}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-sm font-black text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors resize-none"
                                        placeholder="Tell travelers about yourself..."
                                    />
                                    <p className="text-[9px] font-black text-stone-300 text-right mt-1.5">{editBio.length}/160</p>
                                </div>

                                {/* Travel Styles */}
                                <div className="mb-10">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 block">Travel Styles</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TRAVEL_STYLE_OPTIONS.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => toggleStyle(style)}
                                                className={cn(
                                                    "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                    editStyles.includes(style)
                                                        ? "bg-stone-900 border-stone-900 text-white shadow-lg"
                                                        : "bg-stone-50 border-stone-100 text-stone-400 hover:text-stone-900"
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
                                    className="w-full py-5 bg-stone-900 hover:bg-stone-800 rounded-[2rem] font-black text-xs text-white uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-stone-900/20 transition-all"
                                >
                                    <Save className="w-5 h-5" />
                                    Commit Changes
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
