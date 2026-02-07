import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, MapPin, Sparkles, Navigation, CloudRain,
    Package2, SquareCheck, X, Clock, Leaf, DollarSign,
    ChevronDown, Star, AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEnvironment } from '../../context/EnvironmentContext';
import { useAIAgents, AGENTS, type AgentType } from '../../context/AIAgentContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { AgentMessage } from '../../components/ui/AgentAvatar';

type Step = 'destination' | 'dates' | 'budget' | 'style' | 'generating' | 'result';

interface TripData {
    destination: string;
    dates: { start: string; end: string };
    budget: 1 | 2 | 3 | 4;
    styles: string[];
}

export function PlannerView() {
    const [step, setStep] = useState<Step>('destination');
    const [data, setData] = useState<TripData>({
        destination: '',
        dates: { start: '', end: '' },
        budget: 2,
        styles: [],
    });
    const { generateTrip, agentMessages, tripData } = useAIAgents();

    const nextStep = async () => {
        if (step === 'destination') setStep('dates');
        else if (step === 'dates') setStep('budget');
        else if (step === 'budget') setStep('style');
        else if (step === 'style') {
            setStep('generating');
            const budgetAmounts = { 1: 500, 2: 1000, 3: 2000, 4: 5000 };
            await generateTrip(
                data.destination,
                data.dates,
                budgetAmounts[data.budget],
                data.styles
            );
            setStep('result');
        }
    };

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <AnimatePresence mode="wait">
                {step !== 'result' && step !== 'generating' && (
                    <motion.div
                        key="header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-action" />
                            <span className="text-xs text-action font-bold uppercase tracking-wider">AI Experience Builder</span>
                        </div>
                        <h2 className="text-3xl font-bold">
                            {step === 'destination' && "Where to?"}
                            {step === 'dates' && "When works?"}
                            {step === 'budget' && "What's the budget?"}
                            {step === 'style' && "Your travel vibe?"}
                        </h2>
                        <div className="flex gap-2 mt-4">
                            {['destination', 'dates', 'budget', 'style'].map((s, i) => (
                                <div
                                    key={s}
                                    className={cn(
                                        "h-1.5 flex-1 rounded-full transition-all duration-500",
                                        ['destination', 'dates', 'budget', 'style'].indexOf(step) >= i
                                            ? "bg-gradient-to-r from-action to-purple-500"
                                            : "bg-slate-800"
                                    )}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative">
                <AnimatePresence mode="wait">
                    {step === 'destination' && (
                        <motion.div
                            key="step1"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="space-y-6"
                        >
                            <GlassCard className="p-1">
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-action w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="e.g., Tokyo, Japan"
                                        className="w-full bg-transparent rounded-xl py-4 pl-12 pr-4 text-lg focus:outline-none placeholder:text-slate-600"
                                        value={data.destination}
                                        onChange={(e) => setData({ ...data, destination: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                            </GlassCard>

                            <div className="space-y-3">
                                <p className="text-xs text-secondary uppercase tracking-wider font-bold">AI Recommended</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { city: 'Tokyo', country: 'Japan', emoji: '🗼' },
                                        { city: 'Bali', country: 'Indonesia', emoji: '🏝️' },
                                        { city: 'Paris', country: 'France', emoji: '🗼' },
                                        { city: 'Reykjavik', country: 'Iceland', emoji: '🌋' },
                                    ].map(place => (
                                        <motion.button
                                            key={place.city}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setData({ ...data, destination: `${place.city}, ${place.country}` })}
                                            className={cn(
                                                "p-4 rounded-xl border text-left transition-all",
                                                data.destination.includes(place.city)
                                                    ? "bg-action/10 border-action"
                                                    : "bg-surface/50 border-slate-800 hover:border-slate-600"
                                            )}
                                        >
                                            <span className="text-2xl mb-2 block">{place.emoji}</span>
                                            <p className="font-bold">{place.city}</p>
                                            <p className="text-xs text-secondary">{place.country}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'dates' && (
                        <motion.div
                            key="step2"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="space-y-4"
                        >
                            <GlassCard className="p-4">
                                <label className="text-sm text-secondary block mb-2">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-transparent text-white text-lg focus:outline-none [color-scheme:dark]"
                                    value={data.dates.start}
                                    onChange={(e) => setData({ ...data, dates: { ...data.dates, start: e.target.value } })}
                                />
                            </GlassCard>
                            <GlassCard className="p-4">
                                <label className="text-sm text-secondary block mb-2">End Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-transparent text-white text-lg focus:outline-none [color-scheme:dark]"
                                    value={data.dates.end}
                                    onChange={(e) => setData({ ...data, dates: { ...data.dates, end: e.target.value } })}
                                />
                            </GlassCard>

                            {/* Quick Duration Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {['3 days', '5 days', '1 week', '2 weeks'].map(duration => (
                                    <button
                                        key={duration}
                                        className="px-4 py-2 bg-surface/50 border border-slate-800 rounded-full text-sm hover:border-action transition-colors"
                                    >
                                        {duration}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'budget' && (
                        <motion.div
                            key="step3"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {[
                                { val: 1, label: 'Budget', icon: '$', desc: 'Under $500', color: 'from-slate-500 to-slate-600' },
                                { val: 2, label: 'Standard', icon: '$$', desc: '$500 - $1500', color: 'from-blue-500 to-cyan-500' },
                                { val: 3, label: 'Premium', icon: '$$$', desc: '$1500 - $3000', color: 'from-purple-500 to-pink-500' },
                                { val: 4, label: 'Luxury', icon: '$$$$', desc: '$3000+', color: 'from-amber-500 to-orange-500' }
                            ].map((item) => (
                                <motion.button
                                    key={item.val}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setData({ ...data, budget: item.val as any })}
                                    className={cn(
                                        "p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden",
                                        data.budget === item.val
                                            ? "border-white/30 shadow-lg"
                                            : "bg-surface border-slate-800 hover:border-slate-600"
                                    )}
                                >
                                    {data.budget === item.val && (
                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-20`} />
                                    )}
                                    <span className="text-3xl font-bold relative z-10">{item.icon}</span>
                                    <span className="font-bold relative z-10">{item.label}</span>
                                    <span className="text-xs text-secondary relative z-10">{item.desc}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    {step === 'style' && (
                        <motion.div
                            key="step4"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="space-y-4"
                        >
                            <p className="text-sm text-secondary">Select multiple vibes</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'relaxed', label: 'Relaxed', emoji: '😌', desc: 'Beaches, spas, cafés' },
                                    { id: 'adventure', label: 'Adventure', emoji: '🧗', desc: 'Hiking, sports, thrills' },
                                    { id: 'foodie', label: 'Foodie', emoji: '🍜', desc: 'Local cuisine, markets' },
                                    { id: 'nightlife', label: 'Nightlife', emoji: '🍸', desc: 'Bars, clubs, events' },
                                    { id: 'culture', label: 'Culture', emoji: '🏛️', desc: 'Museums, history' },
                                    { id: 'nature', label: 'Nature', emoji: '🌲', desc: 'Parks, wildlife' },
                                    { id: 'shopping', label: 'Shopping', emoji: '🛍️', desc: 'Markets, boutiques' },
                                    { id: 'aesthetic', label: 'Aesthetic', emoji: '📸', desc: 'Photo spots' },
                                ].map((style) => {
                                    const isSelected = data.styles.includes(style.id);
                                    return (
                                        <motion.button
                                            key={style.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setData({ ...data, styles: data.styles.filter(s => s !== style.id) });
                                                } else {
                                                    setData({ ...data, styles: [...data.styles, style.id] });
                                                }
                                            }}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all duration-200 text-left",
                                                isSelected
                                                    ? "bg-white text-black border-white"
                                                    : "bg-surface border-slate-800 hover:border-slate-600"
                                            )}
                                        >
                                            <span className="text-2xl block mb-1">{style.emoji}</span>
                                            <span className="font-bold block">{style.label}</span>
                                            <span className={cn("text-xs", isSelected ? "text-black/60" : "text-secondary")}>{style.desc}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {step === 'generating' && (
                        <GeneratingView messages={agentMessages} />
                    )}

                    {step === 'result' && tripData && (
                        <ItineraryResult
                            data={data}
                            tripData={tripData}
                            onReset={() => setStep('destination')}
                        />
                    )}
                </AnimatePresence>
            </div>

            {step !== 'generating' && step !== 'result' && (
                <motion.div
                    className="fixed bottom-24 left-0 right-0 p-5 z-40 bg-gradient-to-t from-background via-background to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="max-w-md mx-auto">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={nextStep}
                            disabled={step === 'destination' && !data.destination}
                            className={cn(
                                "w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all",
                                step === 'destination' && !data.destination
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-action to-purple-500 text-white hover:shadow-xl hover:shadow-action/30"
                            )}
                        >
                            {step === 'style' ? (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Build with AI
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function GeneratingView({ messages }: { messages: { agent: AgentType; message: string }[] }) {
    const agents: AgentType[] = ['itinerary', 'localSecrets', 'budget', 'safety', 'sustainability'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 space-y-6"
        >
            <div className="text-center mb-8">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-action to-purple-500 opacity-20 animate-pulse" />
                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-action to-purple-500 opacity-40 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="absolute inset-4 rounded-full bg-surface flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-action animate-pulse" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-action/30 border-t-action animate-spin" />
                </div>
                <h3 className="text-2xl font-bold mb-2">AI Agents Working...</h3>
                <p className="text-secondary">6 agents collaborating on your perfect trip</p>
            </div>

            {/* Agent Status */}
            <div className="flex justify-center gap-3 mb-8">
                {agents.map((agent, i) => (
                    <motion.div
                        key={agent}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${AGENTS[agent].color}20` }}
                    >
                        <span className="text-xl">{AGENTS[agent].emoji}</span>
                    </motion.div>
                ))}
            </div>

            {/* Agent Messages */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {messages.map((msg, i) => (
                    <AgentMessage key={i} agent={msg.agent} message={msg.message} />
                ))}
            </div>
        </motion.div>
    );
}

interface ItineraryResultProps {
    data: TripData;
    tripData: any;
    onReset: () => void;
}

function ItineraryResult({ data, tripData, onReset }: ItineraryResultProps) {
    const { isRaining, isHighTraffic } = useEnvironment();
    const [localBackupMode, setLocalBackupMode] = useState(false);
    const [expandedDay, setExpandedDay] = useState<number>(1);

    const showBackups = localBackupMode || isRaining;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
        >
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-action" />
                        <span className="text-xs text-action font-bold">AI Generated</span>
                    </div>
                    <h1 className="text-3xl font-bold">{data.destination}</h1>
                    <p className="text-secondary">{data.dates.start || 'Oct 24'} — {data.dates.end || 'Oct 29'}</p>
                </div>
                <button onClick={onReset} className="text-sm text-action hover:underline">Edit</button>
            </div>

            {/* Overview Section */}
            {tripData.overview && (
                <GlassCard className="p-4 bg-action/5 border-action/20">
                    <p className="text-lg italic leading-relaxed text-white/90">"{tripData.overview}"</p>
                </GlassCard>
            )}

            {/* Detail Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['Daily Plan', 'Top Places', 'Dining', 'Essentials'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setExpandedDay(tab === 'Daily Plan' ? 1 : -1)} // Reset day expansion logic reuse
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                            (tab === 'Daily Plan' && expandedDay > 0) || (tab === 'Top Places' && expandedDay === -2) || (tab === 'Dining' && expandedDay === -3) || (tab === 'Essentials' && expandedDay === -4)
                                ? "bg-white text-black"
                                : "bg-surface border border-slate-700 text-secondary hover:text-white"
                        )}
                        onClickCapture={(e) => {
                            e.preventDefault();
                            if (tab === 'Daily Plan') setExpandedDay(1);
                            if (tab === 'Top Places') setExpandedDay(-2);
                            if (tab === 'Dining') setExpandedDay(-3);
                            if (tab === 'Essentials') setExpandedDay(-4);
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
                <GlassCard className="p-3 text-center">
                    <DollarSign className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                    <p className="text-lg font-bold">${tripData.totalCost.toFixed(0)}</p>
                    <p className="text-[10px] text-secondary">Est. Cost</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <Leaf className="w-5 h-5 mx-auto text-teal-400 mb-1" />
                    <p className="text-lg font-bold">{tripData.carbonFootprint}kg</p>
                    <p className="text-[10px] text-secondary">CO2</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <Star className="w-5 h-5 mx-auto text-amber-400 mb-1" />
                    <p className="text-lg font-bold">{tripData.safetyScore}/10</p>
                    <p className="text-[10px] text-secondary">Safety</p>
                </GlassCard>
            </div>

            <SmartPackingModal isRaining={isRaining} />

            {/* Environmental Alerts */}
            <AnimatePresence>
                {isRaining && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <GlassCard gradient="blue" className="p-3 flex items-center gap-3">
                            <CloudRain className="w-5 h-5 text-blue-400" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-300">Rain Detected</p>
                                <p className="text-xs text-blue-300/70">Itinerary adapted for indoors</p>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {isHighTraffic && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <GlassCard gradient="orange" className="p-3 flex items-center gap-3">
                            <Navigation className="w-5 h-5 text-amber-400" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-amber-300">Heavy Traffic</p>
                                <p className="text-xs text-amber-300/70">Route optimized for travel time</p>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backup Toggle */}
            <GlassCard className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-secondary" />
                    <span className="text-sm font-medium">Show Backup Plans</span>
                </div>
                <button
                    onClick={() => setLocalBackupMode(!localBackupMode)}
                    className={cn("w-12 h-6 rounded-full p-1 transition-colors", showBackups ? "bg-action" : "bg-slate-700")}
                >
                    <motion.div
                        className="w-4 h-4 bg-white rounded-full"
                        animate={{ x: showBackups ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                </button>
            </GlassCard>

            {/* Daily Plan View */}
            {expandedDay >= -1 && (
                <div className="space-y-4">
                    {tripData.itinerary.map((day: any) => (
                        <GlassCard key={day.day} className="overflow-hidden">
                            <button
                                onClick={() => setExpandedDay(expandedDay === day.day ? 0 : day.day)}
                                className="w-full p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-action/20 flex items-center justify-center">
                                        <span className="font-bold text-action">{day.day}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">{day.date}</p>
                                        <p className="text-xs text-secondary">{day.activities.length} activities</p>
                                    </div>
                                </div>
                                <ChevronDown className={cn(
                                    "w-5 h-5 text-secondary transition-transform",
                                    expandedDay === day.day && "rotate-180"
                                )} />
                            </button>

                            <AnimatePresence>
                                {expandedDay === day.day && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4 space-y-3">
                                            {day.activities.map((activity: any) => (
                                                <ActivityCard
                                                    key={activity.id}
                                                    activity={activity}
                                                    showBackup={showBackups}
                                                    isRaining={isRaining}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Top Places View */}
            {expandedDay === -2 && tripData.topPlaces && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tripData.topPlaces.map((place: any, i: number) => (
                        <GlassCard key={i} className="p-4" gradient="blue">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{place.name}</h3>
                                <span className="px-2 py-1 rounded-full bg-black/20 text-xs font-bold text-blue-200">{place.type}</span>
                            </div>
                            <p className="text-sm text-secondary mb-3">{place.description}</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                                <Clock className="w-3 h-3" />
                                Best time: {place.bestTime}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Dining View */}
            {expandedDay === -3 && tripData.dining && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tripData.dining.map((spot: any, i: number) => (
                        <GlassCard key={i} className="p-4" gradient="orange">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{spot.name}</h3>
                                <span className="text-sm font-bold text-amber-500">{spot.price}</span>
                            </div>
                            <div className="flex gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase">{spot.cuisine}</span>
                            </div>
                            <p className="text-sm text-secondary mb-3">{spot.description}</p>
                            <div className="p-2 rounded bg-surface/50 border border-slate-700">
                                <p className="text-xs font-bold text-action">🌟 Must Try: {spot.specialty}</p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Essentials View */}
            {expandedDay === -4 && (
                <div className="space-y-6">
                    {/* Local Secrets */}
                    {tripData.localSecrets && (
                        <div>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                Local Secrets
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {tripData.localSecrets.map((secret: string, i: number) => (
                                    <GlassCard key={i} className="p-3 border-purple-500/20">
                                        <p className="text-sm">{secret}</p>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Safety Tips */}
                    {tripData.safetyTips && (
                        <div>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                Safety First
                            </h3>
                            <div className="space-y-2">
                                {tripData.safetyTips.map((tip: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-slate-800">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                                        <p className="text-sm text-secondary">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="h-20" />
        </motion.div>
    );
}

function ActivityCard({ activity, showBackup, isRaining }: { activity: any; showBackup: boolean; isRaining: boolean }) {
    const isBackupActive = isRaining && activity.isOutdoor && activity.backup;
    const displayTitle = isBackupActive ? activity.backup : activity.title;

    return (
        <motion.div
            layout
            className={cn(
                "p-3 rounded-xl border transition-all",
                isBackupActive
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-surface/50 border-slate-800"
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-action" />
                    <span className="text-sm font-mono text-action">{activity.time}</span>
                    {activity.isSecret && (
                        <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded">SECRET</span>
                    )}
                    {isBackupActive && (
                        <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">INDOOR</span>
                    )}
                </div>
                <span className="text-xs text-secondary">${activity.cost}</span>
            </div>

            <h4 className="font-bold mb-1">{displayTitle}</h4>

            <div className="flex items-center gap-3 text-xs text-secondary">
                {activity.travelTime && (
                    <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> {activity.travelTime}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activity.duration}
                </span>
                {activity.carbonImpact && (
                    <span className="flex items-center gap-1 text-teal-400">
                        <Leaf className="w-3 h-3" /> {activity.carbonImpact}kg
                    </span>
                )}
            </div>

            {showBackup && activity.backup && !isBackupActive && (
                <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-2 text-xs text-secondary">
                    <CloudRain className="w-3 h-3" />
                    <span>Backup: {activity.backup}</span>
                </div>
            )}
        </motion.div>
    );
}

function SmartPackingModal({ isRaining }: { isRaining: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    const items = [
        { cat: 'Essentials', items: ['Passport', 'Wallet', 'Phone Charger'] },
        { cat: 'Weather (Auto)', items: isRaining ? ['Raincoat / Umbrella', 'Waterproof Shoes'] : ['Sunglasses', 'Sunscreen'] },
        { cat: 'Activities', items: ['Walking Shoes (20k steps)', 'Power Bank', 'Camera'] },
    ];

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(true)}
                className="w-full"
            >
                <GlassCard gradient="purple" className="p-4 flex items-center justify-center gap-2">
                    <Package2 className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-purple-300">Generate Smart Packing List</span>
                </GlassCard>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-surface border border-slate-700 w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl"
                        >
                            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-secondary hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-5 h-5 text-action" />
                                <span className="text-xs text-action font-bold">AI Generated</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-1">Packing List</h2>
                            <p className="text-sm text-secondary mb-6">Based on forecast & itinerary</p>

                            <div className="space-y-6">
                                {items.map((section, i) => (
                                    <div key={i}>
                                        <h3 className="text-sm font-bold text-action uppercase tracking-wider mb-3">{section.cat}</h3>
                                        <div className="space-y-2">
                                            {section.items.map(item => (
                                                <div key={item} className="flex items-center gap-3">
                                                    <SquareCheck className="w-5 h-5 text-slate-600" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full mt-8 py-3 bg-action rounded-xl font-bold"
                            >
                                Done
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
