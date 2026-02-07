import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpDown, RefreshCw, TrendingUp, TrendingDown,
    Search, X, Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCurrency, CURRENCIES } from '../../hooks/useCurrency';
import { GlassCard } from './GlassCard';

interface CurrencyConverterProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CurrencyConverter({ isOpen, onClose }: CurrencyConverterProps) {
    const {
        baseCurrency,
        targetCurrency,
        setBaseCurrency,
        setTargetCurrency,
        convert,
        formatCurrency,
        refreshRates,
        isLoading,
        lastUpdated,
        getCurrencyInfo,
    } = useCurrency();

    const [amount, setAmount] = useState('100');
    const [selectingFor, setSelectingFor] = useState<'base' | 'target' | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const numAmount = parseFloat(amount) || 0;
    const convertedAmount = convert(numAmount);

    const baseInfo = getCurrencyInfo(baseCurrency);
    const targetInfo = getCurrencyInfo(targetCurrency);

    const swapCurrencies = () => {
        const temp = baseCurrency;
        setBaseCurrency(targetCurrency);
        setTargetCurrency(temp);
    };

    const filteredCurrencies = CURRENCIES.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-sm bg-surface rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Currency Converter</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Amount Input */}
                            <GlassCard className="p-4">
                                <label className="text-xs text-secondary block mb-2">Amount</label>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{baseInfo?.flag}</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="flex-1 bg-transparent text-3xl font-bold focus:outline-none"
                                        placeholder="0"
                                    />
                                    <button
                                        onClick={() => setSelectingFor('base')}
                                        className="px-3 py-2 bg-slate-800 rounded-lg font-bold hover:bg-slate-700"
                                    >
                                        {baseCurrency}
                                    </button>
                                </div>
                            </GlassCard>

                            {/* Swap Button */}
                            <div className="flex justify-center">
                                <motion.button
                                    whileTap={{ rotate: 180 }}
                                    onClick={swapCurrencies}
                                    className="p-3 bg-action rounded-full shadow-lg"
                                >
                                    <ArrowUpDown className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* Converted Amount */}
                            <GlassCard gradient="blue" className="p-4">
                                <label className="text-xs text-white/70 block mb-2">Converted Amount</label>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{targetInfo?.flag}</span>
                                    <span className="flex-1 text-3xl font-bold text-white">
                                        {formatCurrency(convertedAmount, targetCurrency)}
                                    </span>
                                    <button
                                        onClick={() => setSelectingFor('target')}
                                        className="px-3 py-2 bg-white/20 rounded-lg font-bold hover:bg-white/30"
                                    >
                                        {targetCurrency}
                                    </button>
                                </div>
                            </GlassCard>

                            {/* Exchange Rate Info */}
                            <div className="flex items-center justify-between text-sm text-secondary">
                                <span>1 {baseCurrency} = {convert(1).toFixed(4)} {targetCurrency}</span>
                                <button
                                    onClick={refreshRates}
                                    disabled={isLoading}
                                    className="flex items-center gap-1 text-action hover:underline"
                                >
                                    <motion.div
                                        animate={isLoading ? { rotate: 360 } : {}}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </motion.div>
                                    Refresh
                                </button>
                            </div>

                            {lastUpdated && (
                                <p className="text-xs text-center text-secondary">
                                    Rates updated: {new Date(lastUpdated).toLocaleTimeString()}
                                </p>
                            )}
                        </div>

                        {/* Currency Selector */}
                        <AnimatePresence>
                            {selectingFor && (
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    className="absolute inset-0 bg-surface"
                                >
                                    <div className="p-4 border-b border-slate-800">
                                        <div className="flex items-center gap-3 mb-4">
                                            <button
                                                onClick={() => setSelectingFor(null)}
                                                className="p-2 hover:bg-white/10 rounded-lg"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <h3 className="text-lg font-bold">
                                                Select {selectingFor === 'base' ? 'From' : 'To'} Currency
                                            </h3>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search currency..."
                                                className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-action"
                                            />
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto max-h-[50vh]">
                                        {filteredCurrencies.map(currency => {
                                            const isSelected = selectingFor === 'base'
                                                ? currency.code === baseCurrency
                                                : currency.code === targetCurrency;
                                            return (
                                                <button
                                                    key={currency.code}
                                                    onClick={() => {
                                                        if (selectingFor === 'base') {
                                                            setBaseCurrency(currency.code);
                                                        } else {
                                                            setTargetCurrency(currency.code);
                                                        }
                                                        setSelectingFor(null);
                                                        setSearchQuery('');
                                                    }}
                                                    className={cn(
                                                        "w-full p-4 flex items-center gap-3 hover:bg-white/5 border-b border-slate-800",
                                                        isSelected && "bg-action/10"
                                                    )}
                                                >
                                                    <span className="text-2xl">{currency.flag}</span>
                                                    <div className="flex-1 text-left">
                                                        <p className="font-bold">{currency.code}</p>
                                                        <p className="text-xs text-secondary">{currency.name}</p>
                                                    </div>
                                                    {isSelected && <Check className="w-5 h-5 text-action" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Compact currency display for wallet view
export function CurrencyBadge({
    amount,
    currency,
    showTrend
}: {
    amount: number;
    currency: string;
    showTrend?: 'up' | 'down';
}) {
    const { formatCurrency: format } = useCurrency();
    const info = CURRENCIES.find(c => c.code === currency);

    return (
        <div className="flex items-center gap-1.5">
            <span>{info?.flag}</span>
            <span className="font-bold">{format(amount, currency)}</span>
            {showTrend && (
                showTrend === 'up'
                    ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                    : <TrendingDown className="w-3 h-3 text-red-400" />
            )}
        </div>
    );
}
