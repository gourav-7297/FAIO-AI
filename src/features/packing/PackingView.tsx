import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Backpack, Plus, Check, Trash2,
    Sun,
    Camera, Mountain, Briefcase, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard } from '../../components/ui/GlassCard';
import {
    generatePackingList, loadLists, toggleItem, addCustomItem, deleteList,
    CATEGORIES, CATEGORY_EMOJIS, WEATHER_OPTIONS, ACTIVITIES,
    type PackingList, type PackingCategory
} from '../../services/packingService';
import { useToast } from '../../components/ui/Toast';

const ACTIVITY_EMOJIS: Record<string, React.ReactNode> = {
    beach: <Sun className="w-3.5 h-3.5" />,
    trekking: <Mountain className="w-3.5 h-3.5" />,
    business: <Briefcase className="w-3.5 h-3.5" />,
    photography: <Camera className="w-3.5 h-3.5" />,
};

export function PackingView() {
    const { showToast } = useToast();
    const [lists, setLists] = useState<PackingList[]>([]);
    const [activeList, setActiveList] = useState<PackingList | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [filterCat, setFilterCat] = useState<PackingCategory | 'all'>('all');
    const [showAddItem, setShowAddItem] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCat, setNewItemCat] = useState<PackingCategory>('Misc');

    useEffect(() => { setLists(loadLists()); }, []);

    const handleToggle = (itemId: string) => {
        if (!activeList) return;
        const updated = toggleItem(activeList.id, itemId);
        setLists(updated);
        setActiveList(updated.find(l => l.id === activeList.id) || null);
    };

    const handleAddItem = () => {
        if (!activeList || !newItemName.trim()) return;
        const updated = addCustomItem(activeList.id, newItemName.trim(), newItemCat);
        setLists(updated);
        setActiveList(updated.find(l => l.id === activeList.id) || null);
        setNewItemName('');
        setShowAddItem(false);
        showToast('Item added', 'success');
    };

    const handleDelete = (id: string) => {
        const updated = deleteList(id);
        setLists(updated);
        if (activeList?.id === id) setActiveList(null);
        showToast('List deleted', 'success');
    };

    const packed = activeList ? activeList.items.filter(i => i.packed).length : 0;
    const total = activeList ? activeList.items.length : 0;
    const progress = total > 0 ? (packed / total) * 100 : 0;

    const filteredItems = activeList
        ? filterCat === 'all' ? activeList.items : activeList.items.filter(i => i.category === filterCat)
        : [];

    return (
        <div className="p-5 pt-12 min-h-screen pb-32">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                    <Backpack className="w-5 h-5 text-action" />
                    <span className="text-xs text-action font-bold uppercase tracking-wider">Smart</span>
                </div>
                <h1 className="text-3xl font-bold">Packing List</h1>
                <p className="text-secondary text-sm">Weather-aware, activity-based suggestions</p>
            </motion.header>

            {/* Active list view */}
            {activeList ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {/* Progress card */}
                    <GlassCard gradient="blue" glow className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="font-bold text-lg">{activeList.name}</h2>
                                <p className="text-xs text-secondary">{activeList.duration} days • {activeList.weather}</p>
                            </div>
                            <button onClick={() => setActiveList(null)} className="text-secondary hover:text-white text-xs">← Back</button>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                            <motion.div className="h-full bg-gradient-to-r from-action to-emerald-400 rounded-full"
                                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                        </div>
                        <p className="text-[10px] text-secondary">{packed}/{total} packed ({Math.round(progress)}%)</p>
                    </GlassCard>

                    {/* Category filter */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button onClick={() => setFilterCat('all')}
                            className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap flex-shrink-0",
                                filterCat === 'all' ? "bg-action text-white" : "bg-white/5 text-secondary")}>
                            All ({total})
                        </button>
                        {CATEGORIES.map(cat => {
                            const count = activeList.items.filter(i => i.category === cat).length;
                            if (count === 0) return null;
                            return (
                                <button key={cat} onClick={() => setFilterCat(cat)}
                                    className={cn("px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap flex-shrink-0",
                                        filterCat === cat ? "bg-action text-white" : "bg-white/5 text-secondary")}>
                                    {CATEGORY_EMOJIS[cat]} {cat} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5">
                        {filteredItems.map(item => (
                            <motion.button key={item.id} onClick={() => handleToggle(item.id)}
                                className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                                    item.packed ? "bg-emerald-500/10" : "bg-white/5")}
                                whileTap={{ scale: 0.98 }}>
                                <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0",
                                    item.packed ? "bg-emerald-500 border-emerald-500" : "border-white/20")}>
                                    {item.packed && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-xs font-medium", item.packed ? "text-secondary line-through" : "text-white")}>{item.name}</p>
                                    <p className="text-[9px] text-secondary">{CATEGORY_EMOJIS[item.category]} {item.category} • Qty: {item.quantity}{item.essential ? ' • ⚡ Essential' : ''}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Add item */}
                    {showAddItem ? (
                        <GlassCard className="p-3 space-y-2">
                            <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Item name..."
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none" />
                            <select value={newItemCat} onChange={e => setNewItemCat(e.target.value as PackingCategory)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none">
                                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <button onClick={handleAddItem} className="flex-1 py-2 bg-action rounded-xl text-xs font-bold text-white">Add</button>
                                <button onClick={() => setShowAddItem(false)} className="px-4 py-2 bg-white/5 rounded-xl text-xs text-secondary">Cancel</button>
                            </div>
                        </GlassCard>
                    ) : (
                        <button onClick={() => setShowAddItem(true)}
                            className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-xs text-secondary hover:text-white hover:border-action/30 flex items-center justify-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Add custom item
                        </button>
                    )}
                </motion.div>
            ) : (
                /* List of packing lists */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {lists.length > 0 && (
                        <>
                            <h2 className="font-bold text-sm">Your Lists</h2>
                            {lists.map(list => {
                                const p = list.items.filter(i => i.packed).length;
                                const t = list.items.length;
                                return (
                                    <GlassCard key={list.id} className="p-3 cursor-pointer" onClick={() => setActiveList(list)}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-white">{list.name}</p>
                                                <p className="text-[10px] text-secondary">{list.duration} days • {list.weather} • {t} items</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-action font-bold">{Math.round(t > 0 ? (p / t) * 100 : 0)}%</span>
                                                <button onClick={e => { e.stopPropagation(); handleDelete(list.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-white/10"><Trash2 className="w-3.5 h-3.5 text-secondary" /></button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </>
                    )}

                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-action to-purple-500 text-white font-bold flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Create New List
                    </motion.button>

                    {lists.length === 0 && (
                        <div className="text-center py-8">
                            <Backpack className="w-16 h-16 text-action/20 mx-auto mb-4" />
                            <p className="text-secondary text-sm">Create your first packing list</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Create modal */}
            <AnimatePresence>
                {showCreate && <CreateListModal onClose={() => setShowCreate(false)} onCreate={(list) => {
                    setLists(loadLists());
                    setActiveList(list);
                    setShowCreate(false);
                    showToast(`Created ${list.items.length} items`, 'success');
                }} />}
            </AnimatePresence>
        </div>
    );
}

function CreateListModal({ onClose, onCreate }: { onClose: () => void; onCreate: (list: PackingList) => void }) {
    const [dest, setDest] = useState('');
    const [duration, setDuration] = useState(5);
    const [weather, setWeather] = useState<PackingList['weather']>('moderate');
    const [activities, setActivities] = useState<string[]>([]);

    const toggleActivity = (a: string) => {
        setActivities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
    };

    const handleCreate = () => {
        if (!dest.trim()) return;
        const list = generatePackingList(dest.trim(), duration, weather, activities);
        onCreate(list);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4" onClick={onClose}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                className="w-full max-w-md bg-surface rounded-2xl p-5 space-y-4 border border-white/10"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">New Packing List</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-secondary" /></button>
                </div>

                <input value={dest} onChange={e => setDest(e.target.value)} placeholder="Destination (e.g. Goa, Switzerland)"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none" />

                <div>
                    <p className="text-[10px] text-secondary mb-2">Duration (days)</p>
                    <input type="number" min={1} max={30} value={duration} onChange={e => setDuration(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none" />
                </div>

                <div>
                    <p className="text-[10px] text-secondary mb-2">Weather</p>
                    <div className="grid grid-cols-4 gap-2">
                        {WEATHER_OPTIONS.map(w => (
                            <button key={w.value} onClick={() => setWeather(w.value)}
                                className={cn("p-2 rounded-xl text-center text-[10px] font-bold",
                                    weather === w.value ? "bg-action text-white" : "bg-white/5 text-secondary")}>
                                <span className="text-lg block">{w.emoji}</span>{w.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] text-secondary mb-2">Activities</p>
                    <div className="grid grid-cols-4 gap-2">
                        {ACTIVITIES.map(a => (
                            <button key={a} onClick={() => toggleActivity(a)}
                                className={cn("p-2 rounded-xl text-center text-[10px] font-bold flex flex-col items-center gap-1",
                                    activities.includes(a) ? "bg-action text-white" : "bg-white/5 text-secondary")}>
                                {ACTIVITY_EMOJIS[a]}{a}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-action to-emerald-500 text-white font-bold">
                    Generate Packing List
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
