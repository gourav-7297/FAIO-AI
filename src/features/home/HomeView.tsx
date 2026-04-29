import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Sparkles, ArrowRight,
    CloudSun, Navigation, TrendingUp,
    Leaf, ChevronRight, Thermometer, Droplets, Send, MessageCircle, Zap, Search, X,
    Clock, MapPin, Plane, Star, Users, Globe, Shield, Backpack, FileText, Car, BookOpen
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAIAgents } from '../../context/AIAgentContext';
import { useEnvironment, getWeatherEmoji } from '../../context/EnvironmentContext';

type TabType = 'home' | 'explore' | 'planner' | 'wallet' | 'safety' | 'profile' | 'guides' | 'cabs' | 'hotels' | 'flights' | 'trains' | 'buses' | 'visa' | 'packing' | 'documents';

interface HomeViewProps {
    onNavigate?: (tab: TabType) => void;
    onOpenChat?: () => void;
}

// AI-generated contextual tips based on time + weather
function getAITip(hour: number, isRaining: boolean, tripData: any): string {
    if (tripData) {
        const start = new Date(tripData.startDate);
        const now = new Date();
        const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 7) return `🎒 ${daysUntil} days to go! Start packing for ${tripData.destination}`;
        if (daysUntil <= 0) return `✈️ You're in ${tripData.destination}! Check today's itinerary`;
    }
    if (isRaining) return '🌧️ Rainy day — perfect for museums & cafés!';
    if (hour < 9) return '🌅 Early bird! Best time to beat the crowds at popular spots';
    if (hour < 12) return '☀️ Great morning for outdoor exploration & walking tours';
    if (hour < 14) return '🍜 Lunch time! Try the local street food scene';
    if (hour < 17) return '📸 Golden hour approaching — camera ready!';
    if (hour < 20) return '🌆 Sunset views & rooftop bars await';
    return '🌙 Night markets & local nightlife — stay safe!';
}

