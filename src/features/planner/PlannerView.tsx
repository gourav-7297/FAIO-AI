import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ArrowLeft, MapPin, Sparkles, Navigation, CloudRain,
    Package2, SquareCheck, X, Clock, Leaf, DollarSign,
    ChevronDown, Star, AlertTriangle, Users, Copy, Check,
    BookmarkPlus, RotateCcw, Trash2, Globe, Languages, Coins,
    Bus, Utensils, Map, Shield, Eye, Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEnvironment } from '../../context/EnvironmentContext';
import { useAIAgents, AGENTS, type AgentType } from '../../context/AIAgentContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { AgentMessage } from '../../components/ui/AgentAvatar';

type Step = 'destination' | 'dates' | 'travelers' | 'budget' | 'style' | 'generating' | 'result';

interface TripData {
    destination: string;
    dates: { start: string; end: string };
    budget: 1 | 2 | 3 | 4;
    styles: string[];
    travelers: number;
}

const STEPS: Step[] = ['destination', 'dates', 'travelers', 'budget', 'style'];

export function PlannerView() {
    const [step, setStep] = useState<Step>('destination');
    const [data, setData] = useState<TripData>({
        destination: '',
        dates: { start: '', end: '' },
        budget: 2,
        styles: [],
        travelers: 1,
    });
    const { generateTrip, agentMessages, tripData, savedTrips, saveCurrentTrip, loadTrip, deleteTrip } = useAIAgents();
    const [showHistory, setShowHistory] = useState(false);

    const currentStepIndex = STEPS.indexOf(step as any);

    const goBack = () => {
        const idx = STEPS.indexOf(step as any);
        if (idx > 0) setStep(STEPS[idx - 1]);
    };

    const nextStep = async () => {
        if (step === 'destination') setStep('dates');
        else if (step === 'dates') setStep('travelers');
        else if (step === 'travelers') setStep('budget');
        else if (step === 'budget') setStep('style');
        else if (step === 'style') {
            setStep('generating');
            const budgetAmounts = { 1: 500, 2: 1500, 3: 3000, 4: 5000 };
            await generateTrip(
                data.destination,
                data.dates,
                budgetAmounts[data.budget],
                data.styles,
                data.travelers
            );
            setStep('result');
        }
    };

    const setQuickDuration = (days: number) => {
        const today = new Date();
        const end = new Date(today);
        end.setDate(today.getDate() + days - 1);
        setData({
            ...data,
            dates: {
                start: today.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0]
            }
        });
    };

    const canProceed = () => {
        if (step === 'destination') return !!data.destination;
        if (step === 'dates') return !!data.dates.start && !!data.dates.end;
        if (step === 'travelers') return data.travelers >= 1;
        if (step === 'style') return data.styles.length > 0;
        return true;
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
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-action" />
                                <span className="text-xs text-action font-bold uppercase tracking-wider">AI Experience Builder</span>
                            </div>
                            {savedTrips.length > 0 && (
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="text-xs text-secondary hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    {savedTrips.length} saved
                                </button>
                            )}
                        </div>
                        <h2 className="text-3xl font-bold">
                            {step === 'destination' && "Where to?"}
                            {step === 'dates' && "When works?"}
                            {step === 'travelers' && "Who's coming?"}
                            {step === 'budget' && "What's the budget?"}
                            {step === 'style' && "Your travel vibe?"}
                        </h2>

                        {/* Progress bar */}
                        <div className="flex gap-2 mt-4">
                            {STEPS.map((s, i) => (
                                <div
                                    key={s}
                                    className={cn(
                                        "h-1.5 flex-1 rounded-full transition-all duration-500",
                                        currentStepIndex >= i
                                            ? "bg-gradient-to-r from-action to-purple-500"
                                            : "bg-slate-800"
                                    )}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Saved Trips History Panel */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                    >
                        <div className="space-y-2">
                            {savedTrips.map((trip, i) => (
                                <GlassCard key={i} className="p-3 flex items-center justify-between">
                                    <button onClick={() => { loadTrip(i); setStep('result'); setShowHistory(false); }} className="flex items-center gap-3 flex-1 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-action/20 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-action" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{trip.destination}</p>
                                            <p className="text-xs text-secondary">{trip.startDate} — {trip.endDate} · ${trip.totalCost.toFixed(0)}</p>
                                        </div>
                                    </button>
                                    <button onClick={() => deleteTrip(i)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </GlassCard>
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
                                <p className="text-xs text-secondary uppercase tracking-wider font-bold">🔥 Trending Destinations</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { city: 'Tokyo', country: 'Japan', emoji: '🗼', tag: 'Culture & Tech' },
                                        { city: 'Bali', country: 'Indonesia', emoji: '🏝️', tag: 'Beach & Wellness' },
                                        { city: 'Paris', country: 'France', emoji: '🥐', tag: 'Romance & Art' },
                                        { city: 'Iceland', country: 'Northern Lights', emoji: '🌋', tag: 'Adventure' },
                                        { city: 'Dubai', country: 'UAE', emoji: '🏙️', tag: 'Luxury & Shopping' },
                                        { city: 'Goa', country: 'India', emoji: '🎉', tag: 'Beaches & Nightlife' },
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
                                            <p className="text-[10px] text-secondary">{place.tag}</p>
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
                            <p className="text-xs text-secondary font-bold uppercase tracking-wider">Quick Pick</p>
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { label: '3 days', days: 3 },
                                    { label: '5 days', days: 5 },
                                    { label: '1 week', days: 7 },
                                    { label: '2 weeks', days: 14 },
                                ].map(d => (
                                    <button
                                        key={d.label}
                                        onClick={() => setQuickDuration(d.days)}
                                        className="px-4 py-2 bg-surface/50 border border-slate-800 rounded-full text-sm hover:border-action hover:text-action transition-colors"
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'travelers' && (
                        <motion.div
                            key="step-travelers"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { val: 1, label: 'Solo', emoji: '🧑', desc: 'Just me' },
                                    { val: 2, label: 'Couple', emoji: '👫', desc: 'Two travelers' },
                                    { val: 4, label: 'Family', emoji: '👨‍👩‍👧‍👦', desc: '3-5 people' },
                                    { val: 6, label: 'Group', emoji: '🎉', desc: '6+ people' },
                                ].map(item => (
                                    <motion.button
                                        key={item.val}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setData({ ...data, travelers: item.val })}
                                        className={cn(
                                            "p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2",
                                            data.travelers === item.val
                                                ? "bg-action/10 border-action shadow-lg shadow-action/10"
                                                : "bg-surface border-slate-800 hover:border-slate-600"
                                        )}
                                    >
                                        <span className="text-3xl">{item.emoji}</span>
                                        <span className="font-bold">{item.label}</span>
                                        <span className="text-xs text-secondary">{item.desc}</span>
                                    </motion.button>
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
                            onSave={saveCurrentTrip}
                            onRegenerate={async () => {
                                setStep('generating');
                                const budgetAmounts = { 1: 500, 2: 1500, 3: 3000, 4: 5000 };
                                await generateTrip(
                                    data.destination,
                                    data.dates,
                                    budgetAmounts[data.budget],
                                    data.styles,
                                    data.travelers
                                );
                                setStep('result');
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            {step !== 'generating' && step !== 'result' && (
                <motion.div
                    className="fixed bottom-24 left-0 right-0 p-5 z-40 bg-gradient-to-t from-background via-background to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="max-w-md mx-auto flex gap-3">
                        {currentStepIndex > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={goBack}
                                className="py-4 px-6 rounded-2xl font-bold bg-surface border border-slate-700 text-secondary hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className={cn(
                                "flex-1 py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all",
                                !canProceed()
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
                <p className="text-secondary">6 agents building your perfect trip</p>
            </div>

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

            <div className="space-y-3 max-h-64 overflow-y-auto">
                {messages.map((msg, i) => (
                    <AgentMessage key={i} agent={msg.agent} message={msg.message} />
                ))}
            </div>
        </motion.div>
    );
}

// ============================
// RESULT VIEW
// ============================

interface ItineraryResultProps {
    data: TripData;
    tripData: any;
    onReset: () => void;
    onSave: () => void;
    onRegenerate: () => void;
}

type ResultTab = 'daily' | 'places' | 'dining' | 'essentials';

function ItineraryResult({ data, tripData, onReset, onSave, onRegenerate }: ItineraryResultProps) {
    const { isRaining, isHighTraffic } = useEnvironment();
    const [localBackupMode, setLocalBackupMode] = useState(false);
    const [expandedDay, setExpandedDay] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<ResultTab>('daily');
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const showBackups = localBackupMode || isRaining;

    const totalActivities = tripData.itinerary?.reduce((sum: number, day: any) => sum + day.activities.length, 0) || 0;
    const perDayCost = tripData.totalCost / (tripData.itinerary?.length || 1);

    const handleCopyTrip = () => {
        const text = generateTripText(data, tripData);
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleSave = () => {
        onSave();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const TABS: { id: ResultTab; label: string; icon: any }[] = [
        { id: 'daily', label: 'Daily Plan', icon: Calendar },
        { id: 'places', label: 'Top Places', icon: Map },
        { id: 'dining', label: 'Dining', icon: Utensils },
        { id: 'essentials', label: 'Essentials', icon: Shield },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
        >
            {/* Hero Header */}
            <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-action/30 via-purple-500/20 to-blue-500/10" />
                <div className="relative p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-action" />
                                <span className="text-xs text-action font-bold uppercase tracking-wider">AI Generated</span>
                            </div>
                            <h1 className="text-3xl font-bold mb-1">{data.destination}</h1>
                            <div className="flex items-center gap-3 text-sm text-secondary">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {data.dates.start} — {data.dates.end}</span>
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {data.travelers}</span>
                            </div>
                        </div>
                        <button onClick={onReset} className="text-sm text-action hover:underline">Edit</button>
                    </div>

                    {/* Quick Info */}
                    {(tripData.currency || tripData.language || tripData.bestTimeToVisit) && (
                        <div className="flex gap-3 flex-wrap mt-3">
                            {tripData.currency && (
                                <span className="flex items-center gap-1 text-xs bg-white/5 px-2.5 py-1 rounded-full"><Coins className="w-3 h-3 text-amber-400" /> {tripData.currency}</span>
                            )}
                            {tripData.language && (
                                <span className="flex items-center gap-1 text-xs bg-white/5 px-2.5 py-1 rounded-full"><Languages className="w-3 h-3 text-blue-400" /> {tripData.language}</span>
                            )}
                            {tripData.bestTimeToVisit && (
                                <span className="flex items-center gap-1 text-xs bg-white/5 px-2.5 py-1 rounded-full"><Globe className="w-3 h-3 text-emerald-400" /> Best: {tripData.bestTimeToVisit}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Overview */}
            {tripData.overview && (
                <GlassCard className="p-4 bg-action/5 border-action/20">
                    <p className="text-sm leading-relaxed text-white/90">{tripData.overview}</p>
                </GlassCard>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
                <GlassCard className="p-3 text-center">
                    <DollarSign className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                    <p className="text-base font-bold">${tripData.totalCost.toFixed(0)}</p>
                    <p className="text-[9px] text-secondary">Total</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <Clock className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                    <p className="text-base font-bold">{tripData.itinerary?.length || 0}d</p>
                    <p className="text-[9px] text-secondary">{totalActivities} activities</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <Leaf className="w-4 h-4 mx-auto text-teal-400 mb-1" />
                    <p className="text-base font-bold">{tripData.carbonFootprint}kg</p>
                    <p className="text-[9px] text-secondary">CO2</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <Star className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                    <p className="text-base font-bold">{tripData.sustainabilityScore}</p>
                    <p className="text-[9px] text-secondary">Eco Score</p>
                </GlassCard>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave}
                    className={cn("flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border",
                        saved ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-surface border-slate-700 text-secondary hover:text-white"
                    )}
                >
                    {saved ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                    {saved ? 'Saved!' : 'Save Trip'}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopyTrip}
                    className={cn("flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border",
                        copied ? "bg-action/10 border-action text-action" : "bg-surface border-slate-700 text-secondary hover:text-white"
                    )}
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Share'}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={onRegenerate}
                    className="py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-surface border border-slate-700 text-secondary hover:text-white transition-all"
                >
                    <RotateCcw className="w-4 h-4" />
                </motion.button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2",
                                activeTab === tab.id
                                    ? "bg-white text-black"
                                    : "bg-surface border border-slate-700 text-secondary hover:text-white"
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <SmartPackingModal tripData={tripData} isRaining={isRaining} />

            {/* Environmental Alerts */}
            <AnimatePresence>
                {isRaining && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
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
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
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

            {/* ====== TAB CONTENT ====== */}

            {/* Daily Plan */}
            {activeTab === 'daily' && (
                <div className="space-y-4">
                    {tripData.itinerary.map((day: any) => (
                        <GlassCard key={day.day} className="overflow-hidden">
                            <button
                                onClick={() => setExpandedDay(expandedDay === day.day ? 0 : day.day)}
                                className="w-full p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-action/30 to-purple-500/30 flex items-center justify-center">
                                        <span className="font-bold text-action">{day.day}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">{day.date}</p>
                                        <div className="flex items-center gap-2">
                                            {day.theme && <span className="text-[10px] text-action font-bold">{day.theme}</span>}
                                            <span className="text-[10px] text-secondary">• {day.activities.length} activities</span>
                                        </div>
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
                                        <div className="px-4 pb-4">
                                            {/* Timeline */}
                                            <div className="relative">
                                                <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-action via-purple-500 to-action/20" />
                                                <div className="space-y-1">
                                                    {day.activities.map((activity: any, idx: number) => (
                                                        <ActivityCard
                                                            key={activity.id}
                                                            activity={activity}
                                                            showBackup={showBackups}
                                                            isRaining={isRaining}
                                                            isLast={idx === day.activities.length - 1}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Top Places */}
            {activeTab === 'places' && tripData.topPlaces && (
                <div className="space-y-3">
                    {tripData.topPlaces.map((place: any, i: number) => (
                        <GlassCard key={i} className="p-4 border-blue-500/10">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-blue-400 text-sm">{i + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="font-bold">{place.name}</h3>
                                        {place.rating && (
                                            <span className="flex items-center gap-0.5 text-xs text-amber-400">
                                                <Star className="w-3 h-3 fill-amber-400" /> {place.rating}
                                            </span>
                                        )}
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-300 uppercase">{place.type}</span>
                                    <p className="text-sm text-secondary mt-2">{place.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs">
                                        <span className="flex items-center gap-1 text-blue-300"><Clock className="w-3 h-3" /> {place.bestTime}</span>
                                        {place.estimatedCost && <span className="text-emerald-400">{place.estimatedCost}</span>}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Dining */}
            {activeTab === 'dining' && tripData.dining && (
                <div className="space-y-3">
                    {tripData.dining.map((spot: any, i: number) => (
                        <GlassCard key={i} className="p-4 border-amber-500/10">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-bold">{spot.name}</h3>
                                    {spot.neighborhood && <span className="text-[10px] text-secondary">{spot.neighborhood}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-amber-500">{spot.price}</span>
                                    {spot.rating && (
                                        <span className="flex items-center gap-0.5 text-xs text-amber-400">
                                            <Star className="w-3 h-3 fill-amber-400" /> {spot.rating}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase">{spot.cuisine}</span>
                            </div>
                            <p className="text-sm text-secondary mb-3">{spot.description}</p>
                            <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10">
                                <p className="text-xs font-bold text-amber-400">🌟 Must Try: {spot.specialty}</p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Essentials */}
            {activeTab === 'essentials' && (
                <div className="space-y-6">
                    {/* Transport Tips */}
                    {tripData.transportTips && tripData.transportTips.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Bus className="w-5 h-5 text-blue-400" />
                                Getting Around
                            </h3>
                            <div className="space-y-2">
                                {tripData.transportTips.map((tip: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-blue-500/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                        <p className="text-sm text-secondary">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Local Secrets */}
                    {tripData.localSecrets && (
                        <div>
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-purple-400" />
                                Local Secrets
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {tripData.localSecrets.map((secret: string, i: number) => (
                                    <GlassCard key={i} className="p-3 border-purple-500/10">
                                        <div className="flex items-start gap-3">
                                            <span className="text-lg">🔮</span>
                                            <p className="text-sm">{secret}</p>
                                        </div>
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
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-red-500/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
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

// ============================
// ACTIVITY CARD
// ============================

function ActivityCard({ activity, showBackup, isRaining, isLast }: { activity: any; showBackup: boolean; isRaining: boolean; isLast: boolean }) {
    const isBackupActive = isRaining && activity.isOutdoor && activity.backup;
    const displayTitle = isBackupActive ? activity.backup : activity.title;

    return (
        <div className="flex gap-3 relative pl-1">
            {/* Timeline dot */}
            <div className="flex flex-col items-center z-10 pt-3">
                <div className={cn(
                    "w-[10px] h-[10px] rounded-full border-2 flex-shrink-0",
                    isBackupActive ? "border-blue-400 bg-blue-400" :
                        activity.isEcoFriendly ? "border-teal-400 bg-teal-400/50" :
                            "border-action bg-action/50"
                )} />
            </div>

            {/* Card */}
            <motion.div
                layout
                className={cn(
                    "flex-1 p-3 rounded-xl border transition-all mb-2",
                    isBackupActive
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-surface/50 border-slate-800"
                )}
            >
                <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-action font-bold">{activity.time}</span>
                        {activity.isSecret && (
                            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-bold rounded">SECRET</span>
                        )}
                        {isBackupActive && (
                            <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded">INDOOR</span>
                        )}
                        {activity.isEcoFriendly && (
                            <span className="px-1.5 py-0.5 bg-teal-500/20 text-teal-400 text-[9px] font-bold rounded">ECO</span>
                        )}
                    </div>
                    <span className="text-xs font-bold text-emerald-400">${activity.cost}</span>
                </div>

                <h4 className="font-bold text-sm mb-1">{displayTitle}</h4>

                {activity.description && (
                    <p className="text-xs text-secondary mb-2 line-clamp-2">{activity.description}</p>
                )}

                {activity.location && (
                    <div className="flex items-center gap-1 text-xs text-secondary mb-1.5">
                        <MapPin className="w-3 h-3 text-action/60" />
                        <span>{activity.location}</span>
                    </div>
                )}

                <div className="flex items-center gap-3 text-[10px] text-secondary">
                    {activity.travelTime && (
                        <span className="flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5" /> {activity.travelTime}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {activity.duration}
                    </span>
                    {activity.carbonImpact && (
                        <span className="flex items-center gap-1 text-teal-400">
                            <Leaf className="w-2.5 h-2.5" /> {activity.carbonImpact}kg
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
        </div>
    );
}

// ============================
// SMART PACKING MODAL
// ============================

function SmartPackingModal({ tripData, isRaining }: { tripData: any; isRaining: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    // Use AI-generated packing list if available
    const aiPackingList = tripData.packingList || [];
    const weatherItems = isRaining ? ['Raincoat / Umbrella', 'Waterproof Shoes'] : ['Sunglasses', 'Sunscreen'];

    const items = aiPackingList.length > 0
        ? [
            { cat: 'AI Recommended', items: aiPackingList },
            { cat: 'Weather (Auto)', items: weatherItems },
        ]
        : [
            { cat: 'Essentials', items: ['Passport', 'Wallet', 'Phone Charger', 'Medicines'] },
            { cat: 'Weather (Auto)', items: weatherItems },
            { cat: 'Activities', items: ['Walking Shoes', 'Power Bank', 'Camera', 'Day Backpack'] },
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
                    <span className="font-bold text-purple-300">Smart Packing List</span>
                    {aiPackingList.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded-full font-bold">AI</span>
                    )}
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
                            className="bg-surface border border-slate-700 w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto"
                        >
                            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-secondary hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-5 h-5 text-action" />
                                <span className="text-xs text-action font-bold">{aiPackingList.length > 0 ? 'AI Generated' : 'Smart List'}</span>
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

// ============================
// TRIP SHARE TEXT GENERATOR
// ============================

function generateTripText(data: TripData, tripData: any): string {
    let text = `✈️ FAIO AI Trip: ${data.destination}\n`;
    text += `📅 ${data.dates.start} to ${data.dates.end}\n`;
    text += `💰 Budget: $${tripData.totalCost.toFixed(0)}\n`;
    text += `👥 Travelers: ${data.travelers}\n\n`;

    if (tripData.overview) text += `${tripData.overview}\n\n`;

    tripData.itinerary?.forEach((day: any) => {
        text += `📍 Day ${day.day}${day.theme ? ` — ${day.theme}` : ''}\n`;
        day.activities.forEach((act: any) => {
            text += `  ${act.time} ${act.title}${act.location ? ` @ ${act.location}` : ''} ($${act.cost})\n`;
        });
        text += '\n';
    });

    if (tripData.topPlaces) {
        text += '🏛️ Top Places:\n';
        tripData.topPlaces.forEach((p: any) => { text += `  • ${p.name} (${p.type})\n`; });
        text += '\n';
    }
    if (tripData.dining) {
        text += '🍽️ Dining:\n';
        tripData.dining.forEach((d: any) => { text += `  • ${d.name} — ${d.specialty} (${d.price})\n`; });
    }

    text += '\n— Generated by FAIO AI ✨';
    return text;
}
