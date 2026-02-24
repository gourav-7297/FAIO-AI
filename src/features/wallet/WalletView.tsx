import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Leaf, DollarSign,
    Target, Plus, Book, Camera,
    ChevronRight, Sparkles, Utensils, Hotel, Bus,
    Coffee, ShoppingBag, Ticket, ArrowUpDown, Loader2,
    PieChart, BarChart3, Lightbulb, Download, Users
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

const CATEGORY_COLORS: Record<string, string> = {
    Transport: 'from-blue-500 to-cyan-500',
    Food: 'from-orange-500 to-amber-500',
    Stay: 'from-purple-500 to-pink-500',
    Activity: 'from-emerald-500 to-teal-500',
    Shopping: 'from-rose-500 to-red-500',
    Coffee: 'from-yellow-500 to-orange-500',
};

// AI budget advisor logic
function getAIBudgetAdvice(totalSpent: number, totalBudget: number, expenses: Expense[]): { message: string; emoji: string; type: 'good' | 'warning' | 'danger' } {
    const percent = (totalSpent / totalBudget) * 100;
    const foodSpend = expenses.filter(e => e.category === 'Food').reduce((s, e) => s + e.amount, 0);
    const transportSpend = expenses.filter(e => e.category === 'Transport').reduce((s, e) => s + e.amount, 0);

    if (percent < 30) return { message: "You're spending wisely! Plenty of room for that special experience 🎉", emoji: '🏆', type: 'good' };
    if (percent < 50) return { message: "On track! Consider local street food for big savings on meals", emoji: '👍', type: 'good' };
    if (percent < 70) {
        if (foodSpend > transportSpend * 1.5) return { message: "Food is your biggest spend. Try markets & local eateries for authentic + cheap meals!", emoji: '🍜', type: 'warning' };
        return { message: "Past halfway — prioritize must-see experiences over shopping", emoji: '📊', type: 'warning' };
    }
    if (percent < 90) return { message: "Budget getting tight! Switch to walking tours and cook where you stay", emoji: '⚠️', type: 'warning' };
    return { message: "Over budget! Consider free activities: parks, beaches, street art tours", emoji: '🚨', type: 'danger' };
}