export function HomeView({ onNavigate, onOpenChat }: HomeViewProps) {
    const [greeting, setGreeting] = useState('Good Morning');
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const { tripData, sendChatMessage, isAITyping, savedTrips } = useAIAgents();
    const { isRaining, isHighTraffic, weather, forecast, currentCity, setCity, weatherAlert } = useEnvironment();

    const [currentHour, setCurrentHour] = useState(new Date().getHours());

    useEffect(() => {
        const hour = new Date().getHours();
        setCurrentHour(hour);
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const aiTip = useMemo(() => getAITip(currentHour, isRaining, tripData), [currentHour, isRaining, tripData]);

    // Trip countdown
    const tripCountdown = useMemo(() => {
        if (!tripData) return null;
        const start = new Date(tripData.startDate);
        const now = new Date();
        const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { daysUntil, destination: tripData.destination };
    }, [tripData]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="p-5 pt-12 space-y-6 pb-32">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end mb-4"
            >
                <div>
                    <h1 className="text-4xl font-black text-stone-900 tracking-tight leading-none">
                        {greeting},
                        <br />
                        <span className="text-primary">Explorer</span>
                    </h1>
                    <p className="text-stone-400 mt-2 text-[10px] font-black uppercase tracking-[0.2em]">FAIO Intelligence System</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAITyping && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-full border border-stone-100">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <span className="text-[9px] text-stone-900 font-black uppercase tracking-widest">Processing</span>
                        </div>
                    )}
                    <div className="w-14 h-14 rounded-[20px] bg-white flex items-center justify-center border border-stone-100 overflow-hidden shadow-premium p-1">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
                            className="w-full h-full rounded-[16px] object-cover"
                        />
                    </div>
                </div>
            </motion.header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-5"
            >
                {/* AI Contextual Tip */}
                <motion.div variants={item}>
                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl" />
                        <div className="flex items-center gap-3 relative z-10">
                            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                            <p className="text-sm font-medium text-stone-700">{aiTip}</p>
                        </div>
                    </div>
                </motion.div>

                {/* AI Search Card */}
                <motion.div variants={item}>
                    <div className="p-1.5 bg-white rounded-[32px] border border-stone-100 shadow-premium flex items-center gap-4 group transition-all hover:border-stone-200">
                        <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center border border-stone-100 group-hover:bg-white transition-colors">
                            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Where to next?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        await sendChatMessage(searchQuery);
                                        setSearchQuery('');
                                        onOpenChat?.();
                                    }
                                }}
                                className="w-full bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-400 font-black text-sm uppercase tracking-widest"
                            />
                            <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest mt-0.5">Quantum Search Protocol</p>
                        </div>
                        <button
                            onClick={async () => {
                                if (searchQuery.trim()) {
                                    await sendChatMessage(searchQuery);
                                    setSearchQuery('');
                                    onOpenChat?.();
                                } else {
                                    onOpenChat?.();
                                }
                            }}
                            className="w-12 h-12 bg-stone-900 rounded-[20px] flex items-center justify-center transition-all hover:bg-stone-800 active:scale-95 shadow-lg mr-1"
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </motion.div>

                {/* Book Your Travel */}
                <motion.div variants={item}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                            <Zap className="w-3 h-3" /> Booking Hub
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Flights', color: 'from-sky-50 to-blue-50/20', iconColor: 'text-blue-500', emoji: '✈️', tab: 'flights' as TabType, desc: 'AERIAL VECTORS' },
                            { label: 'Hotels', color: 'from-rose-50 to-pink-50/20', iconColor: 'text-rose-500', emoji: '🏨', tab: 'hotels' as TabType, desc: 'STAY PROTOCOLS' },
                            { label: 'Trains', color: 'from-orange-50 to-amber-50/20', iconColor: 'text-orange-500', emoji: '🚆', tab: 'trains' as TabType, desc: 'RAIL NETWORKS' },
                            { label: 'Buses', color: 'from-emerald-50 to-teal-50/20', iconColor: 'text-teal-500', emoji: '🚌', tab: 'buses' as TabType, desc: 'TRANSIT LOOPS' },
                        ].map((action, i) => (
                            <motion.div key={i} whileTap={{ scale: 0.98 }}
                                className="cursor-pointer" onClick={() => onNavigate?.(action.tab)}>
                                <div className="p-6 rounded-[32px] bg-white border border-stone-100 shadow-premium flex flex-col gap-4 relative overflow-hidden group hover:border-stone-200 transition-all">
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.color} blur-2xl group-hover:scale-125 transition-transform`} />
                                    <div className={`w-14 h-14 rounded-2xl bg-white border border-stone-50 flex items-center justify-center text-3xl shadow-soft z-10`}>
                                        {action.emoji}
                                    </div>
                                    <div className="z-10">
                                        <span className="block text-sm font-black text-stone-900 uppercase tracking-wider">{action.label}</span>
                                        <span className="block text-[8px] font-black text-stone-400 uppercase tracking-widest mt-1.5">{action.desc}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Travel Ecosystem */}
                <motion.div variants={item}>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                            <Shield className="w-3 h-3 text-stone-400" /> Utility Ecosystem
                        </h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'VISA PORTAL', icon: <Globe className="w-5 h-5" />, tab: 'visa' as TabType, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                            { label: 'SAFE PASSAGE', icon: <Shield className="w-5 h-5" />, tab: 'safety' as TabType, color: 'text-rose-500', bg: 'bg-rose-50' },
                            { label: 'UNIT PREP', icon: <Backpack className="w-5 h-5" />, tab: 'packing' as TabType, color: 'text-teal-500', bg: 'bg-teal-50' },
                            { label: 'DATA VAULT', icon: <FileText className="w-5 h-5" />, tab: 'documents' as TabType, color: 'text-sky-500', bg: 'bg-sky-50' },
                            { label: 'GROUND OPS', icon: <Car className="w-5 h-5" />, tab: 'cabs' as TabType, color: 'text-amber-500', bg: 'bg-amber-50' },
                            { label: 'LOCAL KNOWLEDGE', icon: <BookOpen className="w-5 h-5" />, tab: 'guides' as TabType, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        ].map((opt, i) => (
                            <motion.button
                                key={i}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onNavigate?.(opt.tab)}
                                className="flex flex-col items-center gap-3 p-5 rounded-[28px] bg-white border border-stone-100 shadow-sm group hover:border-stone-200 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${opt.bg} flex items-center justify-center ${opt.color}`}>
                                    {opt.icon}
                                </div>
                                <span className="text-[9px] font-black text-stone-900 text-center leading-none uppercase tracking-widest">{opt.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Trip Countdown / Active Trip */}
                {tripData ? (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-stone-800 flex items-center gap-2">
                                <Plane className="w-4 h-4 text-primary" />
                                {tripCountdown && tripCountdown.daysUntil > 0 ? 'Upcoming Trip' : 'Active Trip'}
                            </h2>
                            <button
                                className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                                onClick={() => onNavigate?.('planner')}
                            >
                                View details <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <GlassCard className="p-5 border border-stone-100 bg-white" glow>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                        {tripCountdown && tripCountdown.daysUntil > 0 ? `${tripCountdown.daysUntil} days to go` : 'Active'}
                                    </span>
                                    <h3 className="text-2xl font-black text-stone-900 mt-2">{tripData.destination}</h3>
                                    <div className="flex items-center gap-2 text-stone-500 font-medium text-sm mt-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{tripData.startDate} — {tripData.endDate}</span>
                                    </div>
                                    {tripData.travelers && (
                                        <div className="flex items-center gap-1 text-stone-500 font-medium text-xs mt-1">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{tripData.travelers} traveler{tripData.travelers > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Est. Cost</p>
                                    <p className="text-xl font-black text-emerald-600">${tripData.totalCost.toFixed(0)}</p>
                                </div>
                            </div>

                            {/* Trip Stats */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center p-2.5 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <Clock className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                                    <p className="font-bold text-sm text-stone-900">{tripData.itinerary.length}d</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">Duration</p>
                                </div>
                                <div className="text-center p-2.5 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <MapPin className="w-4 h-4 mx-auto text-primary mb-1" />
                                    <p className="font-bold text-sm text-stone-900">{tripData.itinerary.reduce((s: number, d: any) => s + d.activities.length, 0)}</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">Activities</p>
                                </div>
                                <div className="text-center p-2.5 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <Star className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                                    <p className="font-bold text-sm text-stone-900">{tripData.sustainabilityScore}</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">Eco Score</p>
                                </div>
                                <div className="text-center p-2.5 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <Leaf className="w-4 h-4 mx-auto text-teal-500 mb-1" />
                                    <p className="font-bold text-sm text-stone-900">{tripData.carbonFootprint}kg</p>
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">CO2</p>
                                </div>
                            </div>

                            {/* Today's First Activity */}
                            {tripData.itinerary[0]?.activities?.[0] && (
                                <div className="mt-4 p-3.5 bg-white border border-stone-100 rounded-xl flex items-center gap-3 shadow-sm">
                                    <div className="w-1.5 h-10 bg-primary rounded-full" />
                                    <div className="flex-1">
                                        <p className="text-[10px] text-stone-600 font-medium uppercase tracking-[0.2em] mb-4">Financial Pulse</p>
                                        <p className="font-bold text-sm text-stone-900">{tripData.itinerary[0].activities[0].title}</p>
                                        <p className="text-xs font-medium text-stone-500">{tripData.itinerary[0].activities[0].time} · {tripData.itinerary[0].activities[0].duration}</p>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-stone-800">Start Planning</h2>
                        </div>
                        <GlassCard className="p-5 cursor-pointer bg-gradient-to-br from-rose-50 to-orange-50 border-rose-100" onClick={() => onNavigate?.('planner')}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center animate-float shadow-lg shadow-primary/30">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-stone-900">Let AI plan your trip</h3>
                                    <p className="text-stone-600 font-medium text-sm">6 agents collaborate for the perfect itinerary</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-primary" />
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Saved Trips Quick Access */}
                {savedTrips.length > 0 && !tripData && (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-stone-800 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-purple-500" />
                                Recent Trips
                            </h2>
                            <span className="text-xs font-medium text-stone-500">{savedTrips.length} saved</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 no-scrollbar">
                            {savedTrips.slice(0, 5).map((trip, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="min-w-[160px] cursor-pointer"
                                    onClick={() => onNavigate?.('planner')}
                                >
                                    <GlassCard className="p-4 bg-white border-stone-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-stone-900 truncate max-w-[100px]">{trip.destination}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-stone-500">
                                            <span>{trip.itinerary.length}d</span>
                                            <span>·</span>
                                            <span className="text-emerald-600">${trip.totalCost.toFixed(0)}</span>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Real Weather Widget */}
                <motion.div variants={item}>
                    <GlassCard className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {isEditingLocation ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (locationInput.trim()) {
                                                setCity(locationInput);
                                                setIsEditingLocation(false);
                                            }
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={locationInput}
                                            onChange={(e) => setLocationInput(e.target.value)}
                                            onBlur={() => {
                                                setTimeout(() => setIsEditingLocation(false), 200);
                                            }}
                                            className="bg-stone-100 border border-stone-200 rounded-full px-3 py-1 text-sm font-bold w-32 outline-none focus:border-primary text-stone-900"
                                            placeholder="City..."
                                        />
                                        <button type="submit" className="p-1 hover:bg-stone-100 rounded-full transition-colors">
                                            <Search className="w-4 h-4 text-primary" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingLocation(false)}
                                            className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4 text-stone-400" />
                                        </button>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setLocationInput(currentCity);
                                            setIsEditingLocation(true);
                                        }}
                                        className="flex items-center gap-2 group"
                                    >
                                        <h3 className="font-bold text-sm text-stone-900">Weather in {currentCity}</h3>
                                        <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-primary transition-colors" />
                                    </button>
                                )}
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black tracking-wider uppercase rounded-full">LIVE</span>
                            </div>
                        </div>

                        {weather ? (
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-5xl drop-shadow-sm">{getWeatherEmoji(weather.icon)}</span>
                                        <div>
                                            <p className="text-3xl font-black text-stone-900">{weather.temperature}°C</p>
                                            <p className="text-sm font-bold text-stone-500 capitalize">{weather.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
                                            <Thermometer className="w-4 h-4 text-rose-400" />
                                            <span>Feels {weather.feelsLike}°</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-stone-500 mt-1">
                                            <Droplets className="w-4 h-4 text-blue-400" />
                                            <span>{weather.humidity}% hum</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Forecast */}
                                {forecast.length > 0 && (
                                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                                        {forecast.slice(0, 5).map((day, i) => (
                                            <div key={i} className="flex-shrink-0 text-center p-2.5 bg-stone-50 border border-stone-100 rounded-2xl min-w-[60px]">
                                                <p className="text-[10px] font-bold text-stone-400 uppercase">{day.dayName}</p>
                                                <span className="text-2xl block my-1">{getWeatherEmoji(day.icon)}</span>
                                                <p className="text-sm font-black text-stone-800">{day.tempMax}°</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Weather Alert */}
                                {weatherAlert && (
                                    <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${weatherAlert.severity === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                                        weatherAlert.severity === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                            'bg-blue-50 text-blue-700 border border-blue-100'
                                        }`}>
                                        <CloudSun className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm font-bold">{weatherAlert.description}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-4 rounded-2xl border ${isRaining ? 'bg-blue-50 border-blue-100' : 'bg-stone-50 border-stone-100'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CloudSun className={`w-5 h-5 ${isRaining ? 'text-blue-500' : 'text-stone-400'}`} />
                                        <span className="text-xs font-bold text-stone-500">Weather</span>
                                    </div>
                                    <p className={`font-black text-lg ${isRaining ? 'text-blue-700' : 'text-stone-900'}`}>
                                        {isRaining ? 'Rainy' : 'Clear'}
                                    </p>
                                </div>
                                <div className={`p-4 rounded-2xl border ${isHighTraffic ? 'bg-amber-50 border-amber-100' : 'bg-stone-50 border-stone-100'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Navigation className={`w-5 h-5 ${isHighTraffic ? 'text-amber-500' : 'text-stone-400'}`} />
                                        <span className="text-xs font-bold text-stone-500">Traffic</span>
                                    </div>
                                    <p className={`font-black text-lg ${isHighTraffic ? 'text-amber-700' : 'text-stone-900'}`}>
                                        {isHighTraffic ? 'Heavy' : 'Light'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>

                {/* FAIO AI Assistant */}
                <motion.div variants={item}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-stone-800 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            FAIO AI
                        </h2>
                        <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1 uppercase tracking-wider">
                            <Zap className="w-3 h-3 text-amber-500" /> Powered by Groq
                        </span>
                    </div>
                    <GlassCard className="p-5" onClick={() => onOpenChat?.()}>
                        <div className="flex items-center gap-4 mb-5 cursor-pointer">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-stone-900 text-lg">Chat with FAIO</h3>
                                <p className="text-sm font-medium text-stone-500">Your personal AI travel companion</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-stone-400" />
                        </div>

                        {/* Quick Prompt Chips */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: '🗺️ Plan a trip', query: 'Help me plan a trip' },
                                { label: '🍜 Find restaurants', query: 'Find best local restaurants' },
                                { label: '🛡️ Safety tips', query: 'What safety tips should I know?' },
                                { label: '💰 Budget advice', query: 'Budget travel tips' },
                                { label: '🌿 Eco travel', query: 'Eco-friendly travel tips' },
                                { label: '📸 Photo spots', query: 'Best photography locations nearby' },
                            ].map((chip, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await sendChatMessage(chip.query);
                                        onOpenChat?.();
                                    }}
                                    className="px-3.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-full text-xs font-bold text-stone-600 transition-colors"
                                >
                                    {chip.label}
                                </motion.button>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Quick Stats (when trip exists) */}
                {savedTrips.length > 0 && (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold text-stone-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Your Stats
                            </h2>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <GlassCard className="p-4 text-center border-stone-100 bg-white">
                                <Plane className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                                <p className="text-xl font-black text-stone-900">{savedTrips.length}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Trips Planned</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center border-stone-100 bg-white">
                                <Globe className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                                <p className="text-xl font-black text-stone-900">{new Set(savedTrips.map(t => t.destination)).size}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Destinations</p>
                            </GlassCard>
                            <GlassCard className="p-4 text-center border-stone-100 bg-white">
                                <Leaf className="w-6 h-6 mx-auto text-teal-500 mb-2" />
                                <p className="text-xl font-black text-stone-900">{Math.round(savedTrips.reduce((s, t) => s + (t.sustainabilityScore || 0), 0) / savedTrips.length)}</p>
                                <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Avg Eco</p>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}

                {/* Trending Destinations */}
                <motion.div variants={item}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-stone-800">Trending Now</h2>
                        <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            See all <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-4 -mx-5 px-5 no-scrollbar snap-x">
                        {[
                            { name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop', rating: '4.9', tag: 'Culture' },
                            { name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=400&auto=format&fit=crop', rating: '4.8', tag: 'Romance' },
                            { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=400&auto=format&fit=crop', rating: '4.7', tag: 'Wellness' },
                            { name: 'Reykjavik', country: 'Iceland', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=400&auto=format&fit=crop', rating: '4.8', tag: 'Adventure' },
                        ].map((place, i) => (
                            <motion.div
                                key={i}
                                className="min-w-[240px] h-[320px] rounded-[40px] relative overflow-hidden snap-center group cursor-pointer shadow-premium border border-stone-100"
                                whileHover={{ scale: 1.02 }}
                                onClick={() => onNavigate?.('planner')}
                            >
                                <img src={place.image} alt={place.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />

                                {/* Tags */}
                                <div className="absolute top-6 left-6 flex gap-2">
                                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-2xl flex items-center gap-1.5 shadow-soft">
                                        <Sparkles className="w-3 h-3 text-primary" />
                                        <span className="text-[9px] text-stone-900 font-black uppercase tracking-wider">AI RECOMMEND</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black text-white leading-tight">{place.name}</h3>
                                            <p className="text-white/80 font-black text-[10px] uppercase tracking-widest mt-1">{place.country}</p>
                                        </div>
                                        <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white font-black text-xs">
                                            {place.rating}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
