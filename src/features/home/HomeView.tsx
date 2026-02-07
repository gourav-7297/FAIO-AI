import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Map, Calendar, Sparkles, ArrowRight,
    CloudSun, Navigation, TrendingUp, Shield,
    Compass, Leaf, Wallet, ChevronRight, Thermometer, Droplets, Send, MessageCircle, Zap, Search, X, Car
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAIAgents } from '../../context/AIAgentContext';
import { useEnvironment, getWeatherEmoji } from '../../context/EnvironmentContext';

type TabType = 'home' | 'explore' | 'planner' | 'wallet' | 'safety' | 'profile' | 'guides' | 'cabs';

interface HomeViewProps {
    onNavigate?: (tab: TabType) => void;
    onOpenChat?: () => void;
}

export function HomeView({ onNavigate, onOpenChat }: HomeViewProps) {
    const [greeting, setGreeting] = useState('Good Morning');
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const { tripData, sendChatMessage, isAITyping } = useAIAgents();
    const { isRaining, isHighTraffic, weather, forecast, currentCity, setCity, weatherAlert } = useEnvironment();

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

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
                    {/* AI Status Indicator */}
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
                                <p className="text-xs text-white/60 mt-0.5">Powered by Gemini AI ✨</p>
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

                {/* Quick Actions Grid */}
                <motion.div variants={item} className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Map, label: 'Plan Trip', color: 'from-blue-500 to-cyan-500', emoji: '🗓️', tab: 'planner' as TabType },
                        { icon: Compass, label: 'Explore', color: 'from-emerald-500 to-teal-500', emoji: '🔮', tab: 'explore' as TabType },
                        { icon: Navigation, label: 'Guides', color: 'from-purple-500 to-pink-500', emoji: '🧑‍🏫', tab: 'guides' as TabType },
                        { icon: Car, label: 'Cabs', color: 'from-amber-500 to-orange-500', emoji: '🚖', tab: 'cabs' as TabType },
                        { icon: Wallet, label: 'Budget', color: 'from-indigo-500 to-blue-500', emoji: '💰', tab: 'wallet' as TabType },
                        { icon: Shield, label: 'Safety', color: 'from-red-500 to-rose-500', emoji: '🛡️', tab: 'safety' as TabType },
                    ].map((action, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center gap-2 cursor-pointer"
                            onClick={() => onNavigate?.(action.tab)}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                                <span className="text-xl">{action.emoji}</span>
                            </div>
                            <span className="text-xs font-medium text-secondary">{action.label}</span>
                        </motion.div>
                    ))}
                </motion.div>

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
                                                // Small delay to allow form submit
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
                                        {forecast.slice(0, 4).map((day, i) => (
                                            <div key={i} className="flex-shrink-0 text-center p-2 bg-surface/50 rounded-xl min-w-[60px]">
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
                            <Zap className="w-3 h-3" /> Powered by Gemini
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

                {/* Current/Upcoming Trip */}
                {tripData ? (
                    <motion.div variants={item}>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-bold">Current Trip</h2>
                            <button className="text-action text-xs font-medium flex items-center gap-1">
                                View details <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <GlassCard gradient="blue" glow className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="px-2 py-1 rounded-full bg-action/20 text-action text-[10px] font-bold uppercase tracking-wider">
                                        Active
                                    </span>
                                    <h3 className="text-2xl font-bold mt-2">{tripData.destination}</h3>
                                    <div className="flex items-center gap-2 text-secondary text-sm mt-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{tripData.startDate} - {tripData.endDate}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-secondary">Est. Cost</p>
                                    <p className="text-lg font-bold text-emerald-400">${tripData.totalCost.toFixed(0)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-2 bg-white/5 rounded-xl">
                                    <TrendingUp className="w-4 h-4 mx-auto text-action mb-1" />
                                    <p className="text-[10px] text-secondary">Days</p>
                                    <p className="font-bold text-sm">{tripData.itinerary.length}</p>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-xl">
                                    <Shield className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                                    <p className="text-[10px] text-secondary">Safety</p>
                                    <p className="font-bold text-sm">{tripData.safetyScore}/10</p>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded-xl">
                                    <Leaf className="w-4 h-4 mx-auto text-teal-400 mb-1" />
                                    <p className="text-[10px] text-secondary">CO2</p>
                                    <p className="font-bold text-sm">{tripData.carbonFootprint}kg</p>
                                </div>
                            </div>
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
                            { name: 'Kyoto', country: 'Japan', image: 'from-red-500 to-orange-500', rating: '4.9' },
                            { name: 'Santorini', country: 'Greece', image: 'from-blue-400 to-cyan-300', rating: '4.8' },
                            { name: 'Bali', country: 'Indonesia', image: 'from-emerald-500 to-teal-500', rating: '4.7' },
                            { name: 'Reykjavik', country: 'Iceland', image: 'from-purple-500 to-indigo-500', rating: '4.8' },
                        ].map((place, i) => (
                            <motion.div
                                key={i}
                                className="min-w-[180px] h-[220px] rounded-3xl relative overflow-hidden snap-center group cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${place.image} opacity-90 group-hover:scale-110 transition-transform duration-500`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                                {/* AI Badge */}
                                <div className="absolute top-3 left-3">
                                    <div className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-white" />
                                        <span className="text-[10px] text-white font-bold">AI Pick</span>
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