export function WalletView() {
    const [activeTab, setActiveTab] = useState<'expenses' | 'insights' | 'eco' | 'journal'>('expenses');
    const [showConverter, setShowConverter] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
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

    const handleAddExpense = async (category: string, name: string, amount: number, split?: number) => {
        const finalAmount = split && split > 1 ? amount / split : amount;
        const { data } = await expenseService.addExpense(undefined, { category, name, amount: finalAmount });
        if (data) setExpenses(prev => [data, ...prev]);
        setShowAddModal(false);
    };

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = tripData?.totalCost || 1500;
    const budgetPercent = Math.min((totalSpent / totalBudget) * 100, 100);
    const totalCarbon = expenses.reduce((sum, e) => sum + (e.carbonKg || 0), 0);
    const ecoChoices = expenses.filter(e => e.isEcoOption).length;
    const budgetAdvice = useMemo(() => getAIBudgetAdvice(totalSpent, totalBudget, expenses), [totalSpent, totalBudget, expenses]);

    // Category breakdown for pie chart
    const categoryBreakdown = useMemo(() => {
        const byCategory: Record<string, number> = {};
        expenses.forEach(e => {
            byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        });
        return Object.entries(byCategory)
            .map(([category, amount]) => ({ category, amount, percent: totalSpent > 0 ? (amount / totalSpent) * 100 : 0 }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses, totalSpent]);

    // Daily spending trend
    const dailySpending = useMemo(() => {
        const byDate: Record<string, number> = {};
        expenses.forEach(e => {
            const date = e.date || 'Unknown';
            byDate[date] = (byDate[date] || 0) + e.amount;
        });
        return Object.entries(byDate).slice(-7).map(([date, amount]) => ({ date, amount }));
    }, [expenses]);

    const dailyMax = Math.max(...dailySpending.map(d => d.amount), 1);

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
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowConverter(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-action/20 text-action rounded-lg text-sm font-medium hover:bg-action/30 transition-colors"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            Convert
                        </button>
                        <button
                            onClick={() => {
                                const csv = ['Category,Name,Amount,Date,Carbon(kg)', ...expenses.map(e => `${e.category},${e.name},${e.amount},${e.date},${e.carbonKg || 0}`)].join('\n');
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url; a.download = 'faio-expenses.csv'; a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-surface/80 text-secondary rounded-lg text-sm font-medium hover:text-white transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            CSV
                        </button>
                    </div>
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
                <GlassCard gradient="green" glow className="p-5 mb-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-white/70 mb-1">Total Spent</p>
                            <h2 className="text-4xl font-bold text-white">${totalSpent.toFixed(0)}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white/70 mb-1">Budget</p>
                            <p className="text-xl font-bold text-white">${totalBudget.toFixed(0)}</p>
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

                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-white/70">{budgetPercent.toFixed(0)}% used</span>
                        <span className="text-sm text-white/70">${(totalBudget - totalSpent).toFixed(0)} remaining</span>
                    </div>

                    {/* Per-day budget indicator */}
                    {tripData && tripData.itinerary.length > 0 && (
                        <div className="flex gap-2 mb-3">
                            <div className="flex-1 p-2 bg-white/10 rounded-xl text-center">
                                <p className="text-[10px] text-white/60">Per Day Budget</p>
                                <p className="font-bold text-sm text-white">${(totalBudget / tripData.itinerary.length).toFixed(0)}</p>
                            </div>
                            <div className="flex-1 p-2 bg-white/10 rounded-xl text-center">
                                <p className="text-[10px] text-white/60">Avg Spent/Day</p>
                                <p className="font-bold text-sm text-white">${dailySpending.length > 0 ? (totalSpent / dailySpending.length).toFixed(0) : '0'}</p>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </motion.div>

            {/* AI Budget Advisor */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-4"
            >
                <div className={cn(
                    "p-4 rounded-2xl flex items-start gap-3 border",
                    budgetAdvice.type === 'good' ? 'bg-emerald-500/10 border-emerald-500/20' :
                        budgetAdvice.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                            'bg-red-500/10 border-red-500/20'
                )}>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className={cn("w-5 h-5",
                            budgetAdvice.type === 'good' ? 'text-emerald-400' :
                                budgetAdvice.type === 'warning' ? 'text-amber-400' : 'text-red-400'
                        )} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">AI Budget Tip</p>
                        <p className="text-sm text-white/90">{budgetAdvice.emoji} {budgetAdvice.message}</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2 mb-5">
                <GlassCard className="p-3 text-center">
                    <DollarSign className="w-4 h-4 mx-auto text-action mb-1" />
                    <p className="text-sm font-bold">{expenses.length}</p>
                    <p className="text-[9px] text-secondary">Items</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <TrendingUp className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                    <p className="text-sm font-bold">${expenses.length > 0 ? (totalSpent / expenses.length).toFixed(0) : 0}</p>
                    <p className="text-[9px] text-secondary">Avg</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <Leaf className="w-4 h-4 mx-auto text-teal-400 mb-1" />
                    <p className="text-sm font-bold">{totalCarbon.toFixed(1)}kg</p>
                    <p className="text-[9px] text-secondary">CO2</p>
                </GlassCard>
                <GlassCard className="p-3 text-center">
                    <Target className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                    <p className="text-sm font-bold">{ecoChoices}</p>
                    <p className="text-[9px] text-secondary">Eco</p>
                </GlassCard>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'expenses', label: 'Expenses', icon: DollarSign },
                    { id: 'insights', label: 'Insights', icon: PieChart },
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
                        <button className="w-full" onClick={() => setShowAddModal(true)}>
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

                {activeTab === 'insights' && (
                    <motion.div
                        key="insights"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <SpendingChart categories={categoryBreakdown} totalSpent={totalSpent} />
                        <DailyTrend data={dailySpending} max={dailyMax} />
                        <TopExpenses expenses={expenses} />
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

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddExpenseModal onClose={() => setShowAddModal(false)} onAdd={handleAddExpense} />
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================
// ADD EXPENSE MODAL
// ============================
function AddExpenseModal({ onClose, onAdd }: { onClose: () => void; onAdd: (category: string, name: string, amount: number, split?: number) => void }) {
    const [category, setCategory] = useState('Food');
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [splitWith, setSplitWith] = useState(1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6 space-y-5"
            >
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">Add Expense</h3>
                    <button onClick={onClose} className="text-secondary hover:text-white">✕</button>
                </div>

                {/* Category Pills */}
                <div>
                    <p className="text-xs text-secondary mb-2 uppercase tracking-wider">Category</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(CATEGORY_ICONS).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                                    category === cat ? "bg-action text-white" : "bg-surface/50 text-secondary hover:text-white"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name */}
                <div>
                    <p className="text-xs text-secondary mb-2 uppercase tracking-wider">Name</p>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Lunch at market"
                        className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-action text-white"
                    />
                </div>

                {/* Amount */}
                <div>
                    <p className="text-xs text-secondary mb-2 uppercase tracking-wider">Amount ($)</p>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-surface/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-action text-white text-2xl font-bold"
                    />
                </div>

                {/* Split */}
                <div>
                    <p className="text-xs text-secondary mb-2 uppercase tracking-wider">Split with</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(n => (
                            <button
                                key={n}
                                onClick={() => setSplitWith(n)}
                                className={cn(
                                    "flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1",
                                    splitWith === n ? "bg-action text-white" : "bg-surface/50 text-secondary"
                                )}
                            >
                                <Users className="w-3.5 h-3.5" />
                                {n === 1 ? 'Just me' : `÷${n}`}
                            </button>
                        ))}
                    </div>
                    {splitWith > 1 && amount && (
                        <p className="text-xs text-action mt-2">Your share: ${(parseFloat(amount) / splitWith).toFixed(2)}</p>
                    )}
                </div>

                <button
                    onClick={() => {
                        if (name && amount) onAdd(category, name, parseFloat(amount), splitWith);
                    }}
                    disabled={!name || !amount}
                    className="w-full py-4 bg-gradient-to-r from-action to-purple-500 rounded-xl text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add ${amount ? (parseFloat(amount) / splitWith).toFixed(2) : '0.00'}
                </button>
            </motion.div>
        </motion.div>
    );
}

// ============================
// SPENDING CHART (Visual Pie)
// ============================
function SpendingChart({ categories, totalSpent: _totalSpent }: { categories: { category: string; amount: number; percent: number }[]; totalSpent: number }) {
    return (
        <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-action" />
                <h3 className="font-bold">Spending Breakdown</h3>
            </div>

            {categories.length === 0 ? (
                <p className="text-sm text-secondary text-center py-4">No expenses to analyze</p>
            ) : (
                <div className="space-y-3">
                    {categories.map(({ category, amount, percent }) => {
                        const Icon = CATEGORY_ICONS[category] || DollarSign;
                        const gradient = CATEGORY_COLORS[category] || 'from-gray-500 to-gray-600';
                        return (
                            <div key={category}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">{category}</span>
                                            <p className="text-[10px] text-secondary">{percent.toFixed(0)}% of total</p>
                                        </div>
                                    </div>
                                    <span className="font-bold">${amount.toFixed(0)}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 0.8 }}
                                        className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </GlassCard>
    );
}

// ============================
// DAILY TREND CHART
// ============================
function DailyTrend({ data, max }: { data: { date: string; amount: number }[]; max: number }) {
    return (
        <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold">Daily Spending</h3>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-secondary text-center py-4">No daily data yet</p>
            ) : (
                <div className="flex items-end gap-2 h-32">
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-secondary font-bold">${d.amount.toFixed(0)}</span>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(d.amount / max) * 100}%` }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="w-full bg-gradient-to-t from-action to-purple-500 rounded-t-lg min-h-[4px]"
                            />
                            <span className="text-[9px] text-secondary truncate max-w-full">{d.date.split('-').pop()}</span>
                        </div>
                    ))}
                </div>
            )}
        </GlassCard>
    );
}

// ============================
// TOP EXPENSES
// ============================
function TopExpenses({ expenses }: { expenses: Expense[] }) {
    const top = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

    return (
        <GlassCard className="p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Top Expenses
            </h3>
            {top.length === 0 ? (
                <p className="text-sm text-secondary text-center py-4">No expenses yet</p>
            ) : (
                <div className="space-y-3">
                    {top.map((e, i) => {
                        const Icon = CATEGORY_ICONS[e.category] || DollarSign;
                        return (
                            <div key={e.id} className="flex items-center gap-3">
                                <span className="text-lg font-bold text-secondary w-6">#{i + 1}</span>
                                <div className="w-9 h-9 rounded-lg bg-surface/80 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-action" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{e.name}</p>
                                    <p className="text-[10px] text-secondary">{e.category}</p>
                                </div>
                                <span className="font-bold">${e.amount.toFixed(0)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </GlassCard>
    );
}

// ============================
// EXPENSE CARD
// ============================
function ExpenseCard({ expense, delay }: { expense: Expense; delay: number }) {
    const Icon = CATEGORY_ICONS[expense.category] || DollarSign;
    const gradient = CATEGORY_COLORS[expense.category] || 'from-gray-500 to-gray-600';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
            <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                        gradient
                    )}>
                        <Icon className="w-6 h-6 text-white" />
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
                        <p className="font-bold">${expense.amount.toFixed(2)}</p>
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

// ============================
// ECO IMPACT
// ============================
function EcoImpactCard({ totalCarbon, ecoChoices: _ecoChoices }: { totalCarbon: number; ecoChoices: number }) {
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
                        <p className="text-2xl font-bold text-white">{totalCarbon < 20 ? 'A+' : totalCarbon < 35 ? 'A' : totalCarbon < 50 ? 'B' : 'C'}</p>
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
    const maxCarbon = Math.max(...Object.values(byCategory), 1);

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
        { current: 'Private Car Tour', eco: 'Walking Tour', saveCO2: '4.1kg', saveUSD: 35 },
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
