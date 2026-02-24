import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Sparkles, ArrowRight,
    CloudSun, Navigation, TrendingUp,
    Leaf, ChevronRight, Thermometer, Droplets, Send, MessageCircle, Zap, Search, X,
    Clock, MapPin, Plane, Star, Users, Globe
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
                className="flex justify-between items-start"
            >
                <div>
                    <h1 className="text-3xl font-bold">
                        {greeting},
                        <br />
                        <span className="faio-logo">Traveler</span>
                    </h1>
                    <p className="text-secondary mt-1 text-sm">Ready for your next adventure?</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAITyping && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-action/10 rounded-full">
                            <div className="w-2 h-2 bg-action rounded-full animate-pulse" />
                            <span className="text-xs text-action font-medium">AI thinking...</span>
                        </div>
                    )}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-action to-purple-500 flex items-center justify-center ring-2 ring-white/10">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="User"
                            className="w-10 h-10 rounded-full"
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
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-action/10 to-purple-500/10 border border-action/20">
                        <Sparkles className="w-4 h-4 text-action flex-shrink-0" />
                        <p className="text-sm text-white/90">{aiTip}</p>
                    </div>
                </motion.div>

                {/* AI Search Card */}
                <motion.div variants={item}>
                    <GlassCard gradient="purple" glow className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-action to-purple-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Ask FAIO anything about travel..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && searchQuery.trim()) {
                                            await sendChatMessage(searchQuery);
                                            setSearchQuery('');
                                            onOpenChat?.();
                                        }
                                    }}
                                    className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/50 font-medium"
                                />
                                <p className="text-xs text-white/60 mt-0.5">Powered by FAIO AI ✨</p>
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
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <Send className="w-5 h-5 text-white/60" />
                            </button>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Book Your Travel */}
                <motion.div variants={item}>
                    <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Plane className="w-4 h-4 text-action" /> Book Travel
                    </h2>
                    <div className="grid grid-cols-4 gap-2.5">
                        {[
                            { label: 'Flights', color: 'from-sky-500 to-blue-600', emoji: '✈️', tab: 'flights' as TabType },
                            { label: 'Trains', color: 'from-orange-500 to-red-500', emoji: '🚆', tab: 'trains' as TabType },
                            { label: 'Buses', color: 'from-teal-500 to-cyan-600', emoji: '🚌', tab: 'buses' as TabType },
                            { label: 'Hotels', color: 'from-rose-500 to-pink-500', emoji: '🏨', tab: 'hotels' as TabType },
                        ].map((action, i) => (
                            <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
                                className="cursor-pointer" onClick={() => onNavigate?.(action.tab)}>
                                <div className={`aspect-square rounded-2xl bg-gradient-to-br ${action.color} flex flex-col items-center justify-center shadow-lg gap-1`}>
                                    <span className="text-2xl">{action.emoji}</span>
                                    <span className="text-[10px] font-bold text-white/90">{action.label}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Travel Tools - Scrollable */}
                <motion.div variants={item}>
                    <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" /> Travel Tools
                    </h2>
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
                        {[
                            { label: 'Plan Trip', color: 'from-blue-500 to-cyan-500', emoji: '🗓️', tab: 'planner' as TabType },
                            { label: 'Explore', color: 'from-emerald-500 to-teal-500', emoji: '🔮', tab: 'explore' as TabType },
                            { label: 'Cabs', color: 'from-amber-500 to-orange-500', emoji: '🚖', tab: 'cabs' as TabType },
                            { label: 'Visa Info', color: 'from-violet-500 to-purple-500', emoji: '🛂', tab: 'visa' as TabType },
                            { label: 'Packing', color: 'from-lime-500 to-green-500', emoji: '🎒', tab: 'packing' as TabType },
                            { label: 'Documents', color: 'from-cyan-500 to-blue-500', emoji: '📄', tab: 'documents' as TabType },
                            { label: 'Budget', color: 'from-indigo-500 to-blue-500', emoji: '💰', tab: 'wallet' as TabType },
                            { label: 'Safety', color: 'from-red-500 to-rose-500', emoji: '🛡️', tab: 'safety' as TabType },
                        ].map((action, i) => (
                            <motion.div key={i} whileTap={{ scale: 0.93 }}
                                className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0"
                                onClick={() => onNavigate?.(action.tab)}>
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                                    <span className="text-base">{action.emoji}</span>
                                </div>
                                <span className="text-[9px] font-medium text-secondary whitespace-nowrap">{action.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Trip Countdown / Active Trip */}
                {tripData ? (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold flex items-center gap-2">
                                <Plane className="w-4 h-4 text-action" />
                                {tripCountdown && tripCountdown.daysUntil > 0 ? 'Upcoming Trip' : 'Active Trip'}
                            </h2>
                            <button
                                className="text-action text-xs font-medium flex items-center gap-1"
                                onClick={() => onNavigate?.('planner')}
                            >
                                View details <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <GlassCard gradient="blue" glow className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="px-2 py-1 rounded-full bg-action/20 text-action text-[10px] font-bold uppercase tracking-wider">
                                        {tripCountdown && tripCountdown.daysUntil > 0 ? `${tripCountdown.daysUntil} days to go` : 'Active'}
                                    </span>
                                    <h3 className="text-2xl font-bold mt-2">{tripData.destination}</h3>
                                    <div className="flex items-center gap-2 text-secondary text-sm mt-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{tripData.startDate} — {tripData.endDate}</span>
                                    </div>
                                    {tripData.travelers && (
                                        <div className="flex items-center gap-1 text-secondary text-xs mt-1">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{tripData.travelers} traveler{tripData.travelers > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-secondary">Est. Cost</p>
                                    <p className="text-lg font-bold text-emerald-400">${tripData.totalCost.toFixed(0)}</p>
                                </div>
                            </div>

                            {/* Trip Stats */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center p-2 bg-white/5 rounded-xl">
                                    <Clock className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                                    <p className="font-bold text-sm">{tripData.itinerary.length}d</p>
                                    <p className="text-[9px] text-secondary">Duration</p>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-xl">
                                    <MapPin className="w-4 h-4 mx-auto text-action mb-1" />
                                    <p className="font-bold text-sm">{tripData.itinerary.reduce((s: number, d: any) => s + d.activities.length, 0)}</p>
                                    <p className="text-[9px] text-secondary">Activities</p>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-xl">
                                    <Star className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                                    <p className="font-bold text-sm">{tripData.sustainabilityScore}</p>
                                    <p className="text-[9px] text-secondary">Eco Score</p>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-xl">
                                    <Leaf className="w-4 h-4 mx-auto text-teal-400 mb-1" />
                                    <p className="font-bold text-sm">{tripData.carbonFootprint}kg</p>
                                    <p className="text-[9px] text-secondary">CO2</p>
                                </div>
                            </div>

                            {/* Today's First Activity */}
                            {tripData.itinerary[0]?.activities?.[0] && (
                                <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-full bg-action rounded-full" />
                                    <div className="flex-1">
                                        <p className="text-[10px] text-action font-bold uppercase">Next Up</p>
                                        <p className="font-bold text-sm">{tripData.itinerary[0].activities[0].title}</p>
                                        <p className="text-xs text-secondary">{tripData.itinerary[0].activities[0].time} · {tripData.itinerary[0].activities[0].duration}</p>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold">Start Planning</h2>
                        </div>
                        <GlassCard gradient="blue" className="p-5 cursor-pointer" onClick={() => onNavigate?.('planner')}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-action to-purple-500 flex items-center justify-center animate-float">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">Let AI plan your trip</h3>
                                    <p className="text-secondary text-sm">6 agents collaborate for the perfect itinerary</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-action" />
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Saved Trips Quick Access */}
                {savedTrips.length > 0 && !tripData && (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold flex items-center gap-2">
                                <Globe className="w-4 h-4 text-purple-400" />
                                Recent Trips
                            </h2>
                            <span className="text-xs text-secondary">{savedTrips.length} saved</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 no-scrollbar">
                            {savedTrips.slice(0, 5).map((trip, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="min-w-[160px] cursor-pointer"
                                    onClick={() => onNavigate?.('planner')}
                                >
                                    <GlassCard className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-action/10 flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-action" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm truncate max-w-[100px]">{trip.destination}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-secondary">
                                            <span>{trip.itinerary.length}d</span>
                                            <span>·</span>
                                            <span>${trip.totalCost.toFixed(0)}</span>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Real Weather Widget */}
                <motion.div variants={item}>
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between mb-3">
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
                                            className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-sm font-bold w-32 outline-none focus:border-action"
                                            placeholder="City..."
                                        />
                                        <button type="submit" className="p-1 hover:bg-white/10 rounded-full">
                                            <Search className="w-3 h-3 text-action" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingLocation(false)}
                                            className="p-1 hover:bg-white/10 rounded-full"
                                        >
                                            <X className="w-3 h-3 text-secondary" />
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
                                        <h3 className="font-bold text-sm">Weather in {currentCity}</h3>
                                        <Search className="w-3 h-3 text-secondary group-hover:text-white transition-colors" />
                                    </button>
                                )}
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">LIVE</span>
                            </div>
                        </div>

                        {weather ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{getWeatherEmoji(weather.icon)}</span>
                                        <div>
                                            <p className="text-3xl font-bold">{weather.temperature}°C</p>
                                            <p className="text-sm text-secondary capitalize">{weather.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-sm text-secondary">
                                            <Thermometer className="w-4 h-4" />
                                            <span>Feels {weather.feelsLike}°</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-secondary">
                                            <Droplets className="w-4 h-4" />
                                            <span>{weather.humidity}% humidity</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Forecast */}
                                {forecast.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                        {forecast.slice(0, 5).map((day, i) => (
                                            <div key={i} className="flex-shrink-0 text-center p-2 bg-surface/50 rounded-xl min-w-[56px]">
                                                <p className="text-[10px] text-secondary">{day.dayName}</p>
                                                <span className="text-lg">{getWeatherEmoji(day.icon)}</span>
                                                <p className="text-xs font-bold">{day.tempMax}°</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Weather Alert */}
                                {weatherAlert && (
                                    <div className={`mt-3 p-2 rounded-xl flex items-center gap-2 ${weatherAlert.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                                        weatherAlert.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        <CloudSun className="w-4 h-4" />
                                        <span className="text-xs">{weatherAlert.description}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-3 rounded-xl ${isRaining ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-surface/50'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CloudSun className={`w-4 h-4 ${isRaining ? 'text-blue-400' : 'text-secondary'}`} />
                                        <span className="text-xs text-secondary">Weather</span>
                                    </div>
                                    <p className={`font-bold ${isRaining ? 'text-blue-400' : 'text-white'}`}>
                                        {isRaining ? 'Rainy' : 'Clear'}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${isHighTraffic ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-surface/50'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Navigation className={`w-4 h-4 ${isHighTraffic ? 'text-amber-400' : 'text-secondary'}`} />
                                        <span className="text-xs text-secondary">Traffic</span>
                                    </div>
                                    <p className={`font-bold ${isHighTraffic ? 'text-amber-400' : 'text-white'}`}>
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
                        <h2 className="font-bold flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-action" />
                            FAIO AI
                        </h2>
                        <span className="text-xs text-secondary flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Powered by Groq
                        </span>
                    </div>
                    <GlassCard className="p-4" onClick={() => onOpenChat?.()}>
                        <div className="flex items-center gap-3 mb-4 cursor-pointer">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-action to-purple-500 flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">Chat with FAIO</h3>
                                <p className="text-xs text-secondary">Your personal AI travel companion</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-action" />
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
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-slate-700 rounded-full text-xs transition-colors"
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
                            <h2 className="font-bold flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                Your Stats
                            </h2>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <GlassCard className="p-3 text-center">
                                <Plane className="w-5 h-5 mx-auto text-action mb-1" />
                                <p className="text-lg font-bold">{savedTrips.length}</p>
                                <p className="text-[10px] text-secondary">Trips Planned</p>
                            </GlassCard>
                            <GlassCard className="p-3 text-center">
                                <Globe className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                                <p className="text-lg font-bold">{new Set(savedTrips.map(t => t.destination)).size}</p>
                                <p className="text-[10px] text-secondary">Destinations</p>
                            </GlassCard>
                            <GlassCard className="p-3 text-center">
                                <Leaf className="w-5 h-5 mx-auto text-teal-400 mb-1" />
                                <p className="text-lg font-bold">{Math.round(savedTrips.reduce((s, t) => s + (t.sustainabilityScore || 0), 0) / savedTrips.length)}</p>
                                <p className="text-[10px] text-secondary">Avg Eco</p>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}

                {/* Trending Destinations */}
                <motion.div variants={item}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold">Trending Now</h2>
                        <button className="text-sm text-secondary flex items-center gap-1">
                            See all <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 no-scrollbar snap-x">
                        {[
                            { name: 'Kyoto', country: 'Japan', image: 'from-red-500 to-orange-500', rating: '4.9', tag: 'Culture' },
                            { name: 'Santorini', country: 'Greece', image: 'from-blue-400 to-cyan-300', rating: '4.8', tag: 'Romance' },
                            { name: 'Bali', country: 'Indonesia', image: 'from-emerald-500 to-teal-500', rating: '4.7', tag: 'Wellness' },
                            { name: 'Reykjavik', country: 'Iceland', image: 'from-purple-500 to-indigo-500', rating: '4.8', tag: 'Adventure' },
                            { name: 'Marrakech', country: 'Morocco', image: 'from-amber-500 to-red-500', rating: '4.6', tag: 'Foodie' },
                        ].map((place, i) => (
                            <motion.div
                                key={i}
                                className="min-w-[180px] h-[220px] rounded-3xl relative overflow-hidden snap-center group cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                onClick={() => onNavigate?.('planner')}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${place.image} opacity-90 group-hover:scale-110 transition-transform duration-500`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                                {/* Tags */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <div className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-white" />
                                        <span className="text-[10px] text-white font-bold">AI Pick</span>
                                    </div>
                                    <div className="px-2 py-1 bg-black/30 backdrop-blur-md rounded-full">
                                        <span className="text-[10px] text-white font-bold">{place.tag}</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{place.name}</h3>
                                            <p className="text-white/80 text-sm">{place.country}</p>
                                        </div>
                                        <div className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg">
                                            <span className="text-xs font-bold text-white">⭐ {place.rating}</span>
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
