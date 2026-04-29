import { useState, useEffect, useMemo, useRef } from 'react';
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
import { generateBudgetAdvice, analyzeReceiptWithAI } from '../../services/openRouterService';

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

    const [budgetAdvice, setBudgetAdvice] = useState<{ message: string; emoji: string; type: 'good' | 'warning' | 'danger' }>({ 
        message: "Analyzing your spending...", emoji: "🤔", type: "good" 
    });
    const [_isAdviceLoading, setIsAdviceLoading] = useState(false);

    // AI Budget Roast (triggered when expenses change)
    useEffect(() => {
        if (expenses.length > 0) {
            setIsAdviceLoading(true);
            generateBudgetAdvice(expenses, totalBudget).then(advice => {
                setBudgetAdvice(advice);
                setIsAdviceLoading(false);
            });
        } else {
            setBudgetAdvice({ message: "No expenses yet. Time to start spending!", emoji: "💸", type: "good" });
            setIsAdviceLoading(false);
        }
    }, [expenses.length, totalBudget]);

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
        <div className="p-5 pt-12 min-h-screen pb-32 bg-stone-50">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs text-emerald-500 font-black uppercase tracking-[0.2em]">Budget Intelligence</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowConverter(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5" />
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
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-100 text-stone-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 transition-all shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Data
                        </button>
                    </div>
                </div>
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">Trip Wallet</h1>
                <p className="text-stone-500 text-sm font-medium">AI-tracked spending & eco impact</p>
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
                    "p-4 rounded-2xl flex items-start gap-3 border transition-all",
                    budgetAdvice.type === 'good' ? 'bg-emerald-50 border-emerald-100' :
                        budgetAdvice.type === 'warning' ? 'bg-amber-50 border-amber-100' :
                            'bg-rose-50 border-rose-100'
                )}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        budgetAdvice.type === 'good' ? 'bg-emerald-500/10' :
                            budgetAdvice.type === 'warning' ? 'bg-amber-500/10' : 'bg-rose-500/10'
                    )}>
                        <Lightbulb className={cn("w-5 h-5",
                            budgetAdvice.type === 'good' ? 'text-emerald-500' :
                                budgetAdvice.type === 'warning' ? 'text-amber-500' : 'text-rose-500'
                        )} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">AI Financial Intelligence</p>
                        <p className="text-sm font-bold text-stone-900 leading-relaxed">{budgetAdvice.emoji} {budgetAdvice.message}</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Items', value: expenses.length, icon: DollarSign, color: 'text-primary' },
                    { label: 'Avg', value: `$${expenses.length > 0 ? (totalSpent / expenses.length).toFixed(0) : 0}`, icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'CO2', value: `${totalCarbon.toFixed(1)}kg`, icon: Leaf, color: 'text-teal-500' },
                    { label: 'Eco', value: ecoChoices, icon: Target, color: 'text-purple-500' },
                ].map((stat, i) => (
                    <div key={i} className="p-3 bg-white border border-stone-100 rounded-3xl shadow-soft text-center">
                        <stat.icon className={cn("w-4 h-4 mx-auto mb-1.5", stat.color)} />
                        <p className="text-xs font-black text-stone-900">{stat.value}</p>
                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'expenses', label: 'EXPENSES', icon: DollarSign },
                    { id: 'insights', label: 'INSIGHTS', icon: PieChart },
                    { id: 'eco', label: 'ECO IMPACT', icon: Leaf },
                    { id: 'journal', label: 'JOURNAL', icon: Book },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all whitespace-nowrap text-[10px] font-black tracking-widest",
                            activeTab === tab.id
                                ? "bg-stone-900 text-white shadow-lg"
                                : "bg-white text-stone-400 border border-stone-100"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
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
                            <div className="p-5 rounded-[2.5rem] bg-white border-2 border-dashed border-stone-100 hover:border-primary transition-all group flex items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xs font-black text-stone-400 group-hover:text-primary uppercase tracking-[0.2em]">Acquire Expense Record</span>
                            </div>
                        </button>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <Loader2 className="w-6 h-6 text-action animate-spin mb-2" />
                                <p className="text-secondary text-sm">Loading expenses...</p>
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="p-12 text-center bg-white rounded-[3rem] border border-stone-100 shadow-soft">
                                <div className="w-20 h-20 bg-stone-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <DollarSign className="w-8 h-8 text-stone-200" />
                                </div>
                                <p className="text-sm font-black text-stone-900 uppercase tracking-tight">Zero Transactions Found</p>
                                <p className="text-xs text-stone-400 font-medium mt-2">Initialize your ledger by adding an expense.</p>
                            </div>
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

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const result = await analyzeReceiptWithAI(base64);
            if (result) {
                setName(result.name);
                setAmount(result.amount.toString());
                if (CATEGORY_ICONS[result.category]) {
                    setCategory(result.category);
                }
            }
            setIsScanning(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="w-full max-w-lg bg-white rounded-t-[3rem] p-8 space-y-6 shadow-2xl relative"
            >
                {/* Drawer handle */}
                <div className="w-12 h-1 bg-stone-100 rounded-full mx-auto mb-2" />
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black text-stone-900 tracking-tight">New Record</h3>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={isScanning}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 disabled:opacity-50"
                        >
                            {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                            {isScanning ? "Scanning" : "OCR Scan"}
                        </button>
                        <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            ref={fileInputRef}
                            className="hidden" 
                            onChange={handleReceiptUpload} 
                        />
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all">✕</button>
                    </div>
                </div>

                {/* Category Pills */}
                <div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Service Category</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(CATEGORY_ICONS).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                    category === cat 
                                        ? "bg-stone-900 text-white border-stone-900 shadow-lg" 
                                        : "bg-white text-stone-400 border-stone-100 hover:border-stone-200"
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
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-stone-900 font-medium"
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
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-stone-900 text-2xl font-bold"
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
                                    splitWith === n ? "bg-primary text-white" : "bg-stone-50 text-stone-500"
                                )}
                            >
                                <Users className="w-3.5 h-3.5" />
                                {n === 1 ? 'Just me' : `÷${n}`}
                            </button>
                        ))}
                    </div>
                    {splitWith > 1 && amount && (
                        <p className="text-xs text-primary mt-2">Your share: ${(parseFloat(amount) / splitWith).toFixed(2)}</p>
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
        <div className="p-5 bg-white border border-stone-100 rounded-[2.5rem] shadow-soft">
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
                                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
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
        </div>
    );
}

