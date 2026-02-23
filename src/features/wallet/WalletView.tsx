import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Leaf, DollarSign,
    AlertTriangle, Target, Plus, Book, Camera,
    ChevronRight, Sparkles, Utensils, Hotel, Bus,
    Coffee, ShoppingBag, Ticket, ArrowUpDown, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAIAgents } from '../../context/AIAgentContext';
import { CurrencyConverter } from '../../components/ui/CurrencyConverter';
import { expenseService } from '../../services/expenseService';
import type { Expense } from '../../services/expenseService';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    Transport: Bus,
    Food: Utensils,
    Stay: Hotel,
    Activity: Ticket,
    Shopping: ShoppingBag,
    Coffee: Coffee,
};

export function WalletView() {
    const [activeTab, setActiveTab] = useState<'expenses' | 'eco' | 'journal'>('expenses');
    const [showConverter, setShowConverter] = useState(false);
    const { tripData } = useAIAgents();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            const { data } = await expenseService.getExpenses();
            setExpenses(data);
            setIsLoading(false);
        }
        load();
    }, []);

    const handleAddExpense = async () => {
        const name = prompt('Expense name:');
        if (!name) return;
        const amountStr = prompt('Amount ($):');
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) return;
        const category = prompt('Category (Transport, Food, Stay, Activity, Shopping, Coffee):') || 'Food';
        const { data } = await expenseService.addExpense(undefined, { category, name, amount });
        if (data) setExpenses(prev => [data, ...prev]);
    };

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = tripData?.totalCost || 1500;
    const budgetPercent = Math.min((totalSpent / totalBudget) * 100, 100);
    const totalCarbon = expenses.reduce((sum, e) => sum + (e.carbonKg || 0), 0);
    const ecoChoices = expenses.filter(e => e.isEcoOption).length;

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Budget Agent</span>
                    </div>
                    <button
                        onClick={() => setShowConverter(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-action/20 text-action rounded-lg text-sm font-medium hover:bg-action/30 transition-colors"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        Convert
                    </button>
                </div>
                <h1 className="text-3xl font-bold">Trip Wallet</h1>
                <p className="text-secondary text-sm">AI-tracked spending & eco impact</p>
            </motion.header>

            {/* Currency Converter Modal */}
            <CurrencyConverter isOpen={showConverter} onClose={() => setShowConverter(false)} />

            {/* Budget Overview Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <GlassCard gradient="green" glow className="p-5 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-white/70 mb-1">Total Spent</p>
                            <h2 className="text-4xl font-bold text-white">${totalSpent}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white/70 mb-1">Budget</p>
                            <p className="text-xl font-bold text-white">${totalBudget}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${budgetPercent}%` }}
                            transition={{ delay: 0.3, duration: 1 }}
                            className={cn(
                                "h-full rounded-full transition-colors",
                                budgetPercent > 90 ? "bg-gradient-to-r from-amber-400 to-red-500" :
                                    budgetPercent > 70 ? "bg-gradient-to-r from-emerald-400 to-amber-400" :
                                        "bg-gradient-to-r from-emerald-400 to-teal-400"
                            )}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">{budgetPercent.toFixed(0)}% used</span>
                        <span className="text-sm text-white/70">${totalBudget - totalSpent} remaining</span>
                    </div>

                    {budgetPercent > 80 && (
                        <div className="mt-4 p-3 bg-amber-500/20 rounded-xl flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-300" />
                            <p className="text-sm text-amber-200">Budget alert: Consider eco-friendly options to save</p>
                        </div>
                    )}
                </GlassCard>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <GlassCard className="p-3 text-center">
                    <TrendingUp className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
                    <p className="text-lg font-bold">${expenses.length > 0 ? (totalSpent / expenses.length).toFixed(0) : 0}</p>
                    <p className="text-[10px] text-secondary">Avg/Expense</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <Leaf className="w-5 h-5 mx-auto text-teal-400 mb-2" />
                    <p className="text-lg font-bold">{totalCarbon.toFixed(1)}kg</p>
                    <p className="text-[10px] text-secondary">CO2 Total</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <Target className="w-5 h-5 mx-auto text-purple-400 mb-2" />
                    <p className="text-lg font-bold">{ecoChoices}</p>
                    <p className="text-[10px] text-secondary">Eco Choices</p>
                </GlassCard>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'expenses', label: 'Expenses', icon: DollarSign },
                    { id: 'eco', label: 'Eco Impact', icon: Leaf },
                    { id: 'journal', label: 'Journal', icon: Book },
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
                {activeTab === 'expenses' && (
                    <motion.div
                        key="expenses"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        <button className="w-full" onClick={handleAddExpense}>
                            <GlassCard className="p-4 flex items-center justify-center gap-2 border-dashed border-2 border-slate-700 hover:border-action transition-colors">
                                <Plus className="w-5 h-5 text-action" />
                                <span className="text-action font-medium">Add Expense</span>
                            </GlassCard>
                        </button>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <Loader2 className="w-6 h-6 text-action animate-spin mb-2" />
                                <p className="text-secondary text-sm">Loading expenses...</p>
                            </div>
                        ) : expenses.length === 0 ? (
                            <GlassCard className="p-8 text-center">
                                <DollarSign className="w-10 h-10 text-secondary/30 mx-auto mb-3" />
                                <p className="text-secondary text-sm">No expenses yet. Tap "Add Expense" to start tracking.</p>
                            </GlassCard>
                        ) : (
                            expenses.map((expense, i) => (
                                <ExpenseCard key={expense.id} expense={expense} delay={i * 0.05} />
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'eco' && (
                    <motion.div
                        key="eco"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <EcoImpactCard totalCarbon={totalCarbon} ecoChoices={ecoChoices} />
                        <CarbonBreakdown expenses={expenses} />
                        <EcoAlternatives />
                    </motion.div>
                )}

                {activeTab === 'journal' && (
                    <motion.div
                        key="journal"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <JournalSection />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ExpenseCard({ expense, delay }: { expense: Expense; delay: number }) {
    const Icon = CATEGORY_ICONS[expense.category] || DollarSign;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
            <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        expense.isEcoOption ? "bg-emerald-500/10" : "bg-action/10"
                    )}>
                        <Icon className={cn("w-6 h-6", expense.isEcoOption ? "text-emerald-400" : "text-action")} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold">{expense.name}</h4>
                            {expense.isEcoOption && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">ECO</span>
                            )}
                        </div>
                        <p className="text-xs text-secondary">{expense.category} • {expense.date}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">${expense.amount}</p>
                        {expense.carbonKg && (
                            <p className="text-xs text-teal-400 flex items-center gap-1 justify-end">
                                <Leaf className="w-3 h-3" /> {expense.carbonKg}kg
                            </p>
                        )}
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

function EcoImpactCard({ totalCarbon, ecoChoices: _ecoChoices }: { totalCarbon: number; ecoChoices: number }) {
    // Compare to average traveler (15kg CO2/day for 5 days = 75kg average)
    const averageCarbon = 45;
    const savedCarbon = averageCarbon - totalCarbon;
    const treesEquivalent = (savedCarbon > 0 ? savedCarbon / 21 : 0).toFixed(1);

    return (
        <GlassCard gradient="green" glow className="p-5">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">AI Sustainability Score</span>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-4xl font-bold text-white">{totalCarbon.toFixed(1)}kg</p>
                    <p className="text-emerald-200/80">Total Carbon Footprint</p>
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-emerald-400 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">A</p>
                        <p className="text-[10px] text-emerald-200">Grade</p>
                    </div>
                </div>
            </div>

            {savedCarbon > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/10 rounded-xl text-center">
                        <TrendingDown className="w-5 h-5 mx-auto text-emerald-300 mb-1" />
                        <p className="font-bold text-white">{savedCarbon.toFixed(1)}kg</p>
                        <p className="text-[10px] text-emerald-200/80">CO2 Saved</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl text-center">
                        <Leaf className="w-5 h-5 mx-auto text-emerald-300 mb-1" />
                        <p className="font-bold text-white">{treesEquivalent}</p>
                        <p className="text-[10px] text-emerald-200/80">Trees Worth</p>
                    </div>
                </div>
            )}
        </GlassCard>
    );
}

function CarbonBreakdown({ expenses }: { expenses: Expense[] }) {
    const byCategory = expenses.reduce((acc, exp) => {
        if (!acc[exp.category]) acc[exp.category] = 0;
        acc[exp.category] += exp.carbonKg || 0;
        return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const maxCarbon = Math.max(...Object.values(byCategory));

    return (
        <GlassCard className="p-5">
            <h3 className="font-bold mb-4">Carbon by Category</h3>
            <div className="space-y-3">
                {sorted.map(([category, carbon]) => {
                    const Icon = CATEGORY_ICONS[category] || Leaf;
                    const percent = (carbon / maxCarbon) * 100;
                    return (
                        <div key={category}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-secondary" />
                                    <span className="text-sm font-medium">{category}</span>
                                </div>
                                <span className="text-sm text-teal-400">{carbon.toFixed(1)}kg</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
}

function EcoAlternatives() {
    const alternatives = [
        { current: 'Taxi to Airport', eco: 'Train + Metro', saveCO2: '3.2kg', saveUSD: 20 },
        { current: 'Steak Dinner', eco: 'Local Vegetarian', saveCO2: '2.5kg', saveUSD: 15 },
    ];

    return (
        <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold">AI Eco Suggestions</h3>
            </div>
            <div className="space-y-3">
                {alternatives.map((alt, i) => (
                    <div key={i} className="p-3 bg-surface/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-sm text-secondary line-through">{alt.current}</p>
                                <p className="font-bold text-emerald-400">{alt.eco}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                                <Leaf className="w-3 h-3" /> -{alt.saveCO2}
                            </span>
                            <span className="px-2 py-1 bg-action/10 text-action text-xs rounded-full flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> Save ${alt.saveUSD}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}

function JournalSection() {
    const [entries] = useState([
        { id: '1', date: 'Today', title: 'Temple Visit Magic', preview: 'The sunrise at the ancient temple was...', hasPhoto: true },
        { id: '2', date: 'Yesterday', title: 'Best Ramen Ever', preview: 'Found this tiny shop hidden in the alley...', hasPhoto: true },
    ]);

    return (
        <div className="space-y-4">
            <button className="w-full">
                <GlassCard gradient="purple" className="p-5 flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-white">Create Today's Story</p>
                        <p className="text-sm text-white/70">AI generates from your photos & expenses</p>
                    </div>
                </GlassCard>
            </button>

            {entries.map((entry, i) => (
                <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <GlassCard className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                <Book className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold">{entry.title}</h4>
                                    <span className="text-xs text-secondary">{entry.date}</span>
                                </div>
                                <p className="text-sm text-secondary line-clamp-2">{entry.preview}</p>
                                {entry.hasPhoto && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-purple-400">
                                        <Camera className="w-3 h-3" /> 5 photos
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            ))}
        </div>
    );
}