// ============================
// DAILY TREND CHART
// ============================
function DailyTrend({ data, max }: { data: { date: string; amount: number }[]; max: number }) {
    return (
        <div className="p-5 bg-white border border-stone-100 rounded-[2.5rem] shadow-soft">
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
        </div>
    );
}

// ============================
// TOP EXPENSES
// ============================
function TopExpenses({ expenses }: { expenses: Expense[] }) {
    const top = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

    return (
        <div className="p-6 bg-white border border-stone-100 rounded-[2.5rem] shadow-soft mb-6">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Capital Outflow
            </h3>
            {top.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4 font-medium uppercase tracking-widest">No data mapped</p>
            ) : (
                <div className="space-y-4">
                    {top.map((e, i) => {
                        const Icon = CATEGORY_ICONS[e.category] || DollarSign;
                        return (
                            <div key={e.id} className="flex items-center gap-4 group">
                                <span className="text-xs font-black text-stone-200 w-4 tracking-tighter">0{i + 1}</span>
                                <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon className="w-4.5 h-4.5 text-stone-900" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm text-stone-900 truncate uppercase tracking-tight">{e.name}</p>
                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-0.5">{e.category}</p>
                                </div>
                                <span className="font-black text-sm text-stone-900">${e.amount.toFixed(0)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function ExpenseCard({ expense, delay }: { expense: Expense; delay: number }) {
    const Icon = CATEGORY_ICONS[expense.category as keyof typeof CATEGORY_ICONS] || DollarSign;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="p-5 bg-white border border-stone-100 rounded-[2.5rem] shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
        >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.25rem] bg-stone-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-stone-900" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-black text-stone-900 truncate uppercase tracking-tight">{expense.name}</h4>
                        <span className="text-sm font-black text-stone-900">${expense.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{expense.category} • {expense.date}</p>
                        {expense.carbonKg && (
                            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                                <Leaf className="w-3 h-3" />
                                {expense.carbonKg}kg
                            </span>
                        )}
                    </div>
                </div>
            </div>
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
        <div className="p-8 bg-stone-900 border border-stone-800 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[60px] -mr-16 -mt-16 group-hover:bg-emerald-500/40 transition-all" />
            
            <div className="flex items-center gap-2 mb-8 relative z-10">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">Sustainability Engine</span>
            </div>

            <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                    <p className="text-5xl font-black text-white tracking-tighter">{totalCarbon.toFixed(1)}<span className="text-xl ml-1 opacity-50">kg</span></p>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-2">Emission Footprint</p>
                </div>
                <div className="w-24 h-24 rounded-[2rem] border-4 border-emerald-500 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform">
                    <div className="text-center -rotate-12 group-hover:rotate-0 transition-transform">
                        <p className="text-3xl font-black text-white">{totalCarbon < 20 ? 'A+' : totalCarbon < 35 ? 'A' : totalCarbon < 50 ? 'B' : 'C'}</p>
                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">GRADE</p>
                    </div>
                </div>
            </div>

            {savedCarbon > 0 && (
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 text-center">
                        <TrendingDown className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
                        <p className="text-xl font-black text-white">{savedCarbon.toFixed(1)}kg</p>
                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-1">Mitigated</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 text-center">
                        <Leaf className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
                        <p className="text-xl font-black text-white">{treesEquivalent}</p>
                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-1">Trees Equivalent</p>
                    </div>
                </div>
            )}
        </div>
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
        <div className="p-6 bg-white border border-stone-100 rounded-[2.5rem] shadow-soft mt-6">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-[0.2em] mb-6">Emissions Matrix</h3>
            <div className="space-y-6">
                {sorted.map(([category, carbon]) => {
                    const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Leaf;
                    const percent = (carbon / maxCarbon) * 100;
                    return (
                        <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Icon className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-black text-stone-900 uppercase tracking-tight">{category}</span>
                                </div>
                                <span className="text-xs font-black text-emerald-500">{carbon.toFixed(1)}kg</span>
                            </div>
                            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function EcoAlternatives() {
    const alternatives = [
        { current: 'Taxi to Airport', eco: 'Train + Metro', saveCO2: '3.2kg', saveUSD: 20 },
        { current: 'Steak Dinner', eco: 'Local Vegetarian', saveCO2: '2.5kg', saveUSD: 15 },
        { current: 'Private Car Tour', eco: 'Walking Tour', saveCO2: '4.1kg', saveUSD: 35 },
    ];

    return (
        <div className="p-6 bg-white border border-stone-100 rounded-[2.5rem] shadow-soft mt-6">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-[0.2em]">Neural Substitutions</h3>
            </div>
            <div className="space-y-4">
                {alternatives.map((alt, i) => (
                    <div key={i} className="p-5 bg-stone-50 border border-stone-100 rounded-[2rem] group hover:border-emerald-500/50 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest line-through mb-1">{alt.current}</p>
                                <p className="text-sm font-black text-emerald-500 uppercase tracking-tight">{alt.eco}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <ChevronRight className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                                <Leaf className="w-3 h-3" /> -{alt.saveCO2}
                            </span>
                            <span className="px-3 py-1.5 bg-stone-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 shadow-lg">
                                <DollarSign className="w-3 h-3" /> SAVE ${alt.saveUSD}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function JournalSection() {
    const [entries] = useState([
        { id: '1', date: 'TODAY', title: 'TEMPLE VISIT MAGIC', preview: 'The sunrise at the ancient temple was...', hasPhoto: true },
        { id: '2', date: 'YESTERDAY', title: 'BEST RAMEN EVER', preview: 'Found this tiny shop hidden in the alley...', hasPhoto: true },
    ]);

    return (
        <div className="space-y-6">
            <button className="w-full group">
                <div className="p-8 rounded-[3rem] bg-stone-900 border border-stone-800 flex items-center justify-center gap-6 shadow-2xl relative overflow-hidden transition-all hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                    <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left relative z-10">
                        <p className="text-lg font-black text-white tracking-tight">COMPOSE CHRONICLE</p>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">NEURAL NARRATIVE GENERATOR</p>
                    </div>
                </div>
            </button>

            {entries.map((entry, i) => (
                <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div className="p-6 bg-white border border-stone-100 rounded-[2.5rem] shadow-soft flex items-start gap-5 group hover:shadow-xl transition-all">
                        <div className="w-20 h-20 rounded-[2rem] bg-stone-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Book className="w-8 h-8 text-stone-900" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-black text-stone-900 truncate uppercase tracking-tight">{entry.title}</h4>
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{entry.date}</span>
                            </div>
                            <p className="text-xs font-medium text-stone-500 leading-relaxed line-clamp-2">{entry.preview}</p>
                            {entry.hasPhoto && (
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="px-3 py-1.5 bg-stone-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5">
                                        <Camera className="w-3.5 h-3.5" /> 5 PHOTOS
                                    </div>
                                    <div className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5">
                                        <Leaf className="w-3.5 h-3.5" /> SYNCED
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
